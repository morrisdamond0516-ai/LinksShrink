import { getUncachableStripeClient } from "./stripeClient";
import { db } from "./db";
import { entitlements, processedLinkPacks, usageCredits } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { RefundCheckResult } from "./emailService";

const REFUND_WINDOW_DAYS = 7;

export async function checkRefundEligibility(
  email: string,
  transactionId?: string | null
): Promise<RefundCheckResult> {
  const reasons: string[] = [];

  if (!transactionId) {
    return {
      qualified: false,
      reasons: ["No transaction or session ID was provided. We need this to locate your purchase. You can find it in your email receipt from Stripe."],
    };
  }

  try {
    const stripe = await getUncachableStripeClient();

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(transactionId);
    } catch (err: any) {
      if (transactionId.startsWith("pi_")) {
        try {
          const pi = await stripe.paymentIntents.retrieve(transactionId, {
            expand: ["latest_charge"],
          });
          const purchaseDate = new Date(pi.created * 1000);
          const daysSince = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

          const charge = pi.latest_charge as any;
          const piEmail = charge?.billing_details?.email || charge?.receipt_email || pi.receipt_email;
          if (piEmail && piEmail.toLowerCase() !== email.toLowerCase()) {
            reasons.push("The email address you provided does not match the email on file for this transaction.");
          }

          if (daysSince > REFUND_WINDOW_DAYS) {
            reasons.push(`Your purchase was made ${daysSince} days ago. Our refund policy covers purchases within ${REFUND_WINDOW_DAYS} days.`);
          }

          if (pi.status !== "succeeded") {
            reasons.push("This payment was not completed successfully.");
          }

          if (reasons.length > 0) {
            return { qualified: false, reasons, purchaseDate, daysSincePurchase: daysSince };
          }

          return {
            qualified: true,
            reasons: [],
            purchaseDate,
            daysSincePurchase: daysSince,
            plan: "Payment",
          };
        } catch {
          return {
            qualified: false,
            reasons: ["We could not find a transaction matching this ID. Please double-check the ID from your email receipt."],
          };
        }
      }

      return {
        qualified: false,
        reasons: ["We could not find a transaction matching this ID. Please double-check the ID from your email receipt."],
      };
    }

    const purchaseDate = new Date(session.created * 1000);
    const daysSince = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    const customerEmail = session.customer_details?.email || session.customer_email;

    if (customerEmail && customerEmail.toLowerCase() !== email.toLowerCase()) {
      reasons.push("The email address you provided does not match the email on file for this transaction.");
    }

    if (daysSince > REFUND_WINDOW_DAYS) {
      reasons.push(`Your purchase was made ${daysSince} days ago. Our refund policy covers purchases within ${REFUND_WINDOW_DAYS} days.`);
    }

    if (session.payment_status !== "paid") {
      reasons.push("This session does not have a completed payment.");
    }

    const isLinkPack = session.metadata?.purchaseType === "link_pack";

    if (isLinkPack) {
      const [linkPack] = await db
        .select()
        .from(processedLinkPacks)
        .where(eq(processedLinkPacks.sessionId, transactionId));

      if (linkPack) {
        const creditRecords = await db
          .select()
          .from(usageCredits)
          .where(
            linkPack.userId
              ? eq(usageCredits.userId, linkPack.userId)
              : linkPack.ipHash
                ? eq(usageCredits.ipHash, linkPack.ipHash)
                : eq(usageCredits.anonToken, linkPack.anonToken || "")
          );

        const totalPaidUsed = creditRecords.reduce((sum, r) => sum + (r.paidUsed || 0), 0);
        if (totalPaidUsed > 0) {
          reasons.push(`${totalPaidUsed} of your purchased link credits have already been used. Refunds are only available for unused link packs.`);
        }
      }
    }

    if (reasons.length > 0) {
      return {
        qualified: false,
        reasons,
        purchaseDate,
        plan: isLinkPack ? "Link Pack ($20/20 credits)" : (session.metadata?.plan || "Premium Plan"),
        daysSincePurchase: daysSince,
        creditsUsed: isLinkPack ? reasons.some(r => r.includes("credits have already been used")) : undefined,
      };
    }

    return {
      qualified: true,
      reasons: [],
      purchaseDate,
      plan: isLinkPack ? "Link Pack ($20/20 credits)" : (session.metadata?.plan || "Premium Plan"),
      daysSincePurchase: daysSince,
      creditsUsed: false,
    };

  } catch (error: any) {
    console.error("[RefundChecker] Error checking eligibility:", error?.message || error);
    return {
      qualified: false,
      reasons: ["We encountered an error verifying your transaction. Please email us at ProductionLinks@yahoo.com for assistance."],
    };
  }
}
