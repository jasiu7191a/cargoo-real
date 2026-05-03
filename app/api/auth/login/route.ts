import { NextRequest, NextResponse } from "next/server";
import {
  assertLoginAllowed,
  clearFailedLogins,
  isValidEmail,
  normalizeEmail,
  publicUser,
  recordFailedLogin,
  setAuthCookies,
  verifyPassword,
} from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody } from "@/lib/account-api";
import { queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserWithPassword = {
  id: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
};

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidEmail(email) || !password) {
      apiError(400, "Invalid request", "VALIDATION_ERROR");
    }

    await assertLoginAllowed(email);

    const user = await queryOne<UserWithPassword>(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const passwordOk = user ? await verifyPassword(password, user.password_hash) : false;

    if (!user || !passwordOk) {
      await recordFailedLogin(email);
      apiError(401, "Incorrect email or password", "INVALID_CREDENTIALS");
    }

    await clearFailedLogins(email);

    const res = NextResponse.json({ user: publicUser(user) });
    await setAuthCookies(res, user);
    return res;
  } catch (error) {
    return handleApiError(error, "Login API error");
  }
}
