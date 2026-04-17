import { Resend } from 'resend';

/**
 * Shared Resend client for the Cargoo Platform.
 * Uses the RESEND_API_KEY from environment variables.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Basic helper to send email via Resend
 */
export async function sendEmail({ to, subject, html }: MailOptions) {
  try {
    const data = await resend.emails.send({
      from: 'Cargoo Import <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Mail Delivery Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notification to the Admin (cargooimport@gmail.com)
 */
export async function sendAdminNotification(lead: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #ff5500; text-transform: uppercase;">New High-Intent Lead!</h2>
      <p>A new sourcing request has been submitted on <strong>cargooimport.eu</strong>.</p>
      
      <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Item:</strong> ${lead.productName}</p>
        <p><strong>Client:</strong> ${lead.user?.email || 'Unknown'}</p>
        <p><strong>Qty:</strong> ${lead.quantity}</p>
        <p><strong>Target:</strong> €${lead.targetPrice || 'Not set'}</p>
        <p><strong>Notes:</strong> ${lead.notes || 'None'}</p>
      </div>
      
      <a href="https://cargooimport.eu/admin/leads" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Open Dashboard
      </a>
    </div>
  `;

  return sendEmail({
    to: 'cargooimport@gmail.com',
    subject: `🚀 Leads HQ: New Request for ${lead.productName}`,
    html
  });
}

/**
 * Confirmation to the Client
 */
export async function sendClientConfirmation(email: string, productName: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
      <h1 style="color: #000;">Expert Sourcing Initiated.</h1>
      <p>Hello,</p>
      <p>Thank you for requesting a sourcing quote for <strong>${productName}</strong>.</p>
      <p>Our agents in Shenzen and Guangzhou are already contacting verified suppliers to negotiate the best possible price and quality for you.</p>
      
      <div style="border-left: 4px solid #ff5500; padding: 15px; background: #fff8f5; margin: 20px 0;">
        <strong>Next Step:</strong> You will receive a WhatsApp message or email from your dedicated agent within 24 hours with your <strong>Total Landed Cost</strong> estimate.
      </div>
      
      <p>Best regards,<br/>The Cargoo Team</p>
      <p style="font-size: 12px; color: #999;">cargooimport.eu • Premium China Sourcing</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Cargoo: We've started sourcing your ${productName}`,
    html
  });
}

/**
 * Returns a niche-specific 'Overseas Plug' outreach script
 */
export function getSmartScript(niche: string, productName: string) {
  switch (niche) {
    case "FASHION":
      return `Yo! Spotted your request for ${productName}. 

As your plug in China, I've got direct access to the Tier-1 factories. We're talking hype quality without the middleman tax. 

I'm checking a few batches today to make sure the quality/authenticity is 1:1 before I send you a quote. What's your target price for this?

Best,
The Cargoo Team`;

    case "TECH":
      return `Regarding your inquiry for ${productName}. 

I'm currently verifying the batch certifications (CE/RoHS) and checking defect rates with the factory. We source these direct-from-line to keep your costs at the absolute minimum.

Expect a full landed-cost estimate in your inbox within 24 hours.

Best,
The Cargoo Team`;

    case "ACCESSORIES":
      return `Checking the specs on those ${productName} for you. 

We have a massive network for accessories and we can even handle custom branding/packaging at the source if you're looking to scale your brand.

I'll have the best factory-direct options ready for you by tomorrow.

Best,
The Cargoo Team`;

    default:
      return `Hello! I'm looking into your sourcing request for ${productName}.

I've already contacted a few of our verified suppliers in China, and I'll have a total landed cost estimate for you shortly.

Best regards,
The Cargoo Team`;
  }
}
