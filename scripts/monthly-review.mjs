/**
 * MONTHLY BLOG REVIEW (Zadanie 4) — one command, keep/improve/merge/cut report.
 *
 * Because the org policy `iam.disableServiceAccountKeyCreation` blocks the GSC
 * service-account key, we feed this tool a manual GSC export instead of the API.
 *
 * ── HOW TO RUN (once a month) ────────────────────────────────────────────────
 * 1. Google Search Console → cargooimport.eu → "Osiągnięcia" (Performance).
 *    Date range: "Ostatnie 3 miesiące". Tab "STRONY". Top-right "EKSPORTUJ" →
 *    "Plik CSV". Unzip it somewhere (it contains Strony.csv / Pages.csv).
 * 2. Run (PowerShell):
 *      $env:DATABASE_URL = "postgres://...neon..."
 *      node scripts/monthly-review.mjs "C:/path/to/unzipped/Strony.csv"
 *    (If you omit the path it defaults to C:/Users/jasiu/Downloads/_gsc_extract/Strony.csv.)
 * 3. Read the console summary + scripts/monthly-review.csv. Act on the CUT list:
 *    merge near-duplicates / delete dead weight, then add 301s to middleware
 *    (DELETED_REDIRECTS) and delete the rows via scripts/execute-cleanup.mjs.
 *
 * RULES (from the brief): data decides, no fixed per-language quota, improve/merge
 * before delete, library is allowed to grow. CUT = candidate only — review before
 * deleting, and always 301.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import pg from "pg";

const STRONY = process.argv[2] || "C:/Users/jasiu/Downloads/_gsc_extract/Strony.csv";
const STALE_DAYS = 75; // middle of the brief's 60–90 day window

// --- GSC impressions/clicks/pos by slug (sum across blog/resources URL variants) ---
const gscBySlug = new Map();
if (existsSync(STRONY)) {
  for (const line of readFileSync(STRONY, "utf-8").split(/\r?\n/).slice(1).filter(Boolean)) {
    const m = line.match(/^(.*?),(\d+),(\d+),[\d.]+%?,([\d.]+)$/);
    if (!m) continue;
    const sm = m[1].match(/\/(?:blog|resources)\/([^/?#]+)/);
    if (!sm) continue;
    const cur = gscBySlug.get(sm[1]) || { impr: 0, clicks: 0, pos: 999 };
    cur.impr += +m[3]; cur.clicks += +m[2]; cur.pos = Math.min(cur.pos, +m[4]);
    gscBySlug.set(sm[1], cur);
  }
  console.log(`GSC export: ${gscBySlug.size} content URLs with impressions (${STRONY}).`);
} else {
  console.warn(`⚠️  No GSC CSV at ${STRONY} — running with DB age only (every post will look zero-impression).`);
}

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const posts = (await c.query(
  `SELECT slug, lang, title, status, to_char("createdAt",'YYYY-MM-DD') created,
          (now()::date - "createdAt"::date) AS age_days
     FROM "BlogPost" WHERE status = 'PUBLISHED' ORDER BY "createdAt"`
)).rows;
await c.end();

function action(g, ageDays) {
  if (g && (g.clicks > 0 || g.impr >= 10)) return "KEEP";
  if (g && g.impr >= 1) return "IMPROVE";
  if (ageDays >= STALE_DAYS) return "CUT";   // 0 impressions, had its 60–90 day chance
  return "WATCH";                            // 0 impressions but still too young
}

const rows = posts.map(p => {
  const g = gscBySlug.get(p.slug);
  return {
    action: action(g, p.age_days), lang: p.lang, ageDays: p.age_days,
    impr: g?.impr || 0, clicks: g?.clicks || 0, pos: g ? g.pos.toFixed(1) : "",
    created: p.created, slug: p.slug, title: (p.title || "").slice(0, 70),
  };
}).sort((a, b) => (b.impr - a.impr) || (b.ageDays - a.ageDays));

const cols = ["action", "lang", "ageDays", "impr", "clicks", "pos", "created", "slug", "title"];
writeFileSync("scripts/monthly-review.csv",
  [cols.join(",")].concat(rows.map(r => cols.map(k => { const s = String(r[k] ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))).join("\n"), "utf-8");

const tally = {};
for (const r of rows) { (tally[r.action] ||= { en: 0, pl: 0, de: 0, fr: 0, total: 0 }); tally[r.action][r.lang]++; tally[r.action].total++; }
console.log(`\n=== MONTHLY REVIEW — ${posts.length} published posts (stale threshold: ${STALE_DAYS} days) ===`);
console.table(tally);
const cut = rows.filter(r => r.action === "CUT");
console.log(`\n=== CUT candidates: ${cut.length} posts — 0 impressions, older than ${STALE_DAYS}d. Review → merge or delete (always 301). ===`);
console.table(cut.map(r => ({ lang: r.lang, age: r.ageDays, slug: r.slug.slice(0, 60) })));
console.log("\nFull report: scripts/monthly-review.csv");
console.log("Next: pick merges/deletes from CUT, add 301s to middleware DELETED_REDIRECTS, run execute-cleanup.mjs --apply.");
