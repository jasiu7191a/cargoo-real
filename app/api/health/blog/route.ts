import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LANGS = ["en", "pl", "de", "fr"] as const;

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const checks = await Promise.all(
      LANGS.map(async (lang) => {
        const publishedPosts = await prisma.blogPost.count({
          where: { status: "PUBLISHED", lang },
        });

        return {
          lang,
          ok: true,
          publishedPosts,
        };
      })
    );

    return NextResponse.json(
      {
        ok: true,
        service: "blog",
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
    console.error("[health/blog] DB check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        service: "blog",
        checkedAt,
        error: "Blog database check failed",
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
