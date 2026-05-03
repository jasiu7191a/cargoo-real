# Cargoo Customer Account System Setup

## 1. Environment Variables

Set these in the production admin/backend deployment:

```bash
DATABASE_URL="postgresql://..."
SESSION_SECRET="generate-a-long-random-secret"
RESEND_API_KEY="re_..."
FROM_EMAIL="Cargoo Import <contact@cargooimport.eu>"
PUBLIC_SITE_URL="https://www.cargooimport.eu"
ADMIN_SITE_URL="https://admin.cargooimport.eu/admin"
GEMINI_API_KEY="optional"
```

`SESSION_SECRET` should be a long random value. Do not reuse a public key or commit it.

## 2. Neon Migration

Run this SQL in the Neon SQL editor or with your deployment migration step:

```text
neon-migrations/20260503_customer_accounts.sql
```

The same SQL is also mirrored under `prisma/migrations/202605030001_customer_accounts/migration.sql`, but this repo currently ignores `prisma/migrations`, so use the `neon-migrations` copy as the deployable source.

## 3. Create The First Admin

Recommended production path:

1. Register a normal account on the public website.
2. In Neon, promote only that known email:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

Alternative first-setup helper:

1. Temporarily set `ADMIN_EMAIL` and a 12+ character `ADMIN_PASSWORD`.
2. Visit `https://admin.cargooimport.eu/api/auth/setup-first-admin` once after the migration.
3. Remove the temporary env vars or block the endpoint after setup.

## 4. Public Worker

Deploy the updated public Worker so `www.cargooimport.eu` proxies these customer API paths to the admin/backend app:

```text
/api/auth/*
/api/quote-requests
/api/me/*
```

Without the Worker update, the static public site cannot reach the real auth and account APIs.

## 5. Admin Flow

After logging in as an admin:

1. Open `https://admin.cargooimport.eu/admin/quote-requests`.
2. Select a quote request.
3. Save a quote draft.
4. Click `Send to account and email`.

The quote is saved to the customer account first. If Resend fails, the quote remains visible in the account and the API returns the warning: `Quote saved to account, but email failed to send.`

## 6. Customer Flow

Customers can:

1. Register or log in from `account.html`.
2. Submit quote requests while logged in.
3. View admin quotes.
4. Accept or reject sent quotes.
5. View shipments once an admin creates shipment records.
