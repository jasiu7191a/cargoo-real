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

    const history = await prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Serialize dates for Edge
    const serializedHistory = history.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    }));

    return NextResponse.json(serializedHistory);
  } catch (error: any) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
