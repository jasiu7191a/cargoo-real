import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
  };

  try {
    const count = await prisma.blogPost.count();
    diagnostics.blog_post_count = count;
    diagnostics.prisma_status = "SUCCESS";
  } catch (err: any) {
    diagnostics.prisma_status = "FAILED";
    diagnostics.error_message = err.message;
    diagnostics.error_code = err.code;
  }

  return NextResponse.json(diagnostics);
}
