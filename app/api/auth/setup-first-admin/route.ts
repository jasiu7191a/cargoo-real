import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail, isValidEmail } from "@/lib/account-auth";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const existing = await queryOne<{ count: string }>("SELECT COUNT(*)::text AS count FROM users", []);
    if (Number(existing?.count ?? 0) > 0) {
      return NextResponse.json({ error: "System already initialized." }, { status: 403 });
    }

    const email = normalizeEmail(process.env.ADMIN_EMAIL);
    const password = process.env.ADMIN_PASSWORD;
    if (!isValidEmail(email) || !password || password.length < 12) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL and a 12+ character ADMIN_PASSWORD must be set before setup." },
        { status: 503 }
      );
    }

    const passwordHash = await hashPassword(password);
    await query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')",
      [email, passwordHash]
    );

    return NextResponse.json({
      success: true,
      message: `Admin created for ${email}. Disable this endpoint after setup.`,
    });
  } catch (error) {
    console.error("First admin setup failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
