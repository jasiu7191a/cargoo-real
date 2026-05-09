import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody, cleanString } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { query, transaction } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AddressRow = {
  id: string;
  user_id: string;
  street: string;
  city: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const addresses = await query<AddressRow>(
      `SELECT id, user_id, street, city, zip_code, country, is_default, created_at, updated_at
       FROM addresses WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [user.id]
    );
    return withCors(req, NextResponse.json({ addresses }));
  } catch (error) {
    return handleApiError(error, "GET /api/me/addresses", req);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const body = await readJsonBody(req);
    const street   = cleanString(body?.street, 200);
    const city     = cleanString(body?.city, 120);
    const zipCode  = cleanString(body?.zip_code ?? body?.zipCode, 20);
    const country  = cleanString(body?.country, 80);
    const setDefault = body?.is_default === true || body?.isDefault === true;

    if (!street || !city || !zipCode || !country) {
      apiError(400, "street, city, zip_code, country are required", "VALIDATION_ERROR");
    }

    const created = await transaction(async (tx) => {
      if (setDefault) {
        await tx.query(
          "UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND is_default = TRUE",
          [user.id]
        );
      }
      const rows = await tx.query<AddressRow>(
        `INSERT INTO addresses (user_id, street, city, zip_code, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, street, city, zip_code, country, is_default, created_at, updated_at`,
        [user.id, street, city, zipCode, country, setDefault]
      );
      return rows[0];
    });

    return withCors(req, NextResponse.json({ address: created }, { status: 201 }));
  } catch (error) {
    return handleApiError(error, "POST /api/me/addresses", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
