import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody, cleanString } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { query, transaction } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const body = await readJsonBody(req);

    const street   = body?.street   === undefined ? undefined : cleanString(body.street, 200);
    const city     = body?.city     === undefined ? undefined : cleanString(body.city, 120);
    const zipCode  = body?.zip_code === undefined && body?.zipCode === undefined
      ? undefined
      : cleanString(body.zip_code ?? body.zipCode, 20);
    const country  = body?.country  === undefined ? undefined : cleanString(body.country, 80);
    const setDefault = body?.is_default === true || body?.isDefault === true;

    const sets: string[] = [];
    const queryParams: any[] = [params.id, user.id];

    const add = (field: string, value: any) => {
      if (value === null || (typeof value === "string" && value.length === 0)) {
        apiError(400, `${field} cannot be empty`, "VALIDATION_ERROR");
      }
      queryParams.push(value);
      sets.push(`${field} = $${queryParams.length}`);
    };

    if (street   !== undefined) add("street",   street);
    if (city     !== undefined) add("city",     city);
    if (zipCode  !== undefined) add("zip_code", zipCode);
    if (country  !== undefined) add("country",  country);

    const updated = await transaction(async (tx) => {
      if (setDefault) {
        await tx.query(
          "UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND is_default = TRUE AND id <> $2",
          [user.id, params.id]
        );
        queryParams.push(true);
        sets.push(`is_default = $${queryParams.length}`);
      }
      if (sets.length === 0) apiError(400, "Nothing to update", "VALIDATION_ERROR");
      const rows = await tx.query<AddressRow>(
        `UPDATE addresses SET ${sets.join(", ")}
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, street, city, zip_code, country, is_default, created_at, updated_at`,
        queryParams
      );
      return rows[0] ?? null;
    });

    if (!updated) apiError(404, "Address not found", "NOT_FOUND");
    return withCors(req, NextResponse.json({ address: updated }));
  } catch (error) {
    return handleApiError(error, "PATCH /api/me/addresses/[id]", req);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const rows = await query<{ id: string }>(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id",
      [params.id, user.id]
    );
    if (rows.length === 0) apiError(404, "Address not found", "NOT_FOUND");
    return withCors(req, NextResponse.json({ ok: true }));
  } catch (error) {
    return handleApiError(error, "DELETE /api/me/addresses/[id]", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
