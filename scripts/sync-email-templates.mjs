#!/usr/bin/env node
/**
 * Regenerates lib/email-templates/<lang>.ts from email-previews/email-<lang>.html.
 *
 * Workflow:
 *   1. Edit email-previews/email-en.html in a browser-aware editor.
 *   2. Open the file directly in a browser to preview.
 *   3. Run `node scripts/sync-email-templates.mjs` to regenerate the TS exports
 *      that mail.ts and outreach.ts import.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const previewsDir = join(root, "email-previews");
const templatesDir = join(root, "lib", "email-templates");

const langs = readdirSync(previewsDir)
  .map((f) => f.match(/^email-([a-z]{2})\.html$/)?.[1])
  .filter(Boolean);

if (langs.length === 0) {
  console.error("No email-<lang>.html files found in email-previews/");
  process.exit(1);
}

for (const lang of langs) {
  const html = readFileSync(join(previewsDir, `email-${lang}.html`), "utf8");
  const out = `// AUTO-GENERATED from ../../email-previews/email-${lang}.html\n// Edit the HTML file and re-run scripts/sync-email-templates.mjs.\nexport const template = ${JSON.stringify(html)};\n`;
  writeFileSync(join(templatesDir, `${lang}.ts`), out);
  console.log(`  wrote lib/email-templates/${lang}.ts (${html.length} chars)`);
}

const importLines = langs.map((l) => `import { template as ${l} } from "./${l}";`).join("\n");
const recordEntries = langs.map((l) => `${l}`).join(", ");
const indexOut = `${importLines}\n\nconst templates: Record<string, string> = { ${recordEntries} };\n\n/**\n * Returns the branded HTML email template for the given language.\n * Falls back to English. Replace {{BODY}} and {{UNSUB_URL}} before sending.\n */\nexport function getEmailTemplate(lang: string): string {\n  return templates[lang] ?? templates["en"];\n}\n`;
writeFileSync(join(templatesDir, "index.ts"), indexOut);
console.log(`  wrote lib/email-templates/index.ts (${langs.length} locales: ${langs.join(", ")})`);
