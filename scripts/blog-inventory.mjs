/**
 * Blog inventory + SEO-metrics report (Zadanie 1 — rozeznanie).
 *
 * READ-ONLY. Does not write to the database, does not delete anything, does
 * not call Gemini. It enumerates every BlogPost, joins the freshest SEO
 * metrics, and prints a per-language summary + a diagnostic that helps answer
 * "was the 5/day volume coming from an external scheduler?".
 *
 * ---------------------------------------------------------------------------
 * USAGE (PowerShell):
 *   $env:DATABASE_URL = "postgres://...neon..."          # REQUIRED
 *   # optional — pull LIVE metrics for ALL posts (no take:50 cap):
 *   $env:GSC_SERVICE_ACCOUNT_JSON = '{"client_email":"...","private_key":"..."}'
 *   $env:GSC_SITE_URL = "sc-domain:cargooimport.eu"      # or https URL-prefix
 *   node scripts/blog-inventory.mjs
 *
 * USAGE (bash):
 *   DATABASE_URL="postgres://..." node scripts/blog-inventory.mjs
 *
 * OUTPUT:
 *   - scripts/blog-inventory.csv   (one row per post, ready for Excel/Sheets)
 *   - console summary + scheduler diagnostic
 *
 * METRIC SOURCE PRIORITY per post:
 *   1. live GSC pull (if GSC env vars present)  -> source "gsc-live"
 *   2. newest SeoMetric row already in the DB   -> source "db-seometric"
 *   3. newest SeoCheck row (indexed yes/no)     -> source "db-seocheck"
 *   4. nothing                                  -> source "none"
 *
 * Note: pg is already a project dependency (see prisma/seed-fr-blogs.js).
 */

