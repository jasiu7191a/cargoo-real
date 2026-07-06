import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { querySearchAnalytics, getServiceAccountToken } from "@/lib/gsc";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SITE_URL = "https://www.cargooimport.eu";

// -----------------------------------------------------------------------------
// Batching (fixes the "Too many subrequests by single Worker invocation" 500).
//
// DB access goes over Neon-via-fetch (lib/prisma.ts sets poolQueryViaFetch),
// so EVERY prisma call is one outbound subrequest. Looping over the whole
// corpus (163+ posts, ~2 writes each) blew Cloudflare's per-invocation
// subrequest cap before the handler could even finish — the failing subrequest
// was Neon's own connect fetch, which is why the error read as a DB-connect
// error. We now process at most BATCH_SIZE posts per invocation and hand the
// caller a `nextCursor` to resume from.
//
// SEO_CHECK_BATCH_SIZE (env, default 40 — matches the Custom Search daily
// budget) controls how many posts a single invocation processes.
// -----------------------------------------------------------------------------
const BATCH_SIZE = Number(process.env.SEO_CHECK_BATCH_SIZE) || 40;
// Hard ceiling on a caller-supplied `limit` so a large value can't re-trigger
// the very subrequest blowup this endpoint exists to avoid.
const BATCH_MAX = 100;
// Max slow per-post Custom Search probes per invocation (each up to ~8s). Kept
// separate from BATCH_SIZE so raising the batch size never uncaps the slow
// fallback path.
const CUSTOM_SEARCH_BUDGET = 40;

function authOk(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.AGENT_SECRET;
  return !!secret && token === secret;
}

