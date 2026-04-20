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
      NODE_VERSION: process.version,
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

  // Deep Data Audit
  try {
    const users = await prisma.user.findMany({
       select: { 
         id: true,
         email: true, 
         role: true, 
         name: true,
         _count: {
           select: { leads: true }
         }
       }
    });
    diagnostics.db_status = "CONNECTED";
    diagnostics.user_inventory = users.map(u => ({
       ...u,
       email_length: u.email.length,
       has_hidden_chars: /[^a-zA-Z0-9@._-]/.test(u.email)
    }));
    
    // Exact lookup test
    const target = "admin@cargooimport.eu";
    const found = await prisma.user.findUnique({ where: { email: target } });
    diagnostics.exact_lookup = {
       target,
       found: !!found,
       role: found?.role,
       has_password: !!found?.password
    };

  } catch (error: any) {
    diagnostics.db_status = "ERROR";
    diagnostics.db_error = error.message;
  }

  return NextResponse.json(diagnostics);
}
