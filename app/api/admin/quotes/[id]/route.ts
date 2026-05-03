import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import {
  cleanString,
  handleApiError,
  normalizeCurrency,
  normalizeDate,
  normalizeStatus,
  optionalNumber,
  QUOTE_STATUSES,
  readJsonBody,
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

    const [quote] = await query(
      `UPDATE quotes
       SET product_name = $2,
           product_link = $3,
           product_image_url = $4,
           product_cost = $5,
           shipping_cost = $6,
           customs_cost = $7,
           service_fee = $8,
           total_price = $9,
           currency = $10,
           estimated_delivery = $11,
           notes = $12,
           payment_instructions = $13,
           status = $14,
           expires_at = $15
       WHERE id = $1
       RETURNING *`,
      [
        params.id,
        cleanString(body?.product_name, 500),
        cleanString(body?.product_link, 2000),
        cleanString(body?.product_image_url, 2000),
        optionalNumber(body?.product_cost),
        optionalNumber(body?.shipping_cost),
        optionalNumber(body?.customs_cost),
        optionalNumber(body?.service_fee),
        optionalNumber(body?.total_price),
        normalizeCurrency(body?.currency),
        cleanString(body?.estimated_delivery, 200),
        cleanString(body?.notes, 4000),
        cleanString(body?.payment_instructions, 4000),
        normalizeStatus(body?.status, QUOTE_STATUSES, "draft"),
        normalizeDate(body?.expires_at),
      ]
    );

    return NextResponse.json({ quote });
  } catch (error) {
    return handleApiError(error, "Admin update quote API error");
  }
}