// Legacy fallback: Custom Search "site:" probe. Kept because GSC takes 2-3
// days to register a brand-new URL while Custom Search shows it within
// hours, so for the freshest posts the legacy check is still informative.
async function isIndexedCustomSearch(slug: string, lang: string): Promise<{ indexed: boolean; snippet?: string }> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return { indexed: false };

  // Pages are indexed under the www canonical host (see pageUrl + sitemap),
  // so probe that exact host. An apex-path probe (`site:cargooimport.eu/...`)
  // can miss the www URLs Google actually has on file.
  const query = encodeURIComponent(`site:www.cargooimport.eu/${lang}/blog/${slug}`);
  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&cx=${encodeURIComponent(cx)}` +
    `&q=${query}&num=1`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { indexed: false };
    const data = (await res.json()) as {
      searchInformation?: { totalResults?: string };
      items?: Array<{ snippet?: string }>;
    };
    const total = parseInt(data?.searchInformation?.totalResults ?? "0", 10);
    return { indexed: total > 0, snippet: data?.items?.[0]?.snippet };
  } catch {
    return { indexed: false };
  }
}

function pageUrl(lang: string, slug: string) {
  return `${SITE_URL}/${lang}/blog/${slug}`;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- Parse optional pagination body -------------------------------------
  // MUST tolerate an empty / no body: the weekly agent and the GitHub Action
  // both POST with no body. `req.json()` throws on an empty body, so read text
  // first and only parse when there's something there.
  let cursor: string | null = null;
  let limit = BATCH_SIZE;
  try {
    const raw = await req.text();
    if (raw && raw.trim()) {
      const body = JSON.parse(raw) as { cursor?: string | null; limit?: number };
      if (typeof body.cursor === "string" && body.cursor.length > 0) cursor = body.cursor;
      if (typeof body.limit === "number" && Number.isFinite(body.limit) && body.limit > 0) {
        limit = Math.floor(body.limit);
      }
    }
  } catch {
    // Malformed body → fall back to defaults (first batch, default size).
  }
  limit = Math.min(limit, BATCH_MAX);

  try {
    const gscReady = !!(await getServiceAccountToken());
    const hasCustomSearch = !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX);

    if (!gscReady && !hasCustomSearch) {
      return NextResponse.json(
        {
          error:
            "Neither GSC (GSC_SERVICE_ACCOUNT_JSON + GSC_SITE_URL) nor Custom Search (GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX) is configured.",
        },
        { status: 503 }
      );
    }

    // Whole-corpus size, so the caller can track progress across batches.
    const total = await prisma.blogPost.count({ where: { status: "PUBLISHED" } });

    // ---- Load ONE batch, cursor-paginated -----------------------------------
    // Deterministic order (publishedAt asc, id asc as the stable tiebreaker so
    // the cursor never skips/duplicates a post across invocations). `id` is the
    // @id unique column, which is the cursor value we hand back as nextCursor.
    // take = limit + 1 peeks whether more posts remain without a second query.
    const page = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      select: { id: true, slug: true, lang: true, title: true, publishedAt: true },
    });
    const hasMore = page.length > limit;
    const posts = hasMore ? page.slice(0, limit) : page;

    // ---- Path A: GSC bulk pull (1 subrequest, whole property) ---------------
    const gscRowsByPage = new Map<string, { impressions: number; clicks: number; ctr: number; position: number }>();
    let gscDate: string | null = null;

    if (gscReady && posts.length > 0) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 28); // last 28 days
      gscDate = ymd(end);

      const rows = await querySearchAnalytics({
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ["page"],
        rowLimit: 500,
      });

      for (const row of rows) {
        if (!row.page) continue;
        gscRowsByPage.set(row.page, {
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr,
          position: row.position,
        });
      }
    }

    const results: Array<{
      postId: string;
      slug: string;
      lang: string;
      title: string;
      publishedAt: string | null;
      source: "gsc" | "custom-search" | "none";
      indexed: boolean;
      impressions?: number;
      clicks?: number;
      ctr?: number;
      position?: number;
      snippet?: string;
    }> = [];

    const captureDate = new Date();

    // Custom Search budget for THIS batch. Its purpose is catching the freshest
    // GSC-missing posts (GSC lags 2-3 days), so within the batch prefer the
    // newest GSC-missing posts — `posts` is publishedAt asc, so walk in reverse.
    // A post GSC already covers is skipped entirely: GSC is authoritative, so we
    // never spend a redundant subrequest re-probing it.
    const CUSTOM_SEARCH_MAX = Math.min(limit, CUSTOM_SEARCH_BUDGET);
    const customSearchIds = new Set<string>();
    if (hasCustomSearch) {
      for (let i = posts.length - 1; i >= 0; i--) {
        const p = posts[i];
        if (gscRowsByPage.has(pageUrl(p.lang, p.slug))) continue; // GSC covers it
        customSearchIds.add(p.id);
        if (customSearchIds.size >= CUSTOM_SEARCH_MAX) break;
      }
    }

    // ---- Process the batch, persisting each post as we go -------------------
    // Each write is its own committed fetch txn, so completed posts survive a
    // mid-batch failure. If one does fail, we stop and let the caller resume
    // from the last post we actually persisted (nextCursor = lastProcessedId),
    // rather than throwing away the whole batch.
    let lastProcessedId: string | null = null;
    let partialError: string | null = null;

    for (const post of posts) {
      try {
        const url = pageUrl(post.lang, post.slug);
        const gscRow = gscRowsByPage.get(url);

        if (gscRow) {
          // Indexed if it has at least one impression in the last 28 days
          const indexed = gscRow.impressions > 0;

          // Persist into SeoMetric (new model) — keep one row per post per
          // capture date for trending.
          await prisma.seoMetric.upsert({
            where: {
              // SeoMetric has no compound unique, so use a deterministic id
              id: `${post.id}-${gscDate ?? ymd(captureDate)}`,
            } as any,
            create: {
              id: `${post.id}-${gscDate ?? ymd(captureDate)}`,
              postId: post.id,
              slug: post.slug,
              lang: post.lang,
              impressions: gscRow.impressions,
              clicks: gscRow.clicks,
              ctr: gscRow.ctr,
              position: gscRow.position,
              date: new Date(`${gscDate ?? ymd(captureDate)}T00:00:00Z`),
            } as any,
            update: {
              impressions: gscRow.impressions,
              clicks: gscRow.clicks,
              ctr: gscRow.ctr,
              position: gscRow.position,
            } as any,
          });

          // Mirror into legacy SeoCheck so the existing admin UI still works.
          await prisma.seoCheck.create({
            data: {
              postId: post.id,
              slug: post.slug,
              lang: post.lang,
              indexed,
            },
          });

          results.push({
            postId: post.id,
            slug: post.slug,
            lang: post.lang,
            title: post.title,
            publishedAt: post.publishedAt ? ymd(post.publishedAt) : null,
            source: "gsc",
            indexed,
            impressions: gscRow.impressions,
            clicks: gscRow.clicks,
            ctr: gscRow.ctr,
            position: gscRow.position,
          });
        } else if (customSearchIds.has(post.id)) {
          // ---- Path B: legacy Custom Search fallback --------------------
          // customSearchIds is only populated when hasCustomSearch and only for
          // GSC-missing posts, so membership implies both.
          const { indexed, snippet } = await isIndexedCustomSearch(post.slug, post.lang);
          await prisma.seoCheck.create({
            data: {
              postId: post.id,
              slug: post.slug,
              lang: post.lang,
              indexed,
              searchSnippet: snippet ?? null,
            },
          });
          results.push({
            postId: post.id,
            slug: post.slug,
            lang: post.lang,
            title: post.title,
            publishedAt: post.publishedAt ? ymd(post.publishedAt) : null,
            source: "custom-search",
            indexed,
            snippet,
          });
        } else {
          results.push({
            postId: post.id,
            slug: post.slug,
            lang: post.lang,
            title: post.title,
            publishedAt: post.publishedAt ? ymd(post.publishedAt) : null,
            source: "none",
            indexed: false,
          });
        }

        lastProcessedId = post.id;
      } catch (e: any) {
        // Preserve the work already persisted; stop here and let the caller
        // resume from lastProcessedId on the next invocation.
        partialError = e?.message ?? String(e);
        break;
      }
    }

    // If we couldn't persist even one post, there's nothing to salvage — treat
    // it as a genuine failure so the caller alerts instead of resuming from an
    // ambiguous cursor.
    if (partialError && lastProcessedId === null) {
      throw new Error(partialError);
    }

    const indexedCount = results.filter(r => r.indexed).length;
    const notIndexedCount = results.length - indexedCount;
    const fromGsc = results.filter(r => r.source === "gsc").length;

    // Where the next invocation resumes:
    //  - stopped mid-batch  → right after the last post we persisted
    //  - full batch, more remain → after the last post in this batch
    //  - corpus exhausted   → null (caller is done)
    let nextCursor: string | null;
    if (partialError) {
      nextCursor = lastProcessedId; // lastProcessedId is non-null here
    } else {
      nextCursor = hasMore && posts.length > 0 ? posts[posts.length - 1].id : null;
    }

    // Best-effort audit log. Wrapped so a failure here (e.g. the loop stopped
    // because subrequests ran out) can't turn a salvageable partial 200 into a
    // 500.
    try {
      await prisma.adminAction.create({
        data: {
          type: "SEO_CHECK",
          details:
            `Checked ${results.length}/${total} posts (batch). Indexed: ${indexedCount}. ` +
            `GSC: ${fromGsc}, Custom Search: ${results.length - fromGsc}.` +
            (partialError ? ` PARTIAL: ${partialError}` : "") +
            (nextCursor ? ` nextCursor=${nextCursor}` : " (complete)"),
          adminName: "Agent",
        },
      });
    } catch (logErr) {
      console.error("seo-check: adminAction log failed (non-fatal):", logErr);
    }

    return NextResponse.json({
      // --- existing contract (unchanged types/names) ---
      checked: results.length,
      indexedCount,
      notIndexedCount,
      gscEnabled: gscReady,
      results,
      // --- additive fields for the batching caller ---
      nextCursor, // string when more posts remain, null when the corpus is done
      total,      // total published posts across the whole corpus
      batchSize: limit,
      ...(partialError ? { partial: true } : {}),
    });
  } catch (error: any) {
    console.error("seo-check route error:", error);
    return NextResponse.json(
      { error: "Internal error", message: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
