import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
  
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let leadCount = 0;
    let userCount = 0;
    try {
       [leadCount, userCount] = await Promise.all([
         prisma.lead.count(),
         prisma.user.count()
       ]);
    } catch (dbError) {
       console.error("Database connection failed during stats fetch:", dbError);
    }
    
    return NextResponse.json({
      count: leadCount,
      userCount,
      status: leadCount > 0 ? "LIVE" : "SYNCING",
    });
  } catch (error: any) {
    console.error("Critical Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error.message },
      { status: 500 }
    );
  }
}
