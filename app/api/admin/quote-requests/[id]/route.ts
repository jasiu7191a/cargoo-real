import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/account-auth";
import { apiError, handleApiError } from "@/lib/account-api";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const quoteRequest = await queryOne(
      `SELECT qr.*, u.email AS customer_email
       FROM quote_requests qr
       JOIN users u ON u.id = qr.user_id
       WHERE qr.id = $1`,
      [params.id]
    );
    if (!quoteRequest) apiError(404, "Quote request not found", "NOT_FOUND");

    const quotes = await query(
      `SELECT *
       FROM quotes
       WHERE quote_request_id = $1
       ORDER BY created_at DESC`,
      [params.id]
    );

    const shipments = await query(
      `SELECT s.*
       FROM shipments s
       JOIN quote_requests qr ON qr.user_id = s.user_id
       WHERE qr.id = $1
       ORDER BY s.created_at DESC`,
      [params.id]
    );

    return NextResponse.json({ quoteRequest, quotes, shipments });
  } catch (error) {
    return handleApiError(error, "Admin quote request detail API error");
  }
}
