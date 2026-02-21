import nodemailer from "nodemailer";

const OWNER_EMAIL = "ProductionLinks@yahoo.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const appPassword = process.env.YAHOO_APP_PASSWORD;
  if (!appPassword) {
    console.log("[Email] YAHOO_APP_PASSWORD not configured - emails will not be sent");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: {
      user: OWNER_EMAIL,
      pass: appPassword,
    },
  });

  return transporter;
}

export interface RefundCheckResult {
  qualified: boolean;
  reasons: string[];
  purchaseDate?: Date;
  plan?: string;
  daysSincePurchase?: number;
  creditsUsed?: boolean;
}

export async function sendRefundQualifiedEmail(refundRequest: {
  id: number;
  email: string;
  name?: string | null;
  reason: string;
  transactionId?: string | null;
}, checkResult: RefundCheckResult): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] Cannot send - YAHOO_APP_PASSWORD not configured`);
    console.log(`[Email] Qualified refund request #${refundRequest.id} from ${refundRequest.email}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: OWNER_EMAIL,
      to: OWNER_EMAIL,
      subject: `✅ QUALIFIED Refund Request #${refundRequest.id} - LinksShrink.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #166534; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0;">✅ Qualified Refund Request #${refundRequest.id}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">This customer meets the refund requirements</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.name || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${refundRequest.email}">${refundRequest.email}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Transaction ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.transactionId || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Reason</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.reason}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Purchase Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkResult.purchaseDate ? new Date(checkResult.purchaseDate).toLocaleDateString() : "Unknown"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Plan</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkResult.plan || "Unknown"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Days Since Purchase</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkResult.daysSincePurchase ?? "Unknown"}</td></tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">Process this refund in your <a href="https://dashboard.stripe.com/payments">Stripe Dashboard</a>.</p>
        </div>
      `,
    });
    console.log(`[Email] Qualified refund notification sent for request #${refundRequest.id}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send qualified refund email:", error?.message || error);
    return false;
  }
}

export async function sendRefundDeniedEmails(refundRequest: {
  id: number;
  email: string;
  name?: string | null;
  reason: string;
  transactionId?: string | null;
}, checkResult: RefundCheckResult): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] Cannot send - YAHOO_APP_PASSWORD not configured`);
    console.log(`[Email] Denied refund request #${refundRequest.id}: ${checkResult.reasons.join(", ")}`);
    return false;
  }

  const reasonsList = checkResult.reasons.map(r => `<li style="margin-bottom: 6px;">${r}</li>`).join("");
  const reasonsText = checkResult.reasons.map(r => `• ${r}`).join("\n");

  try {
    await transport.sendMail({
      from: OWNER_EMAIL,
      to: refundRequest.email,
      subject: `Refund Request Update - LinksShrink.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0f0f0f; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #a3e635; margin: 0;">LinksShrink.com</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0;">Refund Request Update</p>
          </div>
          <p>Hi ${refundRequest.name || "there"},</p>
          <p>Thank you for reaching out. After reviewing your refund request, we found that it does not meet our refund policy requirements for the following reason(s):</p>
          <ul style="background: #fef2f2; padding: 16px 16px 16px 32px; border-radius: 8px; border-left: 4px solid #ef4444;">
            ${reasonsList}
          </ul>
          <p><strong>Our refund policy:</strong></p>
          <ul>
            <li>Refunds are available within 7 days of purchase</li>
            <li>Link pack credits must be unused</li>
          </ul>
          <p>If you believe this is an error or have questions, please reply to this email and we'll be happy to help.</p>
          <p>Best regards,<br/>LinksShrink.com Team</p>
        </div>
      `,
    });

    await transport.sendMail({
      from: OWNER_EMAIL,
      to: OWNER_EMAIL,
      subject: `❌ DENIED Refund Request #${refundRequest.id} - LinksShrink.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #991b1b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0;">❌ Denied Refund Request #${refundRequest.id}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Auto-denied - customer was notified</p>
          </div>
          <p><strong>Denial reasons:</strong></p>
          <ul>${reasonsList}</ul>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.name || "Unknown"} (${refundRequest.email})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Transaction ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.transactionId || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Reason Given</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${refundRequest.reason}</td></tr>
          </table>
          <p style="margin-top: 16px; color: #666; font-size: 14px;">The customer has been notified via email. If you want to override and process the refund anyway, use your <a href="https://dashboard.stripe.com/payments">Stripe Dashboard</a>.</p>
        </div>
      `,
    });

    console.log(`[Email] Denied refund emails sent for request #${refundRequest.id}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send denied refund emails:", error?.message || error);
    return false;
  }
}
