import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function authOk(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.AGENT_SECRET;
  return !!secret && token === secret;
}

// Check if a URL is indexed by searching for site:url in Google's search suggestions API
// We use the Bing or Google search-based approach via a simple fetch
async function isIndexed(slug: string, lang: string): Promise<{ indexed: boolean; snippet?: string }> {
  const domain = "cargooimport.eu";
  const fullUrl = `https://${domain}/${lang}/blog/${slug}`;
  const query = encodeURIComponent(`site:${domain}/${lang}/blog/${slug}`);

  try {
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${query}&num=1`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { indexed: false };
    const data = await res.json() as { searchInformation?: { totalResults?: string }; items?: Array<{ snippet?: string }> };
    const total = parseInt(data?.searchInformation?.totalResults ?? "0", 10);
    const snippet = data?.items?.[0]?.snippet;
    return { indexed: total > 0, snippet };
  } catch {
    // Fallback: try a simple HEAD request to see if page exists (not the same as indexed, but validates the URL works)
    try {
      const r = await fetch(fullUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      return { indexed: false }; // Can't confirm indexed without search API
    } catch {
      return { indexed: false };
    }
  }
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get published posts not yet confirmed indexed, or checked more than 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "asc" },
    select: { id: true, slug: true, lang: true, title: true, publishedAt: true },
    take: 20,
  });

  if (posts.length === 0) {
    return NextResponse.json({ checked: 0, message: "No published posts" });
  }

  // For each post, find the latest SEO check
  const results: Array<{
    postId: string;
    slug: string;
    lang: string;
    title: string;
    indexed: boolean;
    checkedAt: string;
    snippet?: string;
    isNew: boolean;
  }> = [];

  const needsCheck: typeof posts = [];

  for (const post of posts) {
    const lastCheck = await prisma.seoCheck.findFirst({
      where: { postId: post.id },
      orderBy: { checkedAt: "desc" },
    });

    // Skip if: already indexed AND checked recently
    if (lastCheck?.indexed && lastCheck.checkedAt > sevenDaysAgo) {
      results.push({
        postId: post.id,
        slug: post.slug,
        lang: post.lang,
        title: post.title,
        indexed: true,
        checkedAt: lastCheck.checkedAt.toISOString(),
        snippet: lastCheck.searchSnippet ?? undefined,
        isNew: false,
      });
      continue;
    }

    // Re-check if not indexed or stale
    if (!lastCheck || lastCheck.checkedAt < sevenDaysAgo) {
      needsCheck.push(post);
    }
  }

  // Check up to 10 posts per run to avoid rate limits
  const toCheck = needsCheck.slice(0, 10);

  for (const post of toCheck) {
    const { indexed, snippet } = await isIndexed(post.slug, post.lang);

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
      indexed,
      checkedAt: new Date().toISOString(),
      snippet,
      isNew: true,
    });
  }

  const indexedCount = results.filter(r => r.indexed).length;
  const notIndexedCount = results.filter(r => !r.indexed).length;

  await prisma.adminAction.create({
    data: {
      type: "SEO_CHECK",
      details: `Checked ${toCheck.length} posts. Indexed: ${indexedCount}, Not yet: ${notIndexedCount}`,
      adminName: "Agent",
    },
  });

  return NextResponse.json({
    checked: toCheck.length,
    total: results.length,
    indexedCount,
    notIndexedCount,
    results,
  });
}
