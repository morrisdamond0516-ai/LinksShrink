import { db } from "./db";
import { entitlements } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function storeEntitlement(sessionId: string, plan: string, customerId?: string, userId?: string) {
  try {
    const existing = await db.select().from(entitlements).where(eq(entitlements.sessionId, sessionId));
    
    if (existing.length > 0) {
      // Update userId if provided and not already set
      if (userId && !existing[0].userId) {
        await db.update(entitlements)
          .set({ userId })
          .where(eq(entitlements.sessionId, sessionId));
      }
      return existing[0];
    }
    
    const [result] = await db.insert(entitlements).values({
      sessionId,
      plan,
      stripeCustomerId: customerId || null,
      userId: userId || null,
      verifiedAt: new Date(),
    }).returning();
    
    return result;
  } catch (err) {
    console.error("Failed to store entitlement:", err);
    throw err;
  }
}

export async function getEntitlement(sessionId: string) {
  try {
    const [result] = await db.select().from(entitlements).where(eq(entitlements.sessionId, sessionId));
    return result || null;
  } catch (err) {
    console.error("Failed to get entitlement:", err);
    return null;
  }
}

export async function getEntitlementByUserId(userId: string) {
  try {
    const [result] = await db.select().from(entitlements).where(eq(entitlements.userId, userId));
    return result || null;
  } catch (err) {
    console.error("Failed to get entitlement by userId:", err);
    return null;
  }
}

export async function hasValidEntitlement(sessionId: string): Promise<boolean> {
  const entitlement = await getEntitlement(sessionId);
  if (!entitlement) return false;
  
  if (entitlement.expiresAt && new Date(entitlement.expiresAt) < new Date()) {
    return false;
  }
  
  return true;
}

export async function hasValidEntitlementByUserId(userId: string): Promise<boolean> {
  const entitlement = await getEntitlementByUserId(userId);
  if (!entitlement) return false;
  
  if (entitlement.expiresAt && new Date(entitlement.expiresAt) < new Date()) {
    return false;
  }
  
  return true;
}
