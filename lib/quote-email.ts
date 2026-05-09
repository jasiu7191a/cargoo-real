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
  /** Optional Stripe Checkout URL. When provided, the email shows a "Pay now" button. */
  paymentUrl?: string | null;
};

export async function sendQuoteReadyEmail({
  to,
  productSummary,
  totalPrice,
  currency,
  estimatedDelivery,
  quoteId,
  paymentUrl,
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
${paymentUrl ? `\nPay securely (card, BLIK, Przelewy24, SEPA):\n${paymentUrl}\n` : ""}
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
          ${paymentUrl
            ? `<a href="${esc(paymentUrl)}" style="display:inline-block;margin-left:10px;background:#161616;color:#fff;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:999px;">Pay now</a>`
            : ""}
        </p>
        ${paymentUrl
          ? `<p style="font-size:12px;color:#666;margin-top:8px;">Pay securely with card, BLIK, Przelewy24, or SEPA. The link is unique to this quote.</p>`
          : ""}
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
    reply_to: process.env.REPLY_TO_EMAIL || "contact@cargooimport.eu",
    tags: [
      { name: "category", value: "quote_ready" },
      { name: "quoteId", value: quoteId },
    ],
  });
}
