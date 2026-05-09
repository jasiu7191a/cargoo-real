import { NextResponse } from "next/server";

/**
 * CORS for /api/*.
 *
 * The static customer dashboard at www.cargooimport.eu lives on a different
 * Cloudflare Pages project from this Next.js API (admin.cargooimport.eu),
 * so it's a cross-origin caller. Wildcard `*` doesn't work with
 * credentials: 'include', so we reflect a specific allowed origin.
 *
 * Why this lives in handler code instead of next.config.js or middleware:
 *  - next.config.js `headers()` proved unreliable for /api routes on
 *    OpenNext/Cloudflare — sometimes applied, sometimes silently dropped,
 *    especially on error responses (500/401).
 *  - Middleware-set response headers via NextResponse.next() also dropped
 *    inconsistently on OpenNext.
 *  - Setting headers explicitly in the route's response is the only thing
 *    that reliably ends up on the wire.
 *
 * Usage:
 *   import { withCors, corsOk } from "@/lib/cors";
 *
 *   export async function GET(req: Request) {
 *     ...
 *     return withCors(req, NextResponse.json({ ok: true }));
 *   }
 *
 *   export const OPTIONS = (req: Request) => corsOk(req);
 *
 * handleApiError() (in account-api.ts) accepts an optional request and
 * applies CORS to error responses too.
 */

const ALLOWED_ORIGINS = new Set([
  "https://www.cargooimport.eu",
  "https://cargooimport.eu",
  "https://admin.cargooimport.eu",
  "https://blog.cargooimport.eu",
]);

export function corsHeaders(req: Request | { headers: Headers }): Record<string, string> {
  const origin = req.headers.get("origin");
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-csrf-token, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
  }
  return h;
}

/** Attach CORS headers to an existing response. Idempotent — won't
 *  duplicate headers if they're already present. */
export function withCors<T extends NextResponse>(req: Request | { headers: Headers }, res: T): T {
  const h = corsHeaders(req);
  for (const [k, v] of Object.entries(h)) {
    res.headers.set(k, v);
  }
  return res;
}

/** Empty success response with CORS — used by OPTIONS preflight handlers. */
export function corsOk(req: Request | { headers: Headers }, status = 204): NextResponse {
  return new NextResponse(null, { status, headers: corsHeaders(req) });
}
