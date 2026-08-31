import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getEntitlement, getEntitlementByUserId } from "./entitlements";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import { sendContactEmail, sendRefundQualifiedEmail, sendRefundDeniedEmails } from "./emailService";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth/replitAuth";
import { listAvatars, listVoices, generateAvatarVideo, getVideoStatus, generateVideoAgent, getHeygenWalletSummary, listHeygenVideos, getHeygenVideoV3 } from "./heygen";
import { researchViralTopic, heygenPromptFromAngle } from "./youtubeViral";
import {
  listKidsFormats,
  listGenerationModes,
  listViralShortsMethod,
  generateRandomKidsShorts,
  generateDailyDrop,
  generateDailyDrops,
  generateDailyDropsFromStyleCounts,
  describeStyleCountsPlan,
  parseStyleCounts,
  parseKidsGenerationMode,
  styleCountsFromLegacy,
  totalStyleCounts,
  MAX_DAILY_DROP_VIDEOS,
  estimateLibrarySize,
  assignAutoMusic,
  autoPickCartoonStyle,
  expandStyleCountsToStyles,
  attachPipelineToConcept,
  buildKidsGenerationJobs,
  heygenPromptFromKidsShort,
  heygenPromptFromPastedScript,
  getViralScriptTemplates,
  buildKidsVideoPlan,
  parseKidsDurationMinutes,
  KIDS_DURATION_OPTIONS,
  KIDS_VISUAL_STYLES,
  type KidsVisualStyle,
  type KidsShortConcept,
  type ViralFormat,
  type KidsGenerationMode,
} from "./kidsShorts";
import {
  isKidsAiConfigured,
  kidsAiConfigHint,
  generateKidsConceptWithAI,
} from "./kidsShortsAI";
import {
  youtubeConfigured,
  pinterestConfigured,
  getYouTubeAuthUrl,
  getPinterestAuthUrl,
  exchangeYouTubeCode,
  exchangePinterestCode,
  refreshYouTubeToken,
  refreshPinterestToken,
  getYouTubeChannel,
  getPinterestUser,
  listPinterestBoards,
  uploadYouTubeVideo,
  createPinterestImagePin,
  createPinterestVideoPin,
} from "./socialOAuth";
import { checkRefundEligibility } from "./refundChecker";
import { insertRefundRequestSchema, youtubeViralPacks, videoEditProjects, socialConnections } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import multer from "multer";
import QRCode from "qrcode";

const ADMIN_EMAIL = "morrisdamond0516@gmail.com";

