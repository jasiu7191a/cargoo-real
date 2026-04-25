import { getCargooSenderForLang, resend, stripBodyPlaceholder } from "@/lib/mail";

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

function fallbackBody(data: OutreachEmail): string {
  const name = data.leadName?.trim() || "there";

  return `Hello ${name},

I reviewed your Cargoo request for ${data.productName}. We can check verified China factories for this exact item and prepare a realistic landed-cost quote before you commit.

Would you like me to shortlist supplier options with pricing, lead time, and quality-control notes?

Best regards,
The Cargoo Sourcing Team
cargooimport.eu`;
}

function renderPlainTextBody(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 16px;">${esc(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export async function sendOutreachEmail(data: OutreachEmail) {
  const bodyText = stripBodyPlaceholder(data.personalizedSnippet) || fallbackBody(data);

  try {
    const { data: resData, error } = await resend.emails.send({
      from: getCargooSenderForLang(data.lang),
      to: [data.to],
      subject: data.subject,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f6f7f9;">
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937;max-width:620px;margin:0 auto;padding:28px 18px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:28px;">
      ${renderPlainTextBody(bodyText)}
    </div>
  </div>
</body>
</html>`,
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
