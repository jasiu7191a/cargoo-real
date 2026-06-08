import { readFileSync } from "node:fs";
import pg from "pg";

// loser slug -> canonical target path (/{lang}/blog/{winnerSlug})
export const REDIRECTS = {
  // DELETE (test articles)
  "pl-test-connectivity-check-import-guide-china-eu": "/pl/blog/pl-end-of-de-minimis-exemption-july-2026-ecommerce-preparation-vat-customs",
  "en-test-auth-check-no-publish": "/en/blog/en-ioss-july-2026-eu-3-euro-duty-full-container-imports-vs-temu-shein",
  // MERGE (duplicate -> stronger sibling)
  "en-eu-made-in-europe-industrial-accelerator-act-2026-china-importers-guide": "/en/blog/en-eu-industrial-accelerator-act-2026-china-importers-guide",
  "en-made-in-europe-industrial-accelerator-act-2026-china-import-guide": "/en/blog/en-eu-industrial-accelerator-act-2026-china-importers-guide",
  "en-find-reliable-1688-suppliers-eu-import-2026-verification-guide": "/en/blog/en-find-reliable-chinese-factory-suppliers-eu-ecommerce-2026-alibaba-canton-fair",
  "en-eu-new-trade-weapon-china-overcapacity-import-guide-2026": "/en/blog/en-eu-trade-deficit-china-2026-importer-guide",
  "en-how-to-negotiate-moq-payment-terms-incoterms-chinese-factories-eu-ecommerce-2026": "/en/blog/en-negotiate-moq-payment-terms-chinese-factories-eu-importer-guide-2026",
  "en-how-to-verify-a-chinese-factory-before-ordering-eu-import-2026-supplier-due-diligence-checklist": "/en/blog/en-how-to-verify-chinese-factory-legitimacy-7-due-diligence-steps-eu-ecommerce-importers-2026",
  "de-eu-new-trade-instrument-chinese-overcapacity-2026-german-importers-guide": "/de/blog/de-eu-industry-law-2026-china-import-germany-guide",
  "de-cbam-co2-grenzausgleich-china-import-2026-pflichten-deutsche-importeure": "/de/blog/de-cbam-pflichten-2026-deutsche-online-shops-stahl-aluminium-china",
  "pl-nowe-clo-ue-3-euro-lipiec-2026-polskie-sklepy-import-chiny": "/pl/blog/pl-end-of-de-minimis-exemption-july-2026-ecommerce-preparation-vat-customs",
  "fr-tva-import-china-france-2026-guide-sme-ecommerce-vat-customs": "/fr/blog/fr-import-china-france-2026-vat-duties-ecommerce-guide",
};

const APPLY = process.argv.includes("--apply");
const losers = Object.keys(REDIRECTS);
const targets = [...new Set(Object.values(REDIRECTS).map(p => p.replace(/^\/[a-z]{2}\/blog\//, "")))];

const fallbacks = readFileSync("lib/blog-fallbacks.ts", "utf-8");

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const all = (await c.query(`SELECT slug, lang FROM "BlogPost"`)).rows;
const slugSet = new Set(all.map(r => r.slug));

let ok = true;
console.log("=== Sprawdzam 12 slugów do usunięcia ===");
for (const s of losers) {
  const exists = slugSet.has(s);
  const inFallback = fallbacks.includes(s);
  if (!exists) { ok = false; console.log(`  ❌ NIE ISTNIEJE w bazie: ${s}`); }
  else if (inFallback) { ok = false; console.log(`  ⚠️ JEST w blog-fallbacks (wróci!): ${s}`); }
  else console.log(`  ✅ ${s}`);
}
console.log("\n=== Sprawdzam 9 celów 301 (muszą istnieć) ===");
for (const t of targets) {
  if (!slugSet.has(t)) { ok = false; console.log(`  ❌ CEL NIE ISTNIEJE: ${t}`); }
  else console.log(`  ✅ ${t}`);
}

console.log(`\nPodsumowanie: ${losers.length} do usunięcia, ${targets.length} celów. Wszystko OK: ${ok ? "TAK" : "NIE"}`);

if (APPLY && ok) {
  const res = await c.query(`DELETE FROM "BlogPost" WHERE slug = ANY($1::text[])`, [losers]);
  console.log(`\n🗑️  USUNIĘTO ${res.rowCount} rekordów BlogPost.`);
  const left = (await c.query(`SELECT count(*)::int n FROM "BlogPost"`)).rows[0].n;
  console.log(`Pozostało wpisów: ${left}`);
} else if (APPLY && !ok) {
  console.log("\n⛔ Nie usuwam — weryfikacja nie przeszła. Popraw mapę REDIRECTS.");
} else {
  console.log("\n(dry-run — nic nie usunięto. Dodaj --apply aby wykonać.)");
}
await c.end();
