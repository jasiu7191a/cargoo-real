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
    const unsubUrl = `https://admin.cargooimport.eu/api/unsubscribe?token=${token}`;

    // Convert plain-text body to HTML paragraphs, preserving line breaks
    const bodyHtml = data.personalizedSnippet
      .split(/\n\n+/)
      .map(para => `<p>${esc(para.replace(/\n/g, "<br>"))}</p>`)
      .join("\n");

    const html = getEmailTemplate(lang)
      .replace(/\{\{BODY\}\}/g, bodyHtml)
      .replace(/\{\{UNSUB_URL\}\}/g, unsubUrl);

    const { data: resData, error } = await resend.emails.send({
      from: 'Cargoo Sourcing <contact@cargooimport.eu>',
      to: [data.to],
      subject: data.subject,
      html,
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
