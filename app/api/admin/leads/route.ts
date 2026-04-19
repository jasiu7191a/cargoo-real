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

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });

    const formattedLeads = leads.map(lead => ({
        id: lead.id,
        name: lead.user?.name || "Unknown",
        email: lead.user?.email || "Unknown",
        product: lead.productName,
        status: lead.status,
        createdAt: lead.createdAt
    }));

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("Leads API Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
