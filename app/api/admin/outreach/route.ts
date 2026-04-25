import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { sendOutreachEmail } from "@/lib/services/outreach";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, leadName, productName, personalizedSnippet, lang = "en" } = body;

    if (!to || !subject || !leadName || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendOutreachEmail({
      to,
      subject,
      leadName,
      productName,
      personalizedSnippet: personalizedSnippet || "",
      lang,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.resData });
  } catch (error) {
    console.error("Admin outreach API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAdminSession();
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return a simple status for GET requests to verify the endpoint is active
  return NextResponse.json({ 
    status: "active", 
    endpoint: "/api/admin/outreach",
    ready: true 
  });
}
