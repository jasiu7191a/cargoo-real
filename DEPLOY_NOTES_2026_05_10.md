# Deploy notes — Customer profile, Stripe, messages (2026-05-10)

This drop adds the missing half of the customer ordering flow: profile fields,
delivery addresses, request metadata (quantity / category / phone),
admin↔customer chat, per-notification mark-read, and end-to-end Stripe
payments. **Code changes ship via the normal `git push` → Cloudflare Pages
build flow.** Three operator actions are required before the new features
work in production.

## 1. Run the Neon migration (REQUIRED)

Open the Neon console → SQL editor → paste the contents of:

    neon-migrations/20260510_profiles_messages_stripe.sql

…and run. Every statement uses `IF NOT EXISTS` / `IF EXISTS`, so it's safe
to re-run if interrupted.

What it changes:

- `users` gets `first_name`, `last_name`, `phone` (all nullable, no default)
- new `addresses` table (1:N per user, partial-unique default flag)
- `quote_requests` gets `quantity`, `category`, `contact_phone`,
  `delivery_address_id` (FK to addresses)
- `quotes` gets `stripe_payment_link`, `stripe_session_id`,
  `stripe_payment_intent_id`, `paid_at`
- new `messages` table (admin↔customer thread per request)

Existing rows keep working — new columns are optional.

## 2. Stripe setup (REQUIRED for "Pay now" buttons)

Without these env vars, the `/api/admin/quotes/[id]/send` route still works
end-to-end — it just skips Stripe and the email goes out with a "View
quote" button only (no "Pay now" button). The customer accepts manually
via the dashboard, you collect payment by other means.

To enable hosted Stripe Checkout:

1. Create / open the Stripe account. Use **live** keys for production,
   **test** keys for staging.
2. **Cloudflare Pages → Settings → Environment variables (Production)** —
   add:

       STRIPE_SECRET_KEY=sk_live_...        (or sk_test_... for staging)
       STRIPE_WEBHOOK_SECRET=whsec_...      (filled in step 4)

   Trigger a redeploy after saving.

3. **Stripe Dashboard → Settings → Payment methods** — for the country/region
   matching your business, enable:
   - Cards (always on by default)
   - **BLIK** (PLN only)
   - **Przelewy24** (PLN only)
   - **SEPA Direct Debit** (EUR only)

   `lib/stripe.ts` automatically picks the right `payment_method_types` per
   currency — PLN quotes get card+blik+p24, EUR quotes get card+sepa_debit,
   anything else gets card-only.

4. **Stripe Dashboard → Developers → Webhooks → Add endpoint:**

       URL:    https://admin.cargooimport.eu/api/webhooks/stripe
       Events: checkout.session.completed
               checkout.session.async_payment_succeeded
               checkout.session.async_payment_failed   (optional)

   Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` and
   redeploy.

5. Smoke test: open `/admin/quote-requests`, pick a customer request, fill
   the quote form, click **Send to account and email**. The response should
   include a Stripe URL and the customer's email + dashboard should show a
   **Pay now** button. Pay through Stripe in test mode using `4242 4242
   4242 4242` → the webhook fires → quote status flips to `paid` → the
   customer gets an `order_paid` notification.

## 3. Deploy the www (cargoo) static site

The www repo at `C:\Users\jasiu\.antigravity\cargoo` is **not git-tracked**
and updates separately. After every change there:

    cd C:\Users\jasiu\.antigravity\cargoo
    npx wrangler pages deploy . --project-name=<your-pages-project>

(or drag-and-drop the folder via the Cloudflare dashboard).

In this drop the www repo got:

- `js/customer-account.js` — extended register form (first/last name, phone,
  address), extended quote-request form (quantity, category, contact phone,
  delivery address picker), Pay-Now button on quote cards when
  `stripe_payment_link` is present, full message thread per request, and a
  Profile / Addresses tab.
- `css/account.css` — new styles for the additions, mirrored into
  `cargoo-pl/css/`, `cargoo-de/css/`, `cargoo-fr/css/`.
- `account.html` cache-bust query strings bumped to
  `?v=20260510-stripe-msg` in all four locales so browsers grab the new JS.

If you don't deploy the www side, customers can't see any of the new UI —
only the admin panel will reflect the changes.

## What ships automatically (no operator action)

- `git push` → Cloudflare Pages rebuilds `admin.cargooimport.eu`
- All new API routes go live as soon as the build deploys:
    - `/api/me/profile` (GET/PATCH)
    - `/api/me/addresses` (GET/POST), `/api/me/addresses/[id]` (PATCH/DELETE)
    - `/api/me/quote-requests/[id]/messages` (GET/POST)
    - `/api/admin/quote-requests/[id]/messages` (GET/POST)
    - `/api/me/notifications/[id]/read` (PATCH)
    - `/api/webhooks/stripe` (POST)
- Existing routes that were extended (no breaking changes):
    - `POST /api/auth/register` accepts optional profile + address fields
    - `POST /api/quote-requests` accepts optional quantity, category,
      contact_phone, delivery_address_id
    - `POST /api/admin/quotes/[id]/send` now creates a Stripe Checkout
      session if Stripe is configured, persists the URL, and includes a
      "Pay now" button in the email
    - `GET /api/me/quote-requests`, `GET /api/me/quotes`,
      `GET /api/admin/quote-requests` — return the new fields

## Rollback

Each phase is its own commit on `main`:

- `4d0f4da` — backend (schema migration + Stripe + messages + profile)
- `50bb630` — admin UI (messages thread + new field display)

The www-side JS/CSS isn't tracked in git, so revert it manually if needed
(prior cache-bust string was `?v=20260509-optimistic`).

The Neon migration is purely additive (no DROP / no data loss). To revert,
manually drop the new columns and tables — but you'll lose any data the
customers wrote against them in the meantime.
