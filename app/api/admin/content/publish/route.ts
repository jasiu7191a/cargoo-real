import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await req.json();

    if (!id || action !== "PUBLISH") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
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
