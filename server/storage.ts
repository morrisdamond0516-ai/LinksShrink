import { db } from "./db";
import { urls, urlAnalytics, type Url, type InsertUrl, type UrlAnalytics, type InsertAnalytics } from "@shared/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
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
}

export interface PremiumUrlOptions {
  userId?: string;
  customSlug?: string;
  password?: string;
  expiresAt?: Date | string;
  qrColor?: string;
  isPremium?: boolean;
  shorterCode?: boolean;
}

export interface UrlAnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; clicks: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
}

export class DatabaseStorage implements IStorage {
  private chars = "23456789bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ";

  private generateCode(length: number): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
    }
    return result;
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  async createUrl(insertUrl: InsertUrl, options: PremiumUrlOptions = {}): Promise<Url> {
    const { userId, customSlug, password, expiresAt, qrColor, isPremium, shorterCode } = options;

    let shortCode = "";
    
    if (customSlug) {
      const existing = await this.getUrl(customSlug);
      if (existing) {
        throw new Error("Custom slug already exists");
      }
      shortCode = customSlug;
    } else {
      let isUnique = false;
      let length = shorterCode ? 2 : 4;
      let attempts = 0;
      
      while (!isUnique) {
        shortCode = this.generateCode(length);
        const existing = await this.getUrl(shortCode);
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
          if (attempts > 5) {
            length = Math.min(length + 1, shorterCode ? 4 : 6);
            attempts = 0;
          }
        }
      }
    }

    const hashedPassword = password ? this.hashPassword(password) : null;

    const [url] = await db
      .insert(urls)
      .values({ 
        ...insertUrl, 
        shortCode,
        customSlug: customSlug || null,
        userId: userId || null,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        qrColor: qrColor || "#000000",
        isPremium: isPremium || false,
      })
      .returning();
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
    };
  }
}

export const storage = new DatabaseStorage();
