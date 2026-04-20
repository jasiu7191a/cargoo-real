import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      DATABASE_URL: !!process.env.DATABASE_URL ? "DETECTED" : "MISSING",
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? "DETECTED" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "NOT SET",
    }
  };

  try {
    // Attempt a light query to verify DB connection
    const userCount = await prisma.user.count();
    diagnostics.db_status = "CONNECTED";
    diagnostics.user_count = userCount;
  } catch (error: any) {
    diagnostics.db_status = "ERROR";
    diagnostics.db_error = error.message || "Unknown Database connection error";
  }

  return NextResponse.json(diagnostics);
}
