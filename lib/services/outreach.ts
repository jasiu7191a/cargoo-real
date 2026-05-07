import { resend, createUnsubscribeToken } from '@/lib/mail';
import { getEmailTemplate } from '@/lib/email-templates';

interface OutreachEmail {
  to: string;
  subject: string;
  leadName: string;
  productName: string;
  personalizedSnippet: string;
  lang?: string;
}

function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOutreachEmail(data: OutreachEmail) {
  try {
    const lang = data.lang ?? "en";
    const token = await createUnsubscribeToken(data.to);
    const unsubBase =
      process.env.UNSUBSCRIBE_BASE_URL || "https://admin.cargooimport.eu";
    const unsubUrl = `${unsubBase.replace(/\/$/, "")}/api/unsubscribe?token=${token}`;

    // Convert plain-text body to HTML paragraphs, preserving line breaks
    const bodyHtml = data.personalizedSnippet
      .split(/\n\n+/)
      .map(para => `<p>${esc(para.replace(/\n/g, "<br>"))}</p>`)
      .join("\n");

    const html = getEmailTemplate(lang)
      .replace(/\{\{BODY\}\}/g, bodyHtml)
      .replace(/\{\{UNSUB_URL\}\}/g, unsubUrl);

    const { data: resData, error } = await resend.emails.send({
      from: process.env.OUTREACH_FROM_EMAIL || 'Cargoo Sourcing <contact@cargooimport.eu>',
      to: [data.to],
      subject: data.subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'contact@cargooimport.eu',
      tags: [
        { name: 'category', value: 'lead_outreach' },
        { name: 'lang', value: lang },
      ],
    });

    if (error) {
      console.error("Error sending outreach email:", error);
      return { success: false, error };
    }

    return { success: true, resData };
  } catch (err) {
    console.error("Critical error in outreach service:", err);
    return { success: false, error: err };
  }
}
