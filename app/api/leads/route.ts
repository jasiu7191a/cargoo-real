import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAdminNotification, sendClientConfirmation } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// Allow the public website (cargooimport.eu) to POST leads cross-origin
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://cargooimport.eu',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, productUrl, quantity, targetPrice, notes, email } = body ?? {};

    if (!productName || typeof productName !== "string" || productName.length > 500) {
      return NextResponse.json({ error: 'Missing or invalid productName' }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
    }

    // 1. Find or create the user by email
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Default name from email
          role: 'USER'
        }
      });
    }

    // 2. Create the Lead
    const lead = await prisma.lead.create({
      data: {
        productName,
        productUrl,
        quantity: Number(quantity) || 1,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        notes,
        userId: user.id,
        status: 'NEW'
      },
      include: { user: true } // Include user for notification data
    });

    // 3. Trigger Automated Notifications (Non-blocking for better UX)
    // In Edge/Worker environments, we handle this carefully.
    try {
      await Promise.all([
        sendAdminNotification(lead),
        sendClientConfirmation(email, productName)
      ]);
    } catch (mailError) {
      console.error('Non-critical Mail Error:', mailError);
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error('Lead Generation Error:', error);
    // Never expose internal error details to untrusted callers.
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500, headers: CORS_HEADERS });
  }
}
