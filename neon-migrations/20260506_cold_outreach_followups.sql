-- 2026-05-06: Allow multiple cold-outreach records per email so follow-up touches
-- can be sent. Previously the schema had a UNIQUE constraint on email that made
-- the /api/admin/outreach/cold endpoint reject every follow-up with HTTP 409 and
-- (worse) the INSERT itself would have blown up on the unique index.
--
-- After this migration the agent can send touch 2, 3, ... to the same address.
-- The endpoint enforces a configurable cooldown window between sends instead.

ALTER TABLE "ColdOutreach" DROP CONSTRAINT IF EXISTS "ColdOutreach_email_key";
DROP INDEX IF EXISTS "ColdOutreach_email_key";

ALTER TABLE "ColdOutreach"
  ADD COLUMN IF NOT EXISTS "touchNumber" INTEGER NOT NULL DEFAULT 1;

-- Fast "most recent contact for this address" lookup, used by the cooldown check.
CREATE INDEX IF NOT EXISTS "ColdOutreach_email_sentAt_idx"
  ON "ColdOutreach" ("email", "sentAt" DESC);

-- Backfill touchNumber for any pre-existing rows that share an email.
-- Earliest send = 1, next = 2, etc. Idempotent: only updates rows still at the
-- default of 1 where another row exists for the same email.
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY "sentAt" ASC) AS rn
  FROM "ColdOutreach"
)
UPDATE "ColdOutreach" co
SET "touchNumber" = numbered.rn
FROM numbered
WHERE co.id = numbered.id
  AND numbered.rn > 1;
