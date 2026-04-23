import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Thresholds that trigger an admin alert
const ALERT_THRESHOLDS = {
  bounceRate: 0.05,   // 5% — Resend suspends at ~8%
  spamRate: 0.001,    // 0.1% — industry danger zone
  windowDays: 7,
};

// Verify the request is genuinely from Resend using the signing secret
async function verifyResendSignature(req: Request): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = req.headers.get("svix-signature") ?? "";
  const msgId = req.headers.get("svix-id") ?? "";
  const timestamp = req.headers.get("svix-timestamp") ?? "";
  const body = await req.clone().text();

  const signedContent = `${msgId}.${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
  const computed = `v1,${Buffer.from(sig).toString("base64")}`;

  // Resend may send multiple signatures — accept if any match
  return signature.split(" ").some(s => s === computed);
}

async function checkAndAlertIfNeeded() {
  const since = new Date();
  since.setDate(since.getDate() - ALERT_THRESHOLDS.windowDays);

  const [total, bounced, spam] = await Promise.all([
    prisma.emailEvent.count({ where: { type: "DELIVERED", createdAt: { gte: since } } }),
    prisma.emailEvent.count({ where: { type: "BOUNCED", createdAt: { gte: since } } }),
    prisma.emailEvent.count({ where: { type: "SPAM", createdAt: { gte: since } } }),
  ]);

  if (total < 10) return; // Not enough data yet

  const bounceRate = bounced / total;
  const spamRate = spam / total;
  const alerts: string[] = [];

  if (bounceRate >= ALERT_THRESHOLDS.bounceRate) {
    alerts.push(`⚠️ Bounce rate: ${(bounceRate * 100).toFixed(1)}% (limit: ${ALERT_THRESHOLDS.bounceRate * 100}%)`);
  }
  if (spamRate >= ALERT_THRESHOLDS.spamRate) {
    alerts.push(`🚨 Spam complaint rate: ${(spamRate * 100).toFixed(2)}% (limit: ${ALERT_THRESHOLDS.spamRate * 100}%)`);
  }

  if (alerts.length === 0) return;

  // Send alert email to admin — non-blocking
  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? "cargooimport@gmail.com",
    subject: "⚠️ Cargoo Email Health Alert",
    html: `
      <div style="font-family:sans-serif;max-width:600px;padding:20px;">
        <h2 style="color:#ff5500;">Email Deliverability Alert</h2>
        <p>Your sending reputation needs attention. Last ${ALERT_THRESHOLDS.windowDays} days:</p>
        <ul>${alerts.map(a => `<li>${a}</li>`).join("")}</ul>
        <p><strong>Stats:</strong> ${total} delivered, ${bounced} bounced, ${spam} spam complaints</p>
        <p>Action: Review your prospect list quality and pause outreach if above 8% bounce rate.</p>
        <p><a href="https://admin.cargooimport.eu/api/admin/email-health">View full health report →</a></p>
      </div>
    `,
  }).catch(() => {}); // Never let alert failure crash the webhook handler
}

export async function POST(req: Request) {
  // Skip signature check if secret not configured (log warning)
  const secretConfigured = !!process.env.RESEND_WEBHOOK_SECRET;
  if (secretConfigured) {
    const valid = await verifyResendSignature(req);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("RESEND_WEBHOOK_SECRET not set — webhook signature verification skipped");
  }

  const body = await req.json();
  const eventType: string = body?.type ?? "";
  const data = body?.data ?? {};

  // Map Resend event types to our simplified types
  const typeMap: Record<string, string> = {
    "email.delivered":        "DELIVERED",
    "email.bounced":          "BOUNCED",
    "email.complained":       "SPAM",
    "email.opened":           "OPENED",
    "email.clicked":          "CLICKED",
  };

  const mappedType = typeMap[eventType];
  if (!mappedType) {
    // Unknown event — acknowledge without storing
    return NextResponse.json({ received: true, skipped: true });
  }

  await prisma.emailEvent.create({
    data: {
      resendId: data.email_id ?? body.id ?? "unknown",
      type: mappedType,
      toEmail: data.to?.[0] ?? data.to ?? "unknown",
      subject: data.subject ?? null,
    },
  });

  // After every bounce or spam event, check if thresholds are breached
  if (mappedType === "BOUNCED" || mappedType === "SPAM") {
    await checkAndAlertIfNeeded();
  }

  return NextResponse.json({ received: true });
}
