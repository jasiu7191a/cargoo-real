import { NextResponse } from "next/server";
import { resend } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

/** Escapes HTML special characters to prevent XSS in outreach email bodies. */
function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, newStatus } = await req.json();

    if (!leadId || !newStatus) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Fetch the lead and the associated user
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { user: true },
    });

    if (!lead || !lead.user?.email) {
      return NextResponse.json({ error: "Lead or User Email not found" }, { status: 404 });
    }

    let subject = "";
    let htmlContent = "";

    // esc() prevents XSS — product names/quantities come from user-submitted data.
    const safeName = esc(lead.productName);
    const safeQty = esc(lead.quantity);

    switch (newStatus) {
      case "PROCESSING":
        subject = `Cargoo Update: We are processing your request for ${lead.productName}`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
             <h2 style="color: #ff5500; text-transform: uppercase;">Request Processing</h2>
             <p>Hello,</p>
             <p>Our sourcing agents in Shenzhen are currently tracking down the best suppliers for <strong>${safeQty}x ${safeName}</strong>.</p>
             <p>We will compile a landed cost quote (including logistics and duties) and get back to you shortly.</p>
             <br/>
             <p>Best regards,<br/>The Cargoo Import Team</p>
          </div>
        `;
        break;
      case "QUOTED":
        subject = `Action Required: Your quote for ${lead.productName} is ready!`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
             <h2 style="color: #ff5500; text-transform: uppercase;">Your Quote is Ready</h2>
             <p>Great news! We have successfully sourced your product and calculated the final landed cost to your warehouse.</p>
             <p>Please log in to your Cargoo Dashboard to review the quote for <strong>${safeName}</strong>.</p>
             <br/>
             <a href="https://cargooimport.eu/dashboard" style="display: inline-block; background: #ff5500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Quote</a>
             <br/><br/>
             <p>Best regards,<br/>The Cargoo Import Team</p>
          </div>
        `;
        break;
      case "SHIPPED":
        subject = `Shipping Update: ${lead.productName} is in transit!`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
             <h2 style="color: #ff5500; text-transform: uppercase;">Cargo Shipped</h2>
             <p>Your order for <strong>${safeName}</strong> has been successfully cleared and boarded.</p>
             <p>You can track the shipment status in your dashboard.</p>
             <br/>
             <p>Thank you for importing with Cargoo.</p>
          </div>
        `;
        break;
      case "CONTACTED":
        subject = `You have a sourcing update from Cargoo for ${lead.productName}`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
             <h2 style="color: #ff5500; text-transform: uppercase;">Cargoo Sourcing Team</h2>
             <p>Hello,</p>
             <p>Thank you for your inquiry regarding <strong>${safeName}</strong>.</p>
             <p>Our sourcing specialists have reviewed your request and are reaching out to our verified supplier network in China. We will send you a detailed landed-cost quote within <strong>24–48 hours</strong>.</p>
             <br/>
             <p>In the meantime, feel free to reply to this email with any additional specifications.</p>
             <br/>
             <p>Best regards,<br/>The Cargoo Import Team</p>
          </div>
        `;
        break;
      default:
        return NextResponse.json({ success: true, message: "No email triggered for this status." });
    }

    // Update DB first — email is non-reversible, so we must persist intent before sending.
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus },
    });

    const sendResult = await resend.emails.send({
      from: "Cargoo Import <noreply@cargooimport.eu>",
      to: lead.user.email,
      subject,
      html: htmlContent,
    });

    if (sendResult.error) {
      console.error("Resend Error:", sendResult.error);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    await prisma.adminAction.create({
      data: {
        type: "EMAIL_SENT",
        details: `Sent ${newStatus} email to ${lead.user.email} (Item: ${lead.productName})`,
        adminName: "Senior Admin",
      },
    });

    return NextResponse.json({ success: true, message: "Email sent and status updated" });
  } catch (error: any) {
    console.error("Outreach API Error:", error);
    return NextResponse.json(
      { error: "Failed to process outreach", details: error.message },
      { status: 500 }
    );
  }
}
