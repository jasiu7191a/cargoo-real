import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAdminNotification, sendClientConfirmation } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, productUrl, quantity, targetPrice, notes, email } = body;

    if (!productName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error: any) {
    console.error('Lead Generation Error:', error);
    return NextResponse.json({ error: 'Failed to create lead', details: error.message }, { status: 500 });
  }
}
