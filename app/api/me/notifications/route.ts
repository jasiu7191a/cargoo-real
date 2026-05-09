import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { listForUser, markAllRead, unreadCount } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/me/notifications?unread=1&limit=30
 *  Returns the current customer's notifications plus an unread count. */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const onlyUnread = url.searchParams.get("unread") === "1";
    const limitRaw = Number(url.searchParams.get("limit") ?? "30");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 30;

    const [items, unread] = await Promise.all([
      listForUser(user.id, { limit, onlyUnread }),
      unreadCount(user.id),
    ]);

    return withCors(req, NextResponse.json({ items, unread }));
  } catch (error) {
    return handleApiError(error, "GET /api/me/notifications", req);
  }
}

/** POST /api/me/notifications/mark-all-read — bulk mark all unread as read. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const updated = await markAllRead(user.id);
    return withCors(req, NextResponse.json({ updated }));
  } catch (error) {
    return handleApiError(error, "POST /api/me/notifications", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
