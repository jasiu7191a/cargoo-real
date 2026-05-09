import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/account-auth";
import { withCors, corsOk } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function logoutResponse(req: NextRequest, forceJson = false) {
  const wantsJson =
    forceJson || req.headers.get("accept")?.includes("application/json");
  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(
        new URL("/", process.env.NEXTAUTH_URL || "https://admin.cargooimport.eu")
      );
  clearAuthCookies(res);
  return withCors(req, res);
}

export async function POST(req: NextRequest) {
  return logoutResponse(req, true);
}

export async function GET(req: NextRequest) {
  return logoutResponse(req);
}

export const OPTIONS = (req: Request) => corsOk(req);
