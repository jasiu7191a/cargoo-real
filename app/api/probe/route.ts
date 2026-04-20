import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  };

  // JOSE JWT Sign Test (Native Edge Compatible)
  try {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60; // 1 hour
    
    // Test with the hardcoded diagnostic secret
    const secret = new TextEncoder().encode("diagnostic-debug-secret-2024");
    
    const token = await new SignJWT({ 'urn:example:claim': true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(secret);
      
    diagnostics.jose_sign_test = "SUCCESS";
    diagnostics.test_token_preview = token.substring(0, 15) + "...";
  } catch (error: any) {
    diagnostics.jose_sign_test = "FAILED";
    diagnostics.jose_error = error.message;
  }

  // Real Secret Metadata (Privacy-Safe)
  if (process.env.NEXTAUTH_SECRET) {
    const secret = process.env.NEXTAUTH_SECRET;
    diagnostics.real_secret_metadata = {
      length: secret.length,
      has_spaces: secret.includes(' '),
      has_newlines: secret.includes('\n') || secret.includes('\r'),
      is_base64: /^[A-Za-z0-9+/=]+$/.test(secret),
      // SHA-256 Hash of the secret for verification without exposure
      hash_hint: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret))
        .then(res => Array.from(new Uint8Array(res)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8))
    };
  }

  // Simple DB check to ensure we didn't break connectivity
  try {
    const userCount = await prisma.user.count();
    diagnostics.db_status = "CONNECTED";
    diagnostics.db_user_count = userCount;
  } catch (error: any) {
    diagnostics.db_status = "ERROR";
  }

  return NextResponse.json(diagnostics);
}
