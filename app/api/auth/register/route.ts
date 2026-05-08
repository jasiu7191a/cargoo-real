import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  publicUser,
  setAuthCookies,
} from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody } from "@/lib/account-api";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AccountUser = {
  id: string;
  email: string;
  role: "customer" | "admin";
};

const ALLOWED_LANGS = ["en", "pl", "de", "fr"] as const;
type Lang = (typeof ALLOWED_LANGS)[number];

function normalizeLang(raw: unknown): Lang {
  if (typeof raw !== "string") return "en";
  const v = raw.trim().slice(0, 2).toLowerCase();
  return (ALLOWED_LANGS as readonly string[]).includes(v) ? (v as Lang) : "en";
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const lang = normalizeLang(body?.lang);

    if (!isValidEmail(email)) {
      apiError(400, "Invalid email address", "INVALID_EMAIL");
    }
    if (password.length < 8) {
      apiError(400, "Password must be at least 8 characters", "WEAK_PASSWORD");
    }

    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    if (existing) {
      apiError(409, "Email already exists. Please log in.", "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(password);
    const [user] = await query<AccountUser>(
      `INSERT INTO users (email, password_hash, role, lang)
       VALUES ($1, $2, 'customer', $3)
       RETURNING id, email, role`,
      [email, passwordHash, lang]
    );

    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    await setAuthCookies(res, user);
    return res;
  } catch (error) {
    return handleApiError(error, "Register API error");
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to register", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "OPTIONS, POST" } }
  );
}
