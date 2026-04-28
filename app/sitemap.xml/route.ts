import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = "https://blog.cargooimport.eu";
const LANGS = ["en", "pl", "de", "fr"] as const;

export async function GET() {
  let posts: { slug: string; lang: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, lang: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.error("[sitemap] DB error:", e);
  }

  const staticUrls = LANGS.flatMap((lang) => [
    { loc: `${BASE_URL}/${lang}`, priority: "1.0", changefreq: "weekly" },
    { loc: `${BASE_URL}/${lang}/blog`, priority: "0.8", changefreq: "daily" },
    { loc: `${BASE_URL}/${lang}/products`, priority: "0.7", changefreq: "monthly" },
  ]);

  const blogUrls = posts.map((post) => ({
    loc: `${BASE_URL}/${post.lang}/blog/${post.slug}`,
    lastmod: post.updatedAt.toISOString().split("T")[0],
    priority: "0.6",
    changefreq: "monthly",
  }));

  const allUrls = [...staticUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
