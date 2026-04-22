import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Secured by a dedicated AGENT_SECRET — separate from admin credentials.
// Set this in Cloudflare env vars. Generate with: openssl rand -base64 32
function verifySecret(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.AGENT_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { keyword, lang = "en" } = body;

  if (!keyword || typeof keyword !== "string" || keyword.length > 500) {
    return NextResponse.json({ error: "keyword is required (string, max 500 chars)" }, { status: 400 });
  }

  const safeLang = ["en", "pl", "de", "fr"].includes(lang) ? lang : "en";

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  const SOURCING_GUIDE_PROMPT = `
You are a senior sourcing agent and logistics expert for Cargoo Import, a platform helping EU businesses import from China.
Generate a comprehensive, high-converting sourcing guide for the keyword/topic: "${keyword}".

IMPORTANT: Write the entire response in ${{ en: "English", pl: "Polish", de: "German", fr: "French" }[safeLang]}.

Requirements:
- Title: Catchy, professional, SEO-optimized
- Slug: URL-safe hyphenated string in English (Latin characters only)
- Meta Description: Compelling summary under 160 chars
- Content: Long-form Markdown. Must include sections on: why import this, sourcing & QC, EU logistics, customs & duties, how Cargoo helps.

Return ONLY a raw JSON object with keys: title, slug, metaDescription, content.
`;

  // Timeout after 45s — Gemini can be slow on long articles
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  let geminiData: any;
  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "Return only valid JSON with no markdown, backticks, or explanation." }],
          },
          contents: [{ role: "user", parts: [{ text: SOURCING_GUIDE_PROMPT }] }],
          generationConfig: { maxOutputTokens: 2000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: "Gemini API error", details: err.slice(0, 500) }, { status: 502 });
    }

    geminiData = await geminiRes.json();
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Gemini API timed out after 45s" }, { status: 504 });
    }
    return NextResponse.json({ error: "Gemini request failed", details: String(err) }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = raw.trim().replace(/^```json?\n?/, "").replace(/```$/, "").trim();

  let contentData: any;
  try {
    contentData = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Gemini JSON", raw: cleaned.slice(0, 500) },
      { status: 502 }
    );
  }

  if (!contentData.title || !contentData.slug || !contentData.content) {
    return NextResponse.json({ error: "Gemini response missing required fields", contentData }, { status: 502 });
  }

  const langSlug = `${safeLang}-${contentData.slug}`;

  // If slug already exists (duplicate run), skip rather than crash
  const existing = await prisma.blogPost.findUnique({ where: { slug: langSlug } });
  if (existing) {
    return NextResponse.json({ skipped: true, reason: "Slug already exists", slug: langSlug });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: contentData.title,
      slug: langSlug,
      metaDescription: contentData.metaDescription ?? "",
      content: contentData.content,
      targetKeyword: keyword,
      lang: safeLang,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.adminAction.create({
    data: {
      type: "AGENT_ARTICLE_PUBLISHED",
      details: `Agent published "${post.title}" [${safeLang}] keyword: "${keyword}"`,
      adminName: "Growth Agent",
    },
  });

  return NextResponse.json({ success: true, post: { id: post.id, title: post.title, slug: post.slug, lang: safeLang } });
}
