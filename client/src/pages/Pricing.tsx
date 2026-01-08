import { Check, Link2, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface FeatureShowcaseItem {
  title: string;
  description: string;
  features: { text: string; example: string }[];
  visual: React.ReactNode;
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
  },
];

const featureShowcase: FeatureShowcaseItem[] = [
  {
    title: "Detailed Analytics Dashboard",
    description: "See exactly how your links are performing with real-time data.",
    features: [
      { text: "Real-time Traffic Monitoring", example: "Clicking this in your dashboard opens a live view of incoming traffic from around the globe." },
      { text: "Device & Browser Breakdown", example: "This view shows you exactly which devices and browsers your audience is using." },
      { text: "Traffic Source Analysis", example: "This screen identifies whether your clicks are coming from social media, email, or direct visits." }
    ],
    visual: (
      <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs text-green-400 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="flex justify-between border-b border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-widest">SYSTEM MONITOR</span>
          </div>
          <span className="text-slate-500">v4.2.0-STABLE</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
              <div className="text-[10px] text-slate-500">TOTAL CLICKS</div>
              <div className="text-lg font-bold text-white">12,842</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
              <div className="text-[10px] text-slate-500">AVG. TIME</div>
              <div className="text-lg font-bold text-white">1.2s</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
              <div className="text-[10px] text-slate-500">BOUNCE</div>
              <div className="text-lg font-bold text-white">14%</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-tighter">Top Geos</div>
            {[
              { label: 'USA', val: 85, color: 'bg-blue-500' },
              { label: 'GBR', val: 45, color: 'bg-indigo-500' },
              { label: 'FRA', val: 30, color: 'bg-purple-500' }
            ].map(geo => (
              <div key={geo.label} className="flex items-center gap-2">
                <div className="w-8 text-slate-400">{geo.label}</div>
                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`${geo.color} h-full transition-all duration-1000`} style={{ width: `${geo.val}%` }} />
                </div>
                <div className="w-6 text-right text-slate-500">{geo.val}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Branded QR Code Engine",
    description: "Generate high-resolution codes that match your brand identity perfectly.",
    features: [
      { text: "Custom Color Selection", example: "Clicking this tool opens a color picker to match the QR code to your brand's exact hex codes." },
      { text: "High-Resolution Downloads", example: "This button generates a 4000x4000px PNG or SVG file perfect for large-scale printing." },
      { text: "Logo Integration", example: "This setting allows you to upload your company logo to be centered perfectly within the QR code." }
    ],
    visual: (
      <div className="bg-white rounded-xl p-8 border shadow-xl flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-slate-200 shadow-inner">
          <div className="grid grid-cols-12 gap-1 p-3 opacity-90 w-full h-full text-primary">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-[1px] ${Math.random() > 0.7 ? 'bg-current' : 'bg-transparent'}`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white border-2 border-primary rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Security & Expiry Control",
    description: "Protect sensitive links and set automatic expiration dates with ease.",
    features: [
      { text: "Password Protection UI", example: "Clicking this will open a modal where you set a password; visitors will see a clean login screen before redirecting." },
      { text: "Link Expiration Timer", example: "This tool lets you choose a date and time; once reached, the link automatically shows an 'Expired' page." },
      { text: "Access Request Log", example: "This screen shows you every attempted access to your protected links, including failed password entries." }
    ],
    visual: (
      <div className="bg-white rounded-xl p-6 border-2 border-slate-100 shadow-2xl relative">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-50 p-3 rounded-2xl">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">Secure Access</div>
            <div className="text-xs text-muted-foreground">Encryption Level: AES-256</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <div className="h-10 bg-slate-50 rounded-lg border flex items-center px-3 text-sm text-slate-400 font-mono tracking-widest italic shadow-sm">••••••••••••</div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-sm text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer">
            Access Protected Link
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>EXPIRES: 04:22:11</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">128 ATTEMPTS</div>
        </div>
      </div>
    )
  },
  {
    title: "Enterprise Bulk Management",
    description: "Manage up to 3,000 links and 50 custom domains from a single unified interface.",
    features: [
      { text: "CSV Bulk Import", example: "Clicking this allows you to upload a file with 3,000 URLs to shorten them all in one batch process." },
      { text: "Multi-Domain Selector", example: "This dropdown menu allows you to switch between 50 different custom domains you've connected." },
      { text: "Bulk Security Manager", example: "This page allows you to apply password protection or expiry dates to thousands of links with a single click." }
    ],
    visual: (
      <div className="bg-slate-50 rounded-xl p-6 border-2 border-blue-100 overflow-hidden relative shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">Bulk Processing</div>
          <div className="text-[10px] text-slate-400 font-bold">TASK ID: #8821</div>
        </div>
        <div className="space-y-3">
          {[
            { id: 2998, name: 'promo_fall_01.link', status: 'COMPLETE' },
            { id: 2999, name: 'promo_fall_02.link', status: 'COMPLETE' },
            { id: 3000, name: 'processing...', status: 'ACTIVE' }
          ].map(row => (
            <div key={row.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-sm">
              <div className={`w-2 h-2 rounded-full ${row.status === 'COMPLETE' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
              <span className="font-bold text-slate-400">#{row.id}</span>
              <span className="flex-1 font-medium truncate">{row.name}</span>
              <span className={`text-[10px] font-black ${row.status === 'COMPLETE' ? 'text-green-600' : 'text-blue-600'}`}>{row.status}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
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
  const handlePayment = async (planName: string) => {
    if (planName === "FREE") {
      window.location.href = "/";
      return;
    }
    
    const plan = plans.find(p => p.name === planName);
    const amount = plan?.price || "0";
    
    toast({
      title: "Opening Checkout",
      description: `Redirecting to Stripe for the ${planName} plan...`,
    });

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amount }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create checkout session");
      
      const { id } = data;
      const stripe = (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) throw new Error("Stripe.js failed to load");
      
      await stripe.redirectToCheckout({ sessionId: id });
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
                <CardFooter className="pt-6">
                  <Button 
                    className={`w-full font-bold h-12 hover-elevate active-elevate-2 ${plan.recommended ? 'bg-primary text-black' : 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black'}`}
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => handlePayment(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
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
