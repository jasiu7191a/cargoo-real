-- 2026-05-10: Customer profile fields, address book, request metadata,
-- admin↔customer message thread, and Stripe payment integration.
--
-- Run this whole file once in the Neon SQL editor. Every statement uses
-- IF NOT EXISTS / IF EXISTS so it's safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----- USERS: profile fields ------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS phone      TEXT;

-- ----- ADDRESSES (1:N per user) --------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street       TEXT NOT NULL,
  city         TEXT NOT NULL,
  zip_code     TEXT NOT NULL,
  country      TEXT NOT NULL,
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Only one default per user. Partial unique index works in Postgres.
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_user_one_default
  ON addresses(user_id) WHERE is_default = TRUE;

DROP TRIGGER IF EXISTS addresses_set_updated_at ON addresses;
CREATE TRIGGER addresses_set_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----- QUOTE_REQUESTS: quantity, category, contact + chosen address ---------
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS quantity            INTEGER,
  ADD COLUMN IF NOT EXISTS category            TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone       TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_category_check') THEN
    ALTER TABLE quote_requests
      ADD CONSTRAINT quote_requests_category_check
      CHECK (category IS NULL OR category IN ('electronics', 'clothing', 'accessories', 'other'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_delivery_address_fkey') THEN
    ALTER TABLE quote_requests
      ADD CONSTRAINT quote_requests_delivery_address_fkey
      FOREIGN KEY (delivery_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ----- QUOTES: Stripe payment fields ----------------------------------------
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS stripe_payment_link      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id        TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at                  TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_stripe_session_id
  ON quotes(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- ----- MESSAGES (admin ↔ customer thread per request) -----------------------
CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id  UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  sender_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  from_admin        BOOLEAN NOT NULL,
  content           TEXT NOT NULL,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_request_created
  ON messages(quote_request_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_request_unread
  ON messages(quote_request_id, created_at)
  WHERE read_at IS NULL;
