import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  // Exposing DB connectivity without auth leaks infrastructure info.
  const session = await getAdminSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
