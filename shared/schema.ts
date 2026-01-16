import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  customSlug: text("custom_slug"),
  visitCount: integer("visit_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  userId: text("user_id"),
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  isExpired: boolean("is_expired").default(false),
  qrColor: text("qr_color").default("#000000"),
  isPremium: boolean("is_premium").default(false),
});

export const urlAnalytics = pgTable("url_analytics", {
  id: serial("id").primaryKey(),
  urlId: integer("url_id").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ipHash: text("ip_hash"),
});

export const entitlements = pgTable("entitlements", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id").notNull().unique(),
  plan: text("plan").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  verifiedAt: timestamp("verified_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
});

export const insertPremiumUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
  customSlug: true,
  password: true,
  expiresAt: true,
  qrColor: true,
});

export const insertAnalyticsSchema = createInsertSchema(urlAnalytics).omit({
  id: true,
  clickedAt: true,
});

export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type InsertPremiumUrl = z.infer<typeof insertPremiumUrlSchema>;
export type UrlAnalytics = typeof urlAnalytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Entitlement = typeof entitlements.$inferSelect;
