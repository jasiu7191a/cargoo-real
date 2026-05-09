import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody, cleanString } from "@/lib/account-api";
import { listMessages, createMessage, markThreadRead } from "@/lib/messages";
import { tryCreateNotification } from "@/lib/notifications";
import { queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** GET — admin reads thread + marks customer's messages as read. */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const messages = await listMessages(params.id);
    await markThreadRead(params.id, "admin");
    return NextResponse.json({ messages });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/quote-requests/[id]/messages");
  }
}

/** POST — admin sends a message; auto-notifies the customer (in-app bell). */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);
    const content = cleanString(body?.content, 4000);
    if (!content) apiError(400, "Message content required", "VALIDATION_ERROR");

    const request = await queryOne<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM quote_requests WHERE id = $1",
      [params.id]
    );
    if (!request) apiError(404, "Request not found", "NOT_FOUND");

    const message = await createMessage({
      quoteRequestId: params.id,
      senderUserId: admin.id,
      fromAdmin: true,
      content,
    });

    await tryCreateNotification({
      userId: request.user_id,
      type: "message_received",
      meta: { excerpt: content.slice(0, 240) },
      link: `/account.html?request=${encodeURIComponent(params.id)}`,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/quote-requests/[id]/messages");
  }
}
