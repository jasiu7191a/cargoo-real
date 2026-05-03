import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import {
  cleanString,
  handleApiError,
  normalizeStatus,
  readJsonBody,
  SHIPMENT_STATUSES,
} from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);

    const [shipment] = await query(
      `UPDATE shipments
       SET order_number = $2,
           tracking_number = $3,
           carrier = $4,
           status = $5,
           last_update = $6,
           estimated_delivery = $7
       WHERE id = $1
       RETURNING *`,
      [
        params.id,
        cleanString(body?.order_number, 120),
        cleanString(body?.tracking_number, 180),
        cleanString(body?.carrier, 120),
        normalizeStatus(body?.status, SHIPMENT_STATUSES, "quote_requested"),
        cleanString(body?.last_update, 1000),
        cleanString(body?.estimated_delivery, 200),
      ]
    );

    return NextResponse.json({ shipment });
  } catch (error) {
    return handleApiError(error, "Admin update shipment API error");
  }
}
