import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Check if any user already exists
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({ error: "System already initialized." }, { status: 403 });
    }

    // 2. Clear credentials for the first admin
    const email = "admin@cargooimport.eu";
    const password = "CargooPassword2024!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the first admin
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Cargoo Master",
        role: "ADMIN"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin created successfully.",
      email,
      password
    });
  } catch (err) {
    console.error("Setup Error:", err);
    return NextResponse.json({ error: "Server Configuration Error. Is your DATABASE_URL set?" }, { status: 500 });
  }
}
