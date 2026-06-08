import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildBlogPrompt,
  parseBlogJson,
  countInternalLinks,
  type BlogLang,
  type BlogVarietyHint,
  type RelatedPostHint,
} from "@/lib/seo-prompts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Secured by a dedicated AGENT_SECRET — separate from admin credentials.
// Set this in Cloudflare env vars. Generate with: openssl rand -base64 32
function verifySecret(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.AGENT_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

const VARIETY_CYCLE: BlogVarietyHint[] = ["guide", "how-to", "listicle", "comparison"];

async function callGemini(prompt: string, signal: AbortSignal, apiKey: string) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "Return only valid JSON with no markdown, backticks, or explanation." }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000 },
      }),
    }
  );
  return res;
}

/**
 * Dry-run support:
 *   Pass `?dryRun=true` (query string) or `{ "dryRun": true }` in the body to
 *   exercise auth + validation + dedup lookups WITHOUT calling Gemini, writing
 *   a BlogPost, or logging an AdminAction. Use this to verify the AGENT_SECRET
 *   bearer token from a new orchestrator without polluting production with
 *   throwaway articles. Response shape:
 *     {
 *       success: true,
 *       dryRun: true,
 *       authOk: true,
 *       wouldCreateArticles: [{ keyword, lang, varietyHint, relatedPostsAvailable, slugPrefix }],
 *       wouldSendEmails: [],
 *       note: "<what got skipped>"
 *     }
 *
 * Manual test:
 *   curl -sS -X POST -H "Authorization: Bearer $AGENT_SECRET" \
 *        -H "Content-Type: application/json" \
 *        -d '{"keyword":"import duties china","lang":"en","dryRun":true}' \
 *        https://admin.cargooimport.eu/api/agent/trigger
 */

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { keyword, lang = "en" } = body;
  const dryRun =
    body?.dryRun === true ||
    new URL(req.url).searchParams.get("dryRun") === "true";

  if (!keyword || typeof keyword !== "string" || keyword.length > 500) {
    return NextResponse.json({ error: "keyword is required (string, max 500 chars)" }, { status: 400 });
  }

  const safeLang: BlogLang = (["en", "pl", "de", "fr"].includes(lang) ? lang : "en") as BlogLang;

  const geminiKey = process.env.GEMINI_API_KEY;
  // In dry-run we don't call Gemini, so a missing key shouldn't fail the
  // auth-verification flow. In a real run the absence of the key is still a
  // hard 503.
  if (!dryRun && !geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  // Dedup at the route level too — even if the orchestrator forgets to check,
  // we never generate two articles for the same keyword/lang pair. Slug
  // collisions are also caught later but this catches the case where Gemini
  // would have invented a brand-new slug for an already-covered topic.
  const dupe = await prisma.blogPost.findFirst({
    where: {
      status: { in: ["PUBLISHED", "DRAFT"] },
      lang: safeLang,
      targetKeyword: { equals: keyword, mode: "insensitive" },
    },
  });
  if (dupe) {
    return NextResponse.json({
      skipped: true,
      reason: "Keyword already covered",
      existingId: dupe.id,
      slug: dupe.slug,
      dryRun,
    });
  }

  // Pull related published posts for the same lang — used both as internal-link
  // candidates and (transitively) to keep the article off topics already shipped.
  const relatedRows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", lang: safeLang },
    select: { slug: true, title: true, targetKeyword: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
  const relatedPosts: RelatedPostHint[] = relatedRows.map(r => ({
    slug: r.slug.replace(new RegExp(`^${safeLang}-`), ""), // the prompt path doesn't include the lang prefix
    title: r.title,
    targetKeyword: r.targetKeyword,
  }));

  // Rotate variety so we don't ship 30 articles with identical H3s. Index is
  // simply how many articles already exist for this lang.
  const articleIndex = relatedRows.length;
  const varietyHint = VARIETY_CYCLE[articleIndex % VARIETY_CYCLE.length];

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      authOk: true,
      wouldCreateArticles: [
        {
          keyword,
          lang: safeLang,
          varietyHint,
          relatedPostsAvailable: relatedPosts.length,
          slugPrefix: `${safeLang}-`,
        },
      ],
      wouldSendEmails: [],
      note: "Dry run: auth + validation + dedup check + related-posts query ran. Skipped: Gemini call, prisma.blogPost.create, prisma.adminAction.create.",
    });
  }

  // Timeout after 45s — Gemini can be slow on long articles
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  let raw = "";
  try {
    let prompt = buildBlogPrompt(keyword, safeLang, {
      relatedPosts,
      includeFaq: true,
      varietyHint,
      // Real first-hand Cargoo facts (fees, observed transit times, real
      // importer mistakes). Set CARGOO_FACTS in Cloudflare to inject them —
      // this is the moat pure-AI competitors can't fake. Empty = the prompt
      // falls back to "accurate general figures, no fabrication".
      firstHandFacts: process.env.CARGOO_FACTS,
    });

    let geminiRes = await callGemini(prompt, controller.signal, geminiKey!);
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: "Gemini API error", details: err.slice(0, 500) }, { status: 502 });
    }
    let geminiData = await geminiRes.json();
    raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // If the first response is missing internal links and we DO have candidates,
    // retry once with a stronger instruction. Single retry — don't loop forever.
    if (relatedPosts.length >= 3) {
      const parsed = parseBlogJson(raw);
      const linkHits = parsed ? countInternalLinks(parsed.content, safeLang, relatedPosts) : 0;
      if (parsed && linkHits < 3) {
        const stronger =
          prompt +
          `\n\nIMPORTANT RETRY: your previous draft included ${linkHits} internal links. You MUST include at least 3 markdown links of the form [Title](/${safeLang}/blog/<slug>) using only the slugs listed above. Regenerate the FULL article with the links woven naturally into the prose.`;
        geminiRes = await callGemini(stronger, controller.signal, geminiKey!);
        if (geminiRes.ok) {
          geminiData = await geminiRes.json();
          raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? raw;
        }
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Gemini API timed out after 45s" }, { status: 504 });
    }
    return NextResponse.json({ error: "Gemini request failed", details: String(err) }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  const contentData = parseBlogJson(raw);
  if (!contentData) {
    return NextResponse.json(
      { error: "Failed to parse Gemini JSON", raw: raw.slice(0, 500) },
      { status: 502 }
    );
  }

  const langSlug = `${safeLang}-${contentData.slug}`;

  // If slug already exists (duplicate run), skip rather than crash
  const existing = await prisma.blogPost.findUnique({ where: { slug: langSlug } });
  if (existing) {
    return NextResponse.json({ skipped: true, reason: "Slug already exists", slug: langSlug });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: contentData.title,
      slug: langSlug,
      metaDescription: contentData.metaDescription ?? "",
      content: contentData.content,
      targetKeyword: keyword,
      lang: safeLang,
      status: "PUBLISHED",
      publishedAt: new Date(),
      // Cast for the new column — Prisma client only sees this after the
      // generated client is rebuilt with the migrated schema (see
      // neon-migrations/20260512_blog_faq_and_outreach.sql + npx prisma generate).
      ...(contentData.faq ? ({ faq: contentData.faq } as any) : {}),
    } as any,
  });

  await prisma.adminAction.create({
    data: {
      type: "AGENT_ARTICLE_PUBLISHED",
      details: `Agent published "${post.title}" [${safeLang}] keyword: "${keyword}" variety: ${varietyHint} faq: ${contentData.faq?.length ?? 0}`,
      adminName: "Growth Agent",
    },
  });

  return NextResponse.json({
    success: true,
    post: { id: post.id, title: post.title, slug: post.slug, lang: safeLang },
    variety: varietyHint,
    faqCount: contentData.faq?.length ?? 0,
    internalLinks: countInternalLinks(contentData.content, safeLang, relatedPosts),
  });
}
