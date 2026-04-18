import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getOpenAI, SOURCING_GUIDE_PROMPT } from "@/lib/openai";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Ensure only authenticated admins can generate content
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    // 2. Call OpenAI with our specialized sourcing prompt
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Best for structured JSON output
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that returns only valid JSON.",
        },
        {
          role: "user",
          content: SOURCING_GUIDE_PROMPT(keyword),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = response.choices[0].message.content;

    if (!result) {
      throw new Error("No response from OpenAI");
    }

    // 3. Parse and return the structured content
    const contentData = JSON.parse(result);

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
