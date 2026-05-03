import { resend } from "@/lib/mail";

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type QuoteEmail = {
  to: string;
  productSummary: string;
  totalPrice: string | number;
  currency: string;
  estimatedDelivery: string;
  quoteId: string;
};

export async function sendQuoteReadyEmail({
  to,
  productSummary,
  totalPrice,
  currency,
  estimatedDelivery,
  quoteId,
}: QuoteEmail) {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL || "https://www.cargooimport.eu";
  const fromEmail = process.env.FROM_EMAIL || "Cargoo Import <contact@cargooimport.eu>";
  const accountQuoteLink = `${publicSiteUrl.replace(/\/$/, "")}/account.html?quote=${encodeURIComponent(quoteId)}`;
  const subject = "Your Cargoo quote is ready";
  const text = `Hi,

Your Cargoo quote is ready.

Product/request:
${productSummary}

Total estimated cost:
${totalPrice} ${currency}

Estimated delivery:
${estimatedDelivery}

You can view, accept, or reject this quote inside your Cargoo account:
${accountQuoteLink}

If you have questions, contact us on WhatsApp or reply to this email.

Cargoo Import`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; padding: 28px; color: #161616;">
      <div style="border:1px solid #eee; border-radius:22px; padding:28px; background:#fff;">
        <p>Hi,</p>
        <p>Your Cargoo quote is ready.</p>
        <div style="background:#fff7f1; border-left:4px solid #ff5500; padding:16px; margin:22px 0;">
          <p style="margin:0 0 10px;"><strong>Product/request:</strong><br>${esc(productSummary)}</p>
          <p style="margin:0 0 10px;"><strong>Total estimated cost:</strong><br>${esc(totalPrice)} ${esc(currency)}</p>
          <p style="margin:0;"><strong>Estimated delivery:</strong><br>${esc(estimatedDelivery)}</p>
        </div>
        <p>You can view, accept, or reject this quote inside your Cargoo account:</p>
        <p>
          <a href="${esc(accountQuoteLink)}" style="display:inline-block;background:#ff5500;color:#000;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:999px;">
            View quote
          </a>
        </p>
        <p>If you have questions, contact us on WhatsApp or reply to this email.</p>
        <p>Cargoo Import</p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  });
}
