import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  retargetingPixels: text("retargeting_pixels"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  geoRoutes: jsonb("geo_routes"),
  abTestUrl: text("ab_test_url"),
  abTestSplit: integer("ab_test_split"),
  maxClicks: integer("max_clicks"),
  scheduledAt: timestamp("scheduled_at"),
  deactivatedAt: timestamp("deactivated_at"),
  iosDeepLink: text("ios_deep_link"),
  androidDeepLink: text("android_deep_link"),
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

export const usageCredits = pgTable("usage_credits", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  anonToken: text("anon_token"),
  ipHash: text("ip_hash"),
  monthKey: text("month_key").notNull(),
  freeUsed: integer("free_used").default(0),
  paidCredits: integer("paid_credits").default(0),
  paidUsed: integer("paid_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const processedLinkPacks = pgTable("processed_link_packs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  credits: integer("credits").notNull(),
  userId: text("user_id"),
  anonToken: text("anon_token"),
  ipHash: text("ip_hash"),
  processedAt: timestamp("processed_at").defaultNow(),
});

export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  reason: text("reason").notNull(),
  transactionId: text("transaction_id"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bioPages = pgTable("bio_pages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  theme: text("theme").default("default"),
  avatarUrl: text("avatar_url"),
  links: jsonb("links").default([]),
  socialLinks: jsonb("social_links").default({}),
  shopEnabled: boolean("shop_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bioPageProducts = pgTable("bio_page_products", {
  id: serial("id").primaryKey(),
  bioPageId: integer("bio_page_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  fileUrl: text("file_url"),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamWorkspaces = pgTable("team_workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const conversionEvents = pgTable("conversion_events", {
  id: serial("id").primaryKey(),
  urlId: integer("url_id").notNull(),
  type: text("type").notNull(),
  revenue: integer("revenue"),
  currency: text("currency").default("usd"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const featurePurchases = pgTable("feature_purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  ipHash: text("ip_hash"),
  featureKey: text("feature_key").notNull(),
  sessionId: text("session_id").notNull().unique(),
  usesRemaining: integer("uses_remaining").default(1),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertRefundRequestSchema = createInsertSchema(refundRequests).pick({
  email: true,
  name: true,
  reason: true,
  transactionId: true,
});

export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;

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

export const insertBioPageSchema = createInsertSchema(bioPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBioProductSchema = createInsertSchema(bioPageProducts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkspaceSchema = createInsertSchema(teamWorkspaces).omit({
  id: true,
  createdAt: true,
});

export type Url = typeof urls.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type InsertPremiumUrl = z.infer<typeof insertPremiumUrlSchema>;
export type UrlAnalytics = typeof urlAnalytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Entitlement = typeof entitlements.$inferSelect;
export type UsageCredits = typeof usageCredits.$inferSelect;
export type BioPage = typeof bioPages.$inferSelect;
export type InsertBioPage = z.infer<typeof insertBioPageSchema>;
export type BioPageProduct = typeof bioPageProducts.$inferSelect;
export type InsertBioProduct = z.infer<typeof insertBioProductSchema>;
export type TeamWorkspace = typeof teamWorkspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type FeaturePurchase = typeof featurePurchases.$inferSelect;

export const funnelEvents = pgTable("funnel_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  page: text("page"),
  metadata: jsonb("metadata"),
  sessionId: text("session_id"),
  userId: text("user_id"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FunnelEvent = typeof funnelEvents.$inferSelect;

export const videoAds = pgTable("video_ads", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  heygenVideoId: text("heygen_video_id"),
  status: text("status").default("pending"),
  prompt: text("prompt").notNull(),
  avatarId: text("avatar_id"),
  voiceId: text("voice_id"),
  targetUrl: text("target_url"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  errorMessage: text("error_message"),
  kidsSaved: boolean("kids_saved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertVideoAdSchema = createInsertSchema(videoAds).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type VideoAd = typeof videoAds.$inferSelect;
export type InsertVideoAd = z.infer<typeof insertVideoAdSchema>;

export const videoAdImages = pgTable("video_ad_images", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoAdImageSchema = createInsertSchema(videoAdImages).omit({ id: true, createdAt: true });
export type VideoAdImage = typeof videoAdImages.$inferSelect;
export type InsertVideoAdImage = z.infer<typeof insertVideoAdImageSchema>;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Admin-only YouTube viral research packs */
export const youtubeViralPacks = pgTable("youtube_viral_packs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic").notNull(),
  count: integer("count").notNull().default(3),
  briefJson: text("brief_json"),
  status: text("status").default("researched"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type YoutubeViralPack = typeof youtubeViralPacks.$inferSelect;

/** Easy video edit projects (customers + admin) */
export const videoEditProjects = pgTable("video_edit_projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled edit"),
  sourceVideoUrl: text("source_video_url"),
  sourceFilename: text("source_filename"),
  trimStartSec: integer("trim_start_sec").default(0),
  trimEndSec: integer("trim_end_sec"),
  captionText: text("caption_text").default(""),
  scriptText: text("script_text").default(""),
  scenesJson: text("scenes_json"),
  aspectRatio: text("aspect_ratio").default("9:16"),
  status: text("status").default("draft"),
  outputVideoUrl: text("output_video_url"),
  linkedVideoAdId: integer("linked_video_ad_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type VideoEditProject = typeof videoEditProjects.$inferSelect;

/** Admin OAuth tokens for YouTube / Pinterest */
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  accountLabel: text("account_label"),
  accountId: text("account_id"),
  metaJson: text("meta_json"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SocialConnection = typeof socialConnections.$inferSelect;
