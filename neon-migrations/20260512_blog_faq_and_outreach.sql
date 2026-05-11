-- =============================================================================
-- 20260512 — automation improvements
-- =============================================================================
-- Run by pasting the entire file into the Neon SQL Editor. Idempotent
-- (every statement uses IF NOT EXISTS), so re-running it is safe.
--
-- After running this, redeploy cargoo-real-fixed so Prisma Client picks up
-- the new schema. The Pages build runs `prisma generate` automatically.
--
-- Adds:
--   1. BlogPost.faq                — JSONB array of {question, answer}
--   2. ColdOutreach.replied        — boolean flag set by inbound-reply
--                                    webhook; drip cron skips replied=true
--   3. ColdOutreach.repliedAt      — when the reply was detected
--   4. ColdOutreach (replied,sentAt) index — speed up the drip cron's
--                                    candidate query (it filters by both)
--   5. SeoMetric                   — new table for GSC analytics rows
-- =============================================================================

-- 1) BlogPost.faq -------------------------------------------------------------
ALTER TABLE "BlogPost"
  ADD COLUMN IF NOT EXISTS "faq" JSONB;

-- 2 + 3) ColdOutreach reply tracking -----------------------------------------
ALTER TABLE "ColdOutreach"
  ADD COLUMN IF NOT EXISTS "replied"   BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP(3);

-- 4) Index for drip cron's "find candidates older than cooldown" query -------
CREATE INDEX IF NOT EXISTS "ColdOutreach_replied_sentAt_idx"
  ON "ColdOutreach" ("replied", "sentAt");

-- 5) SeoMetric — GSC analytics snapshot --------------------------------------
CREATE TABLE IF NOT EXISTS "SeoMetric" (
  "id"          TEXT        PRIMARY KEY,
  "postId"      TEXT,
  "slug"        TEXT        NOT NULL,
  "lang"        TEXT        NOT NULL,
  "query"       TEXT,
  "impressions" INTEGER     NOT NULL DEFAULT 0,
  "clicks"      INTEGER     NOT NULL DEFAULT 0,
  "ctr"         DOUBLE PRECISION NOT NULL DEFAULT 0,
  "position"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "date"        TIMESTAMP(3) NOT NULL,
  "capturedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SeoMetric_slug_lang_date_idx"
  ON "SeoMetric" ("slug", "lang", "date");

CREATE INDEX IF NOT EXISTS "SeoMetric_postId_date_idx"
  ON "SeoMetric" ("postId", "date");
