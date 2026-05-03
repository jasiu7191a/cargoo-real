import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import {
  apiError,
  cleanString,
  handleApiError,
  normalizeCurrency,
  normalizeDate,
  normalizeStatus,
  optionalNumber,
  QUOTE_STATUSES,
  readJsonBody,
} from "@/lib/account-api";
import { query, queryOne, transaction } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuoteRequestRow = {
  id: string;
  user_id: string;
  product_link: string | null;
  product_description: string | null;
  selected_items: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);

    const quoteRequestId = cleanString(body?.quote_request_id, 80);
    const quoteRequest = quoteRequestId
      ? await queryOne<QuoteRequestRow>(
          "SELECT id, user_id, product_link, product_description, selected_items FROM quote_requests WHERE id = $1",
          [quoteRequestId]
        )
      : null;
    if (quoteRequestId && !quoteRequest) apiError(404, "Quote request not found", "NOT_FOUND");

    const userId = quoteRequest?.user_id || cleanString(body?.user_id, 80);
    if (!userId) apiError(400, "Customer is required", "VALIDATION_ERROR");

    const status = normalizeStatus(body?.status, QUOTE_STATUSES, "draft");
    const productCost = optionalNumber(body?.product_cost);
    const shippingCost = optionalNumber(body?.shipping_cost);
    const customsCost = optionalNumber(body?.customs_cost);
    const serviceFee = optionalNumber(body?.service_fee);
    const calculatedTotal = [productCost, shippingCost, customsCost, serviceFee]
      .reduce<number>((sum, value) => sum + (value ?? 0), 0);
    const totalPrice = optionalNumber(
      body?.total_price ??
      calculatedTotal
    );

    const quote = await transaction(async (tx) => {
      const created = await tx.queryOne(
        `INSERT INTO quotes (
          quote_request_id, user_id, admin_id, product_name, product_link, product_image_url,
          product_cost, shipping_cost, customs_cost, service_fee, total_price, currency,
          estimated_delivery, notes, payment_instructions, status, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          quoteRequestId,
          userId,
          admin.id,
          cleanString(body?.product_name, 500),
          cleanString(body?.product_link, 2000) || quoteRequest?.product_link || null,
          cleanString(body?.product_image_url, 2000),
          productCost,
          shippingCost,
          customsCost,
          serviceFee,
          totalPrice,
          normalizeCurrency(body?.currency),
          cleanString(body?.estimated_delivery, 200),
          cleanString(body?.notes, 4000),
          cleanString(body?.payment_instructions, 4000),
          status,
          normalizeDate(body?.expires_at),
        ]
      );

      if (quoteRequestId) {
        await tx.query(
          `UPDATE quote_requests
           SET quote_id = $1,
               status = CASE WHEN status = 'new' THEN 'preparing_quote' ELSE status END,
               last_admin_update = now()
           WHERE id = $2`,
          [(created as any).id, quoteRequestId]
        );
      }

      return created;
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Admin create quote API error");
  }
}
