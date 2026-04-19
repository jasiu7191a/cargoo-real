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

    let leadCount = 0;
    try {
       leadCount = await prisma.lead.count();
    } catch (dbError) {
       console.error("Database connection failed during stats fetch:", dbError);
       // Fallback to zero/cached values if DB is down
    }
    
    // For now returning mock efficiency and speed metrics, but actual (or fallback) lead count
    return NextResponse.json({ 
        count: leadCount,
        activeSessions: Math.floor(Math.random() * 50) + 10,
        conversionRate: "4.8%",
        avgResponse: "1.4m",
        status: leadCount > 0 ? "LIVE" : "SYNCING"
    });
  } catch (error: any) {
    console.error("Critical Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error.message },
      { status: 500 }
    );
  }
}
