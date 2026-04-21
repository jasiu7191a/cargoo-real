import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getOpenAI, SOURCING_GUIDE_PROMPT } from "@/lib/openai";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Ensure only authenticated admins can generate content
    const session = await getAdminSession();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    // 2. Call OpenAI with our specialized sourcing prompt
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that returns only valid JSON matching the requested schema strictly.",
        },
        {
          role: "user",
          content: SOURCING_GUIDE_PROMPT(keyword),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = response.choices[0].message.content;

    if (!result) {
      throw new Error("OpenAI returned an empty response.");
    }

    // 3. Parse and return the structured content
    let contentData;
    try {
      contentData = JSON.parse(result);
    } catch (parseError: any) {
      console.error("JSON Parsing Error from OpenAI:", result);
      throw new Error("Failed to parse AI response into valid JSON.");
    }

    // 4. Automatically save the generated artifact to the database as a DRAFT
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
