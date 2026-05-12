/**
 * Single source of truth for daily cold-email volume.
 *
 * Why one cap (shared budget):
 *   Gmail/Outlook/Resend rate-limit on TOTAL daily volume from a domain, not
 *   per-route. The old design — cold-route cap (COLD_OUTREACH_DAILY_LIMIT=20)
 *   plus drip-route cap (DRIP_DAILY_CAP=30) — meant the system could send 50
 *   in a day before either gate fired, which is well above what a young
 *   domain tolerates. Worse, the two caps drifted (20 vs 30) so ~14 mails/day
 *   were rejected by the cold route after drip had already burned through its
 *   own quota. Both routes now read this constant and share one budget.
 *
 * Window semantics:
 *   Per UTC calendar day. Counter resets at 00:00 UTC, NOT a rolling 24h
 *   window. Rolling-24h would force the morning batch to wait a full day from
 *   yesterday's final send; calendar-day means "at midnight UTC the slate
 *   wipes clean." Cloudflare Workers run in UTC so this matches production
 *   timing exactly; on a dev machine in a non-UTC timezone, the explicit
 *   Date.UTC(...) construction in dailyWindowStartUtc() avoids the
 *   setHours(0,0,0,0) trap (which sets *local* midnight).
 *
 * Bumping the cap:
 *   Domain reputation is cumulative — a fresh domain that jumps from 10 to
 *   50/day overnight gets throttled by every major ESP. Ramp gradually
 *   (e.g. +10/week) and watch /api/admin/email-health for bounce/spam rates
 *   before each step. Either edit DEFAULT_DAILY_EMAIL_CAP and redeploy, or
 *   set EMAIL_DAILY_CAP env var in Cloudflare Pages for a no-deploy bump.
 */
export const DEFAULT_DAILY_EMAIL_CAP = 25;

export function dailyEmailCap(): number {
  const raw = process.env.EMAIL_DAILY_CAP;
  if (!raw) return DEFAULT_DAILY_EMAIL_CAP;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : DEFAULT_DAILY_EMAIL_CAP;
}

/**
 * Start of the current UTC calendar day. Use this for the daily-cap window
 * query instead of `new Date().setHours(0,0,0,0)` — that helper sets LOCAL
 * midnight, which is fine on the Worker (UTC) but silently wrong on a dev
 * machine in Europe/Warsaw, etc. Explicit Date.UTC() removes the ambiguity.
 */
export function dailyWindowStartUtc(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}
