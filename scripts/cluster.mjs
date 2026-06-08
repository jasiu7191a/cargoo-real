import { readFileSync } from "node:fs";
import pg from "pg";

// GSC impressions by slug (reuse export)
const STRONY = "C:/Users/jasiu/Downloads/_gsc_extract/Strony.csv";
const imprBySlug = new Map();
for (const line of readFileSync(STRONY, "utf-8").split(/\r?\n/).slice(1).filter(Boolean)) {
  const m = line.match(/^(.*?),(\d+),(\d+),[\d.]+%?,([\d.]+)$/);
  if (!m) continue;
  const sm = m[1].match(/\/(?:blog|resources)\/([^/?#]+)/);
  if (!sm) continue;
  imprBySlug.set(sm[1], (imprBySlug.get(sm[1]) || 0) + (+m[3]));
}

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const posts = (await c.query(`SELECT slug, lang, title, "targetKeyword" k FROM "BlogPost"`)).rows;
await c.end();

// Discriminative topic tokens — drop ubiquitous words so clustering keys on the actual subject
const STOP = new Set("a an the for from to of and or how what your you in with on is are guide complete ultimate 2026 2025 china chinese import importing importer importers eu europe european business businesses ecommerce e commerce online retailer retailers shop store sme small direct sourcing source product products goods avoid your this that les des pour depuis vers comment qui import von aus nach beim fuer der die das und im z do na przy jak dla oraz w".split(/\s+/));
function tokens(p) {
  return new Set(
    (p.title + " " + (p.k || "")).toLowerCase()
      .replace(/[^a-z0-9äöüßąćęłńóśźż\s-]/g, " ")
      .split(/[\s-]+/)
      .filter(t => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t))
  );
}
function jacc(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); }

const impr = s => imprBySlug.get(s) || 0;
const byLang = {};
for (const p of posts) (byLang[p.lang] ||= []).push({ ...p, tok: tokens(p), impr: impr(p.slug) });

console.log("=== MERGE candidate clusters (per language, Jaccard >= 0.34, >=2 shared topic tokens) ===\n");
let clusterCount = 0, mergeableLosers = 0;
for (const lang of ["en", "pl", "de", "fr"]) {
  const arr = byLang[lang] || [];
  const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (seen.has(i)) continue;
    const group = [i];
    for (let j = i + 1; j < arr.length; j++) {
      if (seen.has(j)) continue;
      let shared = 0; for (const t of arr[i].tok) if (arr[j].tok.has(t)) shared++;
      if (shared >= 2 && jacc(arr[i].tok, arr[j].tok) >= 0.34) { group.push(j); seen.add(j); }
    }
    if (group.length >= 2) {
      seen.add(i); clusterCount++;
      const members = group.map(g => arr[g]).sort((a, b) => b.impr - a.impr);
      mergeableLosers += members.length - 1;
      const sharedTok = [...members[0].tok].filter(t => members.every(m => m.tok.has(t))).slice(0, 6).join(", ");
      console.log(`[${lang.toUpperCase()}] cluster (${members.length}) — shared: ${sharedTok}`);
      members.forEach((m, idx) => console.log(`   ${idx === 0 ? "KEEP→" : "merge"} impr=${m.impr}  ${m.slug}`));
      console.log("");
    }
  }
}
console.log(`Total clusters: ${clusterCount} | posts that could be merged away (301'd into a sibling): ${mergeableLosers}`);
