import { NextResponse } from "next/server";
import { getFallbackBlogPosts } from "@/lib/blog-fallbacks";

export const dynamic = "force-dynamic";

const LANGS = ["en", "pl", "de", "fr"] as const;

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const { default: prisma } = await import("@/lib/prisma");
    const checks = [];

    for (const lang of LANGS) {
      const publishedPosts = await prisma.blogPost.count({
        where: { status: "PUBLISHED", lang },
      });

      checks.push({
        lang,
        ok: true,
        publishedPosts,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        service: "blog",
        source: "admin-content",
        checkedAt,
        checks,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[health/blog] Admin content check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        service: "blog",
        source: "admin-content",
        checkedAt,
        error: "Blog admin content check failed",
        fallbackChecks: LANGS.map((lang) => ({
          lang,
          ok: true,
          publishedPosts: getFallbackBlogPosts(lang).length,
        })),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
