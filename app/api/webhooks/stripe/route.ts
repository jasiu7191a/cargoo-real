import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { query } from "@/lib/account-db";
import { tryCreateNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook endpoint.
 *
 * Configure in the Stripe dashboard: https://admin.cargooimport.eu/api/webhooks/stripe
 *   Events to send:  checkout.session.completed, checkout.session.async_payment_succeeded,
 *                    checkout.session.async_payment_failed, charge.refunded
 *
 * Required env: STRIPE_WEBHOOK_SECRET (from the dashboard, starts with whsec_)
 */
export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set — refusing webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  let event: any;
  try {
    event = await verifyWebhookSignature(rawBody, sigHeader);
  } catch (err: any) {
    console.error("Stripe signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      const quoteId: string | undefined = session?.metadata?.quote_id;
      const sessionId: string | undefined = session?.id;
      const paymentIntentId: string | null = session?.payment_intent ?? null;
      // Stripe returns "paid" once funds clear (BLIK/P24 are async).
      const paid = session?.payment_status === "paid";

      if (quoteId && paid) {
        const updated = await query<{ id: string; user_id: string; quote_request_id: string | null; total_price: string | null; currency: string | null }>(
          `UPDATE quotes
           SET status = 'paid',
               paid_at = COALESCE(paid_at, now()),
               stripe_session_id = COALESCE(stripe_session_id, $2),
               stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, $3)
           WHERE id = $1
           RETURNING id, user_id, quote_request_id, total_price, currency`,
          [quoteId, sessionId, paymentIntentId]
        );

        const row = updated[0];
        if (row) {
          if (row.quote_request_id) {
            await query(
              `UPDATE quote_requests
               SET status = 'accepted', last_admin_update = now()
               WHERE id = $1`,
              [row.quote_request_id]
            );
          }

          await tryCreateNotification({
            userId: row.user_id,
            type: "order_paid",
            meta: {
              amount: row.total_price,
              currency: row.currency,
              quoteId: row.id,
            },
            link: `/account.html?quote=${encodeURIComponent(row.id)}`,
          });
        }
      }
    }
  } catch (err) {
    // Log and ack — Stripe retries non-2xx, but we don't want infinite retries
    // on bugs in our handler. Visible in wrangler tail.
    console.error("Stripe webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
