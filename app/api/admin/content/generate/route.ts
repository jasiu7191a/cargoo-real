import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  pl: "Polish",
  de: "German",
  fr: "French",
};

const SOURCING_GUIDE_PROMPT = (keyword: string, lang: string) => `
You are a senior sourcing agent and logistics expert for Cargoo Import, a platform helping EU businesses import from China.
Generate a comprehensive, high-converting sourcing guide for the keyword/topic: "${keyword}".

IMPORTANT: Write the entire response in ${LANG_NAMES[lang] ?? "English"}. Every field — title, metaDescription, and content — must be in ${LANG_NAMES[lang] ?? "English"}.

Requirements:
- Title: Catchy, professional, SEO-optimized
- Slug: URL-safe hyphenated string in English (Latin characters only, no accents)
- Meta Description: Compelling summary under 160 chars, in ${LANG_NAMES[lang] ?? "English"}
- Content: Long-form Markdown in ${LANG_NAMES[lang] ?? "English"}. Must include:
  ### 📦 Why Import [Topic]?
  ### 🛡️ Verified Sourcing & Quality Control
  ### 🚢 Logistics & Shipping to EU
  ### 📜 Customs & Duties (Focus on Poland/Germany/France)
  ### ⚡ How Cargoo Can Help (CTA)

Tone: Professional, authoritative, yet approachable.
Return the result as a raw JSON object with keys: title, slug, metaDescription, content.
`;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword, lang = "en" } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }
    const safeLang = ["en", "pl", "de", "fr"].includes(lang) ? lang : "en";

    // API key goes in a header, not the URL — URL params appear in server logs and CDN access logs.
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
            parts: [{ text: "You are a helpful assistant that returns only valid JSON with no markdown, no backticks, no explanation — just raw JSON." }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: SOURCING_GUIDE_PROMPT(keyword, safeLang) }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 2000,
          },
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

    let cleaned = result.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json?\n?/, "").replace(/```$/, "").trim();
    }

    let contentData;
    try {
      contentData = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse Gemini response as JSON: " + cleaned.slice(0, 200));
    }

    // Prefix slug with lang code to avoid collisions between languages.
    const langSlug = `${safeLang}-${contentData.slug}`;

    const savedPost = await prisma.blogPost.create({
      data: {
        title: contentData.title,
        slug: langSlug,
        metaDescription: contentData.metaDescription,
        content: contentData.content,
        targetKeyword: keyword,
        lang: safeLang,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ success: true, post: savedPost });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
