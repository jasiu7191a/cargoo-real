import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendColdEmail } from "@/lib/mail";
import { buildFollowUpEmail, buildWinBackEmail } from "@/lib/outreach-templates";
import { dailyEmailCap, dailyWindowStartUtc } from "@/lib/cold-email/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily drip + win-back orchestrator.
 *
 * Triggered by:
 *   - Cloudflare cron (see wrangler.toml `[triggers] crons`) – the platform
 *     hits this endpoint with the AGENT_SECRET bearer token once per day.
 *   - Manual: `curl -X POST -H "Authorization: Bearer $AGENT_SECRET"
 *     https://admin.cargooimport.eu/api/agent/drip` (good for smoke tests
 *     before flipping the cron on).
 *
 * What it does:
 *   1. Finds ColdOutreach rows where the prospect has NOT replied and the
 *      last send was > FOLLOWUP_COOLDOWN_DAYS days ago.
 *   2. For each address, picks the next touch number (2 → 3) and sends a
 *      spintax follow-up. Touches > 3 are dropped (don't drip forever).
 *   3. Runs a separate sweep over Lead rows with status QUOTED that haven't
 *      moved to PAID within WINBACK_AFTER_DAYS — those get a 10% off
 *      win-back email. We dedupe via AdminAction so a prospect doesn't
 *      receive two win-backs.
 *
 * Daily budget:
 *   Cold sends (POST /api/admin/outreach/cold) and drip follow-ups share one
 *   daily quota — see lib/cold-email/config.ts. Drip computes "remaining
 *   slots" as `cap - cold_sends_already_today`, so a busy morning of new
 *   sends naturally shrinks the drip allotment instead of double-spending
 *   the domain's deliverability budget. Win-backs are NOT counted in the
 *   shared cap today (they don't write to coldOutreach); revisit if volume
 *   grows enough to matter.
 */

function authOk(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.AGENT_SECRET;
  return !!secret && auth === `Bearer ${secret}`;
}

const FOLLOWUP_COOLDOWN_DAYS = Number(process.env.DRIP_FOLLOWUP_COOLDOWN_DAYS ?? 3);
const MAX_TOUCHES              = Number(process.env.DRIP_MAX_TOUCHES ?? 3);
const WINBACK_AFTER_DAYS       = Number(process.env.DRIP_WINBACK_AFTER_DAYS ?? 7);

interface DripStats {
  followUpsSent: number;
  winBackSent: number;
  skippedReplied: number;
  skippedUnsubscribed: number;
  skippedMaxTouches: number;
  skippedDailyCap: number;
  errors: string[];
  dailyCap: number;
  coldSentBeforeDrip: number;
}

async function runDrip(): Promise<DripStats> {
  const cap = dailyEmailCap();
  const initialColdSent = await prisma.coldOutreach.count({
    where: { sentAt: { gte: dailyWindowStartUtc() }, status: "SENT" },
  });

  const stats: DripStats = {
    followUpsSent: 0,
    winBackSent: 0,
    skippedReplied: 0,
    skippedUnsubscribed: 0,
    skippedMaxTouches: 0,
    skippedDailyCap: 0,
    errors: [],
    dailyCap: cap,
    coldSentBeforeDrip: initialColdSent,
  };

  // Slots left for drip after subtracting whatever cold-sends already went
  // out today (manual admin sends, agent sends — all funnel through the
  // same coldOutreach table).
  const followUpSlots = Math.max(0, cap - initialColdSent);

  const cutoff = new Date(Date.now() - FOLLOWUP_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  // Most-recent send per address. We can't do GROUP BY DISTINCT ON natively
  // in Prisma so we pull the latest 200 sends (already indexed on sentAt)
  // and dedupe in memory — cheap and predictable.
  const recent = await prisma.coldOutreach.findMany({
    where: {
      sentAt: { lt: cutoff },
      status: "SENT",
    },
    orderBy: { sentAt: "desc" },
    take: 200,
  });

  const seen = new Set<string>();
  const candidates: typeof recent = [];
  for (const row of recent) {
    if (seen.has(row.email)) continue;
    seen.add(row.email);
    candidates.push(row);
    if (candidates.length >= Math.max(followUpSlots, cap) * 2) break;
  }

  // Unsubscribe lookup in one query
  const unsubs = await prisma.unsubscribe.findMany({
    where: { email: { in: candidates.map(c => c.email) } },
    select: { email: true },
  });
  const unsubSet = new Set(unsubs.map(u => u.email));

  for (const row of candidates) {
    if (stats.followUpsSent >= followUpSlots) {
      stats.skippedDailyCap += 1;
      continue;
    }

    const replied = (row as { replied?: boolean }).replied === true;
    if (replied) { stats.skippedReplied += 1; continue; }
    if (unsubSet.has(row.email)) { stats.skippedUnsubscribed += 1; continue; }

    const currentTouch = (row as { touchNumber?: number }).touchNumber ?? 1;
    const nextTouch = currentTouch + 1;
    if (nextTouch > MAX_TOUCHES) { stats.skippedMaxTouches += 1; continue; }
    if (nextTouch !== 2 && nextTouch !== 3) { stats.skippedMaxTouches += 1; continue; }

    const productName = row.subject; // best-effort fallback — original subject often contains the product
    const { subject, bodyHtml } = buildFollowUpEmail(nextTouch as 2 | 3, {
      greetingName: row.name,
      productName,
      lang: row.lang || "en",
    });

    // Persist the attempt first so a Resend failure still leaves a trace
    const pending = await prisma.coldOutreach.create({
      data: {
        email: row.email,
        name: row.name,
        company: row.company,
        subject,
        body: bodyHtml,
        lang: row.lang || "en",
        status: "PENDING",
        touchNumber: nextTouch,
      } as Parameters<typeof prisma.coldOutreach.create>[0]["data"],
    });

    try {
      const result = await sendColdEmail({
        to: row.email,
        name: row.name ?? undefined,
        subject,
        bodyHtml,
        lang: row.lang || "en",
      });
      await prisma.coldOutreach.update({
        where: { id: pending.id },
        data: { status: result.success ? "SENT" : "FAILED" },
      });
      if (result.success) stats.followUpsSent += 1;
      else stats.errors.push(`${row.email}: ${result.error ?? "send failed"}`);
    } catch (err: any) {
      await prisma.coldOutreach.update({
        where: { id: pending.id },
        data: { status: "FAILED" },
      });
      stats.errors.push(`${row.email}: ${err?.message ?? "unknown error"}`);
    }
  }

  // ---- Win-back sweep ---------------------------------------------------
  const winbackCutoff = new Date(Date.now() - WINBACK_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const stalledLeads = await prisma.lead.findMany({
    where: {
      status: "QUOTED",
      updatedAt: { lt: winbackCutoff },
    },
    include: { user: true },
    take: 20,
  });

  for (const lead of stalledLeads) {
    if (stats.winBackSent >= 10) break;
    const email = lead.user?.email;
    if (!email) continue;
    if (unsubSet.has(email)) { stats.skippedUnsubscribed += 1; continue; }

    // Dedup: skip if we've already sent a win-back for this lead. We log
    // every win-back as an AdminAction with details containing the lead id.
    const alreadySent = await prisma.adminAction.findFirst({
      where: { type: "WINBACK_SENT", details: { contains: lead.id } },
    });
    if (alreadySent) continue;

    const { subject, bodyHtml } = buildWinBackEmail({
      greetingName: lead.user?.name,
      productName: lead.productName,
      lang: "en", // Lead doesn't store lang yet — safe default
      couponCode: "WELCOME10",
      couponUrl: "https://cargooimport.eu",
    });

    try {
      const result = await sendColdEmail({
        to: email,
        name: lead.user?.name ?? undefined,
        subject,
        bodyHtml,
        lang: "en",
      });
      if (result.success) {
        stats.winBackSent += 1;
        await prisma.adminAction.create({
          data: {
            type: "WINBACK_SENT",
            details: `Win-back for lead ${lead.id} (${lead.productName}) → ${email}`,
            adminName: "Drip Cron",
          },
        });
      } else {
        stats.errors.push(`winback ${email}: ${result.error ?? "send failed"}`);
      }
    } catch (err: any) {
      stats.errors.push(`winback ${email}: ${err?.message ?? "unknown error"}`);
    }
  }

  await prisma.adminAction.create({
    data: {
      type: "DRIP_CRON_RUN",
      details:
        `Drip: ${stats.followUpsSent} follow-ups, ${stats.winBackSent} win-backs. ` +
        `Cap ${cap}, cold-sent-before ${initialColdSent}, slots ${followUpSlots}. ` +
        `Skipped — replied:${stats.skippedReplied} unsub:${stats.skippedUnsubscribed} ` +
        `maxTouches:${stats.skippedMaxTouches} dailyCap:${stats.skippedDailyCap}. ` +
        `Errors:${stats.errors.length}`,
      adminName: "Drip Cron",
    },
  });

  return stats;
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await runDrip();
  return NextResponse.json({ success: true, ...stats });
}

// GET allowed (cron triggers can send either) — same auth, same logic.
export async function GET(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await runDrip();
  return NextResponse.json({ success: true, ...stats });
}
