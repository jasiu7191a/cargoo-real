import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = "https://blog.cargooimport.eu";
const LANGS = ["en", "pl", "de", "fr"] as const;

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, lang: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = LANGS.flatMap((lang) => [
    {
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/${lang}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${lang}/products`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]);

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.lang}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
