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
        name: lead.user?.name || "Anonymous / Web Inquiry",
        email: lead.user?.email || lead.notes?.match(/Email: ([\w.-]+@[\w.-]+\.\w+)/)?.[1] || "No Email",
        product: lead.productName,
        status: lead.status,
        quantity: lead.quantity,
        targetPrice: lead.targetPrice,
        notes: lead.notes,
        createdAt: lead.createdAt.toISOString()
    }));

    return NextResponse.json(formattedLeads);
  } catch (error: any) {
    console.error("Leads API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}
