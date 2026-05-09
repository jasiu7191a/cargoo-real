import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    return withCors(
      req,
      NextResponse.json({ user: user ? publicUser(user) : null })
    );
  } catch (error) {
    return handleApiError(error, "Me API error", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
