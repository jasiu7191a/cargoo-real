import { NextRequest, NextResponse } from "next/server";
import { requireCsrf, requireUser } from "@/lib/account-auth";
import { apiError, cleanString, handleApiError, readJsonBody } from "@/lib/account-api";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = ["electronics", "clothing", "accessories", "other"];

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

    // Optional new fields. Each is validated only if the client sends it.
    let quantity: number | null = null;
    if (body?.quantity !== undefined && body?.quantity !== null && body?.quantity !== "") {
      const q = Number(body.quantity);
      if (!Number.isInteger(q) || q < 1 || q > 100000) {
        apiError(400, "Quantity must be a positive integer", "VALIDATION_ERROR");
      }
      quantity = q;
    }

    let category: string | null = null;
    if (body?.category !== undefined && body?.category !== null && body?.category !== "") {
      const cat = String(body.category).trim().toLowerCase();
      if (!ALLOWED_CATEGORIES.includes(cat)) {
        apiError(400, `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`, "VALIDATION_ERROR");
      }
      category = cat;
    }

    const contactPhone = cleanString(body?.contact_phone ?? body?.contactPhone ?? body?.phone, 40);

    let deliveryAddressId: string | null = null;
    if (body?.delivery_address_id || body?.deliveryAddressId) {
      const candidate = String(body.delivery_address_id ?? body.deliveryAddressId);
      const owned = await queryOne<{ id: string }>(
        "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
        [candidate, user.id]
      );
      if (!owned) apiError(400, "Selected delivery address does not belong to you", "VALIDATION_ERROR");
      deliveryAddressId = owned.id;
    }

    const [request] = await query(
      `INSERT INTO quote_requests
         (user_id, product_link, product_description, selected_items,
          quantity, category, contact_phone, delivery_address_id)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
       RETURNING id, user_id, product_link, product_description, selected_items,
                 quantity, category, contact_phone, delivery_address_id,
                 status, quote_id, created_at, updated_at`,
      [user.id, productLink, productDescription, JSON.stringify(selectedItems),
       quantity, category, contactPhone, deliveryAddressId]
    );

    return NextResponse.json({ quoteRequest: request }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Create quote request API error");
  }
}
