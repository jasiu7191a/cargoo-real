import prisma from "@/lib/prisma";

export interface LeadData {
  productName: string;
  productUrl?: string;
  quantity: number;
  targetPrice?: number;
  notes?: string;
  email: string;
}

export async function createLead(data: LeadData) {
  // First, find or create the user
  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.email.split('@')[0], // Basic placeholder name
      },
    });
  }

  // Create the lead
  const lead = await prisma.lead.create({
    data: {
      userId: user.id,
      productName: data.productName,
      productUrl: data.productUrl,
      quantity: data.quantity,
      targetPrice: data.targetPrice,
      notes: data.notes,
      status: "NEW",
    },
  });

  return lead;
}
