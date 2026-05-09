import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody, cleanString } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { listMessages, createMessage, userOwnsRequest, markThreadRead } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** GET /api/me/quote-requests/{id}/messages — list thread + mark admin's messages as read. */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    if (!(await userOwnsRequest(user.id, params.id))) {
      apiError(404, "Request not found", "NOT_FOUND");
    }
    const messages = await listMessages(params.id);
    await markThreadRead(params.id, "customer");
    return withCors(req, NextResponse.json({ messages }));
  } catch (error) {
    return handleApiError(error, "GET /api/me/quote-requests/[id]/messages", req);
  }
}

/** POST /api/me/quote-requests/{id}/messages — customer sends a reply. */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    if (!(await userOwnsRequest(user.id, params.id))) {
      apiError(404, "Request not found", "NOT_FOUND");
    }
    const body = await readJsonBody(req);
    const content = cleanString(body?.content, 4000);
    if (!content) apiError(400, "Message content required", "VALIDATION_ERROR");
    const message = await createMessage({
      quoteRequestId: params.id,
      senderUserId: user.id,
      fromAdmin: false,
      content,
    });
    return withCors(req, NextResponse.json({ message }, { status: 201 }));
  } catch (error) {
    return handleApiError(error, "POST /api/me/quote-requests/[id]/messages", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
