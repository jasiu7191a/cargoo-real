import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Inbound reply webhook.
 *
 * Cargoo cold outreach sets `Reply-To: replies@cargooimport.eu`. The plan
 * is to forward that inbox into this endpoint via either:
 *
 *   (a) Cloudflare Email Routing → Worker → POST here, or
 *   (b) a third-party inbound parser (Mailgun Routes, Postmark Inbound,
 *       SendGrid Inbound Parse) that POSTs a JSON payload here.
 *
 * Whichever path is used, we accept a flexible payload shape:
 *
 *   {
 *     "from": "prospect@example.com" | "Name <prospect@example.com>",
 *     "subject": "...",
 *     "messageId": "<original-message-id>"    // optional
 *   }
 *
 * The endpoint:
 *   1. Verifies a shared secret in `Authorization: Bearer <INBOUND_WEBHOOK_SECRET>`
 *      (set in Cloudflare Pages env vars). Required — without auth anyone
 *      could mark prospects as replied and silence our drip cron.
 *   2. Extracts the email portion of `from`.
 *   3. Flags every ColdOutreach row for that address as `replied = true`.
 *   4. Logs an AdminAction so the activity is visible.
 *
 * Note: this only stops drip. The actual reply still lands in the
 * replies@ inbox where a human reads it.
 */

function verifySecret(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

function extractEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // "Name <foo@bar.com>" or just "foo@bar.com"
  const m = raw.match(/<([^>]+)>/) ?? raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (!m) return null;
  const email = (m[1] ?? m[0]).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function POST(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = extractEmail(payload?.from ?? payload?.sender ?? payload?.email);
  if (!email) {
    return NextResponse.json({ error: "Could not parse 'from' email" }, { status: 400 });
  }

  // Mark every prior touch from this address as replied so the drip cron
  // skips all of them. updateMany is cheaper than findMany + update loop.
  const updated = await prisma.coldOutreach.updateMany({
    where: { email, replied: false } as any,
    data: { replied: true, repliedAt: new Date() } as any,
  });

  if (updated.count > 0) {
    await prisma.adminAction.create({
      data: {
        type: "OUTREACH_REPLY_RECEIVED",
        details: `Prospect ${email} replied — ${updated.count} outreach row(s) marked replied`,
        adminName: "Inbound Reply Webhook",
      },
    });
  }

  return NextResponse.json({ success: true, email, rowsFlagged: updated.count });
}
