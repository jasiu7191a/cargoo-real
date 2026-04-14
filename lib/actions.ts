"use server";

import { createLead, LeadData } from "@/lib/services/leads";
import { revalidatePath } from "next/cache";

export async function submitProductRequest(formData: LeadData) {
  try {
    const lead = await createLead(formData);
    
    // In a real app, you might trigger an email notification here
    // await sendNotificationToAdmin(lead);

    revalidatePath("/admin/leads");
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, error: "Failed to submit request" };
  }
}
