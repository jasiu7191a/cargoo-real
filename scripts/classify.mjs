import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const STRONY = "C:/Users/jasiu/Downloads/_gsc_extract/Strony.csv";

// --- parse Strony.csv: accumulate GSC by slug (sum across /blog, /resources, blog. subdomain variants) ---
const lines = readFileSync(STRONY, "utf-8").split(/\r?\n/).slice(1).filter(Boolean);
const gscBySlug = new Map();
let blogImpr = 0, otherImpr = 0, totalImpr = 0;
for (const line of lines) {
  const m = line.match(/^(.*?),(\d+),(\d+),[\d.]+%?,([\d.]+)$/);
  if (!m) continue;
  const [, url, clicks, impr, pos] = m;
  totalImpr += +impr;
  const slugM = url.match(/\/(?:blog|resources)\/([^/?#]+)/);
  if (!slugM) { otherImpr += +impr; continue; }
  blogImpr += +impr;
  const slug = slugM[1];
  const cur = gscBySlug.get(slug) || { impr: 0, clicks: 0, pos: 999, urls: new Set() };
  cur.impr += +impr; cur.clicks += +clicks; cur.pos = Math.min(cur.pos, +pos);
  cur.urls.add(url.replace(/^https?:\/\//, ""));
  gscBySlug.set(slug, cur);
}

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const posts = (await c.query(
  `SELECT slug, lang, title, "targetKeyword", to_char("createdAt",'YYYY-MM-DD') created,
          length(content) chars, array_length(regexp_split_to_array(trim(content), '\\s+'),1) words
     FROM "BlogPost" ORDER BY "createdAt"`
)).rows;
await c.end();

function status(p, g) {
  const junk = /test|connectivity|lorem|sample|dummy|placeholder/i.test(p.slug + " " + p.title);
  if (junk) return "DELETE";
  if (!g) return "ZERO";
  if (g.clicks > 0 || g.impr >= 10) return "KEEP";
  if (g.impr >= 1) return "IMPROVE";
  return "ZERO";
}

const rows = posts.map(p => {
  const g = gscBySlug.get(p.slug);
  return {
    lang: p.lang, slug: p.slug, title: (p.title || "").slice(0, 70),
    created: p.created, words: p.words || 0,
    impr: g?.impr || 0, clicks: g?.clicks || 0, pos: g ? g.pos.toFixed(1) : "",
    variants: g ? g.urls.size : 0,
    status: status(p, g), targetKeyword: p.targetKeyword || ""
  };
}).sort((a, b) => b.impr - a.impr);

const cols = ["status", "lang", "impr", "clicks", "pos", "variants", "words", "created", "slug", "title", "targetKeyword"];
writeFileSync("scripts/blog-classified.csv",
  [cols.join(",")].concat(rows.map(r => cols.map(k => { const s = String(r[k] ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))).join("\n"), "utf-8");

const byStatusLang = {};
for (const r of rows) { (byStatusLang[r.status] ||= { en: 0, pl: 0, de: 0, fr: 0, total: 0 }); byStatusLang[r.status][r.lang]++; byStatusLang[r.status].total++; }
console.log("=== GSC impressions split ===");
console.log(`Total property impressions: ${totalImpr} | blog+resources URLs: ${blogImpr} | home/product/brand/other: ${otherImpr}`);
console.log(`Distinct content slugs with >=1 impression: ${gscBySlug.size}`);
console.log("\n=== Proposed status x language (all posts) ===");
console.table(byStatusLang);
console.log("\n=== KEEP + IMPROVE (every post with ANY impressions) ===");
console.table(rows.filter(r => r.impr > 0).map(r => ({ status: r.status, lang: r.lang, impr: r.impr, clk: r.clicks, pos: r.pos, var: r.variants, slug: r.slug.slice(0, 58) })));
console.log("\n=== DELETE (junk) ===");
console.table(rows.filter(r => r.status === "DELETE").map(r => ({ lang: r.lang, slug: r.slug, impr: r.impr })));
console.log(`\nZERO-impression posts: ${rows.filter(r => r.status === "ZERO").length}`);
console.log("CSV: scripts/blog-classified.csv");
