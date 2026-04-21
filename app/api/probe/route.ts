import { NextResponse, NextRequest } from 'next/server';
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    checks: {
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  };

  // Header Audit
  diagnostics.header_audit = {
    host: request.headers.get('host'),
    x_forwarded_host: request.headers.get('x-forwarded-host'),
    x_forwarded_proto: request.headers.get('x-forwarded-proto'),
    url: request.url,
  };

  // JOSE JWT Sign Test
  try {
    const iat = Math.floor(Date.now() / 1000);
    const secretStr = process.env.NEXTAUTH_SECRET || "diagnostic-secret-atomic-1234567890-abcdefghijklmnopqrstuvwxyz-!!!";
    const secret = new TextEncoder().encode(secretStr);
    await new SignJWT({ 'urn:example:claim': true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setExpirationTime(iat + 60)
      .sign(secret);
    diagnostics.jose_sign_test = "SUCCESS";
  } catch (error: any) {
    diagnostics.jose_sign_test = "FAILED";
    diagnostics.jose_error = error.message;
  }

  return NextResponse.json(diagnostics);
}
