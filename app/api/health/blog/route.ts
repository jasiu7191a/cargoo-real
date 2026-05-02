import { NextResponse } from "next/server";
import { getFallbackBlogPosts } from "@/lib/blog-fallbacks";

export const dynamic = "force-static";

const LANGS = ["en", "pl", "de", "fr"] as const;

export async function GET() {
  const checkedAt = new Date().toISOString();
  const checks = LANGS.map((lang) => ({
    lang,
    ok: true,
    publishedPosts: getFallbackBlogPosts(lang).length,
  }));

  return NextResponse.json(
    {
      ok: true,
      service: "blog",
      source: "stable-fallback-content",
      checkedAt,
      checks,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    }
  );
}
