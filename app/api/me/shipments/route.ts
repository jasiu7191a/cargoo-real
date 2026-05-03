import { NextResponse } from "next/server";
import { requireUser } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const shipments = await query(
      `SELECT id, quote_id, order_number, tracking_number, carrier, status,
              last_update, estimated_delivery, created_at, updated_at
       FROM shipments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ shipments });
  } catch (error) {
    return handleApiError(error, "My shipments API error");
  }
}
