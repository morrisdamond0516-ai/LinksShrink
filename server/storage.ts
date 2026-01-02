import { db } from "./db";
import { urls, type Url, type InsertUrl } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createUrl(insertUrl: InsertUrl): Promise<Url>;
  getUrl(shortCode: string): Promise<Url | undefined>;
  incrementVisit(shortCode: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  private generateCode(length: number): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
    }
    return result;
  }

  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    let shortCode = "";
    let isUnique = false;
    let length = 1;
    let attempts = 0;
    
    while (!isUnique) {
      shortCode = this.generateCode(length);
      const existing = await this.getUrl(shortCode);
      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        // If we collide too much at this length, increase it
        if (attempts > 5) {
          length++;
          attempts = 0;
        }
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
