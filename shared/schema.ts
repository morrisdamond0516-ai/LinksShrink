import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  visitCount: integer("visit_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const entitlements = pgTable("entitlements", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  plan: text("plan").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  verifiedAt: timestamp("verified_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
});

export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type Entitlement = typeof entitlements.$inferSelect;
