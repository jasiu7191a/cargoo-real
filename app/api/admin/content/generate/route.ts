import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { SOURCING_GUIDE_PROMPT } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are a helpful assistant that returns only valid JSON with no markdown, no backticks, no explanation — just raw JSON." }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: SOURCING_GUIDE_PROMPT(keyword) }]
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

    const savedPost = await prisma.blogPost.create({
      data: {
        title: contentData.title,
        slug: contentData.slug,
        metaDescription: contentData.metaDescription,
        content: contentData.content,
        targetKeyword: keyword,
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
