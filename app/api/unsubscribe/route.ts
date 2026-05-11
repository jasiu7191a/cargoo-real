import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(unsubscribePage("Invalid link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const email = await verifyUnsubscribeToken(token);

  if (!email) {
    return new Response(unsubscribePage("Invalid or expired unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Idempotent — inserting twice is fine, unique constraint handles it
  await prisma.unsubscribe.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  return new Response(unsubscribePage(`${email} has been unsubscribed. You will not receive further emails from Cargoo.`, true), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function unsubscribePage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${success ? "Unsubscribed" : "Error"} — Cargoo</title>
  <style>
    body { font-family: sans-serif; background: #050505; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { max-width: 480px; padding: 2.5rem; background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; text-align: center; }
    h1 { color: ${success ? "#00c853" : "#ff5500"}; font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #94a3b8; line-height: 1.6; }
    a { color: #ff5500; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${success ? "Unsubscribed" : "Something went wrong"}</h1>
    <p>${message}</p>
    <p style="margin-top:1.5rem;font-size:0.85rem;">
      <a href="https://cargooimport.eu">cargooimport.eu</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * One-click unsubscribe (RFC 8058 / List-Unsubscribe-Post header).
 *
 * Gmail and Outlook will POST `List-Unsubscribe=One-Click` here when the
 * user clicks the native unsubscribe button at the top of the message.
 * We accept the token from either the query string OR the form body,
 * verify it, and upsert into the Unsubscribe table.
 *
 * MUST return 200 — non-2xx tells the mail client the unsubscribe failed
 * and they'll surface that as an error to the user.
 */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  let token = searchParams.get("token");

  if (!token) {
    try {
      const form = await req.formData();
      const fromForm = form.get("token");
      if (typeof fromForm === "string") token = fromForm;
    } catch {
      // body not form-encoded — ignore, fall through to error
    }
  }

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const email = await verifyUnsubscribeToken(token);
  if (!email) {
    return new Response("Invalid token", { status: 400 });
  }

  await prisma.unsubscribe.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  return new Response("OK", { status: 200 });
}

// Unsubscribe is hit directly from email links (top-level GET, no CORS).
// CORS preflight is harmless here — return 204 with allow-methods so any
// future cross-origin POST (e.g. an in-app preference page) just works.
export const OPTIONS = () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
