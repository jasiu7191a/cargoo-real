import { NextRequest, NextResponse } from "next/server";
import { requireUser, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody, cleanString } from "@/lib/account-api";
import { withCors, corsOk } from "@/lib/cors";
import { query, queryOne } from "@/lib/account-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  lang: string | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const profile = await queryOne<ProfileRow>(
      `SELECT id, email, role, first_name, last_name, phone, lang, created_at
       FROM users WHERE id = $1`,
      [user.id]
    );
    return withCors(req, NextResponse.json({ profile }));
  } catch (error) {
    return handleApiError(error, "GET /api/me/profile", req);
  }
}

/** PATCH — partial update. Only first_name, last_name, phone, lang are mutable here. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    requireCsrf(req);
    const body = await readJsonBody(req);

    const firstName = body?.first_name === null ? null : cleanString(body?.first_name, 80);
    const lastName  = body?.last_name  === null ? null : cleanString(body?.last_name, 80);
    const phone     = body?.phone      === null ? null : cleanString(body?.phone, 40);
    const lang      = typeof body?.lang === "string" && ["en", "pl", "de", "fr"].includes(body.lang)
      ? body.lang
      : undefined;

    const sets: string[] = [];
    const params: any[] = [user.id];
    const add = (field: string, value: any) => {
      params.push(value);
      sets.push(`${field} = $${params.length}`);
    };

    if (body?.first_name !== undefined) add("first_name", firstName);
    if (body?.last_name  !== undefined) add("last_name",  lastName);
    if (body?.phone      !== undefined) add("phone",      phone);
    if (lang)                            add("lang",       lang);

    if (sets.length === 0) apiError(400, "Nothing to update", "VALIDATION_ERROR");

    const [updated] = await query<ProfileRow>(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $1
       RETURNING id, email, role, first_name, last_name, phone, lang, created_at`,
      params
    );
    return withCors(req, NextResponse.json({ profile: updated }));
  } catch (error) {
    return handleApiError(error, "PATCH /api/me/profile", req);
  }
}

export const OPTIONS = (req: Request) => corsOk(req);
