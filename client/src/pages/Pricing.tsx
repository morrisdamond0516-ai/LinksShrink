import { useState } from "react";
import { Check, Link2, Lock, Clock, Globe, QrCode, Smartphone, Monitor, Layers, Download, Palette, Calendar, AlertCircle, LogIn, ShoppingCart, Loader2, Target, BarChart3, Split, MapPin, Pencil, Users, Store, Infinity, MousePointerClick, Timer, Hash, ArrowRight, Eye, TrendingUp, DollarSign, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Footer from "@/components/Footer";
import { usePageView, trackFunnelEvent } from "@/hooks/use-funnel";

interface FeatureShowcaseItem {
  title: string;
  description: string;
  features: { text: string; example: string }[];
  visual: React.ReactNode;
}

interface IndividualFeature {
  name: string;
  price: string;
  featureKey: string;
}

const plans = [
  {
    name: "FREE",
    price: "0",
    description: "Essential link shortening for personal use.",
    features: [
      "5 links per month",
      "Basic link shortening",
      "Basic click counting",
      "No premium features",
    ],
    buttonText: "Get Started",
    recommended: false,
    individualFeatures: [] as IndividualFeature[],
  },
  {
    name: "Starter",
    price: "9.50",
    description: "Perfect for growing brands and creators.",
    features: [
      "Unlimited Links",
      "Link Editing",
      "Click Analytics",
      "Custom QR Codes",
      "Custom Slugs",
      "UTM Builder",
      "Link Scheduling",
      "Click Limits",
      "Link-in-Bio Page",
    ],
    buttonText: "Choose Starter",
    recommended: true,
    individualFeatures: [
      { name: "Click Analytics (1 link)", price: "5", featureKey: "analytics_single" },
      { name: "Custom QR Code (1 code)", price: "3", featureKey: "qr_single" },
      { name: "Custom Slug (1 link)", price: "2", featureKey: "slug_single" },
      { name: "UTM Builder (1 link)", price: "3", featureKey: "utm_builder_single" },
      { name: "Link Scheduling (1 link)", price: "3", featureKey: "scheduling_single" },
      { name: "Click Limit (1 link)", price: "2", featureKey: "click_limit_single" },
      { name: "Link-in-Bio Page", price: "10", featureKey: "bio_page" },
    ],
  },
  {
    name: "Pro",
    price: "28.50",
    description: "Advanced marketing tools for professionals.",
    features: [
      "Unlimited Links",
      "Link Editing",
      "Mobile Deep Links",
      "Unlimited Analytics History",
      "Advanced Analytics",
      "Expiring Links",
      "Password Protection",
      "Retargeting Pixels",
      "A/B Testing",
      "Geo-Routing",
      "Conversion Tracking",
    ],
    buttonText: "Go Pro",
    recommended: false,
    individualFeatures: [
      { name: "Advanced Analytics (1 link)", price: "8", featureKey: "advanced_analytics_single" },
      { name: "Expiring Link (1 link)", price: "3", featureKey: "expiring_single" },
      { name: "Password Protection (1 link)", price: "3", featureKey: "password_single" },
      { name: "Retargeting Pixel (1 link)", price: "5", featureKey: "retargeting_single" },
      { name: "A/B Test (1 link)", price: "5", featureKey: "ab_test_single" },
      { name: "Geo Routing (1 link)", price: "5", featureKey: "geo_routing_single" },
      { name: "Conversion Tracking (1 link)", price: "8", featureKey: "conversion_tracking" },
      { name: "Mobile Deep Link (1 link)", price: "3", featureKey: "deep_link_single" },
    ],
  },
  {
    name: "Enterprise",
    price: "48.50",
    description: "Maximum scale for agencies and teams.",
    features: [
      "Unlimited Links",
      "Link Editing",
      "Mobile Deep Links",
      "Unlimited Analytics History",
      "3,000 Bulk Links",
      "Full API Access",
      "Team Workspaces",
      "All 20 Premium Tools",
      "Priority Support",
      "Bio Page Shop",
    ],
    buttonText: "Get Enterprise",
    recommended: false,
    individualFeatures: [
      { name: "Bulk Links (100 links)", price: "10", featureKey: "bulk_100" },
      { name: "API Access (24hr pass)", price: "15", featureKey: "api_day_pass" },
      { name: "AI Video Ad 15s", price: "5", featureKey: "video_ad_15s" },
      { name: "AI Video Ad 30s", price: "8", featureKey: "video_ad_30s" },
      { name: "AI Video Ad 60s", price: "12", featureKey: "video_ad_60s" },
      { name: "AI Ad Package 15s (3 videos + 3 images)", price: "15", featureKey: "video_ad_package_15s" },
      { name: "AI Ad Package 30s (3 videos + 3 images)", price: "20", featureKey: "video_ad_package_30s" },
      { name: "AI Ad Package 60s (3 videos + 3 images)", price: "28", featureKey: "video_ad_package_60s" },
      { name: "AI Video Ad 2 min", price: "20", featureKey: "video_ad_120s" },
      { name: "AI Video Ad 3 min", price: "28", featureKey: "video_ad_180s" },
      { name: "AI Ad Package 2 min (3 videos + 3 images)", price: "48", featureKey: "video_ad_package_120s" },
      { name: "AI Ad Package 3 min (3 videos + 3 images)", price: "65", featureKey: "video_ad_package_180s" },
    ],
  },
];

const featureShowcase: FeatureShowcaseItem[] = [
  {
    title: "Detailed Analytics Dashboard",
    description: "See exactly how your links are performing with real-time data.",
    features: [
      { text: "Real-time Traffic Monitoring", example: "Track total clicks, unique visitors, and average latency in real-time with percentage growth indicators." },
      { text: "Geographic Distribution", example: "See exactly where your traffic comes from with country-level breakdowns and visual progress bars." },
      { text: "Device Breakdown", example: "Understand your audience with detailed mobile, desktop, and other device usage statistics." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10">
            <span className="text-slate-500 text-[10px] font-bold uppercase">Total Clicks</span>
            <div className="text-xl font-black text-lime-400 mt-1">12,842</div>
            <div className="text-[10px] text-green-500 mt-1">+12% from last week</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10">
            <span className="text-slate-500 text-[10px] font-bold uppercase">Unique Visitors</span>
            <div className="text-xl font-black text-white mt-1">8,211</div>
            <div className="text-[10px] text-slate-500 mt-1">Global reach</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10">
            <span className="text-slate-500 text-[10px] font-bold uppercase">Avg. Latency</span>
            <div className="text-xl font-black text-white mt-1">12ms</div>
            <div className="text-[10px] text-lime-500 mt-1">Optimal</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Globe className="w-3 h-3 text-blue-400" /> Geographic Distribution
            </div>
            {[
              { label: 'United States', val: 65, color: 'bg-blue-500' },
              { label: 'United Kingdom', val: 15, color: 'bg-indigo-500' },
              { label: 'Germany', val: 10, color: 'bg-purple-500' }
            ].map(geo => (
              <div key={geo.label} className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{geo.label}</span>
                  <span className="text-white font-bold">{geo.val}%</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className={`${geo.color} h-full`} style={{ width: `${geo.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-3">
              <Smartphone className="w-3 h-3 text-lime-400" /> Device Breakdown
            </div>
            <div className="flex items-center justify-around py-2">
              <div className="text-center space-y-1">
                <Smartphone className="w-6 h-6 text-lime-400 mx-auto" />
                <p className="font-bold text-sm">68%</p>
                <p className="text-[9px] text-slate-500">Mobile</p>
              </div>
              <div className="text-center space-y-1">
                <Monitor className="w-6 h-6 text-white mx-auto" />
                <p className="font-bold text-sm">24%</p>
                <p className="text-[9px] text-slate-500">Desktop</p>
              </div>
              <div className="text-center space-y-1">
                <Globe className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="font-bold text-sm">8%</p>
                <p className="text-[9px] text-slate-500">Other</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Smart QR Codes",
    description: "Generate custom branded QR codes for print and web with full control.",
    features: [
      { text: "Custom Color Selection", example: "Use a color picker to match QR codes to your exact brand hex codes." },
      { text: "High-Resolution Downloads", example: "Download 4000x4000px PNG files perfect for large-scale printing." },
      { text: "Logo Integration", example: "Your company logo is centered perfectly within the QR code." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-4 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
            <div className="text-xs font-bold text-white">Configuration</div>
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400">Destination URL</div>
              <div className="h-9 bg-black rounded-lg border border-white/10 flex items-center px-3 text-[10px] text-slate-500">https://yourlink.com</div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400">Brand Color</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-lime-400 rounded-lg border border-white/20" />
                <span className="text-[10px] font-mono text-slate-400">#a3e635</span>
              </div>
            </div>
            <div className="h-9 bg-lime-400 rounded-lg flex items-center justify-center gap-2 text-[10px] text-black font-bold">
              <Palette className="w-3 h-3" /> Apply Branding
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-3">
            <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center relative border-4 border-slate-200">
              <div className="grid grid-cols-12 gap-0.5 p-2 w-full h-full text-lime-500">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-[1px] ${[0,1,2,3,4,5,6,12,18,24,30,36,42,43,44,45,46,47,48,54,60,66,72,78,84,5,11,17,23,29,35,41,47,53,59,65,71,77,83,89,95,96,97,98,99,100,101,102,108,114,120,126,132,138,139,140,141,142,143].includes(i) ? 'bg-current' : 'bg-transparent'}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg border-2 border-lime-500 flex items-center justify-center shadow-xl">
                  <Link2 className="w-4 h-4 text-lime-500" />
                </div>
              </div>
            </div>
            <div className="w-full h-9 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-[10px] text-slate-700 font-bold">
              <Download className="w-3 h-3" /> Download PNG (4000px)
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Password Protection",
    description: "Secure your links with enterprise-grade access control and expiration.",
    features: [
      { text: "Password Protection", example: "Set a password that visitors must enter before accessing the destination URL." },
      { text: "Managed Access Control", example: "Restrict access to specific referrers or IP ranges for additional security." },
      { text: "Link Expiration", example: "Set automatic expiration dates so links deactivate after a specific time." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Password Protection</div>
            <div className="text-xs text-slate-500">Enterprise-grade access control</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Target URL</div>
            <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3 gap-2">
              <Link2 className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">https://example.com/sensitive-doc</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Set Link Password</div>
            <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3 justify-between">
              <span className="text-xs text-slate-600 font-mono tracking-widest">••••••••••••</span>
              <Lock className="w-3 h-3 text-slate-500" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Managed Access Control</div>
              <div className="text-[10px] text-slate-500">Only allow specific referrers or IPs</div>
            </div>
            <div className="w-8 h-4 bg-lime-400 rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>
        <div className="h-10 bg-lime-400 rounded-lg flex items-center justify-center text-xs text-black font-bold">
          Save Security Settings
        </div>
      </div>
    )
  },
  {
    title: "Bulk Link Shortener",
    description: "Shorten up to 3,000 links at once with optional password protection.",
    features: [
      { text: "Bulk URL Input", example: "Enter multiple URLs (one per line) to shorten them all in a single batch process." },
      { text: "Batch Password Protection", example: "Apply a single password to protect all links in the batch at once." },
      { text: "Export Results", example: "Copy all shortened links to your clipboard or export as CSV." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2 rounded-xl">
            <Layers className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Bulk Link Shortener</div>
            <div className="text-xs text-slate-500">Shorten up to 3,000 links at once</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-3">
          <div className="text-xs text-slate-400">Enter URLs (one per line)</div>
          <div className="h-24 bg-black rounded-lg border border-white/10 p-3 text-[10px] font-mono text-slate-500 leading-relaxed">
            https://example.com/page1<br/>
            https://example.com/page2<br/>
            https://example.com/page3
          </div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-500/10 p-1.5 rounded">
              <Lock className="w-3 h-3 text-red-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Password Protection</div>
              <div className="text-[10px] text-slate-500">Apply to all links</div>
            </div>
          </div>
          <div className="w-8 h-4 bg-slate-600 rounded-full relative">
            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full" />
          </div>
        </div>
        <div className="h-10 bg-lime-400 rounded-lg flex items-center justify-center text-xs text-black font-bold">
          Generate Bulk Links
        </div>
        <div className="bg-slate-900 rounded-lg border border-white/10 overflow-hidden">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
            <span className="text-xs font-bold text-white">Results (3)</span>
            <span className="text-[10px] text-lime-400">Copy All</span>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { orig: 'https://example.com/page1', short: 'lnk.sh/x7y' },
              { orig: 'https://example.com/page2', short: 'lnk.sh/a2b' },
            ].map((r, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 truncate">{r.orig}</div>
                  <div className="text-xs font-bold text-lime-400">{r.short}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Full API Access",
    description: "Integrate link shortening directly into your own applications and workflows.",
    features: [
      { text: "RESTful Endpoint Support", example: "Send POST requests to our high-speed API to generate links programmatically in milliseconds." },
      { text: "Secure API Key Management", example: "Generate, rotate, and manage multiple API keys for different environments like Dev, Staging, and Production." },
      { text: "Detailed API Usage Logs", example: "Track every single API call made by your systems with detailed status codes and response times." }
    ],
    visual: (
      <div className="bg-slate-900 rounded-xl p-6 font-mono text-[10px] text-blue-300 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-slate-500 text-[9px] font-bold">POST /api/v1/shorten</span>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-slate-500">// Request Payload</div>
            <div className="text-white">
              <span className="text-purple-400">{"{"}</span><br />
              <span className="pl-4 text-blue-400">"url"</span>: <span className="text-green-400">"https://your-product.com/deal"</span>,<br />
              <span className="pl-4 text-blue-400">"domain"</span>: <span className="text-green-400">"brand.link"</span><br />
              <span className="text-purple-400">{"}"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">// Response 201 Created</div>
            <div className="text-white bg-slate-800/50 p-2 rounded">
              <span className="text-purple-400">{"{"}</span><br />
              <span className="pl-4 text-blue-400">"shortUrl"</span>: <span className="text-green-400">"https://brand.link/x7y"</span>,<br />
              <span className="pl-4 text-blue-400">"id"</span>: <span className="text-yellow-400">"lnk_9281"</span><br />
              <span className="text-purple-400">{"}"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-green-500 font-bold">LATENCY: 42ms</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">AUTH: Bearer ****</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Retargeting Pixels",
    description: "Build custom audiences by embedding tracking pixels in your short links.",
    features: [
      { text: "Multi-Platform Support", example: "Add Facebook, Google, and TikTok retargeting pixels to any link with a single click." },
      { text: "Audience Building", example: "Every click automatically adds visitors to your retargeting audiences for future ad campaigns." },
      { text: "Zero-Redirect Delay", example: "Pixels fire seamlessly during redirect — visitors never notice the tracking." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2 rounded-xl">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Retargeting Pixels</div>
            <div className="text-xs text-slate-500">Build audiences automatically</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-3">
          {[
            { platform: "Facebook Pixel", id: "FB-291847362", color: "text-blue-400", bg: "bg-blue-500/10", active: true },
            { platform: "Google Ads Tag", id: "AW-384756291", color: "text-yellow-400", bg: "bg-yellow-500/10", active: true },
            { platform: "TikTok Pixel", id: "TT-938271645", color: "text-pink-400", bg: "bg-pink-500/10", active: false }
          ].map((pixel) => (
            <div key={pixel.platform} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`${pixel.bg} p-1.5 rounded`}>
                  <Target className={`w-3 h-3 ${pixel.color}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{pixel.platform}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{pixel.id}</div>
                </div>
              </div>
              <div className={`w-8 h-4 ${pixel.active ? 'bg-lime-400' : 'bg-slate-600'} rounded-full relative`}>
                <div className={`absolute ${pixel.active ? 'right-0.5' : 'left-0.5'} top-0.5 w-3 h-3 ${pixel.active ? 'bg-white' : 'bg-slate-400'} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-white/10 flex items-center gap-3">
          <div className="bg-green-500/10 p-1.5 rounded">
            <Eye className="w-3 h-3 text-green-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">2,847 audience members added</div>
            <div className="text-[10px] text-slate-500">Last 30 days across all platforms</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "UTM Builder",
    description: "Auto-append UTM parameters to every click for precise campaign tracking.",
    features: [
      { text: "5 UTM Parameters", example: "Set source, medium, campaign, term, and content — all auto-appended to the destination URL." },
      { text: "Google Analytics Ready", example: "UTM parameters appear directly in your Google Analytics reports for seamless attribution." },
      { text: "No Manual Work", example: "Set once per link — every visitor automatically gets the correct UTM parameters appended." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-xl">
            <Hash className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">UTM Parameter Builder</div>
            <div className="text-xs text-slate-500">Auto-append tracking parameters</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-3">
          {[
            { label: "utm_source", value: "newsletter", placeholder: "e.g., newsletter" },
            { label: "utm_medium", value: "email", placeholder: "e.g., email" },
            { label: "utm_campaign", value: "spring_sale_2026", placeholder: "e.g., spring_sale" },
            { label: "utm_term", value: "discount", placeholder: "e.g., keyword" },
            { label: "utm_content", value: "hero_cta", placeholder: "e.g., hero_button" }
          ].map((param) => (
            <div key={param.label} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-orange-400 w-24 shrink-0">{param.label}</span>
              <div className="flex-1 h-8 bg-black rounded border border-white/10 flex items-center px-2">
                <span className="text-[10px] text-white">{param.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-white/10">
          <div className="text-[10px] text-slate-500 mb-1">Generated URL Preview</div>
          <div className="text-[9px] font-mono text-lime-400 break-all">
            https://example.com/sale?utm_source=<span className="text-orange-400">newsletter</span>&utm_medium=<span className="text-orange-400">email</span>&utm_campaign=<span className="text-orange-400">spring_sale_2026</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "A/B Testing",
    description: "Split traffic between two destinations to find what converts best.",
    features: [
      { text: "Configurable Split Ratio", example: "Send 50/50, 70/30, or any custom percentage split between two destination URLs." },
      { text: "Real-Time Results", example: "See click counts for each variation in real-time to determine the winner faster." },
      { text: "One-Link Testing", example: "Use a single short link to test two landing pages — no need to create separate campaigns." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-xl">
            <Split className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">A/B Test Configuration</div>
            <div className="text-xs text-slate-500">Split traffic automatically</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-[10px] font-bold text-black">A</div>
              <div className="flex-1 h-8 bg-black rounded border border-white/10 flex items-center px-2">
                <span className="text-[10px] text-white">https://example.com/page-v1</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-[10px] font-bold text-white">B</div>
              <div className="flex-1 h-8 bg-black rounded border border-white/10 flex items-center px-2">
                <span className="text-[10px] text-white">https://example.com/page-v2</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Traffic Split</span>
              <span className="text-white font-bold">60% / 40%</span>
            </div>
            <div className="h-3 bg-black rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full" style={{ width: '60%' }} />
              <div className="bg-purple-500 h-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-cyan-500/20">
            <div className="text-[10px] text-slate-500">Variant A</div>
            <div className="text-lg font-bold text-cyan-400">3,412</div>
            <div className="text-[10px] text-green-400">+8.2% CTR</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-purple-500/20">
            <div className="text-[10px] text-slate-500">Variant B</div>
            <div className="text-lg font-bold text-purple-400">2,274</div>
            <div className="text-[10px] text-slate-400">+5.1% CTR</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Geo-Routing",
    description: "Route visitors to different destinations based on their country.",
    features: [
      { text: "Country-Level Targeting", example: "Send US visitors to your .com site, UK visitors to .co.uk, and German visitors to .de." },
      { text: "Automatic Detection", example: "Country is detected automatically from browser headers — no extra setup required." },
      { text: "Default Fallback", example: "Visitors from non-targeted countries are sent to your default destination URL." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-2 rounded-xl">
            <MapPin className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Geo-Routing Rules</div>
            <div className="text-xs text-slate-500">Country-based redirects</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-2">
          {[
            { flag: "🇺🇸", country: "United States", url: "https://example.com/us", clicks: "4,281" },
            { flag: "🇬🇧", country: "United Kingdom", url: "https://example.co.uk", clicks: "1,892" },
            { flag: "🇩🇪", country: "Germany", url: "https://example.de", clicks: "967" },
            { flag: "🇫🇷", country: "France", url: "https://example.fr", clicks: "634" }
          ].map((route) => (
            <div key={route.country} className="flex items-center justify-between p-2.5 bg-black/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">{route.flag}</span>
                <div>
                  <div className="text-xs font-bold text-white">{route.country}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{route.url}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-lime-400">{route.clicks}</div>
                <div className="text-[10px] text-slate-500">clicks</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
          <Globe className="w-3 h-3 text-slate-400" />
          <div className="text-[10px] text-slate-400">Default: <span className="text-white font-mono">https://example.com</span></div>
        </div>
      </div>
    )
  },
  {
    title: "Link Scheduling",
    description: "Schedule links to activate at a future date and time.",
    features: [
      { text: "Future Activation", example: "Set your link to go live at a specific date and time — perfect for product launches and sales." },
      { text: "Pre-Activation Page", example: "Visitors who click before activation see a 'not yet available' message instead of an error." },
      { text: "Timezone Support", example: "Schedule in your local timezone with precise hour and minute control." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl">
            <Timer className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Link Scheduling</div>
            <div className="text-xs text-slate-500">Time-based activation</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Activation Date & Time</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3 gap-2">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white">Mar 15, 2026</span>
              </div>
              <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3 gap-2">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white">9:00 AM EST</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex items-center gap-3">
            <Timer className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs font-bold text-white">Activates in 10 days, 4 hours</div>
              <div className="text-[10px] text-blue-400">Link will go live automatically</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Scheduled Links</div>
          {[
            { name: "Spring Sale Launch", date: "Mar 15, 9:00 AM", status: "Scheduled" },
            { name: "Product Hunt Day", date: "Mar 20, 12:01 AM", status: "Scheduled" },
            { name: "Newsletter Promo", date: "Mar 1, 8:00 AM", status: "Active" }
          ].map((link) => (
            <div key={link.name} className="flex items-center justify-between p-2 bg-black/50 rounded border border-white/5">
              <div>
                <div className="text-[10px] font-bold text-white">{link.name}</div>
                <div className="text-[9px] text-slate-500">{link.date}</div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${link.status === 'Active' ? 'bg-lime-400/10 text-lime-400' : 'bg-blue-500/10 text-blue-400'}`}>{link.status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Click Limits",
    description: "Set maximum clicks before a link automatically deactivates.",
    features: [
      { text: "Automatic Deactivation", example: "Link stops working after reaching the set click limit — great for limited offers." },
      { text: "Real-Time Counter", example: "See how many clicks remain before the link expires with a live progress bar." },
      { text: "Scarcity Marketing", example: "Create urgency with 'first 100 clicks only' promotions that enforce the limit automatically." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl">
            <MousePointerClick className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Click Limits</div>
            <div className="text-xs text-slate-500">Auto-deactivate after N clicks</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Maximum Clicks</div>
            <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3">
              <span className="text-sm font-bold text-white">100</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-bold">73 / 100 clicks</span>
            </div>
            <div className="h-3 bg-black rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-lime-400 to-yellow-400 h-full rounded-full" style={{ width: '73%' }} />
            </div>
            <div className="text-[10px] text-yellow-400">27 clicks remaining</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10 text-center">
            <div className="text-lg font-bold text-lime-400">73%</div>
            <div className="text-[10px] text-slate-500">Utilized</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10 text-center">
            <div className="text-lg font-bold text-white">~4 hrs</div>
            <div className="text-[10px] text-slate-500">Est. remaining</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Link-in-Bio Pages",
    description: "Create beautiful landing pages with all your important links in one place.",
    features: [
      { text: "6 Premium Themes", example: "Choose from Default, Ocean, Sunset, Forest, Purple, and Minimal themes to match your brand." },
      { text: "Social Links Integration", example: "Add links to Instagram, Twitter, YouTube, TikTok, and more with auto-detected platform icons." },
      { text: "Custom Branding", example: "Set your own title, description, and avatar for a fully personalized bio page." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-4 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-b from-purple-900 to-slate-900 rounded-xl p-4 border border-purple-500/20 space-y-3">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-lg font-bold text-white">JS</div>
              <div className="text-xs font-bold text-white">Jane Smith</div>
              <div className="text-[9px] text-purple-300">Digital creator & designer</div>
            </div>
            <div className="space-y-1.5">
              {["My Portfolio", "Latest Blog Post", "Book a Call", "Free Template"].map((link) => (
                <div key={link} className="h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-[10px] font-bold text-white border border-white/10 hover:bg-white/20 transition-colors">
                  {link}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-3 pt-1">
              {["IG", "TW", "YT"].map((s) => (
                <div key={s} className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[8px] text-purple-300 font-bold">{s}</div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-white">Choose Theme</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { name: "Default", color: "bg-slate-700" },
                { name: "Ocean", color: "bg-blue-700" },
                { name: "Sunset", color: "bg-orange-700" },
                { name: "Forest", color: "bg-green-700" },
                { name: "Purple", color: "bg-purple-700 ring-2 ring-lime-400" },
                { name: "Minimal", color: "bg-white" }
              ].map((theme) => (
                <div key={theme.name} className="text-center space-y-1">
                  <div className={`w-full h-8 ${theme.color} rounded-lg border border-white/10`} />
                  <div className="text-[8px] text-slate-500">{theme.name}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-white mt-2">Add Links</div>
            <div className="space-y-1.5">
              <div className="h-7 bg-slate-900 rounded border border-white/10 flex items-center px-2 text-[9px] text-slate-500">Link title...</div>
              <div className="h-7 bg-slate-900 rounded border border-white/10 flex items-center px-2 text-[9px] text-slate-500">https://...</div>
            </div>
            <div className="h-7 bg-lime-400 rounded flex items-center justify-center text-[9px] text-black font-bold">
              Publish Page
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Bio Page Shop",
    description: "Sell digital products directly from your link-in-bio page.",
    features: [
      { text: "Product Listings", example: "Add digital products with names, descriptions, prices, and download links right on your bio page." },
      { text: "Integrated Payments", example: "Customers purchase directly through Stripe — funds go straight to your account." },
      { text: "Unlimited Products", example: "List as many digital products as you want on a single bio page — no product limits." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl">
            <Store className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Bio Page Shop</div>
            <div className="text-xs text-slate-500">Sell digital products from your bio page</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-3">
          {[
            { name: "Social Media Template Pack", price: "$29", sales: "142 sold", icon: "📦" },
            { name: "YouTube Thumbnail Presets", price: "$19", sales: "87 sold", icon: "🎨" },
            { name: "Content Calendar (Notion)", price: "$9", sales: "234 sold", icon: "📅" }
          ].map((product) => (
            <div key={product.name} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{product.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{product.name}</div>
                  <div className="text-[10px] text-slate-500">{product.sales}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-400">{product.price}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10 text-center">
            <div className="text-lg font-bold text-emerald-400">$2,847</div>
            <div className="text-[10px] text-slate-500">Revenue this month</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-white/10 text-center">
            <div className="text-lg font-bold text-white">463</div>
            <div className="text-[10px] text-slate-500">Total sales</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Conversion Tracking",
    description: "Track conversions and revenue generated from each short link.",
    features: [
      { text: "Revenue Attribution", example: "See exactly how much revenue each link generates with per-click value calculations." },
      { text: "API Integration", example: "Send conversion events from your app via a simple POST request to our tracking API." },
      { text: "Funnel Analysis", example: "Track the full journey from click to conversion with detailed funnel breakdowns." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2 rounded-xl">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Conversion Tracking</div>
            <div className="text-xs text-slate-500">Revenue attribution per link</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/50 p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Clicks</div>
              <div className="text-sm font-bold text-white">8,421</div>
            </div>
            <div className="bg-black/50 p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Conversions</div>
              <div className="text-sm font-bold text-lime-400">342</div>
            </div>
            <div className="bg-black/50 p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Revenue</div>
              <div className="text-sm font-bold text-yellow-400">$12,847</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Conversion Rate</span>
              <span className="text-lime-400 font-bold">4.06%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden">
              <div className="bg-lime-400 h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-white/10 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Top Converting Links</div>
          {[
            { code: "/spring-sale", conv: "148", revenue: "$5,920", rate: "6.2%" },
            { code: "/free-trial", conv: "112", revenue: "$4,480", rate: "3.8%" },
            { code: "/webinar", conv: "82", revenue: "$2,447", rate: "2.9%" }
          ].map((link) => (
            <div key={link.code} className="flex items-center justify-between p-2 bg-black/50 rounded border border-white/5">
              <div className="flex items-center gap-2">
                <Link2 className="w-3 h-3 text-lime-400" />
                <span className="text-[10px] font-mono text-white">{link.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">{link.conv} conv</span>
                <span className="text-[10px] font-bold text-yellow-400">{link.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Link Editing",
    description: "Change your link's destination URL anytime without creating a new short link.",
    features: [
      { text: "Edit Destination", example: "Update where a link points without changing the short URL — keep all existing shares working." },
      { text: "Campaign Updates", example: "Swap landing pages mid-campaign without reprinting QR codes or updating social posts." },
      { text: "Instant Effect", example: "Changes take effect immediately — the next click goes to the new destination." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-xl">
            <Pencil className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Link Editing</div>
            <div className="text-xs text-slate-500">Update destinations on the fly</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Short Link</div>
            <div className="h-10 bg-black/50 rounded-lg border border-lime-400/30 flex items-center px-3 gap-2">
              <Link2 className="w-3 h-3 text-lime-400" />
              <span className="text-xs text-lime-400 font-bold">linksshrink.com/x7y</span>
              <Lock className="w-3 h-3 text-slate-500 ml-auto" />
            </div>
            <div className="text-[9px] text-slate-500">Short URL stays the same</div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">Current Destination</div>
              <span className="text-[9px] text-red-400 line-through">old URL</span>
            </div>
            <div className="h-10 bg-black rounded-lg border border-white/10 flex items-center px-3 gap-2 line-through opacity-40">
              <span className="text-[10px] text-slate-500">https://example.com/old-page</span>
            </div>
            <div className="text-xs text-slate-400">New Destination</div>
            <div className="h-10 bg-black rounded-lg border border-emerald-500/30 flex items-center px-3 gap-2">
              <span className="text-[10px] text-emerald-400">https://example.com/new-page</span>
            </div>
          </div>
        </div>
        <div className="h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-xs text-black font-bold gap-2">
          <Pencil className="w-3 h-3" /> Update Destination
        </div>
      </div>
    )
  },
  {
    title: "Mobile Deep Links",
    description: "Route mobile visitors directly to your iOS or Android app.",
    features: [
      { text: "iOS & Android Support", example: "Set separate deep link URLs for iOS and Android — each platform gets the right app link." },
      { text: "Smart Detection", example: "Device OS is automatically detected — iPhone users get the iOS link, Android users get theirs." },
      { text: "Web Fallback", example: "Desktop and non-mobile visitors are sent to the regular web URL as usual." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-lime-400/10 p-2 rounded-xl">
            <Smartphone className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Mobile Deep Links</div>
            <div className="text-xs text-slate-500">App-first mobile routing</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-white/5">
            <div className="bg-slate-800 p-2 rounded-lg">
              <span className="text-lg">🍎</span>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">iOS Deep Link</div>
              <div className="text-[10px] font-mono text-blue-400 mt-0.5">myapp://product/spring-sale</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-white/5">
            <div className="bg-slate-800 p-2 rounded-lg">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Android Deep Link</div>
              <div className="text-[10px] font-mono text-green-400 mt-0.5">myapp://product/spring-sale</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-white/5">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Monitor className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Desktop Fallback</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">https://example.com/sale</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
        <div className="bg-lime-400/10 p-3 rounded-lg border border-lime-400/20 flex items-center gap-2">
          <Zap className="w-3 h-3 text-lime-400" />
          <span className="text-[10px] text-lime-400">Auto-detected: routing based on visitor's device</span>
        </div>
      </div>
    )
  },
  {
    title: "Team Workspaces",
    description: "Collaborate with your team using shared workspaces and role-based access.",
    features: [
      { text: "Role-Based Access", example: "Assign Owner, Admin, or Member roles — each with different permission levels for team security." },
      { text: "Shared Link Management", example: "All team members can view and manage links within the workspace from a single dashboard." },
      { text: "Invite by Email", example: "Invite team members by email — they get instant access to the workspace after signing up." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Marketing Team</div>
            <div className="text-xs text-slate-500">5 members</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-2">
          {[
            { name: "Sarah Chen", role: "Owner", color: "text-yellow-400", bg: "bg-yellow-500/10", initials: "SC" },
            { name: "Mike Johnson", role: "Admin", color: "text-blue-400", bg: "bg-blue-500/10", initials: "MJ" },
            { name: "Lisa Park", role: "Member", color: "text-slate-400", bg: "bg-slate-500/10", initials: "LP" },
            { name: "David Kim", role: "Member", color: "text-slate-400", bg: "bg-slate-500/10", initials: "DK" },
            { name: "Anna Taylor", role: "Member", color: "text-slate-400", bg: "bg-slate-500/10", initials: "AT" }
          ].map((member) => (
            <div key={member.name} className="flex items-center justify-between p-2.5 bg-black/50 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white">{member.initials}</div>
                <div>
                  <div className="text-xs font-bold text-white">{member.name}</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${member.bg} ${member.color}`}>{member.role}</span>
            </div>
          ))}
        </div>
        <div className="h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-xs text-white font-bold gap-2">
          <Users className="w-3 h-3" /> Invite Team Member
        </div>
      </div>
    )
  },
  {
    title: "Unlimited Links",
    description: "All paid plans include unlimited link creation with no monthly caps.",
    features: [
      { text: "No Monthly Limits", example: "Create as many short links as you need — no 5-link cap, no restrictions, no surprises." },
      { text: "Instant Upgrade", example: "The moment you subscribe, the cap is lifted and you can shorten unlimited URLs." },
      { text: "All Plans Included", example: "Whether you're on Starter, Pro, or Enterprise — unlimited links are included in every paid plan." }
    ],
    visual: (
      <div className="bg-black rounded-xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-lime-400/10 p-2 rounded-xl">
            <Infinity className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Unlimited Links</div>
            <div className="text-xs text-slate-500">No caps on any paid plan</div>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/50 p-3 rounded-lg border border-red-500/20 text-center space-y-1">
              <div className="text-[10px] text-red-400 uppercase font-bold">Free Plan</div>
              <div className="text-xl font-bold text-white">5</div>
              <div className="text-[10px] text-slate-500">links / month</div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="text-[9px] text-red-400">Limit reached</div>
            </div>
            <div className="bg-black/50 p-3 rounded-lg border border-lime-400/20 text-center space-y-1">
              <div className="text-[10px] text-lime-400 uppercase font-bold">Paid Plan</div>
              <div className="text-xl font-bold text-lime-400 flex items-center justify-center"><Infinity className="w-6 h-6" /></div>
              <div className="text-[10px] text-slate-500">links / month</div>
              <div className="h-2 bg-lime-400/20 rounded-full overflow-hidden">
                <div className="bg-lime-400 h-full rounded-full animate-pulse" style={{ width: '30%' }} />
              </div>
              <div className="text-[9px] text-lime-400">No limits</div>
            </div>
          </div>
          <div className="bg-lime-400/10 p-3 rounded-lg border border-lime-400/20 flex items-center gap-3">
            <Zap className="w-4 h-4 text-lime-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Upgrade to unlock</div>
              <div className="text-[10px] text-lime-400">Starting at just $9.50/mo</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function Pricing() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [purchasingFeature, setPurchasingFeature] = useState<string | null>(null);
  usePageView("/pricing");
  
  const handleFeaturePurchase = async (featureKey: string, featureName: string) => {
    if (purchasingFeature) return;
    trackFunnelEvent("buy_click", "/pricing", { type: "feature", featureKey, featureName });
    setPurchasingFeature(featureKey);
    try {
      const response = await fetch("/api/create-feature-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureKey }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create checkout session");
      
      if (data.url) {
        trackFunnelEvent("checkout_started", "/pricing", { type: "feature", featureKey });
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL not available");
      }
    } catch (err: any) {
      console.error("Feature Purchase Error:", err);
      toast({
        title: "Purchase Error",
        description: err.message || "Could not connect to Stripe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setPurchasingFeature(null);
    }
  };

  const handlePayment = async (planName: string) => {
    trackFunnelEvent("buy_click", "/pricing", { type: "plan", planName });
    if (planName === "FREE") {
      window.location.href = "/";
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the plan they want to purchase for after login
      localStorage.setItem('pendingPlan', planName);
      
      toast({
        title: "Account Required",
        description: "Please sign in to purchase a plan. You'll be redirected to checkout after signing in.",
      });
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create checkout session");
      
      if (data.url) {
        trackFunnelEvent("checkout_started", "/pricing", { type: "plan", planName });
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL not available");
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      toast({
        title: "Payment Error",
        description: err.message || "Could not connect to Stripe. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-lime-400">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Start free with 5 links per month. Upgrade for unlimited links, analytics, QR codes, retargeting, A/B testing, mobile deep links, bio pages, and 19 premium tools — or buy features individually.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start mb-48">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`flex flex-col relative bg-slate-900 border-lime-400/20 ${plan.recommended ? 'border-primary shadow-xl scale-105 z-10' : 'hover:shadow-lg transition-shadow'}`}>
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="leading-tight text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6 flex-col gap-4">
                  <Button 
                    className={`w-full font-bold h-12 hover-elevate active-elevate-2 ${plan.recommended ? 'bg-primary text-black' : 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black'}`}
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => handlePayment(plan.name)}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
              {plan.individualFeatures.length > 0 && (
                <div className="mt-3 bg-slate-800/50 rounded-xl border border-lime-400/10 p-4">
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-wider text-center mb-3">Or buy individually</p>
                  <div className="space-y-1.5">
                    {plan.individualFeatures.map((feature) => (
                      <button
                        key={feature.featureKey}
                        onClick={() => handleFeaturePurchase(feature.featureKey, feature.name)}
                        disabled={purchasingFeature !== null}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 hover:bg-lime-400/10 border border-white/5 hover:border-lime-400/30 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid={`button-feature-${feature.featureKey}`}
                      >
                        <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
                          {purchasingFeature === feature.featureKey ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Processing...
                            </span>
                          ) : feature.name}
                        </span>
                        <span className="text-xs font-bold text-lime-400">${feature.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Feature Showcase Section */}
        <div className="max-w-6xl mx-auto space-y-48 pb-20">
          <div className="text-center space-y-6">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
              Exclusive Features
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">Feature Deep Dive</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A detailed look at the tools included in our premium plans.
            </p>
          </div>

          <div className="grid gap-48">
            {featureShowcase.map((item, index) => (
              <motion.div 
                key={item.title}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex-1 space-y-10 text-center lg:text-left">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-white">{item.title}</h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="space-y-8">
                    {item.features.map((feature, fIndex) => (
                      <div key={fIndex} className="space-y-3">
                        <div className="flex items-center gap-4 font-bold text-white">
                          <div className="bg-primary/10 rounded-full p-1.5">
                            <Check className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-lg">{feature.text}</span>
                        </div>
                        <div className="bg-slate-900 border-l-4 border-primary p-4 rounded-r-lg">
                          <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            {feature.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full max-w-xl">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-3xl opacity-50 -z-10 rounded-full" />
                    {item.visual}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
