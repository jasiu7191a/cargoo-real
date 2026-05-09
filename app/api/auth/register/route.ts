import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  publicUser,
  setAuthCookies,
} from "@/lib/account-auth";
import { apiError, cleanString, handleApiError, readJsonBody } from "@/lib/account-api";
import { query, queryOne, transaction } from "@/lib/account-db";
import { withCors, corsOk } from "@/lib/cors";

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

    // Optional profile fields. Each can be null/undefined; we only validate
    // length and trim. If the client provides a full address, it becomes
    // the user's default address in the same transaction.
    const firstName = cleanString(body?.first_name ?? body?.firstName, 80);
    const lastName  = cleanString(body?.last_name  ?? body?.lastName,  80);
    const phone     = cleanString(body?.phone, 40);

    const street   = cleanString(body?.address?.street ?? body?.street, 200);
    const city     = cleanString(body?.address?.city ?? body?.city, 120);
    const zipCode  = cleanString(body?.address?.zip_code ?? body?.address?.zipCode ?? body?.zip_code ?? body?.zipCode, 20);
    const country  = cleanString(body?.address?.country ?? body?.country, 80);
    const hasAnyAddrField = Boolean(street || city || zipCode || country);
    const hasFullAddress  = Boolean(street && city && zipCode && country);
    if (hasAnyAddrField && !hasFullAddress) {
      apiError(400, "Full address requires street, city, zip_code, and country", "VALIDATION_ERROR");
    }

    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    if (existing) {
      apiError(409, "Email already exists. Please log in.", "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(password);

    const user = await transaction(async (tx) => {
      const rows = await tx.query<AccountUser>(
        `INSERT INTO users (email, password_hash, role, lang, first_name, last_name, phone)
         VALUES ($1, $2, 'customer', $3, $4, $5, $6)
         RETURNING id, email, role`,
        [email, passwordHash, lang, firstName, lastName, phone]
      );
      const created = rows[0];
      if (hasFullAddress) {
        await tx.query(
          `INSERT INTO addresses (user_id, street, city, zip_code, country, is_default)
           VALUES ($1, $2, $3, $4, $5, TRUE)`,
          [created.id, street, city, zipCode, country]
        );
      }
      return created;
    });

    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    await setAuthCookies(res, user);
    return withCors(req, res);
  } catch (error) {
    return handleApiError(error, "Register API error", req);
  }
}

export async function GET(req: NextRequest) {
  return withCors(req, NextResponse.json(
    { error: "Use POST to register", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "OPTIONS, POST" } }
  ));
}

export const OPTIONS = (req: Request) => corsOk(req);