import crypto from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.cargooimport.eu";
const GSC_WINDOW_DAYS = 90; // brief asks about 60–90 day windows

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ymd(d) {
  return d.toISOString().slice(0, 10);
}
function pageUrl(lang, slug) {
  return `${SITE_URL}/${lang}/blog/${slug}`;
}
function normalizeUrl(u) {
  return (u || "").replace(/\/+$/, "");
}
function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ---------------------------------------------------------------------------
// Optional live GSC pull (ports lib/gsc.ts to standalone node:crypto)
// ---------------------------------------------------------------------------
async function gscToken() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    console.warn("⚠️  GSC_SERVICE_ACCOUNT_JSON is not valid JSON — skipping live GSC.");
    return null;
  }
  if (!sa.client_email || !sa.private_key) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const aud = sa.token_uri || "https://oauth2.googleapis.com/token";
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const sig = signer.sign(sa.private_key).toString("base64url");
  const jwt = `${signingInput}.${sig}`;

  const res = await fetch(aud, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    console.warn("⚠️  GSC token exchange failed:", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const body = await res.json();
  return body.access_token || null;
}

async function gscPullAllPages() {
  const token = await gscToken();
  if (!token) return null;
  const site = process.env.GSC_SITE_URL;
  if (!site) {
    console.warn("⚠️  GSC_SERVICE_ACCOUNT_JSON present but GSC_SITE_URL missing — skipping live GSC.");
    return null;
  }
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - GSC_WINDOW_DAYS);

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ["page"],
        rowLimit: 1000, // no take:50 cap — cover the whole library
      }),
    }
  );
  if (!res.ok) {
    console.warn("⚠️  GSC searchAnalytics failed:", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const data = await res.json();
  const byPage = new Map();
  for (const r of data.rows || []) {
    const url = normalizeUrl(r.keys?.[0]);
    if (!url) continue;
    byPage.set(url, {
      impressions: Number(r.impressions) || 0,
      clicks: Number(r.clicks) || 0,
      ctr: Number(r.ctr) || 0,
      position: Number(r.position) || 0,
    });
  }
  console.log(`✅ Live GSC: pulled ${byPage.size} page rows for the last ${GSC_WINDOW_DAYS} days.`);
  return byPage;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is required. See the header of this file for usage.");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
  });
  await client.connect();

  // 1. All posts
  const posts = (
    await client.query(
      `SELECT id, slug, lang, title, status, "targetKeyword",
              "createdAt", "publishedAt", length(content) AS content_chars, content
         FROM "BlogPost"
         ORDER BY "createdAt" ASC`
    )
  ).rows;

  // 2. Newest SeoMetric per post (window-function, latest by date)
  const metricRows = (
    await client.query(
      `SELECT DISTINCT ON ("postId") "postId", slug, lang, impressions, clicks, ctr, position, date
         FROM "SeoMetric"
        WHERE "postId" IS NOT NULL
        ORDER BY "postId", date DESC`
    )
  ).rows;
  const metricByPost = new Map(metricRows.map((r) => [r.postId, r]));

  // 3. Newest SeoCheck per post (indexed flag fallback)
  const checkRows = (
    await client.query(
      `SELECT DISTINCT ON ("postId") "postId", indexed, "checkedAt"
         FROM "SeoCheck"
        ORDER BY "postId", "checkedAt" DESC`
    )
  ).rows;
  const checkByPost = new Map(checkRows.map((r) => [r.postId, r]));

  // 4. Optional live GSC
  const gscByPage = await gscPullAllPages();

  // ---- Build rows -------------------------------------------------------
  const out = [];
  for (const p of posts) {
    const url = pageUrl(p.lang, p.slug);
    let impressions = "",
      clicks = "",
      ctr = "",
      position = "",
      indexed = "",
      source = "none";

    const live = gscByPage?.get(normalizeUrl(url));
    const dbm = metricByPost.get(p.id);
    const chk = checkByPost.get(p.id);

    if (live) {
      impressions = live.impressions;
      clicks = live.clicks;
      ctr = live.ctr;
      position = live.position;
      indexed = live.impressions > 0;
      source = "gsc-live";
    } else if (dbm) {
      impressions = dbm.impressions;
      clicks = dbm.clicks;
      ctr = dbm.ctr;
      position = dbm.position;
      indexed = dbm.impressions > 0;
      source = "db-seometric";
    } else if (chk) {
      indexed = chk.indexed;
      source = "db-seocheck";
    }

    out.push({
      url,
      lang: p.lang,
      slug: p.slug,
      title: p.title,
      status: p.status,
      createdAt: p.createdAt ? ymd(new Date(p.createdAt)) : "",
      publishedAt: p.publishedAt ? ymd(new Date(p.publishedAt)) : "",
      words: wordCount(p.content),
      impressions,
      clicks,
      ctr: ctr === "" ? "" : Number(ctr).toFixed(4),
      position: position === "" ? "" : Number(position).toFixed(1),
      indexed,
      metricSource: source,
      targetKeyword: p.targetKeyword || "",
      recommendation: "", // filled in Zadanie 2
    });
  }

  // ---- CSV --------------------------------------------------------------
  const cols = [
    "url", "lang", "slug", "title", "status", "createdAt", "publishedAt",
    "words", "impressions", "clicks", "ctr", "position", "indexed",
    "metricSource", "targetKeyword", "recommendation",
  ];
  const csv = [cols.join(",")]
    .concat(out.map((r) => cols.map((c) => csvCell(r[c])).join(",")))
    .join("\n");
  const csvPath = join(__dirname, "blog-inventory.csv");
  writeFileSync(csvPath, csv, "utf-8");

  // ---- Per-language summary --------------------------------------------
  const byLang = {};
  for (const r of out) {
    const L = (byLang[r.lang] ||= { total: 0, published: 0, indexed: 0, withImpr: 0, thin: 0, zeroData: 0 });
    L.total++;
    if (r.status === "PUBLISHED") L.published++;
    if (r.indexed === true) L.indexed++;
    if (typeof r.impressions === "number" && r.impressions > 0) L.withImpr++;
    if (r.words < 600) L.thin++;
    if (r.metricSource === "none") L.zeroData++;
  }

  console.log("\n================ BLOG INVENTORY ================");
  console.log(`Total posts: ${out.length}`);
  console.table(byLang);
  console.log(`CSV written: ${csvPath}`);

  const coverage = out.filter((r) => r.metricSource !== "none").length;
  console.log(
    `\nMetric coverage: ${coverage}/${out.length} posts have metrics ` +
      `(source breakdown below). If this is ~50 and you did NOT pass GSC env ` +
      `vars, that's the take:50 cap in seo-check — pass GSC creds to this ` +
      `script for full coverage.`
  );
  const srcBreak = {};
  for (const r of out) srcBreak[r.metricSource] = (srcBreak[r.metricSource] || 0) + 1;
  console.table(srcBreak);

  // ---- Scheduler diagnostic --------------------------------------------
  // (a) publish histogram — a clean "5 per day" pattern points at a fixed
  //     external scheduler; a one-time burst points at manual/seed seeding.
  const perDay = {};
  for (const r of out) {
    const d = r.createdAt || "(none)";
    perDay[d] = (perDay[d] || 0) + 1;
  }
  const busiest = Object.entries(perDay).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log("\n========== SCHEDULER DIAGNOSTIC ==========");
  console.log("Busiest creation days (date -> #posts):");
  for (const [d, n] of busiest) console.log(`  ${d}: ${n}`);

  // (b) AdminAction authorship — the in-repo cron stamps "Growth Agent"
  //     (trigger) / "Agent" (leads-pipeline). Posts with NO matching action,
  //     or a different author, were seeded/manual/external.
  const actions = (
    await client.query(
      `SELECT "adminName", type, count(*)::int AS n,
              min("createdAt") AS first, max("createdAt") AS last
         FROM "AdminAction"
        WHERE type ILIKE 'AGENT_ARTICLE%' OR type ILIKE 'LEADS_PIPELINE%' OR type ILIKE '%ARTICLE%'
        GROUP BY "adminName", type
        ORDER BY n DESC`
    )
  ).rows;
  console.log("\nBlog-related AdminAction rows (who/what published):");
  if (actions.length === 0) {
    console.log("  (none) — NO agent-publish actions logged. The ~150 posts were");
    console.log("  almost certainly seeded by script/manual import, not by the");
    console.log("  in-repo cron. An external scheduler is unlikely to leave no trace,");
    console.log("  but check your host's crontab / n8n / Zapier to be 100% sure.");
  } else {
    console.table(
      actions.map((a) => ({
        adminName: a.adminName,
        type: a.type,
        count: a.n,
        first: a.first ? ymd(new Date(a.first)) : "",
        last: a.last ? ymd(new Date(a.last)) : "",
      }))
    );
    const publishActions = actions
      .filter((a) => /ARTICLE/i.test(a.type))
      .reduce((s, a) => s + a.n, 0);
    console.log(
      `\nAGENT publish actions: ${publishActions} vs total posts: ${out.length}. ` +
        `A large gap (e.g. ${publishActions} << ${out.length}) means most posts did ` +
        `NOT come from the in-repo agent — i.e. seed/manual/external bulk load.`
    );
  }

  await client.end();
  console.log("\nDone. Open scripts/blog-inventory.csv to start the keep/improve/merge/delete pass.\n");
}

main().catch((e) => {
  console.error("Inventory failed:", e);
  process.exit(1);
});
