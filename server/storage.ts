import { db } from "./db";
import { urls, urlAnalytics, usageCredits, processedLinkPacks, refundRequests, bioPages, bioPageProducts, teamWorkspaces, workspaceMembers, conversionEvents, featurePurchases, funnelEvents, videoAds, type Url, type InsertUrl, type UrlAnalytics, type InsertAnalytics, type UsageCredits, type RefundRequest, type InsertRefundRequest, type BioPage, type InsertBioPage, type BioPageProduct, type InsertBioProduct, type TeamWorkspace, type InsertWorkspace, type WorkspaceMember, type ConversionEvent, type FeaturePurchase, type FunnelEvent, type VideoAd, type InsertVideoAd } from "@shared/schema";
import { eq, desc, sql, and, gte, or } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  createUrl(insertUrl: InsertUrl, options?: PremiumUrlOptions): Promise<Url>;
  getUrl(shortCode: string): Promise<Url | undefined>;
  getUrlById(id: number): Promise<Url | undefined>;
  incrementVisit(shortCode: string): Promise<void>;
  getUserUrls(userId: string): Promise<Url[]>;
  updateUrl(id: number, updates: Partial<Url>): Promise<Url | undefined>;
  recordAnalytics(analytics: InsertAnalytics): Promise<void>;
  getUrlAnalytics(urlId: number, days?: number): Promise<UrlAnalyticsSummary>;
  verifyPassword(shortCode: string, password: string): Promise<boolean>;
  checkExpiry(shortCode: string): Promise<boolean>;
  getOrCreateUsage(userId?: string, anonToken?: string, ipHash?: string): Promise<UsageCredits>;
  getRemainingCredits(userId?: string, anonToken?: string, ipHash?: string): Promise<CreditInfo>;
  consumeCredit(userId?: string, anonToken?: string, ipHash?: string): Promise<boolean>;
  refundCredit(userId?: string, anonToken?: string, ipHash?: string): Promise<void>;
  grantPaidCredits(credits: number, userId?: string, anonToken?: string, ipHash?: string): Promise<void>;
  isLinkPackProcessed(sessionId: string): Promise<boolean>;
  markLinkPackProcessed(sessionId: string, credits: number, userId?: string, anonToken?: string, ipHash?: string): Promise<void>;
  createRefundRequest(request: InsertRefundRequest, status?: string): Promise<RefundRequest>;
  createBioPage(data: InsertBioPage): Promise<BioPage>;
  getBioPageBySlug(slug: string): Promise<BioPage | undefined>;
  getBioPageById(id: number): Promise<BioPage | undefined>;
  getUserBioPages(userId: string): Promise<BioPage[]>;
  updateBioPage(id: number, updates: Partial<BioPage>): Promise<BioPage | undefined>;
  deleteBioPage(id: number): Promise<void>;
  createBioProduct(data: InsertBioProduct): Promise<BioPageProduct>;
  getBioProducts(bioPageId: number): Promise<BioPageProduct[]>;
  updateBioProduct(id: number, updates: Partial<BioPageProduct>): Promise<BioPageProduct | undefined>;
  getBioProductById(id: number): Promise<BioPageProduct | undefined>;
  deleteBioProduct(id: number): Promise<void>;
  createWorkspace(data: InsertWorkspace): Promise<TeamWorkspace>;
  getUserWorkspaces(userId: string): Promise<TeamWorkspace[]>;
  addWorkspaceMember(workspaceId: number, userId: string, role?: string): Promise<WorkspaceMember>;
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  removeWorkspaceMember(workspaceId: number, userId: string): Promise<void>;
  recordConversion(urlId: number, type: string, revenue?: number, currency?: string, metadata?: any): Promise<ConversionEvent>;
  getConversions(urlId: number): Promise<ConversionEvent[]>;
  storeFeaturePurchase(sessionId: string, featureKey: string, userId?: string, ipHash?: string): Promise<FeaturePurchase>;
  getUserFeaturePurchases(userId?: string, ipHash?: string): Promise<FeaturePurchase[]>;
  hasFeatureAccess(featureKey: string, userId?: string, ipHash?: string): Promise<boolean>;
  consumeFeatureUse(featureKey: string, userId?: string, ipHash?: string): Promise<boolean>;
  recordFunnelEvent(event: { eventType: string; page?: string; metadata?: any; sessionId?: string; userId?: string; ipHash?: string; userAgent?: string; referrer?: string }): Promise<FunnelEvent>;
  getFunnelStats(days?: number): Promise<any>;
  createVideoAd(data: InsertVideoAd): Promise<VideoAd>;
  getVideoAd(id: number): Promise<VideoAd | undefined>;
  getVideoAdByHeygenId(heygenVideoId: string): Promise<VideoAd | undefined>;
  getUserVideoAds(userId: string): Promise<VideoAd[]>;
  updateVideoAd(id: number, updates: Partial<VideoAd>): Promise<VideoAd | undefined>;
}

