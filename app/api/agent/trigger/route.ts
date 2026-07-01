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

// Budget: the GitHub Actions caller uses `curl --max-time 90`. Everything —
// all Gemini attempts + the link-quality retry + DB writes — must land well
// inside that or the caller gives up on a request that would have succeeded.
const TOTAL_BUDGET_MS = 75_000;
const GEMINI_ATTEMPT_TIMEOUT_MS = 45_000;
const GEMINI_MAX_ATTEMPTS = 3;

type GeminiOutcome =
  | { ok: true; raw: string }
  | { ok: false; retryable: boolean; status?: number; details: string };

async function callGeminiOnce(prompt: string, apiKey: string, timeoutMs: number): Promise<GeminiOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        signal: controller.signal,
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
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      // 429 + 5xx are transient (quota/gateway); other 4xx are our bug — retrying won't help.
      const retryable = res.status === 429 || res.status >= 500;
      return { ok: false, retryable, status: res.status, details: err.slice(0, 500) };
    }
    const data = await res.json().catch(() => null);
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) {
      return { ok: false, retryable: true, status: res.status, details: "Gemini returned 200 with empty candidates" };
    }
    return { ok: true, raw };
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError" || err?.name === "TimeoutError";
    return {
      ok: false,
      retryable: true,
      details: isTimeout ? `Gemini attempt timed out after ${timeoutMs / 1000}s` : String(err).slice(0, 300),
    };
  } finally {
    clearTimeout(timer);
  }
}

// Bounded retry with backoff for transient upstream failures. Respects the
// request deadline so the caller never sees a client-side timeout instead of
// a proper JSON error.
async function callGeminiWithRetry(prompt: string, apiKey: string, deadline: number): Promise<GeminiOutcome> {
  let last: GeminiOutcome = { ok: false, retryable: true, details: "no attempts made" };
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining < 10_000) break; // not enough budget for a meaningful attempt
    last = await callGeminiOnce(prompt, apiKey, Math.min(GEMINI_ATTEMPT_TIMEOUT_MS, remaining));
    if (last.ok || !last.retryable) return last;
    console.error(`Gemini attempt ${attempt}/${GEMINI_MAX_ATTEMPTS} failed (status=${last.status ?? "n/a"}): ${last.details}`);
    if (attempt < GEMINI_MAX_ATTEMPTS) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return last;
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
 *
 * Error contract (all failures are JSON, never a bare Cloudflare 502):
 *   503 { error, retryable: true }   — upstream (Gemini) unavailable / timed out; safe to retry
 *   502 { error, retryable: false }  — Gemini rejected the request (non-transient)
 *   502 { error, retryable: true }   — Gemini answered but with unparseable JSON; regeneration may succeed
 *   500 { error, retryable: true }   — unexpected exception (DB connectivity etc.); safe to retry,
 *                                      dedup guarantees no duplicate post on retry
 */

export async function POST(req: Request) {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  try {
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
    // This also makes caller-side retries idempotent: a retry after a failure
    // that happened post-publish lands here and returns { skipped }.
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

    const prompt = buildBlogPrompt(keyword, safeLang, {
      relatedPosts,
      includeFaq: true,
      varietyHint,
      // Real first-hand Cargoo facts (fees, observed transit times, real
      // importer mistakes). Set CARGOO_FACTS in Cloudflare to inject them —
      // this is the moat pure-AI competitors can't fake. Empty = the prompt
      // falls back to "accurate general figures, no fabrication".
      firstHandFacts: process.env.CARGOO_FACTS,
    });

    const generated = await callGeminiWithRetry(prompt, geminiKey!, deadline);
    if (!generated.ok) {
      if (generated.retryable) {
        return NextResponse.json(
          { error: "generation upstream unavailable", retryable: true, details: generated.details },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Gemini API error", retryable: false, status: generated.status, details: generated.details },
        { status: 502 }
      );
    }
    let raw = generated.raw;

    // If the first response is missing internal links and we DO have candidates,
    // retry once with a stronger instruction. Single attempt, quality-only —
    // a failure here keeps the first draft rather than failing the request.
    if (relatedPosts.length >= 3 && deadline - Date.now() > 20_000) {
      const parsed = parseBlogJson(raw);
      const linkHits = parsed ? countInternalLinks(parsed.content, safeLang, relatedPosts) : 0;
      if (parsed && linkHits < 3) {
        const stronger =
          prompt +
          `\n\nIMPORTANT RETRY: your previous draft included ${linkHits} internal links. You MUST include at least 3 markdown links of the form [Title](/${safeLang}/blog/<slug>) using only the slugs listed above. Regenerate the FULL article with the links woven naturally into the prose.`;
        const better = await callGeminiOnce(stronger, geminiKey!, Math.min(GEMINI_ATTEMPT_TIMEOUT_MS, deadline - Date.now()));
        if (better.ok) raw = better.raw;
      }
    }

    const contentData = parseBlogJson(raw);
    if (!contentData) {
      return NextResponse.json(
        { error: "Failed to parse Gemini JSON", retryable: true, raw: raw.slice(0, 500) },
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

    // Audit-log failure must not fail the request — the post is already live.
    try {
      await prisma.adminAction.create({
        data: {
          type: "AGENT_ARTICLE_PUBLISHED",
          details: `Agent published "${post.title}" [${safeLang}] keyword: "${keyword}" variety: ${varietyHint} faq: ${contentData.faq?.length ?? 0}`,
          adminName: "Growth Agent",
        },
      });
    } catch (auditErr) {
      console.error("adminAction audit log failed (post already published):", auditErr);
    }

    return NextResponse.json({
      success: true,
      post: { id: post.id, title: post.title, slug: post.slug, lang: safeLang },
      variety: varietyHint,
      faqCount: contentData.faq?.length ?? 0,
      internalLinks: countInternalLinks(contentData.content, safeLang, relatedPosts),
    });
  } catch (err: any) {
    // Catch-all so nothing ever escapes as a bare Cloudflare "error code: 502".
    // Typical causes: transient DB connectivity. No post exists unless
    // blogPost.create succeeded, and the dedup check makes retries safe.
    console.error("agent/trigger unhandled error:", err);
    return NextResponse.json(
      { error: "Internal error", retryable: true, details: String(err?.message ?? err).slice(0, 300) },
      { status: 500 }
    );
  }
}
