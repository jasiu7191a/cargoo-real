import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { markRead } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

/** PATCH /api/me/notifications/:id/read — mark a single notification read. */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const updated = await markRead(user.id, params.id);
    if (!updated) apiError(404, "Notification not found", "NOT_FOUND");
    return withCors(req, NextResponse.json({ notification: updated }));
  } catch (error) {
    return handleApiError(error, "PATCH /api/me/notifications/[id]/read", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
