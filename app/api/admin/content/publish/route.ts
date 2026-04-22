import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

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
  } catch (error: any) {
    // Prisma throws P2025 when the record doesn't exist
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.error("Publishing error:", error);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
