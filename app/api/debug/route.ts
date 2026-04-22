import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  // Guard: only authenticated admins may access this endpoint.
  // Previously this was unauthenticated and leaked all env variable names.
  const session = await getAdminSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Cargoo Environment Probe",
    nodeEnv: process.env.NODE_ENV,
    // Report presence only — never names or values of other variables
    hasDatabaseUrl: !!(process.env.DATABASE_URL || (globalThis as any).DATABASE_URL),
    hasResendKey: !!(process.env.RESEND_API_KEY || (globalThis as any).RESEND_API_KEY),
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
