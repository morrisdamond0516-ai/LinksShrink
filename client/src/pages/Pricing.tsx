import { useState } from "react";
import { Check, Link2, Lock, Clock, Globe, QrCode, Smartphone, Monitor, Layers, Download, Palette, Calendar, AlertCircle, LogIn, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
      "Basic link shortening",
      "No analytics",
      "No custom domain",
    ],
    buttonText: "Get Started",
    recommended: false,
    individualFeatures: [] as IndividualFeature[],
  },
  {
    name: "Starter",
    price: "20",
    description: "Perfect for growing brands.",
    features: [
      "Click Analytics",
      "Custom QR Codes",
      "Custom Slugs",
      "Faster Redirects",
    ],
    buttonText: "Choose Starter",
    recommended: true,
    individualFeatures: [
      { name: "Click Analytics (1 link)", price: "5", featureKey: "analytics_single" },
      { name: "Custom QR Code (1 code)", price: "3", featureKey: "qr_single" },
      { name: "Custom Slug (1 link)", price: "2", featureKey: "slug_single" },
    ],
  },
  {
    name: "Pro",
    price: "35",
    description: "Advanced features for professionals.",
    features: [
      "Custom domain",
      "Advanced analytics",
      "Expiring links",
      "Password-protected links",
    ],
    buttonText: "Go Pro",
    recommended: false,
    individualFeatures: [
      { name: "Advanced Analytics (1 link)", price: "8", featureKey: "advanced_analytics_single" },
      { name: "Expiring Link (1 link)", price: "3", featureKey: "expiring_single" },
      { name: "Password Protection (1 link)", price: "3", featureKey: "password_single" },
    ],
  },
  {
    name: "Enterprise",
    price: "50",
    description: "Maximum scale for agencies and power users.",
    features: [
      "3,000 Bulk Links",
      "50 Custom Domains",
      "Bulk Password Protection",
      "Full API Access",
    ],
    buttonText: "Get Enterprise",
    recommended: false,
    individualFeatures: [
      { name: "Bulk Links (100 links)", price: "10", featureKey: "bulk_100" },
      { name: "API Access (24hr pass)", price: "15", featureKey: "api_day_pass" },
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
  }
];

export default function Pricing() {
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [purchasingFeature, setPurchasingFeature] = useState<string | null>(null);
  
  const handleFeaturePurchase = async (featureKey: string, featureName: string) => {
    if (purchasingFeature) return;
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
        // Redirect the current page to Stripe checkout
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
              Choose the plan that's right for your links. All plans include our core shortening technology.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-48">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative bg-slate-900 border-lime-400/20 ${plan.recommended ? 'border-primary shadow-xl scale-105 z-10' : 'hover:shadow-lg transition-shadow'}`}>
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
                <div className="mt-4 bg-slate-800/60 rounded-2xl border border-lime-400/10 p-5">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-lime-400/20" />
                    <p className="text-sm text-white font-bold uppercase tracking-wider whitespace-nowrap">Or buy individually</p>
                    <div className="h-px flex-1 bg-lime-400/20" />
                  </div>
                  <p className="text-xs text-slate-400 text-center mb-4">No subscription needed — one-time purchase</p>
                  <div className="space-y-2.5">
                    {plan.individualFeatures.map((feature) => (
                      <button
                        key={feature.featureKey}
                        onClick={() => handleFeaturePurchase(feature.featureKey, feature.name)}
                        disabled={purchasingFeature !== null}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 hover:bg-lime-400/10 border border-white/10 hover:border-lime-400/40 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid={`button-feature-${feature.featureKey}`}
                      >
                        <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                          {purchasingFeature === feature.featureKey ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Processing...
                            </span>
                          ) : feature.name}
                        </span>
                        <span className="text-sm font-bold text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full">${feature.price}</span>
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
    </div>
  );
}
