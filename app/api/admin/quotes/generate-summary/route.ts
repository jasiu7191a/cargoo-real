import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireCsrf } from "@/lib/account-auth";
import { apiError, handleApiError, readJsonBody } from "@/lib/account-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    requireCsrf(req);
    const body = await readJsonBody(req);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) apiError(503, "Gemini is not configured", "GEMINI_NOT_CONFIGURED");

    const prompt = `
You assist a Cargoo Import admin. Summarize the quote request and draft customer-friendly quote notes.
Do not decide prices, security, authorization, or whether to send anything.
Return concise JSON with keys: product_summary, customer_notes, missing_info_warnings.

Request:
product_link: ${String(body?.product_link ?? "")}
product_description: ${String(body?.product_description ?? "")}
selected_items: ${JSON.stringify(body?.selected_items ?? [])}
draft_quote_fields: ${JSON.stringify(body?.draft_quote_fields ?? {})}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini summary failed:", await response.text());
      apiError(502, "Gemini summary failed", "GEMINI_FAILED");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let summary;
    try {
      summary = JSON.parse(text);
    } catch {
      summary = { product_summary: text, customer_notes: "", missing_info_warnings: [] };
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return handleApiError(error, "Gemini quote summary API error");
  }
}
