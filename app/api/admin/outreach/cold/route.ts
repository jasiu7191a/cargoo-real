import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { sendColdEmail, stripBodyPlaceholder } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Daily cap on outbound cold sends, protects domain reputation. Override via
// COLD_OUTREACH_DAILY_LIMIT env var when running a planned follow-up batch
// larger than the default. Keep increases gradual — Resend will throttle a
// brand-new domain that suddenly sends 50/day after weeks at 10/day.
const DEFAULT_DAILY_LIMIT = 10;
const DAILY_LIMIT = (() => {
  const raw = process.env.COLD_OUTREACH_DAILY_LIMIT;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_DAILY_LIMIT;
})();

// Hours that must elapse between two sends to the same address. Set short enough
// that a next-day follow-up batch goes through, long enough that an operator
// double-clicking "send" the same morning doesn't spam a prospect. Override via
// COLD_OUTREACH_COOLDOWN_HOURS env var.
const DEFAULT_COOLDOWN_HOURS = 12;
const cooldownHours = (() => {
  const raw = process.env.COLD_OUTREACH_COOLDOWN_HOURS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_COOLDOWN_HOURS;
})();

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
    const force = body?.force === true;
    const requestedTouch =
      typeof body?.touch === "number" && body.touch > 0 ? Math.floor(body.touch) : null;

    if (!email || !subject || typeof bodyHtml !== "string") {
      return NextResponse.json(
        { error: "email, subject, and bodyHtml are required" },
        { status: 400 }
      );
    }

    const cleanBodyHtml = stripBodyPlaceholder(bodyHtml);
    if (!cleanBodyHtml) {
      return NextResponse.json(
        { error: "bodyHtml must contain real email copy, not only a template placeholder" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Block sends to unsubscribed addresses
    const unsubscribed = await prisma.unsubscribe.findUnique({ where: { email } });
    if (unsubscribed) {
      return NextResponse.json(
        { error: "This address has unsubscribed", skipped: true },
        { status: 200 }
      );
    }

    // Enforce daily sending limit to protect deliverability
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

    // Look up the most recent prior contact (used to compute touch number and
    // enforce the cooldown). Multiple records per email are now allowed —
    // see neon-migrations/20260506_cold_outreach_followups.sql.
    const lastSent = await prisma.coldOutreach.findFirst({
      where: { email },
      orderBy: { sentAt: "desc" },
    });

    if (lastSent && !force) {
      const hoursSince =
        (Date.now() - new Date(lastSent.sentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < cooldownHours) {
        const nextAllowedAt = new Date(
          new Date(lastSent.sentAt).getTime() + cooldownHours * 3600 * 1000
        );
        return NextResponse.json(
          {
            error: `Cooldown active: last contact was ${hoursSince.toFixed(1)}h ago, minimum gap is ${cooldownHours}h.`,
            cooldown: true,
            lastSentAt: lastSent.sentAt,
            lastTouch: (lastSent as { touchNumber?: number }).touchNumber ?? 1,
            nextAllowedAt,
          },
          { status: 429 }
        );
      }
    }

    const touchNumber =
      requestedTouch ?? ((lastSent as { touchNumber?: number } | null)?.touchNumber ?? 0) + 1;

    // Write record first so we never lose track of an attempted send
    const record = await prisma.coldOutreach.create({
      data: {
        email,
        name,
        company,
        subject,
        body: cleanBodyHtml,
        lang,
        status: "PENDING",
        touchNumber,
      } as Parameters<typeof prisma.coldOutreach.create>[0]["data"],
    });

    // Send via Resend — unsubscribe footer is appended inside sendColdEmail
    const result = await sendColdEmail({ to: email, name, subject, bodyHtml: cleanBodyHtml, lang });

    await prisma.coldOutreach.update({
      where: { id: record.id },
      data: { status: result.success ? "SENT" : "FAILED" },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Email delivery failed", details: result.error, touch: touchNumber },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      touch: touchNumber,
      sentToday: sentToday + 1,
      remaining: DAILY_LIMIT - sentToday - 1,
    });
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
      cooldownHours,
    });
  } catch (error) {
    console.error("Cold outreach GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