export interface CreditInfo {
  freeRemaining: number;
  paidRemaining: number;
  totalRemaining: number;
  freeUsed: number;
  paidUsed: number;
  monthKey: string;
}

export interface PremiumUrlOptions {
  userId?: string;
  customSlug?: string;
  password?: string;
  expiresAt?: Date | string;
  qrColor?: string;
  isPremium?: boolean;
  retargetingPixels?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  geoRoutes?: any;
  abTestUrl?: string;
  abTestSplit?: number;
  maxClicks?: number;
  scheduledAt?: Date | string;
}

export interface UrlAnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; clicks: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  conversions?: { total: number; revenue: number };
}

export class DatabaseStorage implements IStorage {
  private base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  private numberToBase62(num: number): string {
    if (num === 0) return this.base62Chars[0];
    let result = "";
    while (num > 0) {
      result = this.base62Chars[num % 62] + result;
      num = Math.floor(num / 62);
    }
    return result;
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  async createUrl(insertUrl: InsertUrl, options: PremiumUrlOptions = {}): Promise<Url> {
    const { userId, customSlug, password, expiresAt, qrColor, isPremium, retargetingPixels, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, geoRoutes, abTestUrl, abTestSplit, maxClicks, scheduledAt } = options;

    const hashedPassword = password ? this.hashPassword(password) : null;
    
    const extraFields = {
      retargetingPixels: retargetingPixels || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmTerm: utmTerm || null,
      utmContent: utmContent || null,
      geoRoutes: geoRoutes || null,
      abTestUrl: abTestUrl || null,
      abTestSplit: abTestSplit || null,
      maxClicks: maxClicks || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    };

    if (customSlug) {
      const existing = await this.getUrl(customSlug);
      if (existing) {
        throw new Error("Custom slug already exists");
      }
      
      const [url] = await db
        .insert(urls)
        .values({ 
          ...insertUrl, 
          shortCode: customSlug,
          customSlug: customSlug,
          userId: userId || null,
          password: hashedPassword,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          qrColor: qrColor || "#000000",
          isPremium: isPremium || false,
          ...extraFields,
        })
        .returning();
      return url;
    }

    const url = await db.transaction(async (tx) => {
      const tempCode = `_tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      const [insertedUrl] = await tx
        .insert(urls)
        .values({ 
          ...insertUrl, 
          shortCode: tempCode,
          customSlug: null,
          userId: userId || null,
          password: hashedPassword,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          qrColor: qrColor || "#000000",
          isPremium: isPremium || false,
          ...extraFields,
        })
        .returning();
      
      const shortCode = this.numberToBase62(insertedUrl.id);
      
      const [updatedUrl] = await tx
        .update(urls)
        .set({ shortCode })
        .where(eq(urls.id, insertedUrl.id))
        .returning();
      
      return updatedUrl;
    });
    
    return url;
  }

  async getUrl(shortCode: string): Promise<Url | undefined> {
    const [url] = await db.select().from(urls).where(eq(urls.shortCode, shortCode));
    return url;
  }

  async getUrlById(id: number): Promise<Url | undefined> {
    const [url] = await db.select().from(urls).where(eq(urls.id, id));
    return url;
  }

  async getUserUrls(userId: string): Promise<Url[]> {
    return await db.select().from(urls).where(eq(urls.userId, userId)).orderBy(desc(urls.createdAt));
  }

  async updateUrl(id: number, updates: Partial<Url>): Promise<Url | undefined> {
    if (updates.password) {
      updates.password = this.hashPassword(updates.password);
    }
    const [url] = await db.update(urls).set(updates).where(eq(urls.id, id)).returning();
    return url;
  }

  async incrementVisit(shortCode: string): Promise<void> {
    const url = await this.getUrl(shortCode);
    if (url) {
      await db.update(urls)
        .set({ visitCount: (url.visitCount || 0) + 1 })
        .where(eq(urls.shortCode, shortCode));
    }
  }

  async verifyPassword(shortCode: string, password: string): Promise<boolean> {
    const url = await this.getUrl(shortCode);
    if (!url || !url.password) return true;
    return url.password === this.hashPassword(password);
  }

  async checkExpiry(shortCode: string): Promise<boolean> {
    const url = await this.getUrl(shortCode);
    if (!url) return false;
    if (!url.expiresAt) return true;
    return new Date(url.expiresAt) > new Date();
  }

  async recordAnalytics(analytics: InsertAnalytics): Promise<void> {
    await db.insert(urlAnalytics).values(analytics);
  }

  async getUrlAnalytics(urlId: number, days: number = 30): Promise<UrlAnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const allClicks = await db
      .select()
      .from(urlAnalytics)
      .where(and(
        eq(urlAnalytics.urlId, urlId),
        gte(urlAnalytics.clickedAt, startDate)
      ));

    const uniqueIps = new Set(allClicks.map(c => c.ipHash).filter(Boolean));

    const clicksByDay: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};

    for (const click of allClicks) {
      const date = click.clickedAt?.toISOString().split("T")[0] || "Unknown";
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;

      const referrer = click.referrer || "Direct";
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

      const country = click.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const device = click.device || "Unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      const browser = click.browser || "Unknown";
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    }

    const allConversions = await db.select().from(conversionEvents).where(eq(conversionEvents.urlId, urlId));
    const conversionRevenue = allConversions.reduce((sum, c) => sum + (c.revenue || 0), 0);

    return {
      totalClicks: allClicks.length,
      uniqueVisitors: uniqueIps.size,
      clicksByDay: Object.entries(clicksByDay)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topReferrers: Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topCountries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      deviceBreakdown: Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      browserBreakdown: Object.entries(browserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count),
      conversions: {
        total: allConversions.length,
        revenue: conversionRevenue,
      },
    };
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getOrCreateUsage(userId?: string, anonToken?: string, ipHash?: string): Promise<UsageCredits> {
    const monthKey = this.getCurrentMonthKey();
    
    let conditions = [];
    if (userId) {
      conditions.push(eq(usageCredits.userId, userId));
    } else if (anonToken) {
      conditions.push(eq(usageCredits.anonToken, anonToken));
    } else if (ipHash) {
      conditions.push(eq(usageCredits.ipHash, ipHash));
    }

    if (conditions.length === 0) {
      throw new Error("Must provide userId, anonToken, or ipHash");
    }

    const [existing] = await db.select().from(usageCredits)
      .where(and(conditions[0], eq(usageCredits.monthKey, monthKey)));

    if (existing) {
      return existing;
    }

    let previousPaidCredits = 0;
    let previousPaidUsed = 0;
    
    if (userId || anonToken || ipHash) {
      const [previous] = await db.select().from(usageCredits)
        .where(conditions[0])
        .orderBy(desc(usageCredits.createdAt))
        .limit(1);
      
      if (previous) {
        previousPaidCredits = previous.paidCredits || 0;
        previousPaidUsed = previous.paidUsed || 0;
      }
    }

    const [newUsage] = await db.insert(usageCredits).values({
      userId: userId || null,
      anonToken: anonToken || null,
      ipHash: ipHash || null,
      monthKey,
      freeUsed: 0,
      paidCredits: previousPaidCredits,
      paidUsed: previousPaidUsed,
    }).returning();

    return newUsage;
  }

  async getRemainingCredits(userId?: string, anonToken?: string, ipHash?: string): Promise<CreditInfo> {
    const FREE_LIMIT = 5;
    const usage = await this.getOrCreateUsage(userId, anonToken, ipHash);
    
    const freeUsed = usage.freeUsed || 0;
    const paidCredits = usage.paidCredits || 0;
    const paidUsed = usage.paidUsed || 0;
    
    const freeRemaining = Math.max(0, FREE_LIMIT - freeUsed);
    const paidRemaining = Math.max(0, paidCredits - paidUsed);
    
    return {
      freeRemaining,
      paidRemaining,
      totalRemaining: freeRemaining + paidRemaining,
      freeUsed,
      paidUsed,
      monthKey: usage.monthKey,
    };
  }

  async consumeCredit(userId?: string, anonToken?: string, ipHash?: string): Promise<boolean> {
    const FREE_LIMIT = 5;
    const usage = await this.getOrCreateUsage(userId, anonToken, ipHash);
    
    const freeUsed = usage.freeUsed || 0;
    const paidCredits = usage.paidCredits || 0;
    const paidUsed = usage.paidUsed || 0;
    
    if (freeUsed < FREE_LIMIT) {
      await db.update(usageCredits)
        .set({ freeUsed: freeUsed + 1, updatedAt: new Date() })
        .where(eq(usageCredits.id, usage.id));
      return true;
    }
    
    if (paidUsed < paidCredits) {
      await db.update(usageCredits)
        .set({ paidUsed: paidUsed + 1, updatedAt: new Date() })
        .where(eq(usageCredits.id, usage.id));
      return true;
    }
    
    return false;
  }

  async grantPaidCredits(credits: number, userId?: string, anonToken?: string, ipHash?: string): Promise<void> {
    const usage = await this.getOrCreateUsage(userId, anonToken, ipHash);
    const currentPaid = usage.paidCredits || 0;
    
    await db.update(usageCredits)
      .set({ paidCredits: currentPaid + credits, updatedAt: new Date() })
      .where(eq(usageCredits.id, usage.id));
  }

  async refundCredit(userId?: string, anonToken?: string, ipHash?: string): Promise<void> {
    const FREE_LIMIT = 5;
    const usage = await this.getOrCreateUsage(userId, anonToken, ipHash);
    
    const paidUsed = usage.paidUsed || 0;
    const freeUsed = usage.freeUsed || 0;
    
    if (paidUsed > 0) {
      await db.update(usageCredits)
        .set({ paidUsed: paidUsed - 1, updatedAt: new Date() })
        .where(eq(usageCredits.id, usage.id));
      return;
    }
    
    if (freeUsed > 0) {
      await db.update(usageCredits)
        .set({ freeUsed: freeUsed - 1, updatedAt: new Date() })
        .where(eq(usageCredits.id, usage.id));
    }
  }

  async isLinkPackProcessed(sessionId: string): Promise<boolean> {
    const [existing] = await db.select()
      .from(processedLinkPacks)
      .where(eq(processedLinkPacks.sessionId, sessionId));
    return !!existing;
  }

  async markLinkPackProcessed(sessionId: string, credits: number, userId?: string, anonToken?: string, ipHash?: string): Promise<void> {
    await db.insert(processedLinkPacks).values({
      sessionId,
      credits,
      userId: userId || null,
      anonToken: anonToken || null,
      ipHash: ipHash || null,
    });
  }

  async createRefundRequest(request: InsertRefundRequest, status?: string): Promise<RefundRequest> {
    const [refund] = await db.insert(refundRequests).values({
      ...request,
      ...(status ? { status } : {}),
    }).returning();
    return refund;
  }

  async createBioPage(data: InsertBioPage): Promise<BioPage> {
    const [page] = await db.insert(bioPages).values(data).returning();
    return page;
  }

  async getBioPageBySlug(slug: string): Promise<BioPage | undefined> {
    const [page] = await db.select().from(bioPages).where(eq(bioPages.slug, slug));
    return page;
  }

  async getBioPageById(id: number): Promise<BioPage | undefined> {
    const [page] = await db.select().from(bioPages).where(eq(bioPages.id, id));
    return page;
  }

  async getUserBioPages(userId: string): Promise<BioPage[]> {
    return await db.select().from(bioPages).where(eq(bioPages.userId, userId)).orderBy(desc(bioPages.createdAt));
  }

  async updateBioPage(id: number, updates: Partial<BioPage>): Promise<BioPage | undefined> {
    const [page] = await db.update(bioPages).set({ ...updates, updatedAt: new Date() }).where(eq(bioPages.id, id)).returning();
    return page;
  }

  async deleteBioPage(id: number): Promise<void> {
    await db.delete(bioPageProducts).where(eq(bioPageProducts.bioPageId, id));
    await db.delete(bioPages).where(eq(bioPages.id, id));
  }

  async createBioProduct(data: InsertBioProduct): Promise<BioPageProduct> {
    const [product] = await db.insert(bioPageProducts).values(data).returning();
    return product;
  }

  async getBioProducts(bioPageId: number): Promise<BioPageProduct[]> {
    return await db.select().from(bioPageProducts).where(eq(bioPageProducts.bioPageId, bioPageId));
  }

  async updateBioProduct(id: number, updates: Partial<BioPageProduct>): Promise<BioPageProduct | undefined> {
    const [product] = await db.update(bioPageProducts).set(updates).where(eq(bioPageProducts.id, id)).returning();
    return product;
  }

  async getBioProductById(id: number): Promise<BioPageProduct | undefined> {
    const [product] = await db.select().from(bioPageProducts).where(eq(bioPageProducts.id, id));
    return product;
  }

  async deleteBioProduct(id: number): Promise<void> {
    await db.delete(bioPageProducts).where(eq(bioPageProducts.id, id));
  }

  async createWorkspace(data: InsertWorkspace): Promise<TeamWorkspace> {
    const [workspace] = await db.insert(teamWorkspaces).values(data).returning();
    await db.insert(workspaceMembers).values({ workspaceId: workspace.id, userId: data.ownerId, role: "owner" });
    return workspace;
  }

  async getUserWorkspaces(userId: string): Promise<TeamWorkspace[]> {
    const memberships = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, userId));
    if (memberships.length === 0) return [];
    const workspaceIds = memberships.map(m => m.workspaceId);
    const result: TeamWorkspace[] = [];
    for (const wid of workspaceIds) {
      const [ws] = await db.select().from(teamWorkspaces).where(eq(teamWorkspaces.id, wid));
      if (ws) result.push(ws);
    }
    return result;
  }

  async addWorkspaceMember(workspaceId: number, userId: string, role: string = "member"): Promise<WorkspaceMember> {
    const [member] = await db.insert(workspaceMembers).values({ workspaceId, userId, role }).returning();
    return member;
  }

  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async removeWorkspaceMember(workspaceId: number, userId: string): Promise<void> {
    await db.delete(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
  }

  async recordConversion(urlId: number, type: string, revenue?: number, currency?: string, metadata?: any): Promise<ConversionEvent> {
    const [event] = await db.insert(conversionEvents).values({
      urlId,
      type,
      revenue: revenue || null,
      currency: currency || "usd",
      metadata: metadata || null,
    }).returning();
    return event;
  }

  async getConversions(urlId: number): Promise<ConversionEvent[]> {
    return await db.select().from(conversionEvents).where(eq(conversionEvents.urlId, urlId)).orderBy(desc(conversionEvents.createdAt));
  }

  async storeFeaturePurchase(sessionId: string, featureKey: string, userId?: string, ipHash?: string): Promise<FeaturePurchase> {
    const existing = await db.select().from(featurePurchases).where(eq(featurePurchases.sessionId, sessionId));
    if (existing.length > 0) return existing[0];

    const [purchase] = await db.insert(featurePurchases).values({
      sessionId,
      featureKey,
      userId: userId || null,
      ipHash: ipHash || null,
      usesRemaining: 1,
    }).returning();
    return purchase;
  }

  async getUserFeaturePurchases(userId?: string, ipHash?: string): Promise<FeaturePurchase[]> {
    if (userId) {
      return await db.select().from(featurePurchases)
        .where(and(eq(featurePurchases.userId, userId), sql`${featurePurchases.usesRemaining} > 0`))
        .orderBy(desc(featurePurchases.purchasedAt));
    }
    if (ipHash) {
      return await db.select().from(featurePurchases)
        .where(and(eq(featurePurchases.ipHash, ipHash), sql`${featurePurchases.usesRemaining} > 0`))
        .orderBy(desc(featurePurchases.purchasedAt));
    }
    return [];
  }

  async hasFeatureAccess(featureKey: string, userId?: string, ipHash?: string): Promise<boolean> {
    const baseConditions = [eq(featurePurchases.featureKey, featureKey), sql`${featurePurchases.usesRemaining} > 0`];

    if (userId && ipHash) {
      const results = await db.select().from(featurePurchases)
        .where(and(...baseConditions, or(eq(featurePurchases.userId, userId), eq(featurePurchases.ipHash, ipHash))))
        .limit(1);
      return results.length > 0;
    } else if (userId) {
      const results = await db.select().from(featurePurchases)
        .where(and(...baseConditions, eq(featurePurchases.userId, userId)))
        .limit(1);
      return results.length > 0;
    } else if (ipHash) {
      const results = await db.select().from(featurePurchases)
        .where(and(...baseConditions, eq(featurePurchases.ipHash, ipHash)))
        .limit(1);
      return results.length > 0;
    }
    return false;
  }

  async consumeFeatureUse(featureKey: string, userId?: string, ipHash?: string): Promise<boolean> {
    const baseConditions = [eq(featurePurchases.featureKey, featureKey), sql`${featurePurchases.usesRemaining} > 0`];
    let identityCondition;

    if (userId && ipHash) {
      identityCondition = or(eq(featurePurchases.userId, userId), eq(featurePurchases.ipHash, ipHash));
    } else if (userId) {
      identityCondition = eq(featurePurchases.userId, userId);
    } else if (ipHash) {
      identityCondition = eq(featurePurchases.ipHash, ipHash);
    } else {
      return false;
    }

    const results = await db.select().from(featurePurchases).where(and(...baseConditions, identityCondition)).limit(1);
    if (results.length === 0) return false;

    await db.update(featurePurchases)
      .set({ usesRemaining: sql`${featurePurchases.usesRemaining} - 1` })
      .where(eq(featurePurchases.id, results[0].id));
    return true;
  }

  async recordFunnelEvent(event: { eventType: string; page?: string; metadata?: any; sessionId?: string; userId?: string; ipHash?: string; userAgent?: string; referrer?: string }): Promise<FunnelEvent> {
    const [result] = await db.insert(funnelEvents).values({
      eventType: event.eventType,
      page: event.page || null,
      metadata: event.metadata || null,
      sessionId: event.sessionId || null,
      userId: event.userId || null,
      ipHash: event.ipHash || null,
      userAgent: event.userAgent || null,
      referrer: event.referrer || null,
    }).returning();
    return result;
  }

  async getFunnelStats(days: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await db.select({
      eventType: funnelEvents.eventType,
      page: funnelEvents.page,
      count: sql<number>`count(*)::int`,
      uniqueSessions: sql<number>`count(distinct ${funnelEvents.sessionId})::int`,
    })
    .from(funnelEvents)
    .where(gte(funnelEvents.createdAt, since))
    .groupBy(funnelEvents.eventType, funnelEvents.page);

    const dailyEvents = await db.select({
      date: sql<string>`to_char(${funnelEvents.createdAt}, 'YYYY-MM-DD')`,
      eventType: funnelEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(funnelEvents)
    .where(gte(funnelEvents.createdAt, since))
    .groupBy(sql`to_char(${funnelEvents.createdAt}, 'YYYY-MM-DD')`, funnelEvents.eventType)
    .orderBy(sql`to_char(${funnelEvents.createdAt}, 'YYYY-MM-DD')`);

    const recentEvents = await db.select()
    .from(funnelEvents)
    .orderBy(desc(funnelEvents.createdAt))
    .limit(50);

    const topReferrers = await db.select({
      referrer: funnelEvents.referrer,
      count: sql<number>`count(*)::int`,
    })
    .from(funnelEvents)
    .where(and(
      gte(funnelEvents.createdAt, since),
      sql`${funnelEvents.referrer} IS NOT NULL AND ${funnelEvents.referrer} != ''`
    ))
    .groupBy(funnelEvents.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

    return { events, dailyEvents, recentEvents, topReferrers };
  }

  async createVideoAd(data: InsertVideoAd): Promise<VideoAd> {
    const [ad] = await db.insert(videoAds).values(data).returning();
    return ad;
  }

  async getVideoAd(id: number): Promise<VideoAd | undefined> {
    const [ad] = await db.select().from(videoAds).where(eq(videoAds.id, id));
    return ad;
  }

  async getVideoAdByHeygenId(heygenVideoId: string): Promise<VideoAd | undefined> {
    const [ad] = await db.select().from(videoAds).where(eq(videoAds.heygenVideoId, heygenVideoId));
    return ad;
  }

  async getUserVideoAds(userId: string): Promise<VideoAd[]> {
    return db.select().from(videoAds).where(eq(videoAds.userId, userId)).orderBy(desc(videoAds.createdAt));
  }

  async updateVideoAd(id: number, updates: Partial<VideoAd>): Promise<VideoAd | undefined> {
    const [ad] = await db.update(videoAds).set(updates).where(eq(videoAds.id, id)).returning();
    return ad;
  }
}

export const storage = new DatabaseStorage();
