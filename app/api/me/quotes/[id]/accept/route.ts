import { NextRequest, NextResponse } from "next/server";
import { requireCsrf, requireUser } from "@/lib/account-auth";
import { apiError, handleApiError } from "@/lib/account-api";
import { transaction } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };
type QuoteRow = {
  id: string;
  user_id: string;
  quote_request_id: string | null;
  status: string;
  expires_at: Date | string | null;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    requireCsrf(req);

    const result = await transaction(async (tx) => {
      const quote = await tx.queryOne<QuoteRow>(
        "SELECT id, user_id, quote_request_id, status, expires_at FROM quotes WHERE id = $1 FOR UPDATE",
        [params.id]
      );
      if (!quote) apiError(404, "Quote not found", "NOT_FOUND");
      if (quote.user_id !== user.id) apiError(403, "Forbidden", "FORBIDDEN");
      if (quote.status !== "sent") apiError(409, "Only sent quotes can be accepted", "INVALID_STATUS");
      if (quote.expires_at && new Date(quote.expires_at).getTime() < Date.now()) {
        await tx.query("UPDATE quotes SET status = 'expired' WHERE id = $1", [quote.id]);
        apiError(409, "Quote expired", "QUOTE_EXPIRED");
      }

      const updated = await tx.queryOne(
        `UPDATE quotes
         SET status = 'accepted', accepted_at = now()
         WHERE id = $1
         RETURNING id, status, accepted_at`,
        [quote.id]
      );

      if (quote.quote_request_id) {
        await tx.query(
          "UPDATE quote_requests SET status = 'accepted' WHERE id = $1 AND user_id = $2",
          [quote.quote_request_id, user.id]
        );
      }

      return updated;
    });

    return NextResponse.json({ success: true, quote: result });
  } catch (error) {
    return handleApiError(error, "Accept quote API error");
  }
}
