import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ message: "NextAuth is disabled. Using custom auth matrix." });
}

export async function POST() {
  return NextResponse.json({ message: "NextAuth is disabled. Using custom auth matrix." });
}
