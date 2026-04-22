import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

// GET: List all articles
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    const serializedPosts = posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() || null
    }));

    return NextResponse.json(serializedPosts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save a new generated article
export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, metaDescription, content, targetKeyword } = await req.json();

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        metaDescription,
        content,
        targetKeyword,
        status: "DRAFT",
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update/Publish an article
export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    if (data.status === "PUBLISHED" && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an article
export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
