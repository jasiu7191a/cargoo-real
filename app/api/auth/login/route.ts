import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "diagnostic-secret-atomic-1234567890-abcdefghijklmnopqrstuvwxyz-!!!");

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Zero-logic hardcoded admin for stabilization
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "cargoo2024";
    if (email !== "admin@cargooimport.eu" || password !== ADMIN_PASS) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({ email, role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(SECRET);

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 });
  }
}
