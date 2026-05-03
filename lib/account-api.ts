import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function apiError(status: number, message: string, code?: string): never {
  throw new ApiError(status, message, code);
}

export function handleApiError(error: unknown, context: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error(`${context}:`, error);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

export async function readJsonBody(req: Request) {
  try {
    return await req.json();
  } catch {
    apiError(400, "Invalid JSON body", "INVALID_JSON");
  }
}

export function cleanString(value: unknown, maxLength = 4000): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function requiredString(value: unknown, field: string, maxLength = 4000): string {
  const cleaned = cleanString(value, maxLength);
  if (!cleaned) apiError(400, `${field} is required`, "VALIDATION_ERROR");
  return cleaned;
}

export function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < 0) {
    apiError(400, "Invalid numeric value", "VALIDATION_ERROR");
  }
  return Math.round(number * 100) / 100;
}

export function normalizeStatus(value: unknown, allowed: string[], fallback: string) {
  const status = typeof value === "string" ? value.trim() : "";
  if (!status) return fallback;
  if (!allowed.includes(status)) apiError(400, "Invalid status", "VALIDATION_ERROR");
  return status;
}

export function normalizeCurrency(value: unknown) {
  const currency = typeof value === "string" && value.trim() ? value.trim().toUpperCase() : "EUR";
  if (!/^[A-Z]{3}$/.test(currency)) apiError(400, "Invalid currency", "VALIDATION_ERROR");
  return currency;
}

export function normalizeDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value !== "string") apiError(400, "Invalid date", "VALIDATION_ERROR");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) apiError(400, "Invalid date", "VALIDATION_ERROR");
  return date.toISOString();
}

export const QUOTE_REQUEST_STATUSES = [
  "new",
  "preparing_quote",
  "quoted",
  "accepted",
  "rejected",
  "cancelled",
];

export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "paid",
  "cancelled",
];

export const SHIPMENT_STATUSES = [
  "quote_requested",
  "paid",
  "sourcing",
  "quality_check",
  "shipped_from_china",
  "customs",
  "out_for_delivery",
  "delivered",
];
