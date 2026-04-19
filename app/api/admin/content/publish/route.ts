import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    if (!id || action !== "PUBLISH") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Publishing error:", error);
    return NextResponse.json(
      { error: "Failed to publish artifact" },
      { status: 500 }
    );
  }
}
