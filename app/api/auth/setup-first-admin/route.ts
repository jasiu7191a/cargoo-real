import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return NextResponse.json({ error: "System already initialized." }, { status: 403 });
  }

  // Credentials MUST come from env vars — never hardcoded defaults.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: "ADMIN_EMAIL and ADMIN_PASSWORD env vars must be set before running setup." },
      { status: 503 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashedPassword, name: "Cargoo Admin", role: "ADMIN" },
  });

  // Never return the plaintext password in the response.
  return NextResponse.json({
    success: true,
    message: `Admin created for ${email}. This endpoint should be disabled or removed now.`,
  });
}
