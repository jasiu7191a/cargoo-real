import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/account-api";
import { query, queryOne } from "@/lib/account-db";

export const SESSION_COOKIE = "cargoo_session";
export const CSRF_COOKIE = "cargoo_csrf";

export type AccountRole = "customer" | "admin";
export type AccountUser = {
  id: string;
  email: string;
  role: AccountRole;
};

type LoginAttempt = {
  failed_count: number;
  locked_until: Date | string | null;
  last_failed_at: Date | string | null;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const rawSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!rawSecret) {
    throw new Error("SESSION_SECRET env var is required but not set.");
  }
  return new TextEncoder().encode(rawSecret);
}

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNextDynamicServerError(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).includes("DYNAMIC_SERVER_USAGE")
  );
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function signSession(user: AccountUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

function csrfToken() {
  return randomBytes(32).toString("base64url");
}

export async function setAuthCookies(res: NextResponse, user: AccountUser) {
  const token = await signSession(user);
  const csrf = csrfToken();

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  res.cookies.set(CSRF_COOKIE, csrf, {
    httpOnly: false,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearAuthCookies(res: NextResponse) {
  for (const name of [SESSION_COOKIE, CSRF_COOKIE, "admin_token"]) {
    res.cookies.set(name, "", {
      httpOnly: name !== CSRF_COOKIE,
      secure: cookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

export async function getCurrentUser(): Promise<AccountUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;

    return await queryOne<AccountUser>(
      "SELECT id, email, role FROM users WHERE id = $1 LIMIT 1",
      [payload.sub]
    );
  } catch (error) {
    if (isNextDynamicServerError(error)) throw error;
    console.error("Customer session verification failed:", error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) apiError(401, "Authentication required", "UNAUTHENTICATED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") apiError(403, "Admin access required", "FORBIDDEN");
  return user;
}

export function requireCsrf(req: NextRequest) {
  const method = req.method.toUpperCase();
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) return;

  const header = req.headers.get("x-csrf-token");
  const cookie = cookies().get(CSRF_COOKIE)?.value;
  if (!header || !cookie || header !== cookie) {
    apiError(403, "Invalid CSRF token", "CSRF_INVALID");
  }
}

export function publicUser(user: AccountUser) {
  return { id: user.id, email: user.email, role: user.role };
}

export async function assertLoginAllowed(email: string) {
  const attempt = await queryOne<LoginAttempt>(
    "SELECT failed_count, locked_until, last_failed_at FROM login_attempts WHERE email = $1",
    [email]
  );
  if (!attempt?.locked_until) return;

  const lockedUntil = new Date(attempt.locked_until);
  if (lockedUntil.getTime() > Date.now()) {
    apiError(429, "Too many failed attempts. Try again later.", "LOGIN_LOCKED");
  }
}

export async function recordFailedLogin(email: string) {
  const attempt = await queryOne<LoginAttempt>(
    "SELECT failed_count, locked_until, last_failed_at FROM login_attempts WHERE email = $1",
    [email]
  );
  const lastFailedAt = attempt?.last_failed_at ? new Date(attempt.last_failed_at) : null;
  const shouldReset = !lastFailedAt || lastFailedAt.getTime() < Date.now() - 15 * 60 * 1000;
  const failedCount = shouldReset ? 1 : (attempt?.failed_count ?? 0) + 1;
  const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

  await query(
    `INSERT INTO login_attempts (email, failed_count, locked_until, last_failed_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (email) DO UPDATE SET
       failed_count = EXCLUDED.failed_count,
       locked_until = EXCLUDED.locked_until,
       last_failed_at = now()`,
    [email, failedCount, lockedUntil]
  );
}

export async function clearFailedLogins(email: string) {
  await query(
    "DELETE FROM login_attempts WHERE email = $1",
    [email]
  );
}
