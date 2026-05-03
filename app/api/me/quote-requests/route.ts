import { NextResponse } from "next/server";
import { requireUser } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const quoteRequests = await query(
      `SELECT qr.id, qr.product_link, qr.product_description, qr.selected_items, qr.status,
              qr.quote_id, qr.admin_notes, qr.last_admin_update, qr.created_at, qr.updated_at,
              q.status AS quote_status
       FROM quote_requests qr
       LEFT JOIN quotes q ON q.id = qr.quote_id
       WHERE qr.user_id = $1
       ORDER BY qr.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ quoteRequests });
  } catch (error) {
    return handleApiError(error, "My quote requests API error");
  }
}
