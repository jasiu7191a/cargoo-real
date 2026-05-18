import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { querySearchAnalytics, getServiceAccountToken } from "@/lib/gsc";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SITE_URL = "https://www.cargooimport.eu";

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

  const domain = "cargooimport.eu";
  const query = encodeURIComponent(`site:${domain}/${lang}/blog/${slug}`);
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

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "asc" },
      select: { id: true, slug: true, lang: true, title: true, publishedAt: true },
      take: 50,
    });

    if (posts.length === 0) {
      return NextResponse.json({ checked: 0, message: "No published posts" });
    }

    // ---- Path A: GSC bulk pull ------------------------------------------
    let gscRowsByPage = new Map<string, { impressions: number; clicks: number; ctr: number; position: number }>();
    let gscDate: string | null = null;

    if (gscReady) {
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
      source: "gsc" | "custom-search" | "none";
      indexed: boolean;
      impressions?: number;
      clicks?: number;
      ctr?: number;
      position?: number;
      snippet?: string;
    }> = [];

    const captureDate = new Date();

    for (const post of posts) {
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
          source: "gsc",
          indexed,
          impressions: gscRow.impressions,
          clicks: gscRow.clicks,
          ctr: gscRow.ctr,
          position: gscRow.position,
        });
        continue;
      }

      // ---- Path B: legacy Custom Search fallback ------------------------
      if (hasCustomSearch) {
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
          source: "none",
          indexed: false,
        });
      }
    }

    const indexedCount = results.filter(r => r.indexed).length;
    const fromGsc = results.filter(r => r.source === "gsc").length;

    await prisma.adminAction.create({
      data: {
        type: "SEO_CHECK",
        details: `Checked ${results.length} posts. Indexed: ${indexedCount}. GSC: ${fromGsc}, Custom Search: ${results.length - fromGsc}.`,
        adminName: "Agent",
      },
    });

    return NextResponse.json({
      checked: results.length,
      indexedCount,
      gscEnabled: gscReady,
      results,
    });
  } catch (error: any) {
    console.error("seo-check route error:", error);
    return NextResponse.json(
      { error: "Internal error", message: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
