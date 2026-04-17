import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

function detectNiche(name: string, notes: string): string {
  const text = `${name} ${notes}`.toLowerCase();
  
  const fashionKeywords = ["sneaker", "shoe", "hoodie", "tshirt", "bag", "dress", "clothing", "apparel", "fashion", "textile"];
  const techKeywords = ["electronic", "led", "computer", "phone", "screen", "tech", "drone", "laptop", "battery"];
  const accessoryKeywords = ["watch", "jewelry", "sunglasses", "case", "belt", "accessory", "hat"];

  if (fashionKeywords.some(kw => text.includes(kw))) return "FASHION";
  if (techKeywords.some(kw => text.includes(kw))) return "TECH";
  if (accessoryKeywords.some(kw => text.includes(kw))) return "ACCESSORIES";
  
  return "GENERAL";
}

/**
 * GET: Fetch pending leads that need outreach
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: {
         status: "NEW"
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Enrich leads with detected niches
    const enrichedLeads = leads.map(lead => ({
      ...lead,
      niche: detectNiche(lead.productName, lead.notes || "")
    }));

    return NextResponse.json(enrichedLeads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Send a personalized response to a lead
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, subject, message } = await req.json();

    if (!leadId || !message) {
      return NextResponse.json({ error: "Lead ID and Message are required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { user: true }
    });

    if (!lead || !lead.user?.email) {
      return NextResponse.json({ error: "Lead or User Email not found" }, { status: 404 });
    }

    // 1. Send the manual email via Resend
    const mailResult = await sendEmail({
      to: lead.user.email,
      subject: subject || `Regarding your sourcing request for ${lead.productName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999;">Sent via Cargoo Admin Portal • Real-time Sourcing Services</p>
        </div>
      `
    });

    if (!mailResult.success) {
       throw new Error(`Email failed: ${mailResult.error}`);
    }

    // 2. Update Lead status to PROCESSING (meaning we've contacted them)
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "PROCESSING" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
