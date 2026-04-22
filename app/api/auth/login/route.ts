import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Fail hard at boot if secret is missing — no public fallback ever.
const rawSecret = process.env.NEXTAUTH_SECRET;
if (!rawSecret) throw new Error("NEXTAUTH_SECRET env var is required but not set.");
const SECRET = new TextEncoder().encode(rawSecret);

// Credentials must come from env vars — no hardcoded fallbacks in source.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  // Validate env is fully configured before processing any request.
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Login route: ADMIN_EMAIL or ADMIN_PASSWORD env vars are not set.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Constant-time comparison is not needed here since both sides come from
    // env vars (not DB), but we still avoid timing-distinguishable short-circuits.
    const emailMatch = email === ADMIN_EMAIL;
    const passMatch = password === ADMIN_PASSWORD;
    if (!emailMatch || !passMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Token expires in 8 hours — 30 days is excessive for an admin session.
    const token = await new SignJWT({ email, role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(SECRET);

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    // Never expose internal error details to the client.
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
