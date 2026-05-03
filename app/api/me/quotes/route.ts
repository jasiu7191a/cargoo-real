import { NextResponse } from "next/server";
import { requireUser } from "@/lib/account-auth";
import { handleApiError } from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const quotes = await query(
      `SELECT id, quote_request_id, product_name, product_link, product_image_url,
              product_cost, shipping_cost, customs_cost, service_fee, total_price, currency,
              estimated_delivery, notes, payment_instructions, status, expires_at,
              sent_at, accepted_at, rejected_at, created_at, updated_at
       FROM quotes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ quotes });
  } catch (error) {
    return handleApiError(error, "My quotes API error");
  }
}
