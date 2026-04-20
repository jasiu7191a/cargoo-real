import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      DATABASE_URL: !!process.env.DATABASE_URL ? "DETECTED" : "MISSING",
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? "DETECTED" : "MISSING",
    }
  };

  // Bcrypt Test
  try {
    const testPassword = "test-password-123";
    const hash = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hash);
    diagnostics.bcrypt_status = isValid ? "OK" : "FAILED_COMPARISON";
  } catch (error: any) {
    diagnostics.bcrypt_status = "ERROR";
    diagnostics.bcrypt_error = error.message;
  }

  // DB & Data Check
  try {
    const users = await prisma.user.findMany({
       select: { email: true, role: true, name: true }
    });
    diagnostics.db_status = "CONNECTED";
    diagnostics.users = users;
    
    // Test findUnique
    const adminEmail = "admin@cargooimport.eu";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    diagnostics.admin_lookup = !!adminUser ? "FOUND" : "NOT_FOUND";
    if (adminUser) {
      diagnostics.admin_has_password = !!adminUser.password;
    }
  } catch (error: any) {
    diagnostics.db_status = "ERROR";
    diagnostics.db_error = error.message;
  }

  return NextResponse.json(diagnostics);
}
