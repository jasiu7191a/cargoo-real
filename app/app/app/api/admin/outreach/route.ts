import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOutreachEmail } from "@/lib/services/outreach";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Fixed: Added null check for session.user to resolve TypeScript build error
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, leadName, productName, personalizedSnippet } = body;

    if (!to || !subject || !leadName || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendOutreachEmail({
      to,
      subject,
      leadName,
      productName,
      personalizedSnippet: personalizedSnippet || "",
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
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return a simple status for GET requests to verify the endpoint is active
  return NextResponse.json({ 
    status: "active", 
    endpoint: "/api/admin/outreach",
    ready: true 
  });
}
