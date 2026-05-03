import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ? publicUser(user) : null });
  } catch (error) {
    return handleApiError(error, "Me API error");
  }
}
