/**
 * Shared prompt builder + Gemini-response parser for the blog generator.
 *
 * Previously the same SOURCING_GUIDE_PROMPT existed in two places
 * (`app/api/agent/trigger/route.ts` and `app/api/admin/content/generate/route.ts`)
 * and they had already drifted (different sections, different output schema).
 * This module is the single source of truth for prompt copy + JSON shape.
 *
 * The prompt is structured so that downstream features can be turned on/off
 * via options without rewriting the template:
 *  - `includeFaq` → adds the FAQ section to the schema + instructions
 *  - `relatedPosts` → injects an internal-linking instruction block
 *  - `varietyHint`  → swaps the headline section template so we don't ship
 *                     the same five H3s every article
 */
export type BlogLang = "en" | "pl" | "de" | "fr";

export const LANG_NAMES: Record<BlogLang, string> = {
  en: "English",
  pl: "Polish",
  de: "German",
  fr: "French",
};

export type BlogVarietyHint = "guide" | "comparison" | "listicle" | "how-to";

export interface RelatedPostHint {
  slug: string;
  title: string;
  targetKeyword?: string | null;
}

export interface BuildBlogPromptOptions {
  /**
   * Posts the LLM should choose from for internal links. Pass at most 20 –
   * longer lists waste tokens without helping topical authority.
   */
  relatedPosts?: RelatedPostHint[];
  /** Add 5-7 FAQ items + JSON-LD-ready FAQ shape to the response. */
  includeFaq?: boolean;
  /**
   * Bias the article structure to avoid every post looking the same.
   * Cycle the hint by `articleIndex % 4` from the caller for organic variety.
   */
  varietyHint?: BlogVarietyHint;
}

/**
 * Compose the section-structure block based on the chosen variety. We keep
 * the EU/PL/DE/FR sourcing angle in every variant because that's the topical
 * focus, but switch the H3 lineup so Google's templated-content classifier
 * has less of a fingerprint to grab onto.
 */
function structureBlock(hint: BlogVarietyHint | undefined): string {
  switch (hint) {
    case "comparison":
      return `
Structure:
  ### Snapshot — Who should consider this?
  ### Option A vs Option B (markdown table comparing 3-5 attributes)
  ### When direct China sourcing wins
  ### When a local EU supplier wins
  ### Hidden costs (customs, VAT, shipping)
  ### How Cargoo bridges the gap (CTA)`;
    case "listicle":
      return `
Structure:
  ### Why this matters for EU importers in 2026
  ### 1. <First insight> (2-3 paragraphs + concrete example)
  ### 2. <Second insight>
  ### 3. <Third insight>
  ### 4. <Fourth insight>
  ### 5. <Fifth insight>
  ### How Cargoo helps you act on this (CTA)`;
    case "how-to":
      return `
Structure:
  ### Outcome — what you'll have at the end
  ### Step 1: Define spec & MOQ realistically
  ### Step 2: Verify suppliers (Alibaba traps to avoid)
  ### Step 3: Quality control before payment
  ### Step 4: Shipping mode + duty math
  ### Step 5: Customs clearance in PL/DE/FR
  ### Where Cargoo plugs in (CTA)`;
    case "guide":
    default:
      return `
Structure:
  ### Why import this from China
  ### Verified sourcing & quality control
  ### Logistics & shipping to the EU
  ### Customs & duties (Poland, Germany, France)
  ### How Cargoo can help (CTA)`;
  }
}

function relatedBlock(lang: BlogLang, posts: RelatedPostHint[] | undefined): string {
  if (!posts || posts.length === 0) return "";
  const list = posts
    .slice(0, 20)
    .map(p => `- "${p.title}" → /${lang}/blog/${p.slug}`)
    .join("\n");
  return `
Internal linking (REQUIRED):
- Naturally weave 3-5 markdown links to the EXISTING articles below where they fit the surrounding paragraph.
- Use the exact path shown. Do NOT fabricate slugs, do NOT shorten them.
- Anchor text should be descriptive (the article title or a close paraphrase), never "click here".
- Place each link inside running prose, not in a "Related reading" dump.

Candidate articles:
${list}
`;
}

