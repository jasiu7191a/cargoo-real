import { Resend } from 'resend';
import { getEmailTemplate } from '@/lib/email-templates';

// Instantiated lazily so a missing key only fails when email is actually sent,
// not at module load time (which would crash all routes that import this file).
let _resend: Resend | null = null;
export const resend = {
  emails: {
    send: (opts: Parameters<Resend["emails"]["send"]>[0]) => {
      if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) throw new Error("RESEND_API_KEY env var is required but not set.");
        _resend = new Resend(key);
      }
      return _resend.emails.send(opts);
    },
  },
};

/** Escapes HTML special characters to prevent XSS in email bodies. */
function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
      from: process.env.FROM_EMAIL || 'Cargoo Import <contact@cargooimport.eu>',
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
  // esc() prevents XSS if a malicious user submits HTML in product/notes fields.
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #ff5500; text-transform: uppercase;">New High-Intent Lead!</h2>
      <p>A new sourcing request has been submitted on <strong>cargooimport.eu</strong>.</p>

      <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Item:</strong> ${esc(lead.productName)}</p>
        <p><strong>Client:</strong> ${esc(lead.user?.email ?? 'Unknown')}</p>
        <p><strong>Qty:</strong> ${esc(lead.quantity)}</p>
        <p><strong>Target:</strong> €${esc(lead.targetPrice ?? 'Not set')}</p>
        <p><strong>Notes:</strong> ${esc(lead.notes ?? 'None')}</p>
      </div>

      <a href="https://admin.cargooimport.eu/admin/leads" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Open Dashboard
      </a>
    </div>
  `;

  return sendEmail({
    to: 'cargooimport@gmail.com',
    subject: `Leads HQ: New Request for ${lead.productName}`,
    html
  });
}

/**
 * Confirmation to the Client
 */
export async function sendClientConfirmation(email: string, productName: string) {
  const safeProduct = esc(productName);
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
      <h1 style="color: #000;">Expert Sourcing Initiated.</h1>
      <p>Hello,</p>
      <p>Thank you for requesting a sourcing quote for <strong>${safeProduct}</strong>.</p>
      <p>Our agents in Shenzhen and Guangzhou are already contacting verified suppliers to negotiate the best possible price and quality for you.</p>

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

// ---------------------------------------------------------------------------
// Cold outreach helpers
// ---------------------------------------------------------------------------

/** Generates a signed unsubscribe token for a given email using HMAC-SHA256. */
export async function createUnsubscribeToken(email: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("SESSION_SECRET (or NEXTAUTH_SECRET) not set");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return Buffer.from(`${email}:${sigHex}`).toString("base64url");
}

/** Verifies an unsubscribe token and returns the email if valid, null if tampered. */
export async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const colonIdx = decoded.lastIndexOf(":");
    const email = decoded.slice(0, colonIdx);
    const expected = await createUnsubscribeToken(email);
    return expected === token ? email : null;
  } catch {
    return null;
  }
}

interface ColdEmailOptions {
  to: string;
  name?: string;
  subject: string;
  bodyHtml: string;  // pre-built HTML body — must NOT contain unsubscribe footer (added here)
  lang?: string;
}

/**
 * Strips any stray {{BODY}} placeholders from caller-supplied body HTML.
 * Also handles the case where the caller accidentally passes a full HTML document
 * (e.g. the complete branded template shell) instead of just the body paragraphs —
 * in that case it extracts only the body content from the <!-- BODY --> section.
 * Returns null if nothing meaningful remains (caller should reject the request).
 */
export function stripBodyPlaceholder(html: string): string | null {
  let cleaned = html.replace(/\{\{BODY\}\}/gi, "").trim();
  if (!cleaned) return null;

  if (/<!DOCTYPE|<html\b/i.test(cleaned)) {
    // Try to extract content from the branded <!-- BODY --> td section
    const bodySection = cleaned.match(
      /<!--\s*BODY\s*-->[\s\S]*?<td[^>]*background-color:#111111[^>]*>([\s\S]*?)<\/td>/i
    );
    if (bodySection?.[1]?.trim()) {
      cleaned = bodySection[1].trim();
    } else {
      // Fallback: grab <p> tags without inline styles (body paragraphs, not footer)
      cleaned = (cleaned.match(/<p>[\s\S]*?<\/p>/gi) ?? []).join("\n");
    }
  }

  return cleaned.length > 0 ? cleaned : null;
}

/** Sends a cold prospecting email using the branded language-specific template. */
export async function sendColdEmail({ to, name, subject, bodyHtml, lang = "en" }: ColdEmailOptions) {
  const token = await createUnsubscribeToken(to);
  const unsubUrl = `https://admin.cargooimport.eu/api/unsubscribe?token=${token}`;

  const html = getEmailTemplate(lang)
    .replace(/\{\{BODY\}\}/g, bodyHtml)
    .replace(/\{\{UNSUB_URL\}\}/g, unsubUrl);

  return sendEmail({ to, subject, html });
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
