/**
 * Tiny HTML-escape helper, factored out of lib/mail.ts so cold-outreach
 * templates can import it without dragging the full Resend client (and its
 * env-var requirements) into modules that may run during build-time
 * template tests.
 */
export function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