function faqBlock(lang: BlogLang, include: boolean | undefined): string {
  if (!include) return "";
  return `
FAQ (REQUIRED):
- After the main content, produce 5-7 frequently asked questions an EU importer would google.
- Each answer is 2-4 sentences. Plain text, no markdown.
- Questions must match the article's keyword and language (${LANG_NAMES[lang]}).
- Return them in the dedicated "faq" JSON array described below — do NOT also paste them into "content".
`;
}

export function buildBlogPrompt(
  keyword: string,
  lang: BlogLang,
  options: BuildBlogPromptOptions = {}
): string {
  const langName = LANG_NAMES[lang];
  const structure = structureBlock(options.varietyHint);
  const related = relatedBlock(lang, options.relatedPosts);
  const faq = faqBlock(lang, options.includeFaq);

  const jsonShape = options.includeFaq
    ? `{ "title": "...", "slug": "...", "metaDescription": "...", "content": "...", "faq": [ { "question": "...", "answer": "..." }, ... ] }`
    : `{ "title": "...", "slug": "...", "metaDescription": "...", "content": "..." }`;

  return `
You are a senior sourcing agent and logistics expert for Cargoo Import — a platform helping EU businesses import from China.

Write a comprehensive, high-converting article for the keyword/topic: "${keyword}".

LANGUAGE: Write EVERY field (title, metaDescription, content${options.includeFaq ? ", faq" : ""}) in ${langName}. The slug stays in Latin characters (URL-safe).

Requirements:
- Title: Catchy, professional, SEO-optimized for "${keyword}".
- Slug: URL-safe, hyphenated, lowercase, ASCII only (transliterate accents).
- Meta description: Compelling summary under 160 characters, in ${langName}.
- Content: Long-form Markdown (1200–1800 words) in ${langName}.
- Cite at least 2 real, credible sources by name in the prose (e.g. "European Commission", "WCO", a published industry report). Do NOT fabricate URLs — name the source inline; only link out to widely-known domains (ec.europa.eu, wto.org, etc.) you are sure exist.
- Avoid the boilerplate phrase "in today's fast-paced world" and similar AI tells.
${structure}
${related}
${faq}
Output:
- Return ONLY a single raw JSON object, no markdown fences, no commentary.
- Schema: ${jsonShape}
`.trim();
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

export interface ParsedBlogContent {
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  faq?: { question: string; answer: string }[];
}

/**
 * Pulls the first {...} block out of a Gemini response, strips common
 * markdown-fence wrappers, JSON.parses it, and validates the required fields.
 * Returns null if parsing fails — callers should treat that as a 502.
 */
export function parseBlogJson(raw: string): ParsedBlogContent | null {
  if (!raw) return null;
  const match = raw.match(/\{[\s\S]*\}/);
  const cleaned = match
    ? match[0]
    : raw.trim().replace(/^```json?\n?/i, "").replace(/```$/i, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (!parsed?.title || !parsed?.slug || !parsed?.content) return null;

  // Defensive: keep only well-formed FAQ entries (the LLM occasionally
  // returns `null` or partial objects mid-array).
  let faq: ParsedBlogContent["faq"] | undefined;
  if (Array.isArray(parsed.faq)) {
    faq = parsed.faq
      .map((entry: any) => ({
        question: typeof entry?.question === "string" ? entry.question.trim() : "",
        answer:   typeof entry?.answer   === "string" ? entry.answer.trim()   : "",
      }))
      .filter((entry: { question: string; answer: string }) => entry.question && entry.answer);
    if (faq && faq.length === 0) faq = undefined;
  }

  return {
    title: String(parsed.title),
    slug: String(parsed.slug),
    metaDescription: String(parsed.metaDescription ?? ""),
    content: String(parsed.content),
    faq,
  };
}

/**
 * Counts how many of the supplied candidate slugs actually appear as
 * internal markdown links in the generated content. Used by callers that
 * want to retry the prompt with a stronger instruction when the LLM
 * ignored the linking requirement.
 */
export function countInternalLinks(
  content: string,
  lang: BlogLang,
  candidates: RelatedPostHint[]
): number {
  if (!candidates || candidates.length === 0) return 0;
  let hits = 0;
  for (const c of candidates) {
    const needle = `/${lang}/blog/${c.slug}`;
    if (content.includes(`](${needle})`) || content.includes(`](${needle}/)`)) {
      hits += 1;
    }
  }
  return hits;
}
