import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.cargooimport.eu";
const LANGS = ["en", "pl", "de", "fr"] as const;
type Lang = (typeof LANGS)[number];

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  priority: string;
  changefreq: string;
  alternates?: { lang: string; href: string }[];
};

function buildAlternates(slugBuilder: (lang: Lang) => string) {
  const alts = LANGS.map((lang) => ({ lang, href: `${BASE_URL}${slugBuilder(lang)}` }));
  return [...alts, { lang: "x-default", href: `${BASE_URL}${slugBuilder("en")}` }];
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

  const entries: SitemapEntry[] = [];

  // Static landings — homepage, blog index, products per locale.
  for (const lang of LANGS) {
    entries.push({
      loc: `${BASE_URL}/${lang}`,
      priority: "1.0",
      changefreq: "weekly",
      alternates: buildAlternates((l) => `/${l}`),
    });
    entries.push({
      loc: `${BASE_URL}/${lang}/blog`,
      priority: "0.8",
      changefreq: "daily",
      alternates: buildAlternates((l) => `/${l}/blog`),
    });
    entries.push({
      loc: `${BASE_URL}/${lang}/products`,
      priority: "0.7",
      changefreq: "monthly",
      alternates: buildAlternates((l) => `/${l}/products`),
    });
    entries.push({
      loc: `${BASE_URL}/${lang}/resources`,
      priority: "0.6",
      changefreq: "weekly",
      alternates: buildAlternates((l) => `/${l}/resources`),
    });
  }

  // Blog posts — grouped by slug so alternates link translated versions
  // when they exist. If a slug only has one lang, we still emit it.
  const postsBySlug = new Map<string, Map<string, { slug: string; updatedAt: Date }>>();
  for (const post of posts) {
    const slugKey = post.slug;
    if (!postsBySlug.has(slugKey)) postsBySlug.set(slugKey, new Map());
    postsBySlug.get(slugKey)!.set(post.lang, post);
  }

  for (const post of posts) {
    entries.push({
      loc: `${BASE_URL}/${post.lang}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split("T")[0],
      priority: "0.6",
      changefreq: "monthly",
      alternates: buildAlternates((l) => `/${l}/blog/${post.slug}`),
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((u) => {
    const altLines = (u.alternates ?? [])
      .map(
        (a) =>
          `    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.lang)}" href="${xmlEscape(a.href)}"/>`
      )
      .join("\n");
    const lastmodLine = u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "";
    return `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
${lastmodLine}${altLines}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
