import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { sendColdEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = 10;

function verifyAgentSecret(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.AGENT_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  try {
    const isAgent = verifyAgentSecret(req);
    if (!isAgent) {
      const session = await getAdminSession();
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { email, name, company, subject, bodyHtml, lang = "en" } = body ?? {};

    if (!email || !subject || !bodyHtml) {
      return NextResponse.json({ error: "email, subject, and bodyHtml are required" }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Block sends to unsubscribed addresses
    const unsubscribed = await prisma.unsubscribe.findUnique({ where: { email } });
    if (unsubscribed) {
      return NextResponse.json({ error: "This address has unsubscribed", skipped: true }, { status: 200 });
    }

    // Enforce daily sending limit to protect deliverability and comply with best practices
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sentToday = await prisma.coldOutreach.count({
      where: { sentAt: { gte: todayStart }, status: "SENT" },
    });
    if (sentToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit of ${DAILY_LIMIT} cold emails reached. Try again tomorrow.` },
        { status: 429 }
      );
    }

    // Check for duplicate — don't contact the same address twice
    const alreadySent = await prisma.coldOutreach.findUnique({ where: { email } });
    if (alreadySent) {
      return NextResponse.json(
        { error: "Already contacted this address", skipped: true, sentAt: alreadySent.sentAt },
        { status: 409 }
      );
    }

    // Write record first so we never lose track of an attempted send
    const record = await prisma.coldOutreach.create({
      data: { email, name, company, subject, body: bodyHtml, lang, status: "PENDING" },
    });

    // Send via Resend — unsubscribe footer is appended inside sendColdEmail
    const result = await sendColdEmail({ to: email, name, subject, bodyHtml, lang });

    await prisma.coldOutreach.update({
      where: { id: record.id },
      data: { status: result.success ? "SENT" : "FAILED" },
    });

    if (!result.success) {
      return NextResponse.json({ error: "Email delivery failed", details: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentToday: sentToday + 1, remaining: DAILY_LIMIT - sentToday - 1 });
  } catch (error) {
    console.error("Cold outreach error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [history, unsubscribes, todayCount] = await Promise.all([
      prisma.coldOutreach.findMany({
        orderBy: { sentAt: "desc" },
        take: 100,
      }),
      prisma.unsubscribe.count(),
      prisma.coldOutreach.count({
        where: {
          sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: "SENT",
        },
      }),
    ]);

    return NextResponse.json({
      history,
      unsubscribes,
      todaySent: todayCount,
      dailyLimit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - todayCount),
    });
  } catch (error) {
    console.error("Cold outreach GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
