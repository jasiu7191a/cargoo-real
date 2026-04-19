import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leadCount = await prisma.lead.count();
    
    // For now returning mock efficiency and speed, but actual lead count
    return NextResponse.json({ 
        count: leadCount,
        activeSessions: Math.floor(Math.random() * 50) + 10,
        conversionRate: "4.8%",
        avgResponse: "1.4m"
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
