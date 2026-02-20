import sgMail from "@sendgrid/mail";

const NOTIFICATION_EMAIL = "ProductionLinks@yahoo.com";

let sendgridConfigured = false;

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    sendgridConfigured = true;
  }
}

initSendGrid();

export async function sendRefundNotification(refundRequest: {
  id: number;
  email: string;
  name?: string | null;
  reason: string;
  transactionId?: string | null;
  createdAt?: Date | null;
}): Promise<boolean> {
  if (!sendgridConfigured) {
    console.log("[Email] SendGrid not configured - refund request stored in database only");
    console.log(`[Email] Refund Request #${refundRequest.id}:`);
    console.log(`  From: ${refundRequest.name || "Unknown"} (${refundRequest.email})`);
    console.log(`  Reason: ${refundRequest.reason}`);
    console.log(`  Transaction ID: ${refundRequest.transactionId || "Not provided"}`);
    return false;
  }

  try {
    const msg = {
      to: NOTIFICATION_EMAIL,
      from: NOTIFICATION_EMAIL,
      subject: `Refund Request #${refundRequest.id} - LinksShrink.com`,
      text: `New Refund Request\n\nRequest ID: #${refundRequest.id}\nCustomer Name: ${refundRequest.name || "Not provided"}\nCustomer Email: ${refundRequest.email}\nTransaction/Session ID: ${refundRequest.transactionId || "Not provided"}\nReason: ${refundRequest.reason}\nSubmitted: ${refundRequest.createdAt ? new Date(refundRequest.createdAt).toLocaleString() : "Just now"}\n\nPlease review this request in your Stripe Dashboard and process the refund if applicable within 7 days per your refund policy.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0f0f0f; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #a3e635; margin: 0;">Refund Request #${refundRequest.id}</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0;">LinksShrink.com</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.name || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${refundRequest.email}">${refundRequest.email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Transaction/Session ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.transactionId || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Reason</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.reason}</td></tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">Please review this request in your <a href="https://dashboard.stripe.com/payments">Stripe Dashboard</a> and process the refund if applicable within 7 days per your refund policy.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] Refund notification sent for request #${refundRequest.id}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send refund notification:", error?.message || error);
    return false;
  }
}