function getIpHash(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function getUserId(req: Request): string | undefined {
  return (req.user as any)?.id || (req.user as any)?.claims?.sub;
}

function isAdmin(req: Request): boolean {
  const user = req.user as any;
  return user?.email === ADMIN_EMAIL;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !isAdmin(req)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

async function requireFeature(req: Request, res: Response, next: NextFunction) {
  const featureKeyHeader = req.headers["x-feature-key"] as string;
  if (!featureKeyHeader) {
    return res.status(403).json({ message: "Feature key required" });
  }

  const userId = getUserId(req);
  const ipHash = getIpHash(req);
  const keys = featureKeyHeader.split(",").map((k) => k.trim());

  for (const key of keys) {
    const has = await storage.hasFeatureAccess(key, userId, ipHash);
    if (has) return next();
  }

  return res.status(403).json({ message: "Feature not purchased", featureKey: featureKeyHeader });
}

const UPLOAD_DIR = path.join(process.cwd(), "server", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const videoUpload = multer({
  storage: multerStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(mp4|webm|mov|m4v)$/i;
    if (allowed.test(file.originalname) || file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed (mp4, webm, mov)"));
  },
});

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const device = /mobile|android|iphone|ipad|ipod/i.test(ua)
    ? "mobile"
    : /tablet/i.test(ua)
    ? "tablet"
    : "desktop";

  let browser = "Other";
  if (/chrome/i.test(ua) && !/chromium|edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/msie|trident/i.test(ua)) browser = "IE";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });
  });

  app.post("/api/shorten", async (req, res) => {
    try {
      const { url, anonToken } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL is required" });
      }

      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      const userId = getUserId(req);
      const ipHash = getIpHash(req);

      const credits = await storage.getRemainingCredits(userId, anonToken, ipHash);
      if (credits.totalRemaining <= 0) {
        return res.status(403).json({ message: "No credits remaining", outOfCredits: true });
      }

      const consumed = await storage.consumeCredit(userId, anonToken, ipHash);
      if (!consumed) {
        return res.status(403).json({ message: "No credits remaining", outOfCredits: true });
      }

      const shortened = await storage.createUrl({ originalUrl: normalizedUrl }, { userId });
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;
      const shortUrl = `${baseUrl}/${shortened.shortCode}`;

      await storage.recordFunnelEvent({
        eventType: "link_shortened",
        page: "/",
        metadata: { shortCode: shortened.shortCode },
        userId,
        ipHash,
        userAgent: req.headers["user-agent"] || "",
        referrer: req.headers.referer || "",
      });

      res.json({ shortUrl, shortCode: shortened.shortCode, id: shortened.id });
    } catch (err: any) {
      console.error("Shorten error:", err);
      res.status(500).json({ message: "Failed to shorten URL" });
    }
  });

  app.get("/api/my-links", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const links = await storage.getUserUrls(userId);
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;
      const result = links.map((l) => ({
        ...l,
        shortUrl: `${baseUrl}/${l.shortCode}`,
      }));
      res.json(result);
    } catch (err: any) {
      console.error("my-links error:", err);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.delete("/api/my-links/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const url = await storage.getUrlById(id);
      if (!url) return res.status(404).json({ message: "Link not found" });
      if (url.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      await storage.deleteUrl(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("delete link error:", err);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  app.get("/api/credits", async (req, res) => {
    try {
      const userId = getUserId(req);
      const anonToken = req.query.anonToken as string | undefined;
      const ipHash = getIpHash(req);
      const credits = await storage.getRemainingCredits(userId, anonToken, ipHash);
      res.json(credits);
    } catch (err: any) {
      console.error("credits error:", err);
      res.status(500).json({ message: "Failed to get credits" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      await sendContactEmail({ name, email, subject, message });
      res.json({ success: true });
    } catch (err: any) {
      console.error("contact error:", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/refund-request", async (req, res) => {
    try {
      const parsed = insertRefundRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, name, reason, transactionId } = parsed.data;

      const checkResult = await checkRefundEligibility(email, transactionId);
      const refundReq = await storage.createRefundRequest(
        parsed.data,
        checkResult.qualified ? "qualified" : "denied"
      );

      if (checkResult.qualified) {
        await sendRefundQualifiedEmail(
          { id: refundReq.id, email, name: name || null, reason, transactionId: transactionId || null },
          checkResult
        );
      } else {
        await sendRefundDeniedEmails(
          { id: refundReq.id, email, name: name || null, reason, transactionId: transactionId || null },
          checkResult
        );
      }

      res.json({ success: true, qualified: checkResult.qualified, reasons: checkResult.reasons });
    } catch (err: any) {
      console.error("refund request error:", err);
      res.status(500).json({ message: "Failed to process refund request" });
    }
  });

  app.get("/api/stripe-key", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (err: any) {
      console.error("stripe key error:", err);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { plan, userId, anonToken } = req.body;
      const ipHash = getIpHash(req);

      const planPrices: Record<string, { amount: number; name: string }> = {
        "Premium": { amount: 2900, name: "LinksShrink Premium" },
        "Pro": { amount: 4900, name: "LinksShrink Pro" },
      };

      const planInfo = planPrices[plan] || planPrices["Premium"];
      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: planInfo.name, tax_code: "txcd_10103001" },
            unit_amount: planInfo.amount,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${baseUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        automatic_tax: { enabled: true },
        metadata: { plan, userId: userId || "", anonToken: anonToken || "", ipHash },
      });

      await storage.recordFunnelEvent({
        eventType: "checkout_started",
        page: "/pricing",
        metadata: { plan, amount: planInfo.amount },
        userId: userId || undefined,
        ipHash,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("checkout session error:", err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/create-link-pack-checkout", async (req, res) => {
    try {
      const { credits, userId, anonToken } = req.body;
      const ipHash = getIpHash(req);
      const creditCount = parseInt(credits) || 20;
      const amount = creditCount === 20 ? 2000 : creditCount === 50 ? 4500 : 8000;

      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditCount} Link Credits Pack`,
              tax_code: "txcd_10103001",
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&pack=true`,
        cancel_url: `${baseUrl}/`,
        automatic_tax: { enabled: true },
        metadata: {
          purchaseType: "link_pack",
          credits: String(creditCount),
          userId: userId || "",
          anonToken: anonToken || "",
          ipHash,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("link pack checkout error:", err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  const FEATURE_PRICES: Record<string, { amount: number; name: string }> = {
    slug_single: { amount: 199, name: "Custom Slug (1 link)" },
    password_single: { amount: 199, name: "Password Protection (1 link)" },
    expiring_single: { amount: 199, name: "Expiring Link (1 link)" },
    qr_single: { amount: 299, name: "Smart QR Code (1 link)" },
    bulk_100: { amount: 999, name: "Bulk Shortener (100 links)" },
    analytics_single: { amount: 299, name: "Link Analytics (1 link)" },
    advanced_analytics_single: { amount: 499, name: "Advanced Analytics (1 link)" },
    geo_single: { amount: 399, name: "Geo-Routing (1 link)" },
    ab_single: { amount: 399, name: "A/B Testing (1 link)" },
    retargeting_single: { amount: 299, name: "Retargeting Pixels (1 link)" },
    utm_single: { amount: 199, name: "UTM Builder (1 link)" },
    deep_link_single: { amount: 299, name: "Mobile Deep Links (1 link)" },
    schedule_single: { amount: 199, name: "Link Scheduling (1 link)" },
    click_limit_single: { amount: 199, name: "Click Limits (1 link)" },
    conversion_tracking: { amount: 999, name: "Conversion Tracking" },
    video_ad_single: { amount: 1999, name: "AI Video Ad (1 video)" },
    bio_page: { amount: 799, name: "Link-in-Bio Page" },
    team_workspace: { amount: 1499, name: "Team Workspace" },
  };

  app.post("/api/create-feature-checkout", async (req, res) => {
    try {
      const { featureKey, userId, anonToken } = req.body;
      const ipHash = getIpHash(req);

      const feature = FEATURE_PRICES[featureKey];
      if (!feature) {
        return res.status(400).json({ message: "Unknown feature" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: feature.name, tax_code: "txcd_10103001" },
            unit_amount: feature.amount,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${baseUrl}/pricing?session_id={CHECKOUT_SESSION_ID}&feature=${featureKey}`,
        cancel_url: `${baseUrl}/pricing`,
        automatic_tax: { enabled: true },
        metadata: {
          purchaseType: "individual_feature",
          featureKey,
          userId: userId || "",
          anonToken: anonToken || "",
          ipHash,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("feature checkout error:", err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/verify-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = getUserId(req);
      const anonToken = req.query.anonToken as string | undefined;
      const ipHash = getIpHash(req);

      const processed = await storage.isLinkPackProcessed(sessionId);
      if (processed) {
        return res.json({ verified: true, type: "link_pack" });
      }

      const entitlement = await getEntitlement(sessionId);
      if (entitlement) {
        if (userId && !entitlement.userId) {
          const { storeEntitlement } = await import("./entitlements");
          await storeEntitlement(sessionId, entitlement.plan, entitlement.stripeCustomerId || undefined, userId);
        }
        return res.json({ verified: true, type: "premium", plan: entitlement.plan });
      }

      try {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
          const purchaseType = session.metadata?.purchaseType;
          const { storeEntitlement } = await import("./entitlements");

          if (purchaseType === "link_pack") {
            const credits = parseInt(session.metadata?.credits || "20");
            const alreadyProcessed = await storage.isLinkPackProcessed(sessionId);
            if (!alreadyProcessed) {
              await storage.grantPaidCredits(credits, userId, anonToken, ipHash);
              await storage.markLinkPackProcessed(sessionId, credits, userId, anonToken, ipHash);
            }
            return res.json({ verified: true, type: "link_pack", credits });
          } else if (purchaseType === "individual_feature") {
            const featureKey = session.metadata?.featureKey || "";
            const alreadyProcessed = await storage.isLinkPackProcessed(sessionId);
            if (!alreadyProcessed) {
              await storage.markLinkPackProcessed(sessionId, 0, userId, "", ipHash);
              await storage.storeFeaturePurchase(sessionId, featureKey, userId, ipHash);
            }
            return res.json({ verified: true, type: "individual_feature", featureKey });
          } else {
            const plan = session.metadata?.plan || "Premium";
            const customerId = typeof session.customer === "string" ? session.customer : undefined;
            await storeEntitlement(sessionId, plan, customerId, userId);
            return res.json({ verified: true, type: "premium", plan });
          }
        }
      } catch (stripeErr: any) {
        console.error("Stripe session verify error:", stripeErr.message);
      }

      res.json({ verified: false });
    } catch (err: any) {
      console.error("verify session error:", err);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.get("/api/check-entitlement/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const entitlement = await getEntitlement(sessionId);
      if (entitlement) {
        return res.json({ hasAccess: true, plan: entitlement.plan, entitlement });
      }
      res.json({ hasAccess: false });
    } catch (err: any) {
      console.error("check entitlement error:", err);
      res.status(500).json({ message: "Failed to check entitlement" });
    }
  });

  app.get("/api/my-entitlement", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const entitlement = await getEntitlementByUserId(userId);
      if (entitlement) {
        return res.json({ hasAccess: true, plan: entitlement.plan, entitlement });
      }
      res.json({ hasAccess: false });
    } catch (err: any) {
      console.error("my entitlement error:", err);
      res.status(500).json({ message: "Failed to get entitlement" });
    }
  });

  app.post("/api/funnel/track", async (req, res) => {
    try {
      const { eventType, page, metadata, sessionId } = req.body;
      if (!eventType) return res.status(400).json({ message: "eventType required" });

      const userId = getUserId(req);
      const ipHash = getIpHash(req);
      const userAgent = req.headers["user-agent"] || "";
      const referrer = req.headers.referer || "";

      await storage.recordFunnelEvent({ eventType, page, metadata, sessionId, userId, ipHash, userAgent, referrer });
      res.json({ success: true });
    } catch (err: any) {
      console.error("funnel track error:", err);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  app.get("/api/funnel/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const stats = await storage.getFunnelStats(days);
      res.json(stats);
    } catch (err: any) {
      console.error("funnel stats error:", err);
      res.status(500).json({ message: "Failed to get funnel stats" });
    }
  });

  app.post("/api/premium/shorten", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const featureKeyHeader = req.headers["x-feature-key"] as string | undefined;
      const {
        url, customSlug, password, expiresAt, qrColor,
        retargetingPixels, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        geoRoutes, abTestUrl, abTestSplit, maxClicks, scheduledAt,
        iosDeepLink, androidDeepLink,
      } = req.body;

      if (!url) return res.status(400).json({ message: "URL is required" });

      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) normalizedUrl = "https://" + normalizedUrl;

      if (featureKeyHeader) {
        const keys = featureKeyHeader.split(",").map((k: string) => k.trim());
        for (const key of keys) {
          const has = await storage.hasFeatureAccess(key, userId, ipHash);
          if (!has) {
            return res.status(403).json({ message: "Feature not purchased", featureKey: key });
          }
        }
        for (const key of keys) {
          await storage.consumeFeatureUse(key, userId, ipHash);
        }
      }

      const shortened = await storage.createUrl(
        { originalUrl: normalizedUrl },
        {
          userId, customSlug, password, expiresAt, qrColor, isPremium: true,
          retargetingPixels, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
          geoRoutes, abTestUrl, abTestSplit, maxClicks, scheduledAt,
        }
      );

      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      res.json({
        shortUrl: `${baseUrl}/${shortened.shortCode}`,
        shortCode: shortened.shortCode,
        id: shortened.id,
      });
    } catch (err: any) {
      console.error("premium shorten error:", err);
      res.status(500).json({ message: err.message || "Failed to shorten URL" });
    }
  });

  app.post("/api/premium/bulk-shorten", isAuthenticated, requireFeature, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const { urls } = req.body;

      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: "URLs array required" });
      }
      if (urls.length > 100) {
        return res.status(400).json({ message: "Maximum 100 URLs per batch" });
      }

      const featureKey = "bulk_100";
      const has = await storage.hasFeatureAccess(featureKey, userId, ipHash);
      if (!has) return res.status(403).json({ message: "Bulk shortener not purchased" });
      await storage.consumeFeatureUse(featureKey, userId, ipHash);

      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      const results = await Promise.all(
        urls.map(async (url: string) => {
          try {
            let normalizedUrl = url.trim();
            if (!normalizedUrl.match(/^https?:\/\//i)) normalizedUrl = "https://" + normalizedUrl;
            const shortened = await storage.createUrl({ originalUrl: normalizedUrl }, { userId, isPremium: true });
            return { original: url, shortUrl: `${baseUrl}/${shortened.shortCode}`, success: true };
          } catch {
            return { original: url, success: false, error: "Failed to shorten" };
          }
        })
      );

      res.json({ results });
    } catch (err: any) {
      console.error("bulk shorten error:", err);
      res.status(500).json({ message: "Failed to shorten URLs" });
    }
  });

  app.get("/api/premium/my-urls", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const featureKeyHeader = req.headers["x-feature-key"] as string | undefined;

      if (featureKeyHeader) {
        const keys = featureKeyHeader.split(",").map((k: string) => k.trim());
        let hasAny = false;
        for (const key of keys) {
          if (await storage.hasFeatureAccess(key, userId, ipHash)) { hasAny = true; break; }
        }
        if (!hasAny) return res.status(403).json({ message: "Feature not purchased" });
      }

      const links = await storage.getUserUrls(userId);
      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;

      res.json(links.map((l) => ({ ...l, shortUrl: `${baseUrl}/${l.shortCode}` })));
    } catch (err: any) {
      console.error("premium my-urls error:", err);
      res.status(500).json({ message: "Failed to fetch URLs" });
    }
  });

  app.get("/api/premium/analytics/:urlId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const urlId = parseInt(req.params.urlId);
      if (isNaN(urlId)) return res.status(400).json({ message: "Invalid URL ID" });

      const featureKeyHeader = req.headers["x-feature-key"] as string | undefined;
      if (featureKeyHeader) {
        const keys = featureKeyHeader.split(",").map((k: string) => k.trim());
        let hasAny = false;
        for (const key of keys) {
          if (await storage.hasFeatureAccess(key, userId, ipHash)) { hasAny = true; break; }
        }
        if (!hasAny) return res.status(403).json({ message: "Feature not purchased" });
      }

      const url = await storage.getUrlById(urlId);
      if (!url) return res.status(404).json({ message: "URL not found" });
      if (url.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const days = parseInt(req.query.days as string) || 30;
      const analytics = await storage.getUrlAnalytics(urlId, days);
      res.json(analytics);
    } catch (err: any) {
      console.error("analytics error:", err);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  app.get("/api/premium/qr/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const featureKey = "qr_single";

      const featureKeyHeader = req.headers["x-feature-key"] as string | undefined;
      if (featureKeyHeader) {
        const has = await storage.hasFeatureAccess(featureKey, userId, ipHash);
        if (!has) return res.status(403).json({ message: "QR feature not purchased" });
      }

      const { url, color, size } = req.query;
      if (!url) return res.status(400).json({ message: "URL required" });

      const qrDataUrl = await QRCode.toDataURL(url as string, {
        color: { dark: (color as string) || "#000000", light: "#ffffff" },
        width: parseInt(size as string) || 300,
        errorCorrectionLevel: "H",
      });

      res.json({ qrDataUrl });
    } catch (err: any) {
      console.error("QR generate error:", err);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  app.post("/api/conversions/track", isAuthenticated, async (req, res) => {
    try {
      const { urlId, type, revenue, currency, metadata } = req.body;
      if (!urlId || !type) return res.status(400).json({ message: "urlId and type required" });

      const conversion = await storage.recordConversion(parseInt(urlId), type, revenue, currency, metadata);
      res.json(conversion);
    } catch (err: any) {
      console.error("conversion track error:", err);
      res.status(500).json({ message: "Failed to track conversion" });
    }
  });

  app.get("/api/conversions/:urlId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const ipHash = getIpHash(req);
      const urlId = parseInt(req.params.urlId);
      if (isNaN(urlId)) return res.status(400).json({ message: "Invalid URL ID" });

      const featureKey = "conversion_tracking";
      const featureKeyHeader = req.headers["x-feature-key"] as string | undefined;
      if (featureKeyHeader) {
        const has = await storage.hasFeatureAccess(featureKey, userId, ipHash);
        if (!has) return res.status(403).json({ message: "Conversion tracking not purchased" });
      }

      const url = await storage.getUrlById(urlId);
      if (!url || url.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const conversions = await storage.getConversions(urlId);
      res.json(conversions);
    } catch (err: any) {
      console.error("get conversions error:", err);
      res.status(500).json({ message: "Failed to get conversions" });
    }
  });

  app.get("/api/bio/my-pages", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const pages = await storage.getUserBioPages(userId);
      res.json(pages);
    } catch (err: any) {
      console.error("bio pages error:", err);
      res.status(500).json({ message: "Failed to get bio pages" });
    }
  });

  app.post("/api/bio", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const data = { ...req.body, userId };
      const page = await storage.createBioPage(data);
      res.json(page);
    } catch (err: any) {
      console.error("create bio page error:", err);
      res.status(500).json({ message: err.message || "Failed to create bio page" });
    }
  });

  app.put("/api/bio/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const existing = await storage.getBioPageById(id);
      if (!existing) return res.status(404).json({ message: "Bio page not found" });
      if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const updated = await storage.updateBioPage(id, req.body);
      res.json(updated);
    } catch (err: any) {
      console.error("update bio page error:", err);
      res.status(500).json({ message: "Failed to update bio page" });
    }
  });

  app.delete("/api/bio/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const existing = await storage.getBioPageById(id);
      if (!existing) return res.status(404).json({ message: "Bio page not found" });
      if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      await storage.deleteBioPage(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("delete bio page error:", err);
      res.status(500).json({ message: "Failed to delete bio page" });
    }
  });

  app.get("/api/bio/:slug", async (req, res) => {
    try {
      const page = await storage.getBioPageBySlug(req.params.slug);
      if (!page) return res.status(404).json({ message: "Bio page not found" });
      const products = page.shopEnabled ? await storage.getBioProducts(page.id) : [];
      res.json({ ...page, products });
    } catch (err: any) {
      console.error("get bio page error:", err);
      res.status(500).json({ message: "Failed to get bio page" });
    }
  });

  app.post("/api/bio/:id/products", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const existing = await storage.getBioPageById(id);
      if (!existing || existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const product = await storage.createBioProduct({ ...req.body, bioPageId: id });
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/teams/my-teams", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const workspaces = await storage.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (err: any) {
      console.error("my teams error:", err);
      res.status(500).json({ message: "Failed to get teams" });
    }
  });

  app.post("/api/teams", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const workspace = await storage.createWorkspace({ ...req.body, ownerId: userId });
      res.json(workspace);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.post("/api/teams/:id/members", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const workspaceId = parseInt(req.params.id);
      const { memberId, role } = req.body;
      const member = await storage.addWorkspaceMember(workspaceId, memberId || userId, role);
      res.json(member);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to add member" });
    }
  });

  app.get("/api/video-ads/my-videos", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const videos = await storage.getUserVideoAds(userId);
      res.json(videos);
    } catch (err: any) {
      console.error("my videos error:", err);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  app.post("/api/video-ads/generate", isAuthenticated, async (req, res) => {
    try {
      // Customer Video Ads is shelved until scrape/package/payment are wired.
      // Admin (Kids Shorts retry) may still use this route.
      if (!isAdmin(req)) {
        return res.status(503).json({
          message: "AI Video Ads is temporarily unavailable. Link tools still work as usual.",
          unavailable: true,
        });
      }

      const userId = getUserId(req)!;
      const { prompt, avatarId, voiceId, targetUrl, mode, script, dimension, backgroundImageUrl, scenes } = req.body;
      if (!prompt) return res.status(400).json({ message: "Prompt required" });

      let heygenResult: any;
      if (mode === "agent" || !avatarId) {
        heygenResult = await generateVideoAgent(prompt);
      } else {
        heygenResult = await generateAvatarVideo(
          avatarId, voiceId, script || prompt, undefined, dimension, backgroundImageUrl, scenes
        );
      }

      const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;

      const videoAd = await storage.createVideoAd({
        userId,
        heygenVideoId: heygenVideoId || null,
        status: heygenVideoId ? "processing" : "error",
        prompt,
        avatarId: avatarId || null,
        voiceId: voiceId || null,
        targetUrl: targetUrl || null,
        videoUrl: null,
        thumbnailUrl: null,
        duration: null,
        errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen",
      });

      res.json({ ...videoAd, heygenResult });
    } catch (err: any) {
      console.error("video generate error:", err);
      res.status(500).json({ message: err.message || "Failed to generate video" });
    }
  });

  app.get("/api/video-ads/:id/status", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const videoAd = await storage.getVideoAd(id);
      if (!videoAd) return res.status(404).json({ message: "Video not found" });
      if (videoAd.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      if (videoAd.heygenVideoId && (videoAd.status === "processing" || !videoAd.videoUrl)) {
        const statusData = videoAd.status === "processing"
          ? await getVideoStatus(videoAd.heygenVideoId)
          : await getHeygenVideoV3(videoAd.heygenVideoId);
        const payload = statusData?.data ?? statusData;
        const status = payload?.status;
        const videoUrl = payload?.video_url;
        const thumbnailUrl = payload?.thumbnail_url;
        const duration = payload?.duration;

        if (status === "completed") {
          const updated = await storage.updateVideoAd(id, {
            status: "completed",
            videoUrl: videoUrl || null,
            thumbnailUrl: thumbnailUrl || null,
            duration: duration != null ? Math.round(Number(duration)) : null,
            completedAt: new Date(),
          });
          return res.json(updated);
        } else if (status === "failed") {
          const updated = await storage.updateVideoAd(id, {
            status: "error",
            errorMessage: payload?.error || statusData?.data?.error || "Generation failed",
          });
          return res.json(updated);
        } else if (videoUrl && videoAd.status !== "processing") {
          const updated = await storage.updateVideoAd(id, {
            status: status === "completed" ? "completed" : videoAd.status,
            videoUrl: videoUrl || null,
            thumbnailUrl: thumbnailUrl || null,
            duration: duration != null ? Math.round(Number(duration)) : videoAd.duration,
            completedAt: status === "completed" ? new Date() : videoAd.completedAt,
          });
          return res.json(updated);
        }
      }

      res.json(videoAd);
    } catch (err: any) {
      console.error("video status error:", err);
      res.status(500).json({ message: "Failed to get video status" });
    }
  });

  app.patch("/api/video-ads/:id/saved", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id, 10);
      const videoAd = await storage.getVideoAd(id);
      if (!videoAd) return res.status(404).json({ message: "Video not found" });
      if (videoAd.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const saved = !!req.body.saved;
      const updated = await storage.updateVideoAd(id, { kidsSaved: saved });
      res.json(updated);
    } catch (err: any) {
      console.error("video save toggle error:", err);
      res.status(500).json({ message: err.message || "Failed to update video" });
    }
  });

  app.delete("/api/video-ads/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteVideoAd(id, userId);
      if (!deleted) return res.status(404).json({ message: "Video not found" });
      res.json({ success: true, id });
    } catch (err: any) {
      console.error("video delete error:", err);
      res.status(500).json({ message: err.message || "Failed to delete video" });
    }
  });

  app.get("/api/video-ads/my-uploaded-images", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const images = await storage.getUserVideoAdImages(userId);
      res.json(images);
    } catch (err: any) {
      console.error("my uploaded images error:", err);
      res.status(500).json({ message: "Failed to get images" });
    }
  });

  app.post(
    "/api/video-ads/upload-images",
    isAuthenticated,
    upload.array("images", 10),
    async (req, res) => {
      try {
        const userId = getUserId(req)!;
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const keywordsRaw = req.body.keywords;
        const keywords: string[] = keywordsRaw
          ? (Array.isArray(keywordsRaw) ? keywordsRaw : [keywordsRaw])
          : [];
        const description: string = req.body.description || "";

        const baseUrl = process.env.NODE_ENV === "production"
          ? "https://linksshrink.com"
          : `${req.protocol}://${req.get("host")}`;

        const saved = await Promise.all(
          files.map((f) =>
            storage.saveVideoAdImage({
              userId,
              filename: f.filename,
              originalName: f.originalname,
              url: `${baseUrl}/uploads/${f.filename}`,
              keywords,
              description,
            })
          )
        );

        res.json(saved);
      } catch (err: any) {
        console.error("image upload error:", err);
        res.status(500).json({ message: "Failed to upload images" });
      }
    }
  );

  app.delete("/api/video-ads/images/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVideoAdImage(id, userId);
      if (!deleted) return res.status(404).json({ message: "Image not found" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  app.get("/api/heygen/avatars", isAuthenticated, async (_req, res) => {
    try {
      const avatars = await listAvatars();
      res.json(avatars);
    } catch (err: any) {
      console.error("heygen avatars error:", err);
      res.status(500).json({ message: "Failed to get avatars" });
    }
  });

  app.get("/api/heygen/voices", isAuthenticated, async (_req, res) => {
    try {
      const voices = await listVoices();
      res.json(voices);
    } catch (err: any) {
      console.error("heygen voices error:", err);
      res.status(500).json({ message: "Failed to get voices" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const allUsers = await db.select().from(users).limit(1000);
      res.json(allUsers.map((u) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, createdAt: u.createdAt })));
    } catch (err: any) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getFunnelStats(30);
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // ——— Admin-only YouTube viral studio (hidden from customers) ———
  app.post("/api/admin/youtube/research", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const topic = String(req.body.topic || "").trim();
      const count = Math.min(5, Math.max(1, parseInt(req.body.count || "3", 10) || 3));
      if (!topic) return res.status(400).json({ message: "Topic required" });

      const brief = await researchViralTopic(topic, count);
      const { db } = await import("./db");
      const [pack] = await db
        .insert(youtubeViralPacks)
        .values({
          userId,
          topic: brief.topic,
          count,
          briefJson: JSON.stringify(brief),
          status: brief.bannedOrRisky ? "blocked" : "researched",
        })
        .returning();

      res.json({ packId: pack.id, brief });
    } catch (err: any) {
      console.error("youtube research error:", err);
      res.status(500).json({ message: err.message || "Research failed" });
    }
  });

  app.get("/api/admin/youtube/packs", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { db } = await import("./db");
      const packs = await db
        .select()
        .from(youtubeViralPacks)
        .where(eq(youtubeViralPacks.userId, userId))
        .orderBy(desc(youtubeViralPacks.createdAt))
        .limit(30);
      res.json(
        packs.map((p) => ({
          ...p,
          brief: p.briefJson ? JSON.parse(p.briefJson) : null,
        }))
      );
    } catch (err: any) {
      res.status(500).json({ message: "Failed to list packs" });
    }
  });

  app.post("/api/admin/youtube/generate", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { packId, angleIds } = req.body as { packId: number; angleIds?: string[] };
      if (!packId) return res.status(400).json({ message: "packId required" });

      const { db } = await import("./db");
      const [pack] = await db
        .select()
        .from(youtubeViralPacks)
        .where(eq(youtubeViralPacks.id, packId));
      if (!pack || pack.userId !== userId) return res.status(404).json({ message: "Pack not found" });

      const brief = pack.briefJson ? JSON.parse(pack.briefJson) : null;
      if (!brief?.angles?.length) return res.status(400).json({ message: "No angles in pack" });
      if (brief.bannedOrRisky) return res.status(400).json({ message: "Topic blocked" });

      const selected = angleIds?.length
        ? brief.angles.filter((a: any) => angleIds.includes(a.id))
        : brief.angles;

      const created: any[] = [];
      for (const angle of selected) {
        const prompt = heygenPromptFromAngle(angle, brief.topic);
        // Realistic avatar / story styles → HeyGen agent; others still use agent with style in prompt
        const heygenResult = await generateVideoAgent(prompt);
        const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;
        const videoAd = await storage.createVideoAd({
          userId,
          heygenVideoId: heygenVideoId || null,
          status: heygenVideoId ? "processing" : "error",
          prompt: `[YT ${angle.style}] ${angle.suggestedTitle}\n\n${prompt}`,
          avatarId: null,
          voiceId: null,
          targetUrl: null,
          videoUrl: null,
          thumbnailUrl: null,
          duration: angle.durationSeconds || null,
          errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen",
        });
        created.push({ angle, videoAd, heygenResult });
      }

      await db
        .update(youtubeViralPacks)
        .set({ status: "generating" })
        .where(eq(youtubeViralPacks.id, packId));

      res.json({
        created,
        youtubeConnectNote:
          "Use Connect YouTube below, then Upload on completed videos. Set YOUTUBE_API_KEY for live research.",
      });
    } catch (err: any) {
      console.error("youtube generate error:", err);
      res.status(500).json({ message: err.message || "Generate failed" });
    }
  });

  // ——— Kids Shorts Studio (ViewMax replacement — random viral nursery rhyme Shorts) ———
  app.get("/api/admin/heygen/wallet", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const wallet = await getHeygenWalletSummary();
      res.json(wallet);
    } catch (err: any) {
      console.error("heygen wallet error:", err);
      res.status(500).json({ message: err.message || "Failed to fetch HeyGen wallet" });
    }
  });

  /** List completed HeyGen videos — for recovering renders lost from local DB. */
  app.get("/api/admin/heygen/videos", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20));
      const data = await listHeygenVideos(limit);
      const videos = (data?.data ?? []).map((v: any) => ({
        id: v.id,
        title: v.title,
        status: v.status,
        duration: v.duration != null ? Math.round(Number(v.duration)) : null,
        videoUrl: v.video_url ?? null,
        thumbnailUrl: v.thumbnail_url ?? null,
        createdAt: v.created_at ?? null,
      }));
      res.json({ videos, hasMore: !!data?.has_more, nextToken: data?.next_token ?? null });
    } catch (err: any) {
      console.error("heygen videos list error:", err);
      res.status(500).json({ message: err.message || "Failed to list HeyGen videos" });
    }
  });

  /** Re-import a HeyGen video into the local Kids library (no re-render cost). */
  app.post("/api/admin/kids-shorts/recover", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const heygenVideoId = String(req.body.heygenVideoId || "").trim();
      if (!heygenVideoId) {
        return res.status(400).json({ message: "heygenVideoId required" });
      }

      const existing = await storage.getVideoAdByHeygenId(heygenVideoId);
      const remote = await getHeygenVideoV3(heygenVideoId);
      const v = remote?.data ?? remote;
      if (!v?.id) {
        return res.status(404).json({ message: "Video not found on HeyGen" });
      }

      const title = v.title && v.title !== v.id ? v.title : `Recovered HeyGen video ${v.id.slice(0, 8)}`;
      const prompt = `[KIDS recovered] ${title}\n\nRecovered from HeyGen video ${v.id}. Original render — not re-generated.`;
      const patch = {
        status: v.status === "completed" ? "completed" : v.status === "failed" ? "error" : "processing",
        videoUrl: v.video_url ?? null,
        thumbnailUrl: v.thumbnail_url ?? null,
        duration: v.duration != null ? Math.round(Number(v.duration)) : null,
        errorMessage: v.status === "failed" ? "Generation failed on HeyGen" : null,
        completedAt: v.status === "completed" ? new Date() : null,
      };

      if (existing) {
        const updated = await storage.updateVideoAd(existing.id, patch);
        return res.json({
          videoAd: updated,
          recovered: true,
          note: "Updated existing library entry with fresh HeyGen URLs.",
        });
      }

      const videoAd = await storage.createVideoAd({
        userId,
        heygenVideoId: v.id,
        prompt,
        avatarId: null,
        voiceId: null,
        targetUrl: null,
        ...patch,
      });

      res.json({
        videoAd,
        recovered: true,
        note: "Video re-imported into your library — no HeyGen credits spent.",
      });
    } catch (err: any) {
      console.error("kids recover error:", err);
      res.status(500).json({ message: err.message || "Recover failed" });
    }
  });

  app.get("/api/admin/kids-shorts/formats", isAuthenticated, requireAdmin, (_req, res) => {
    res.json({
      formats: listKidsFormats(),
      generationModes: listGenerationModes(),
      viralMethod: listViralShortsMethod(),
      durations: Object.entries(KIDS_DURATION_OPTIONS).map(([id, d]) => ({
        id: parseInt(id, 10),
        label: d.label,
        seconds: d.seconds,
        hint: d.hint,
      })),
      librarySize: estimateLibrarySize(),
      libraryNote: "Each generate asks AI for a fresh idea tailored to 3D / 2D / Presenter style (when API key set).",
      aiConfigured: isKidsAiConfigured(),
      aiHint: kidsAiConfigHint(),
      styles: Object.entries(KIDS_VISUAL_STYLES).map(([id, s]) => ({
        id,
        label: s.label,
        description: s.description,
      })),
    });
  });

  app.get("/api/admin/kids-shorts/templates", isAuthenticated, requireAdmin, (_req, res) => {
    res.json({ templates: getViralScriptTemplates() });
  });

  /** Render one video from a pasted DeepSeek / ChatGPT scene-by-scene script. */
  app.post("/api/admin/kids-shorts/render-script", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const script = String(req.body.script || "").trim();
      const style = (
        req.body.style === "cocomelon" || req.body.style === "chuchu" || req.body.style === "blippi"
          ? req.body.style
          : "cocomelon"
      ) as KidsVisualStyle;
      const durationMinutes = parseKidsDurationMinutes(req.body.durationMinutes);
      const title = typeof req.body.title === "string" ? req.body.title.trim() : undefined;
      const formatHintRaw = req.body.formatHint;
      const formatHint =
        formatHintRaw === "wrong_sound" ||
        formatHintRaw === "story_remix" ||
        formatHintRaw === "parent_pov" ||
        formatHintRaw === "asmr_texture" ||
        formatHintRaw === "emoji_chat"
          ? (formatHintRaw as ViralFormat)
          : null;

      if (script.length < 80) {
        return res.status(400).json({
          message: "Paste the full scene-by-scene script (at least 80 characters).",
        });
      }

      const estCost = durationMinutes * 2;
      try {
        const wallet = await getHeygenWalletSummary();
        if (wallet.remainingBalanceUsd != null && estCost > wallet.remainingBalanceUsd + 0.01) {
          return res.status(402).json({
            message: `Not enough HeyGen balance. Need ~$${estCost} for ${durationMinutes}min, wallet has $${wallet.remainingBalanceUsd.toFixed(2)}. Top up at app.heygen.com.`,
            estimatedCostUsd: estCost,
            remainingBalanceUsd: wallet.remainingBalanceUsd,
          });
        }
      } catch (walletErr) {
        console.warn("heygen wallet check skipped:", walletErr);
      }

      const prompt = heygenPromptFromPastedScript(script, style, durationMinutes, {
        title,
        formatHint: formatHint ?? undefined,
      });
      const displayTitle =
        title || script.split("\n")[0]?.slice(0, 80) || "Custom Kids Short";
      const fullTitle = `${displayTitle} [${KIDS_VISUAL_STYLES[style].label}] [PASTED]`;
      const heygenResult = await generateVideoAgent(prompt);
      const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;
      const durationSeconds = KIDS_DURATION_OPTIONS[durationMinutes].seconds;

      const videoAd = await storage.createVideoAd({
        userId,
        heygenVideoId: heygenVideoId || null,
        status: heygenVideoId ? "processing" : "error",
        prompt: `[KIDS ${style}] ${fullTitle}\n\n${prompt}`,
        avatarId: null,
        voiceId: null,
        targetUrl: null,
        videoUrl: null,
        thumbnailUrl: null,
        duration: durationSeconds,
        errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen — check HEYGEN_API_KEY",
      });

      res.json({
        videoAd,
        heygenResult,
        note: "Rendering from your pasted script. Toddler victory + brand outro added automatically.",
      });
    } catch (err: any) {
      console.error("kids render-script error:", err);
      res.status(500).json({ message: err.message || "Render from script failed" });
    }
  });

  app.post("/api/admin/kids-shorts/random", isAuthenticated, requireAdmin, (req, res) => {
    const count = Math.min(5, Math.max(1, parseInt(req.body.count || "1", 10) || 1));
    const durationMinutes = parseKidsDurationMinutes(req.body.durationMinutes);
    const generationMode = parseKidsGenerationMode(req.body.generationMode);
    const concepts = generateRandomKidsShorts(count, durationMinutes, generationMode).map((c) => ({
      ...c,
      autoMusic: assignAutoMusic(c),
      autoStyle: autoPickCartoonStyle(),
    }));
    const plans = concepts.map((c) => buildKidsVideoPlan(c));
    res.json({ concepts, plans, count: concepts.length, durationMinutes, generationMode });
  });

  /** Preview Step 1 idea + Step 2 scene script without spending HeyGen credits. */
  app.post("/api/admin/kids-shorts/plan", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const count = Math.min(MAX_DAILY_DROP_VIDEOS, Math.max(1, parseInt(req.body.count || "1", 10) || 1));
      const durationMinutes = parseKidsDurationMinutes(req.body.durationMinutes);
      const generationMode = parseKidsGenerationMode(req.body.generationMode);
      const styleCounts = req.body.styleCounts
        ? parseStyleCounts(req.body.styleCounts)
        : styleCountsFromLegacy(count);
      const styles = expandStyleCountsToStyles(styleCounts);
      const n = Math.max(count, styles.length);

      const concepts: KidsShortConcept[] = [];
      for (let i = 0; i < n; i++) {
        const style = styles[i] ?? styles[0];
        if (isKidsAiConfigured()) {
          concepts.push(
            await generateKidsConceptWithAI({
              style,
              mode: generationMode,
              durationMinutes,
              batchIndex: i,
            })
          );
        } else {
          const [c] = generateRandomKidsShorts(1, durationMinutes, generationMode);
          concepts.push(c);
        }
      }

      const plans = concepts.map((c) => buildKidsVideoPlan(c));
      res.json({
        plans,
        count: plans.length,
        durationMinutes,
        generationMode,
        aiConfigured: isKidsAiConfigured(),
        aiHint: kidsAiConfigHint(),
      });
    } catch (err: any) {
      console.error("kids plan error:", err);
      res.status(500).json({ message: err.message || "Plan failed" });
    }
  });

  /** One-click daily cartoon(s): auto rhyme, format, music, cartoon style — no manual picks. */
  app.post("/api/admin/kids-shorts/daily-drop", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const durationMinutes = parseKidsDurationMinutes(req.body.durationMinutes);
      const styleCounts = req.body.styleCounts
        ? parseStyleCounts(req.body.styleCounts)
        : styleCountsFromLegacy(
            Math.min(3, Math.max(1, parseInt(req.body.count || "1", 10) || 1)),
            !!req.body.includePresenterForTwo,
            req.body.style === "cocomelon" ||
              req.body.style === "chuchu" ||
              req.body.style === "blippi" ||
              req.body.style === "random"
              ? req.body.style
              : undefined
          );
      const total = totalStyleCounts(styleCounts);
      if (total === 0) {
        return res.status(400).json({ message: "Pick at least 1 video (set a style count above 0)" });
      }
      if (total > MAX_DAILY_DROP_VIDEOS) {
        return res.status(400).json({
          message: `Max ${MAX_DAILY_DROP_VIDEOS} videos per batch — lower your counts or run another batch.`,
        });
      }

      const generationMode = parseKidsGenerationMode(req.body.generationMode);

      const estCost = total * durationMinutes * 2;
      try {
        const wallet = await getHeygenWalletSummary();
        if (
          wallet.remainingBalanceUsd != null &&
          estCost > wallet.remainingBalanceUsd + 0.01
        ) {
          return res.status(402).json({
            message: `Not enough HeyGen balance. Need ~$${estCost} for ${total}×${durationMinutes}min, wallet has $${wallet.remainingBalanceUsd.toFixed(2)}. Top up at app.heygen.com.`,
            estimatedCostUsd: estCost,
            remainingBalanceUsd: wallet.remainingBalanceUsd,
          });
        }
      } catch (walletErr) {
        console.warn("heygen wallet check skipped:", walletErr);
      }

      const styles = expandStyleCountsToStyles(styleCounts);
      const created: any[] = [];

      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        let concept: KidsShortConcept;
        if (isKidsAiConfigured()) {
          concept = await generateKidsConceptWithAI({
            style,
            mode: generationMode,
            durationMinutes,
            batchIndex: i,
          });
        } else {
          const [c] = generateRandomKidsShorts(1, durationMinutes, generationMode);
          concept = c;
        }
        const music = assignAutoMusic(concept);
        concept = { ...concept, autoMusic: music, autoStyle: style };
        const plan = buildKidsVideoPlan(concept);
        const prompt = heygenPromptFromKidsShort(plan.concept, style);
        const heygenResult = await generateVideoAgent(prompt);
        const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;
        const title = `${concept.suggestedShortTitle} [${KIDS_VISUAL_STYLES[style].label}]`;
        const videoAd = await storage.createVideoAd({
          userId,
          heygenVideoId: heygenVideoId || null,
          status: heygenVideoId ? "processing" : "error",
          prompt: `[KIDS ${style}] ${title}\n\n${prompt}`,
          avatarId: null,
          voiceId: null,
          targetUrl: null,
          videoUrl: null,
          thumbnailUrl: null,
          duration: concept.durationSeconds,
          errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen — check HEYGEN_API_KEY",
        });
        created.push({
          concept: plan.concept,
          plan: { step1_idea: plan.step1_idea, step2_sceneScript: plan.step2_sceneScript },
          style,
          music,
          videoAd,
          heygenResult,
          aiGenerated: isKidsAiConfigured(),
        });
      }

      res.json({
        created,
        count: created.length,
        durationMinutes,
        generationMode,
        stylePlan: describeStyleCountsPlan(styleCounts),
        styleCounts,
        note: isKidsAiConfigured()
          ? `${total} video(s) — AI wrote a fresh idea + scene script for each ${describeStyleCountsPlan(styleCounts)} slot, then HeyGen is rendering.`
          : `${total} video(s) — using built-in templates (add OPENAI_API_KEY to .env for fresh AI every time). ${describeStyleCountsPlan(styleCounts)}.`,
        aiConfigured: isKidsAiConfigured(),
      });
    } catch (err: any) {
      console.error("kids daily drop error:", err);
      res.status(500).json({ message: err.message || "Daily drop failed" });
    }
  });

  app.post("/api/admin/kids-shorts/generate", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      let concepts = (req.body.concepts || []) as KidsShortConcept[];
      const styles = (req.body.styles || ["cocomelon", "blippi", "chuchu"]) as KidsVisualStyle[];
      const randomCount = parseInt(req.body.randomCount || "0", 10) || 0;
      const durationMinutes = parseKidsDurationMinutes(req.body.durationMinutes);

      if (randomCount > 0) {
        concepts = generateRandomKidsShorts(Math.min(5, randomCount), durationMinutes);
      }

      if (!concepts.length) {
        return res.status(400).json({ message: "Generate random ideas first, or pass randomCount" });
      }
      if (!styles.length) {
        return res.status(400).json({ message: "Select at least one visual style" });
      }

      const validStyles = styles.filter((s) => KIDS_VISUAL_STYLES[s]);
      const jobs = buildKidsGenerationJobs(concepts, validStyles);
      if (!jobs.length) {
        return res.status(400).json({ message: "No valid concept/style combinations" });
      }

      const created: any[] = [];
      for (const job of jobs) {
        const heygenResult = await generateVideoAgent(job.prompt);
        const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;
        const videoAd = await storage.createVideoAd({
          userId,
          heygenVideoId: heygenVideoId || null,
          status: heygenVideoId ? "processing" : "error",
          prompt: `[KIDS ${job.style}] ${job.title}\n\n${job.prompt}`,
          avatarId: null,
          voiceId: null,
          targetUrl: null,
          videoUrl: null,
          thumbnailUrl: null,
          duration: job.durationSeconds,
          errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen — check HEYGEN_API_KEY",
        });
        created.push({
          conceptId: job.concept.id,
          style: job.style,
          title: job.title,
          durationMinutes: job.concept.durationMinutes,
          videoAd,
          heygenResult,
        });
      }

      const maxMins = Math.max(...concepts.map((c) => c.durationMinutes || 1));
      const renderNote =
        maxMins >= 5
          ? "Long videos (5 min) may take 20–40 min in HeyGen."
          : maxMins >= 3
            ? "3-min videos may take 15–25 min in HeyGen."
            : "Videos render in HeyGen (5–15 min).";

      res.json({
        created,
        concepts,
        count: created.length,
        durationMinutes,
        note: `${renderNote} Refresh, preview, then Upload to YouTube.`,
      });
    } catch (err: any) {
      console.error("kids shorts generate error:", err);
      res.status(500).json({ message: err.message || "Generate failed" });
    }
  });

  async function getValidSocialToken(userId: string, provider: "youtube" | "pinterest") {
    const { db } = await import("./db");
    const [row] = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, provider)));
    if (!row) return null;

    const expired =
      row.expiresAt && row.expiresAt.getTime() < Date.now() + 60_000;
    if (!expired) return row;

    if (!row.refreshToken) return row;

    try {
      if (provider === "youtube") {
        const refreshed = await refreshYouTubeToken(row.refreshToken);
        const expiresAt = refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000)
          : null;
        const [updated] = await db
          .update(socialConnections)
          .set({
            accessToken: refreshed.access_token,
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, row.id))
          .returning();
        return updated;
      } else {
        const refreshed = await refreshPinterestToken(row.refreshToken);
        const expiresAt = refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000)
          : null;
        const [updated] = await db
          .update(socialConnections)
          .set({
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token || row.refreshToken,
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, row.id))
          .returning();
        return updated;
      }
    } catch (err) {
      console.error(`refresh ${provider} token failed:`, err);
      return row;
    }
  }

  const oauthStates = new Map<string, { provider: string; userId: string; createdAt: number }>();

  app.get("/api/admin/social/status", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const yt = await getValidSocialToken(userId, "youtube");
      const pin = await getValidSocialToken(userId, "pinterest");
      res.json({
        youtube: {
          configured: youtubeConfigured(),
          connected: !!yt,
          accountLabel: yt?.accountLabel || null,
          accountId: yt?.accountId || null,
        },
        pinterest: {
          configured: pinterestConfigured(),
          connected: !!pin,
          accountLabel: pin?.accountLabel || null,
          accountId: pin?.accountId || null,
          profileUrl: "https://www.pinterest.com/morris_damond/",
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/youtube/connect", isAuthenticated, requireAdmin, (req, res) => {
    if (!youtubeConfigured()) {
      return res.status(400).json({
        message:
          "Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env (Google Cloud OAuth, YouTube Data API enabled).",
      });
    }
    const userId = getUserId(req)!;
    const state = crypto.randomBytes(16).toString("hex");
    oauthStates.set(state, { provider: "youtube", userId, createdAt: Date.now() });
    const host = req.get("host") || undefined;
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
    res.redirect(getYouTubeAuthUrl(state, host, proto));
  });

  app.get("/api/admin/youtube/callback", async (req, res) => {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state) return res.status(400).send("Missing code/state");
      const st = oauthStates.get(state);
      oauthStates.delete(state);
      if (!st || st.provider !== "youtube" || Date.now() - st.createdAt > 600000) {
        return res.status(400).send("Invalid or expired OAuth state — try Connect again while logged in.");
      }

      const host = req.get("host") || undefined;
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
      const tokens = await exchangeYouTubeCode(code, host, proto);
      const channel = await getYouTubeChannel(tokens.access_token);
      const userId = st.userId;
      const { db } = await import("./db");

      const existing = await db
        .select()
        .from(socialConnections)
        .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "youtube")));

      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null;
      const values = {
        userId,
        provider: "youtube" as const,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || existing[0]?.refreshToken || null,
        expiresAt,
        accountLabel: channel.title || "YouTube",
        accountId: channel.id || null,
        updatedAt: new Date(),
      };

      if (existing[0]) {
        await db.update(socialConnections).set(values).where(eq(socialConnections.id, existing[0].id));
      } else {
        await db.insert(socialConnections).values(values);
      }

      res.redirect("/admin/youtube-studio?youtube=connected");
    } catch (err: any) {
      console.error("youtube callback error:", err);
      res.redirect(`/admin/youtube-studio?youtube=error&msg=${encodeURIComponent(err.message || "failed")}`);
    }
  });

  app.post("/api/admin/youtube/disconnect", isAuthenticated, requireAdmin, async (req, res) => {
    const userId = getUserId(req)!;
    const { db } = await import("./db");
    await db
      .delete(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "youtube")));
    res.json({ ok: true });
  });

  app.post("/api/admin/youtube/upload", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { videoAdId, title, description, privacyStatus, tags } = req.body;
      if (!videoAdId) return res.status(400).json({ message: "videoAdId required" });

      const conn = await getValidSocialToken(userId, "youtube");
      if (!conn) return res.status(400).json({ message: "Connect YouTube first" });

      const videoAd = await storage.getVideoAd(parseInt(videoAdId, 10));
      if (!videoAd || videoAd.userId !== userId) return res.status(404).json({ message: "Video not found" });
      if (!videoAd.videoUrl || videoAd.status !== "completed") {
        return res.status(400).json({ message: "Video must be completed with a URL" });
      }

      const uploaded = await uploadYouTubeVideo({
        accessToken: conn.accessToken,
        videoUrl: videoAd.videoUrl,
        title: title || videoAd.prompt.slice(0, 80) || "LinksShrink video",
        description: description || videoAd.prompt,
        privacyStatus: privacyStatus || "private",
        tags: tags || ["LinksShrink", "Shorts"],
      });

      res.json({ ok: true, ...uploaded });
    } catch (err: any) {
      console.error("youtube upload error:", err);
      res.status(500).json({ message: err.message || "Upload failed" });
    }
  });

  app.get("/api/admin/pinterest/connect", isAuthenticated, requireAdmin, (req, res) => {
    if (!pinterestConfigured()) {
      return res.status(400).json({
        message:
          "Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env (developers.pinterest.com). Redirect URI must match.",
      });
    }
    const userId = getUserId(req)!;
    const state = crypto.randomBytes(16).toString("hex");
    oauthStates.set(state, { provider: "pinterest", userId, createdAt: Date.now() });
    const host = req.get("host") || undefined;
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
    res.redirect(getPinterestAuthUrl(state, host, proto));
  });

  app.get("/api/admin/pinterest/callback", async (req, res) => {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state) return res.status(400).send("Missing code/state");
      const st = oauthStates.get(state);
      oauthStates.delete(state);
      if (!st || st.provider !== "pinterest" || Date.now() - st.createdAt > 600000) {
        return res.status(400).send("Invalid or expired OAuth state — try Connect again while logged in.");
      }

      const host = req.get("host") || undefined;
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
      const tokens = await exchangePinterestCode(code, host, proto);
      const profile = await getPinterestUser(tokens.access_token);
      const userId = st.userId;
      const { db } = await import("./db");

      const existing = await db
        .select()
        .from(socialConnections)
        .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "pinterest")));

      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null;
      const values = {
        userId,
        provider: "pinterest" as const,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || existing[0]?.refreshToken || null,
        expiresAt,
        accountLabel: profile.username ? `@${profile.username}` : "Pinterest",
        accountId: profile.id || null,
        metaJson: JSON.stringify({ profileUrl: "https://www.pinterest.com/morris_damond/" }),
        updatedAt: new Date(),
      };

      if (existing[0]) {
        await db.update(socialConnections).set(values).where(eq(socialConnections.id, existing[0].id));
      } else {
        await db.insert(socialConnections).values(values);
      }

      res.redirect("/admin/youtube-studio?pinterest=connected");
    } catch (err: any) {
      console.error("pinterest callback error:", err);
      res.redirect(`/admin/youtube-studio?pinterest=error&msg=${encodeURIComponent(err.message || "failed")}`);
    }
  });

  app.post("/api/admin/pinterest/disconnect", isAuthenticated, requireAdmin, async (req, res) => {
    const userId = getUserId(req)!;
    const { db } = await import("./db");
    await db
      .delete(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.provider, "pinterest")));
    res.json({ ok: true });
  });

  app.get("/api/admin/pinterest/boards", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const conn = await getValidSocialToken(userId, "pinterest");
      if (!conn) return res.status(400).json({ message: "Connect Pinterest first" });
      const boards = await listPinterestBoards(conn.accessToken);
      res.json(boards);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to list boards" });
    }
  });

  app.post("/api/admin/pinterest/pin", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { videoAdId, boardId, title, description, link, imageUrl } = req.body;
      if (!boardId) return res.status(400).json({ message: "boardId required" });

      const conn = await getValidSocialToken(userId, "pinterest");
      if (!conn) return res.status(400).json({ message: "Connect Pinterest first" });

      let pin;
      if (videoAdId) {
        const videoAd = await storage.getVideoAd(parseInt(videoAdId, 10));
        if (!videoAd || videoAd.userId !== userId) return res.status(404).json({ message: "Video not found" });
        if (videoAd.videoUrl && videoAd.status === "completed") {
          pin = await createPinterestVideoPin({
            accessToken: conn.accessToken,
            boardId,
            title: title || videoAd.prompt.slice(0, 80) || "LinksShrink pin",
            description: description || videoAd.prompt,
            link: link || "https://www.pinterest.com/morris_damond/",
            videoUrl: videoAd.videoUrl,
            coverImageUrl: videoAd.thumbnailUrl || undefined,
          });
        } else if (videoAd.thumbnailUrl || imageUrl) {
          pin = await createPinterestImagePin({
            accessToken: conn.accessToken,
            boardId,
            title: title || "LinksShrink pin",
            description: description || videoAd.prompt,
            link: link || "https://www.pinterest.com/morris_damond/",
            imageUrl: imageUrl || videoAd.thumbnailUrl!,
          });
        } else {
          return res.status(400).json({ message: "Video/thumbnail not ready" });
        }
      } else if (imageUrl) {
        pin = await createPinterestImagePin({
          accessToken: conn.accessToken,
          boardId,
          title: title || "LinksShrink pin",
          description: description || "",
          link: link || "https://www.pinterest.com/morris_damond/",
          imageUrl,
        });
      } else {
        return res.status(400).json({ message: "videoAdId or imageUrl required" });
      }

      res.json({ ok: true, ...pin });
    } catch (err: any) {
      console.error("pinterest pin error:", err);
      res.status(500).json({ message: err.message || "Pin failed" });
    }
  });

  // ——— Easy video editor (authenticated customers + admin) ———
  app.get("/api/video-ads/edit-projects", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { db } = await import("./db");
      const projects = await db
        .select()
        .from(videoEditProjects)
        .where(eq(videoEditProjects.userId, userId))
        .orderBy(desc(videoEditProjects.updatedAt))
        .limit(50);
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to list edit projects" });
    }
  });

  app.post("/api/video-ads/edit-projects", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const {
        title,
        sourceVideoUrl,
        trimStartSec,
        trimEndSec,
        captionText,
        scriptText,
        scenesJson,
        aspectRatio,
        linkedVideoAdId,
      } = req.body;

      const { db } = await import("./db");
      const [project] = await db
        .insert(videoEditProjects)
        .values({
          userId,
          title: title || "Untitled edit",
          sourceVideoUrl: sourceVideoUrl || null,
          trimStartSec: trimStartSec ?? 0,
          trimEndSec: trimEndSec ?? null,
          captionText: captionText || "",
          scriptText: scriptText || "",
          scenesJson: typeof scenesJson === "string" ? scenesJson : JSON.stringify(scenesJson || []),
          aspectRatio: aspectRatio || "9:16",
          linkedVideoAdId: linkedVideoAdId || null,
          status: "draft",
          updatedAt: new Date(),
        })
        .returning();
      res.json(project);
    } catch (err: any) {
      console.error("create edit project error:", err);
      res.status(500).json({ message: err.message || "Failed to create edit project" });
    }
  });

  app.patch("/api/video-ads/edit-projects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const { db } = await import("./db");
      const [existing] = await db.select().from(videoEditProjects).where(eq(videoEditProjects.id, id));
      if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Not found" });

      const updates: any = { updatedAt: new Date() };
      for (const key of [
        "title",
        "sourceVideoUrl",
        "trimStartSec",
        "trimEndSec",
        "captionText",
        "scriptText",
        "scenesJson",
        "aspectRatio",
        "status",
        "linkedVideoAdId",
      ]) {
        if (req.body[key] !== undefined) {
          updates[key] =
            key === "scenesJson" && typeof req.body[key] !== "string"
              ? JSON.stringify(req.body[key])
              : req.body[key];
        }
      }

      const [updated] = await db
        .update(videoEditProjects)
        .set(updates)
        .where(eq(videoEditProjects.id, id))
        .returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update" });
    }
  });

  app.post(
    "/api/video-ads/edit-projects/upload-video",
    isAuthenticated,
    videoUpload.single("video"),
    async (req, res) => {
      try {
        const userId = getUserId(req)!;
        if (!req.file) return res.status(400).json({ message: "No video uploaded" });
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const url = `${baseUrl}/uploads/${req.file.filename}`;

        const { db } = await import("./db");
        const [project] = await db
          .insert(videoEditProjects)
          .values({
            userId,
            title: req.body.title || req.file.originalname || "Uploaded video",
            sourceVideoUrl: url,
            sourceFilename: req.file.originalname,
            scriptText: req.body.scriptText || "",
            captionText: req.body.captionText || "",
            status: "draft",
            updatedAt: new Date(),
          })
          .returning();

        res.json(project);
      } catch (err: any) {
        console.error("video upload error:", err);
        res.status(500).json({ message: err.message || "Upload failed" });
      }
    }
  );

  app.post("/api/video-ads/edit-projects/:id/regenerate", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const id = parseInt(req.params.id);
      const { avatarId, voiceId, mode } = req.body;
      const { db } = await import("./db");
      const [project] = await db.select().from(videoEditProjects).where(eq(videoEditProjects.id, id));
      if (!project || project.userId !== userId) return res.status(404).json({ message: "Not found" });

      const script =
        project.scriptText ||
        (project.scenesJson
          ? (JSON.parse(project.scenesJson) as { text: string }[]).map((s) => s.text).join("\n\n")
          : "") ||
        project.captionText ||
        project.title;

      const editNotes = [
        project.trimStartSec ? `Trim start: ${project.trimStartSec}s` : null,
        project.trimEndSec ? `Trim end: ${project.trimEndSec}s` : null,
        project.captionText ? `Burned-in captions: ${project.captionText}` : null,
        `Aspect: ${project.aspectRatio || "9:16"}`,
      ]
        .filter(Boolean)
        .join(". ");

      const prompt = `Edit/recreate this video with these easy edits applied: ${editNotes}.
Script:
${script}`;

      let heygenResult: any;
      let scenes: { text: string; backgroundUrl?: string }[] | undefined;
      try {
        scenes = project.scenesJson ? JSON.parse(project.scenesJson) : undefined;
      } catch {
        scenes = undefined;
      }

      if (mode === "avatar" && avatarId && voiceId) {
        const dim =
          project.aspectRatio === "16:9"
            ? { width: 1920, height: 1080 }
            : project.aspectRatio === "1:1"
              ? { width: 1080, height: 1080 }
              : { width: 1080, height: 1920 };
        heygenResult = await generateAvatarVideo(
          avatarId,
          voiceId,
          script,
          undefined,
          dim,
          undefined,
          scenes
        );
      } else {
        heygenResult = await generateVideoAgent(prompt);
      }

      const heygenVideoId = heygenResult?.data?.video_id || heygenResult?.video_id;
      const videoAd = await storage.createVideoAd({
        userId,
        heygenVideoId: heygenVideoId || null,
        status: heygenVideoId ? "processing" : "error",
        prompt,
        avatarId: avatarId || null,
        voiceId: voiceId || null,
        targetUrl: null,
        videoUrl: null,
        thumbnailUrl: null,
        duration: null,
        errorMessage: heygenVideoId ? null : "Failed to submit to HeyGen",
      });

      await db
        .update(videoEditProjects)
        .set({
          status: "regenerating",
          linkedVideoAdId: videoAd.id,
          updatedAt: new Date(),
        })
        .where(eq(videoEditProjects.id, id));

      res.json({ projectId: id, videoAd, heygenResult });
    } catch (err: any) {
      console.error("regenerate edit error:", err);
      res.status(500).json({ message: err.message || "Regenerate failed" });
    }
  });

  app.get("/:shortCode", async (req, res, next) => {
    const { shortCode } = req.params;
    if (shortCode.startsWith("_") || shortCode.includes(".") || shortCode === "api") {
      return next();
    }

    try {
      const urlRecord = await storage.getUrl(shortCode);
      if (!urlRecord) return next();

      const now = new Date();

      if (urlRecord.isExpired || (urlRecord.expiresAt && urlRecord.expiresAt < now)) {
        return res.status(410).send(`
          <html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2>Link Expired</h2><p>This link has expired.</p>
            <a href="/">Go to LinksShrink</a>
          </body></html>
        `);
      }

      if (urlRecord.scheduledAt && urlRecord.scheduledAt > now) {
        return res.status(404).send(`
          <html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2>Link Not Yet Active</h2><p>This link will be active soon.</p>
          </body></html>
        `);
      }

      if (urlRecord.maxClicks && urlRecord.visitCount && urlRecord.visitCount >= urlRecord.maxClicks) {
        return res.status(410).send(`
          <html><body style="font-family:sans-serif;text-align:center;padding:40px">
            <h2>Link Limit Reached</h2><p>This link has reached its maximum number of clicks.</p>
            <a href="/">Go to LinksShrink</a>
          </body></html>
        `);
      }

      if (urlRecord.password) {
        const pw = req.query.pw as string;
        if (!pw) {
          return res.send(`
            <html><head><title>Password Protected Link</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:40px;background:#f9f9f9">
              <div style="max-width:400px;margin:0 auto;background:white;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                <h2>🔒 Password Protected</h2>
                <form method="GET">
                  <input name="pw" type="password" placeholder="Enter password"
                    style="width:100%;padding:10px;margin:12px 0;border:1px solid #ddd;border-radius:6px;font-size:16px"/>
                  <button type="submit" style="width:100%;padding:10px;background:#84cc16;border:none;border-radius:6px;font-size:16px;cursor:pointer">
                    Unlock
                  </button>
                </form>
              </div>
            </body></html>
          `);
        }
        const valid = await storage.verifyPassword(shortCode, pw);
        if (!valid) {
          return res.send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px">
              <h2>🔒 Incorrect Password</h2>
              <form method="GET">
                <input name="pw" type="password" placeholder="Try again"
                  style="padding:10px;margin:12px 0;border:1px solid #ddd;border-radius:6px"/>
                <button type="submit">Unlock</button>
              </form>
            </body></html>
          `);
        }
      }

      const ua = req.headers["user-agent"] || "";
      const { device, browser, os } = parseUserAgent(ua);
      const ipHash = getIpHash(req);

      if (urlRecord.iosDeepLink && /iphone|ipad|ipod/i.test(ua)) {
        await storage.incrementVisit(shortCode);
        await storage.recordAnalytics({ urlId: urlRecord.id, referrer: req.headers.referer || null, userAgent: ua, country: null, city: null, device, browser, os, ipHash });
        return res.redirect(302, urlRecord.iosDeepLink);
      }

      if (urlRecord.androidDeepLink && /android/i.test(ua)) {
        await storage.incrementVisit(shortCode);
        await storage.recordAnalytics({ urlId: urlRecord.id, referrer: req.headers.referer || null, userAgent: ua, country: null, city: null, device, browser, os, ipHash });
        return res.redirect(302, urlRecord.androidDeepLink);
      }

      let targetUrl = urlRecord.originalUrl;

      if (urlRecord.geoRoutes) {
        const geoRoutes = urlRecord.geoRoutes as Record<string, string>;
        const cfCountry = req.headers["cf-ipcountry"] as string;
        const country = cfCountry || req.headers["x-country"] as string || "";
        if (country && geoRoutes[country.toUpperCase()]) {
          targetUrl = geoRoutes[country.toUpperCase()];
        }
      }

      if (urlRecord.abTestUrl && urlRecord.abTestSplit) {
        const roll = Math.random() * 100;
        if (roll < urlRecord.abTestSplit) {
          targetUrl = urlRecord.abTestUrl;
        }
      }

      const utmParams: Record<string, string> = {};
      if (urlRecord.utmSource) utmParams.utm_source = urlRecord.utmSource;
      if (urlRecord.utmMedium) utmParams.utm_medium = urlRecord.utmMedium;
      if (urlRecord.utmCampaign) utmParams.utm_campaign = urlRecord.utmCampaign;
      if (urlRecord.utmTerm) utmParams.utm_term = urlRecord.utmTerm;
      if (urlRecord.utmContent) utmParams.utm_content = urlRecord.utmContent;

      if (Object.keys(utmParams).length > 0) {
        const urlObj = new URL(targetUrl);
        for (const [k, v] of Object.entries(utmParams)) {
          if (!urlObj.searchParams.has(k)) urlObj.searchParams.set(k, v);
        }
        targetUrl = urlObj.toString();
      }

      await storage.incrementVisit(shortCode);
      await storage.recordAnalytics({
        urlId: urlRecord.id,
        referrer: req.headers.referer || null,
        userAgent: ua,
        country: null,
        city: null,
        device,
        browser,
        os,
        ipHash,
      });

      await storage.recordFunnelEvent({
        eventType: "link_clicked",
        page: `/${shortCode}`,
        metadata: { shortCode, originalUrl: urlRecord.originalUrl },
        ipHash,
        userAgent: ua,
        referrer: req.headers.referer || "",
      });

      if (urlRecord.retargetingPixels) {
        const pixels = urlRecord.retargetingPixels;
        const pixelHtml = `
          <html><head><title>Redirecting...</title>
          ${pixels.includes("facebook") ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixels.match(/fb:([A-Za-z0-9]+)/)?.[1] || ""}');fbq('track','PageView');</script>` : ""}
          </head>
          <body>
            <p>Redirecting...</p>
            <script>setTimeout(function(){window.location.href=${JSON.stringify(targetUrl)};},100);</script>
            <noscript><meta http-equiv="refresh" content="0;url=${targetUrl}"></noscript>
          </body></html>`;
        return res.send(pixelHtml);
      }

      return res.redirect(302, targetUrl);
    } catch (err: any) {
      console.error("Redirect error:", err);
      next();
    }
  });

  return httpServer;
}
