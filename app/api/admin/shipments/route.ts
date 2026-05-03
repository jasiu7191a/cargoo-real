import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import {
  apiError,
  cleanString,
  handleApiError,
  normalizeStatus,
  SHIPMENT_STATUSES,
  readJsonBody,
} from "@/lib/account-api";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);
    const quoteId = cleanString(body?.quote_id, 80);
    const quote = quoteId
      ? await queryOne<{ user_id: string }>("SELECT user_id FROM quotes WHERE id = $1", [quoteId])
      : null;
    if (quoteId && !quote) apiError(404, "Quote not found", "NOT_FOUND");

    const userId = quote?.user_id || cleanString(body?.user_id, 80);
    if (!userId) apiError(400, "Customer is required", "VALIDATION_ERROR");

    const [shipment] = await query(
      `INSERT INTO shipments (
        user_id, quote_id, order_number, tracking_number, carrier, status, last_update, estimated_delivery
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        quoteId,
        cleanString(body?.order_number, 120) || `CG-${Date.now()}`,
        cleanString(body?.tracking_number, 180),
        cleanString(body?.carrier, 120),
        normalizeStatus(body?.status, SHIPMENT_STATUSES, "quote_requested"),
        cleanString(body?.last_update, 1000),
        cleanString(body?.estimated_delivery, 200),
      ]
    );

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Admin create shipment API error");
  }
}
