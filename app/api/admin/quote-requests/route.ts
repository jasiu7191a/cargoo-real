import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import {
  cleanString,
  handleApiError,
  normalizeStatus,
  QUOTE_REQUEST_STATUSES,
  readJsonBody,
} from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const quoteRequests = await query(
      `SELECT qr.id, qr.user_id, u.email AS customer_email, qr.product_link,
              qr.product_description, qr.selected_items, qr.status, qr.quote_id,
              qr.admin_notes, qr.last_admin_update, qr.created_at, qr.updated_at,
              q.status AS quote_status, q.total_price, q.currency,
              s.status AS shipment_status, s.order_number
       FROM quote_requests qr
       JOIN users u ON u.id = qr.user_id
       LEFT JOIN quotes q ON q.id = qr.quote_id
       LEFT JOIN LATERAL (
         SELECT status, order_number
         FROM shipments
         WHERE user_id = qr.user_id AND (quote_id = qr.quote_id OR qr.quote_id IS NULL)
         ORDER BY created_at DESC
         LIMIT 1
       ) s ON true
       ORDER BY qr.created_at DESC`,
      []
    );

    return NextResponse.json({ quoteRequests });
  } catch (error) {
    return handleApiError(error, "Admin quote requests API error");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);
    const id = cleanString(body?.id, 80);
    const status = normalizeStatus(body?.status, QUOTE_REQUEST_STATUSES, "new");
    const adminNotes = cleanString(body?.admin_notes, 4000);

    const [request] = await query(
      `UPDATE quote_requests
       SET status = $2, admin_notes = $3, last_admin_update = now()
       WHERE id = $1
       RETURNING id, status, admin_notes, last_admin_update`,
      [id, status, adminNotes]
    );

    return NextResponse.json({ quoteRequest: request });
  } catch (error) {
    return handleApiError(error, "Admin quote request update API error");
  }
}
