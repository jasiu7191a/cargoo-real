import { NextRequest, NextResponse } from "next/server";
import { requireCsrf, requireUser } from "@/lib/account-auth";
import { apiError, cleanString, handleApiError, readJsonBody } from "@/lib/account-api";
import { query } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    requireCsrf(req);

    const body = await readJsonBody(req);
    const productLink = cleanString(body?.product_link ?? body?.productUrl, 2000);
    const productDescription = cleanString(body?.product_description ?? body?.productName ?? body?.notes ?? body?.message, 4000);
    const selectedItems = Array.isArray(body?.selected_items) ? body.selected_items : [];

    if (!productLink && !productDescription && selectedItems.length === 0) {
      apiError(400, "Product link, description, or selected items are required", "VALIDATION_ERROR");
    }

    const [request] = await query(
      `INSERT INTO quote_requests (user_id, product_link, product_description, selected_items)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, user_id, product_link, product_description, selected_items, status, quote_id, created_at, updated_at`,
      [user.id, productLink, productDescription, JSON.stringify(selectedItems)]
    );

    return NextResponse.json({ quoteRequest: request }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Create quote request API error");
  }
}
