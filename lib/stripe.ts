/**
 * Minimal Stripe client using raw fetch — works on Cloudflare Workers
 * without the official SDK (which pulls in Node-only deps).
 *
 * Two operations only:
 *   1. createCheckoutSession() — generates a hosted payment URL
 *   2. verifyWebhookSignature() — checks the Stripe-Signature header
 *      using Web Crypto HMAC (works in Workers; no Node crypto).
 *
 * Env vars required:
 *   STRIPE_SECRET_KEY      sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET  whsec_... (from the webhook endpoint dashboard)
 *
 * If STRIPE_SECRET_KEY is unset, isStripeEnabled() returns false and the
 * send-quote flow falls back to email-only (graceful degradation).
 */

const STRIPE_API = "https://api.stripe.com/v1";

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function getSecret(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

/** Encode a JS object/array into application/x-www-form-urlencoded body
 *  the way Stripe expects (e.g. line_items[0][price_data][unit_amount]). */
function formEncode(obj: Record<string, any>, prefix = ""): string {
  const pairs: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          pairs.push(formEncode(item, `${key}[${i}]`));
        } else {
          pairs.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof v === "object") {
      pairs.push(formEncode(v, key));
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return pairs.filter(Boolean).join("&");
}

export type CheckoutSessionInput = {
  amount: number;          // in major units (PLN, EUR, …) — we'll convert to cents
  currency: string;        // 'PLN' | 'EUR' | …
  productName: string;
  productDescription?: string;
  customerEmail: string;
  quoteId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
};

/** Currencies that Stripe expects with no fractional digits. EUR and PLN are
 *  not in this list — they use 2 decimals like USD. */
const ZERO_DECIMAL_CURRENCIES = new Set(["BIF","CLP","DJF","GNF","JPY","KMF","KRW","MGA","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"]);

export function toMinorUnits(amount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) return Math.round(amount);
  return Math.round(amount * 100);
}

/**
 * Stripe's payment_method_types per region.
 * - card always
 * - blik + p24 only valid for PLN
 * - sepa_debit valid for EUR
 */
function paymentMethodsFor(currency: string): string[] {
  const c = currency.toUpperCase();
  if (c === "PLN") return ["card", "blik", "p24"];
  if (c === "EUR") return ["card", "sepa_debit"];
  return ["card"];
}

export async function createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
  const unitAmount = toMinorUnits(input.amount, input.currency);
  const body = formEncode({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail,
    payment_method_types: paymentMethodsFor(input.currency),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: input.productName,
            ...(input.productDescription ? { description: input.productDescription.slice(0, 500) } : {}),
          },
        },
      },
    ],
    metadata: {
      quote_id: input.quoteId,
    },
  });

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Stripe checkout create failed (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = await res.json() as { id: string; url: string };
  if (!data.url) throw new Error("Stripe returned a session without a URL");
  return { id: data.id, url: data.url };
}

// ---------------------------------------------------------------------------
// Webhook signature verification — Web Crypto HMAC, Workers-compatible.
// ---------------------------------------------------------------------------

const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

/**
 * Verifies Stripe's t=…,v1=… header. Returns the parsed event JSON if valid;
 * throws otherwise. The body argument MUST be the raw text Stripe sent — any
 * re-serialization breaks the signature.
 */
export async function verifyWebhookSignature(rawBody: string, header: string | null): Promise<any> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  if (!header) throw new Error("Missing Stripe-Signature header");

  const parts: Record<string, string[]> = {};
  for (const piece of header.split(",")) {
    const [k, v] = piece.split("=");
    if (!k || !v) continue;
    (parts[k] ??= []).push(v);
  }

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];
  if (!timestamp || signatures.length === 0) throw new Error("Stripe-Signature missing t= or v1=");

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Stripe-Signature timestamp outside tolerance");
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedHex = bufferToHex(sig);

  const matched = signatures.some((s) => timingSafeEqual(s, expectedHex));
  if (!matched) throw new Error("Stripe-Signature did not match");

  return JSON.parse(rawBody);
}
