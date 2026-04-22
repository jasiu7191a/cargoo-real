import { resend } from '@/lib/mail';

interface OutreachEmail {
  to: string;
  subject: string;
  leadName: string;
  productName: string;
  personalizedSnippet: string;
}

export async function sendOutreachEmail(data: OutreachEmail) {
  try {
    const { data: resData, error } = await resend.emails.send({
      from: 'Cargoo Sourcing <cargooimport@gmail.com>',
      to: [data.to],
      subject: data.subject,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Hello ${data.leadName.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},</h2>
          <p>I noticed you were looking for <strong>${data.productName.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</strong>. At Cargoo, we specialize in direct-from-factory sourcing to get you much better rates than public marketplaces.</p>
          <p>${data.personalizedSnippet.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
          <p>We handle all the logistics, quality inspection, and customs so you don't have to worry about a thing.</p>
          <p>Would you like me to generate a personalized quote for your order?</p>
          <br />
          <p>Best regards,<br />The Cargoo Sourcing Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending outreach email:", error);
      return { success: false, error };
    }

    return { success: true, resData };
  } catch (err) {
    console.error("Critical error in outreach service:", err);
    return { success: false, error: err };
  }
}
