import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/lib/prisma";
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  };

  // Header Audit (The most likely culprit for 500)
  diagnostics.header_audit = {
    host: request.headers.get('host'),
    x_forwarded_host: request.headers.get('x-forwarded-host'),
    x_forwarded_proto: request.headers.get('x-forwarded-proto'),
    url: request.url,
    matches_nextauth_url: request.url.startsWith(process.env.NEXTAUTH_URL || 'NONE')
  };

  // JOSE JWT Sign Test
  try {
    const iat = Math.floor(Date.now() / 1000);
    const secret = new TextEncoder().encode("diagnostic-debug-secret-2024");
    const token = await new SignJWT({ 'urn:example:claim': true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setExpirationTime(iat + 60)
      .sign(secret);
    diagnostics.jose_sign_test = "SUCCESS";
  } catch (error: any) {
    diagnostics.jose_sign_test = "FAILED";
    diagnostics.jose_error = error.message;
  }

  // Real Secret Metadata
  if (process.env.NEXTAUTH_SECRET) {
    diagnostics.real_secret_metadata = {
      length: process.env.NEXTAUTH_SECRET.length,
      is_base64: /^[A-Za-z0-9+/=]+$/.test(process.env.NEXTAUTH_SECRET),
      hash_hint: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
        .then(res => Array.from(new Uint8Array(res)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8))
    };
  }

  // DB simple check
  try {
    const userCount = await prisma.user.count();
    diagnostics.db_status = "CONNECTED";
  } catch (error: any) {
    diagnostics.db_status = "ERROR";
  }

  return NextResponse.json(diagnostics);
}
