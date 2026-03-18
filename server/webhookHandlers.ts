import { getUncachableStripeClient } from './stripeClient';
import { storeEntitlement } from './entitlements';
import { DatabaseStorage } from './storage';
import crypto from 'crypto';

const storage = new DatabaseStorage();

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook signatures');
    }

    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    console.log(`Webhook verified OK: ${event.type} (${event.id})`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      if (session.payment_status !== 'paid') {
        console.log(`Webhook: session ${session.id} not yet paid, skipping`);
        return;
      }

      const purchaseType = session.metadata?.purchaseType;
      const sessionId = session.id;

      try {
        const alreadyProcessed = await storage.isLinkPackProcessed(sessionId);
        if (alreadyProcessed) {
          console.log(`Webhook: session ${sessionId} already processed, skipping`);
          return;
        }

        if (purchaseType === 'link_pack') {
          const credits = parseInt(session.metadata?.credits || '20');
          const userId = session.metadata?.userId || undefined;
          const anonToken = session.metadata?.anonToken || undefined;
          const ipHash = session.metadata?.ipHash || undefined;

          await storage.grantPaidCredits(credits, userId, anonToken, ipHash);
          await storage.markLinkPackProcessed(sessionId, credits, userId, anonToken, ipHash);
          console.log(`Webhook: granted ${credits} link credits for session ${sessionId}`);
        } else if (purchaseType === 'individual_feature') {
          const featureKey = session.metadata?.featureKey || '';
          const userId = session.metadata?.userId || undefined;
          const ipHash = session.metadata?.ipHash || '';

          await storage.markLinkPackProcessed(sessionId, 0, userId, '', ipHash);
          await storage.storeFeaturePurchase(sessionId, featureKey, userId, ipHash);
          console.log(`Webhook: stored feature purchase '${featureKey}' for session ${sessionId}`);
        } else {
          const plan = session.metadata?.plan || 'Premium';
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.toString();
          const userId = session.metadata?.userId;

          await storeEntitlement(sessionId, plan, customerId, userId);
          console.log(`Webhook: stored ${plan} entitlement for session ${sessionId}`);
        }
        await storage.recordFunnelEvent({
          eventType: "checkout_completed",
          page: "/webhook",
          metadata: { purchaseType, plan: session.metadata?.plan, featureKey: session.metadata?.featureKey, amount: session.amount_total },
          sessionId,
          userId: session.metadata?.userId,
          ipHash: session.metadata?.ipHash,
        });
      } catch (err: any) {
        console.error(`Webhook processing error for session ${sessionId}:`, err.message);
      }
    }
  }
}
