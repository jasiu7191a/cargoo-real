import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError } from "@/lib/account-api";
import { query, queryOne, transaction } from "@/lib/account-db";
import { sendQuoteReadyEmail } from "@/lib/quote-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };
type QuoteSendRow = {
  id: string;
  quote_request_id: string | null;
  user_id: string;
  customer_email: string;
  product_name: string | null;
  product_link: string | null;
  product_cost: string | null;
  shipping_cost: string | null;
  customs_cost: string | null;
  service_fee: string | null;
  total_price: string | null;
  currency: string | null;
  estimated_delivery: string | null;
  notes: string | null;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    requireCsrf(req);

    const quote = await queryOne<QuoteSendRow>(
      `SELECT q.*, u.email AS customer_email
       FROM quotes q
       JOIN users u ON u.id = q.user_id
       WHERE q.id = $1`,
      [params.id]
    );
    if (!quote) apiError(404, "Quote not found", "NOT_FOUND");

    if (!quote.product_name || !quote.total_price || !quote.currency || !quote.estimated_delivery) {
      apiError(400, "Product name, total price, currency, and estimated delivery are required", "QUOTE_INCOMPLETE");
    }

    if (quote.quote_request_id) {
      const request = await queryOne<{ user_id: string }>(
        "SELECT user_id FROM quote_requests WHERE id = $1",
        [quote.quote_request_id]
      );
      if (!request || request.user_id !== quote.user_id) {
        apiError(409, "Quote request does not belong to this customer", "QUOTE_REQUEST_MISMATCH");
      }
    }

    const savedQuote = await transaction(async (tx) => {
      const updated = await tx.queryOne(
        `UPDATE quotes
         SET status = 'sent', sent_at = COALESCE(sent_at, now()), admin_id = $2
         WHERE id = $1
         RETURNING *`,
        [quote.id, admin.id]
      );

      if (quote.quote_request_id) {
        await tx.query(
          `UPDATE quote_requests
           SET status = 'quoted',
               quote_id = $1,
               last_admin_update = now()
           WHERE id = $2`,
          [quote.id, quote.quote_request_id]
        );
      }

      return updated;
    });

    const productSummary = quote.product_link
      ? `${quote.product_name} (${quote.product_link})`
      : quote.product_name;
    const subject = "Your Cargoo quote is ready";
    let resendMessageId: string | null = null;
    let emailStatus = "sent";
    let emailError: string | null = null;

    try {
      const emailResult = await sendQuoteReadyEmail({
        to: quote.customer_email,
        productSummary,
        totalPrice: quote.total_price,
        currency: quote.currency,
        estimatedDelivery: quote.estimated_delivery,
        quoteId: quote.id,
      });
      const maybeError = (emailResult as any).error;
      if (maybeError) throw new Error(maybeError.message || "Resend failed");
      resendMessageId = (emailResult as any).data?.id ?? null;
    } catch (error: any) {
      emailStatus = "failed";
      emailError = error?.message || "Email failed";
      console.error("Quote email failed:", error);
    }

    await query(
      `INSERT INTO email_logs (user_id, quote_id, email_to, subject, resend_message_id, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [quote.user_id, quote.id, quote.customer_email, subject, resendMessageId, emailStatus, emailError]
    );

    if (emailStatus === "failed") {
      return NextResponse.json({
        success: true,
        warning: "Quote saved to account, but email failed to send.",
        quote: savedQuote,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Quote sent to customer account and email.",
      quote: savedQuote,
    });
  } catch (error) {
    return handleApiError(error, "Admin send quote API error");
  }
}
