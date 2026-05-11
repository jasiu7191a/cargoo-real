import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import {
  buildBlogPrompt,
  parseBlogJson,
  type BlogLang,
  type RelatedPostHint,
} from "@/lib/seo-prompts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { keyword, lang = "en", variety } = body ?? {};
    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }
    const safeLang: BlogLang = (["en", "pl", "de", "fr"].includes(lang) ? lang : "en") as BlogLang;
    const safeVariety = (["guide", "comparison", "listicle", "how-to"] as const).includes(variety)
      ? variety
      : undefined;

    // Pull related posts so admins-generated articles also link internally.
    const relatedRows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", lang: safeLang },
      select: { slug: true, title: true, targetKeyword: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });
    const relatedPosts: RelatedPostHint[] = relatedRows.map(r => ({
      slug: r.slug.replace(new RegExp(`^${safeLang}-`), ""),
      title: r.title,
      targetKeyword: r.targetKeyword,
    }));

    const prompt = buildBlogPrompt(keyword, safeLang, {
      relatedPosts,
      includeFaq: true,
      varietyHint: safeVariety,
    });

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text:
                "You are a helpful assistant that returns only valid JSON with no markdown, no backticks, no explanation — just raw JSON.",
            }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          // Increased from 2000 — with FAQ + longer body the previous cap was
          // truncating mid-JSON which then failed parsing.
          generationConfig: { maxOutputTokens: 4000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const data = await geminiRes.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) throw new Error("Empty response from Gemini");

    const contentData = parseBlogJson(result);
    if (!contentData) {
      throw new Error("Failed to parse Gemini response as JSON: " + result.slice(0, 200));
    }

    // Prefix slug with lang code to avoid collisions between languages.
    const langSlug = `${safeLang}-${contentData.slug}`;

    const savedPost = await prisma.blogPost.create({
      data: {
        title: contentData.title,
        slug: langSlug,
        metaDescription: contentData.metaDescription ?? "",
        content: contentData.content,
        targetKeyword: keyword,
        lang: safeLang,
        status: "DRAFT",
        ...(contentData.faq ? ({ faq: contentData.faq } as any) : {}),
      } as any,
    });

    return NextResponse.json({
      success: true,
      post: savedPost,
      faqCount: contentData.faq?.length ?? 0,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
