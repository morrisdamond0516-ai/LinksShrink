import { db } from "./db";
import { urls, type Url, type InsertUrl } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  createUrl(insertUrl: InsertUrl): Promise<Url>;
  getUrl(shortCode: string): Promise<Url | undefined>;
  incrementVisit(shortCode: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    // Generate a unique short code
    // Try a few times to ensure uniqueness, though collision is rare with 6 chars (base64ish or hex)
    // We'll use 6 hex chars for simplicity = 16^6 = 16M combinations. Enough for this demo.
    let shortCode = "";
    let isUnique = false;
    
    while (!isUnique) {
      // Use 4 hex chars = 16^4 = 65,536 combinations. 
      // This results in a very short URL: domain.com/abcd (4 chars)
      shortCode = randomBytes(2).toString("hex");
      const existing = await this.getUrl(shortCode);
      if (!existing) {
        isUnique = true;
      }
    }

    const [url] = await db
      .insert(urls)
      .values({ ...insertUrl, shortCode })
      .returning();
    return url;
  }

  async getUrl(shortCode: string): Promise<Url | undefined> {
    const [url] = await db.select().from(urls).where(eq(urls.shortCode, shortCode));
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
}

export const storage = new DatabaseStorage();
