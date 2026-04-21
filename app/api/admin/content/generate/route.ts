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

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is missing in Cloudflare Environment Variables.");
    }

    // Call Google Gemini 1.5 Flash (Free Tier) via native fetch
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: SOURCING_GUIDE_PROMPT(keyword) + "\nIMPORTANT: Return ONLY the raw JSON object. No markdown formatting around it."
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error: ${err}`);
    }

    const data = await geminiRes.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) throw new Error("Empty response from Gemini");

    // Gemini sometimes includes backticks even with responseMimeType, we clean it just in case
    const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const contentData = JSON.parse(cleanJson);

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
