import { Resend } from "resend";

const OWNER_EMAIL = "ProductionLinks@yahoo.com";
const FROM_EMAIL = "no-reply@linksshrink.com";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found");
  }

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return { apiKey: connectionSettings.settings.api_key };
}

async function getResendClient() {
  const { apiKey } = await getCredentials();
  return new Resend(apiKey);
}

export interface RefundCheckResult {
  qualified: boolean;
  reasons: string[];
  purchaseDate?: Date;
  plan?: string;
  daysSincePurchase?: number;
  creditsUsed?: boolean;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: `LinksShrink.com <${FROM_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - LinksShrink.com",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0f0f0f; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #a3e635; margin: 0;">LinksShrink.com</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0;">Password Reset Request</p>
          </div>
          <p>Hi there,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #a3e635; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #a3e635; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">LinksShrink.com — Shorten, Track, Grow</p>
        </div>
      `,
    });
    console.log(`[Email] Password reset email sent to ${email} via Resend`);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send password reset email:", error?.message || error);
    return false;
  }
}

export async function sendRefundQualifiedEmail(refundRequest: {
  id: number;
  email: string;
  name?: string | null;
  reason: string;
  transactionId?: string | null;
}, checkResult: RefundCheckResult): Promise<boolean> {
  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: `LinksShrink.com <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `QUALIFIED Refund Request #${refundRequest.id} - LinksShrink.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #166534; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0;">Qualified Refund Request #${refundRequest.id}</h1>
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
  const reasonsList = checkResult.reasons.map(r => `<li style="margin-bottom: 6px;">${r}</li>`).join("");

  try {
    const resend = await getResendClient();

    await resend.emails.send({
      from: `LinksShrink.com <${FROM_EMAIL}>`,
      to: refundRequest.email,
      subject: "Refund Request Update - LinksShrink.com",
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

    await resend.emails.send({
      from: `LinksShrink.com <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `DENIED Refund Request #${refundRequest.id} - LinksShrink.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #991b1b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0;">Denied Refund Request #${refundRequest.id}</h1>
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

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: `LinksShrink.com <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      replyTo: data.email,
      subject: `[Contact Form] ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #84cc16; color: black; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0;">New Contact Form Message</h1>
            <p style="margin: 5px 0 0 0;">From: ${data.name} (${data.email})</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Subject</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.subject}</td></tr>
          </table>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #84cc16;">
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
          <p style="margin-top: 16px; color: #666; font-size: 14px;">Reply directly to this email to respond to ${data.name}.</p>
        </div>
      `,
    });
    console.log(`[Email] Contact form message sent from ${data.email}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send contact email:", error?.message || error);
    return false;
  }
}
