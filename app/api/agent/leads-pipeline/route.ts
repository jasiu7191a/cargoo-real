import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function authOk(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.AGENT_SECRET;
  return !!secret && token === secret;
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch leads from the last 30 days that have a product name
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recentLeads = await prisma.lead.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { productName: true, notes: true },
    take: 50,
  });

  if (recentLeads.length === 0) {
    return NextResponse.json({ skipped: true, reason: "No recent leads" });
  }

  // Build unique keyword list from product names
  const keywords = Array.from(new Set(recentLeads.map(l => l.productName.trim()).filter(Boolean)));

  // Find which keywords already have a published article
  const existing = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { targetKeyword: true, title: true },
  });

  const coveredKeywords = new Set(
    existing.flatMap(p => [
      p.targetKeyword?.toLowerCase(),
      p.title?.toLowerCase(),
    ]).filter(Boolean)
  );

  const uncovered = keywords.filter(k => {
    const lower = k.toLowerCase();
    return !Array.from(coveredKeywords).some(c => c?.includes(lower) || lower.includes(c ?? ""));
  });

  if (uncovered.length === 0) {
    return NextResponse.json({ skipped: true, reason: "All recent products already have articles", keywords });
  }

  // Trigger article generation for the top uncovered keyword
  const keyword = uncovered[0];
  const agentSecret = process.env.AGENT_SECRET ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.cargooimport.eu";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50_000);

  let triggerResult: unknown;
  try {
    const res = await fetch(`${baseUrl}/api/agent/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${agentSecret}`,
      },
      body: JSON.stringify({ keyword, lang: "en" }),
      signal: controller.signal,
    });
    triggerResult = await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Trigger failed", details: msg, keyword });
  } finally {
    clearTimeout(timeout);
  }

  await prisma.adminAction.create({
    data: {
      type: "LEADS_PIPELINE",
      details: `Triggered article for keyword: "${keyword}" (${uncovered.length} uncovered of ${keywords.length} unique products)`,
      adminName: "Agent",
    },
  });

  return NextResponse.json({
    keyword,
    uncoveredCount: uncovered.length,
    totalLeadKeywords: keywords.length,
    triggerResult,
  });
}
