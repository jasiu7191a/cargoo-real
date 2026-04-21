import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "https://admin.cargooimport.eu"));
  res.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
