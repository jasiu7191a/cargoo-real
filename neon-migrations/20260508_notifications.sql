-- 2026-05-08: In-app notifications for the customer dashboard.
-- Adds a per-user `lang` column so notifications can be rendered server-side
-- in the user's preferred locale at creation time, and creates the
-- `notifications` table with a partial index for the common
-- "give me unread notifications, newest first" query.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'en';

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  link         TEXT,
  meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'quote_ready',
      'quote_accepted',
      'quote_rejected',
      'message_received',
      'order_paid',
      'order_shipped',
      'order_delivered',
      'generic'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all
  ON notifications(user_id, created_at DESC);
