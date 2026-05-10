import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError } from "@/lib/account-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upload an image to the IMAGES_BUCKET R2 binding and return its public URL.
 *
 * Body: multipart/form-data with a single `file` field.
 * Auth: admin session + CSRF.
 *
 * Required Cloudflare Pages configuration (one-time setup):
 *   1. Create an R2 bucket (e.g. `cargoo-images`).
 *   2. Bind it in Pages → Settings → Functions → R2 bucket bindings:
 *        Variable name: IMAGES_BUCKET   (must match this code)
 *        R2 bucket:     cargoo-images
 *   3. Make objects publicly readable: either turn on the bucket's
 *      r2.dev public URL, or attach a custom domain (e.g. images.cargooimport.eu).
 *   4. Set the env var R2_PUBLIC_URL to the public origin (no trailing slash),
 *      e.g.   https://images.cargooimport.eu     or
 *             https://pub-<hash>.r2.dev
 *
 * If the binding or env var is missing the route returns 503 with a clear
 * error so the admin sees what to fix.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function extFor(contentType: string): string {
  switch (contentType) {
    case "image/jpeg": return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/gif":  return "gif";
    case "image/avif": return "avif";
    default: return "bin";
  }
}

function randomKey(): string {
  // 16 bytes -> 32 hex chars. Good enough to avoid collisions per quote.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

async function getR2() {
  // OpenNext exposes the Cloudflare bindings via getCloudflareContext().
  // Importing dynamically keeps the route working in `next dev` (where the
  // adapter isn't loaded) — there it just throws "R2 binding not available"
  // which surfaces nicely as a 503.
  const mod: any = await import("@opennextjs/cloudflare").catch(() => null);
  const ctx = mod?.getCloudflareContext?.();
  return ctx?.env?.IMAGES_BUCKET ?? null;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    requireCsrf(req);

    const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
    if (!publicBase) {
      apiError(503, "R2_PUBLIC_URL env var not configured", "R2_NOT_CONFIGURED");
    }

    const bucket: any = await getR2();
    if (!bucket) {
      apiError(503, "IMAGES_BUCKET R2 binding is not bound to this deployment", "R2_NOT_CONFIGURED");
    }

    const form = await req.formData().catch(() => null);
    if (!form) apiError(400, "Expected multipart/form-data body", "INVALID_BODY");
    const file = form.get("file");
    if (!(file instanceof Blob)) apiError(400, "Missing `file` field", "VALIDATION_ERROR");

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED.has(contentType)) {
      apiError(415, `Unsupported file type: ${contentType}`, "UNSUPPORTED_TYPE");
    }
    if (file.size > MAX_BYTES) {
      apiError(413, `File too large (max ${MAX_BYTES / 1024 / 1024} MB)`, "TOO_LARGE");
    }

    const ext = extFor(contentType);
    // Path: quote-images/YYYY/MM/<random>.<ext>
    const now = new Date();
    const key = `quote-images/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomKey()}.${ext}`;

    const buf = await file.arrayBuffer();
    await bucket.put(key, buf, {
      httpMetadata: { contentType },
      // Cache aggressively — image bytes never change for a given key.
      customMetadata: { uploaded_at: now.toISOString() },
    });

    return NextResponse.json({
      url:  `${publicBase}/${key}`,
      key,
      bytes: file.size,
      contentType,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Admin upload quote image error");
  }
}
