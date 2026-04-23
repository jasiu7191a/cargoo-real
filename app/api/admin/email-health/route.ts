import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const windows = [7, 30] as const;
    const result: Record<string, unknown> = {};

    for (const days of windows) {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [delivered, bounced, spam, opened, clicked] = await Promise.all([
        prisma.emailEvent.count({ where: { type: "DELIVERED", createdAt: { gte: since } } }),
        prisma.emailEvent.count({ where: { type: "BOUNCED",   createdAt: { gte: since } } }),
        prisma.emailEvent.count({ where: { type: "SPAM",      createdAt: { gte: since } } }),
        prisma.emailEvent.count({ where: { type: "OPENED",    createdAt: { gte: since } } }),
        prisma.emailEvent.count({ where: { type: "CLICKED",   createdAt: { gte: since } } }),
      ]);

      const total = delivered + bounced;

      result[`last${days}days`] = {
        delivered,
        bounced,
        spam,
        opened,
        clicked,
        total,
        bounceRate:    total > 0 ? +(bounced / total * 100).toFixed(2) : null,
        spamRate:      total > 0 ? +(spam   / total * 100).toFixed(3) : null,
        openRate:      delivered > 0 ? +(opened  / delivered * 100).toFixed(1) : null,
        clickRate:     delivered > 0 ? +(clicked / delivered * 100).toFixed(1) : null,
        status: total < 10
          ? "insufficient_data"
          : bounced / total >= 0.08 || spam / total >= 0.002
          ? "critical"
          : bounced / total >= 0.05 || spam / total >= 0.001
          ? "warning"
          : "healthy",
      };
    }

    // Most recent bounce events (for debugging)
    const recentBounces = await prisma.emailEvent.findMany({
      where: { type: "BOUNCED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { toEmail: true, subject: true, createdAt: true },
    });

    return NextResponse.json({ ...result, recentBounces });
  } catch (error) {
    console.error("Email health error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
