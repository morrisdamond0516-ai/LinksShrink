import { useState, useEffect, useRef } from "react";
import { useShortenUrl } from "@/hooks/use-shortener";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Link2,
  Copy,
  Globe,
  BarChart,
  QrCode,
  Lock,
  Clock,
  Layers,
  ArrowRight,
  Check,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const pendingPlanProcessed = useRef(false);
  
  const shortenMutation = useShortenUrl();

    const handleJobClick = (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      toast({
        title: "Applications Closed",
        description: "We are sorry, but we are not accepting any applications right now. However, if you email us your resume, we will take a look at it in a timely manner. Have a great day!",
      });
    };
  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Simple frontend validation for better UX
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP/HTTPS URL.",
        variant: "destructive",
      });
      return;
    }

    shortenMutation.mutate(url, {
      onSuccess: (data) => {
        setResult(data);
        setCopied(false);
        toast({
          title: "URL Shortened!",
          description: "Your link is ready to share.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userPlan, setUserPlan] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      
      if (sessionId) {
        setIsVerifying(true);
        try {
          const response = await fetch(`/api/verify-session/${sessionId}`);
          const data = await response.json();
          
          if (data.success && data.plan) {
            setIsUnlocked(true);
            setUserPlan(data.plan);
            toast({
              title: "Payment Successful!",
              description: `Your ${data.plan} plan is now active. Enjoy premium features!`,
            });
            window.history.replaceState({}, document.title, "/#features");
          } else {
            toast({
              title: "Payment Pending",
              description: "Your payment is being processed. Please check back shortly.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Verification error:", err);
          toast({
            title: "Verification Error",
            description: "Could not verify payment. Please contact support.",
            variant: "destructive",
          });
        } finally {
          setIsVerifying(false);
        }
      }
      
      if (window.location.hash === "#features") {
        const element = document.getElementById("features");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    
    verifyPayment();
  }, []);

  // Handle pending plan purchase after login
  useEffect(() => {
    const handlePendingPlan = async () => {
      // Don't process if still loading auth or already processed
      if (authLoading || pendingPlanProcessed.current) return;
      
      const pendingPlan = localStorage.getItem('pendingPlan');
      
      if (pendingPlan && isAuthenticated) {
        pendingPlanProcessed.current = true;
        localStorage.removeItem('pendingPlan');
        
        toast({
          title: "Completing Your Purchase",
          description: `Redirecting to checkout for ${pendingPlan} plan...`,
        });
        
        try {
          const response = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planName: pendingPlan }),
          });
          
          const data = await response.json();
          if (response.ok && data.url) {
            window.location.href = data.url;
          }
        } catch (err) {
          console.error("Error creating checkout:", err);
        }
      }
    };
    
    handlePendingPlan();
  }, [isAuthenticated, authLoading]);

  const handleUnlockClick = (featureTitle: string) => {
    if (isUnlocked) {
      if (featureTitle === "Branded Links") {
        window.location.href = "/features/branded";
        return;
      }
      if (featureTitle === "Bulk Creation") {
        window.location.href = "/features/bulk";
        return;
      }
      if (featureTitle === "Detailed Analytics") {
        window.location.href = "/features/analytics";
        return;
      }
      if (featureTitle === "Smart QR Codes") {
        window.location.href = "/features/qr";
        return;
      }
      if (featureTitle === "Password Protection") {
        window.location.href = "/features/password";
        return;
      }
      if (featureTitle === "Expiring Links") {
        window.location.href = "/features/expiry";
        return;
      }
      toast({
        title: "Feature Active",
        description: `${featureTitle} is active. This specific feature page is coming soon.`,
      });
      return;
    }
    // Redirect to pricing with the intent to unlock
    window.location.href = "/pricing";
  };

  const features = [
    {
      icon: <Globe id="branded-links" className="w-6 h-6 text-lime-400" />,
      title: "Branded Links",
      description: "Build trust with custom domains like brand.link/sale.",
      benefit: "Example: link.yourbrand.com/summer",
      premium: true
    },
    {
      icon: <BarChart id="analytics" className="w-6 h-6 text-yellow-400" />,
      title: "Detailed Analytics",
      description: "Track clicks, location, devices, and traffic sources with our advanced tracking engine.",
      benefit: "Live tracking & geographic heatmaps",
      premium: true
    },
    {
      icon: <QrCode className="w-6 h-6 text-lime-500" />,
      title: "Smart QR Codes",
      description: "High-resolution, custom colors, and fully downloadable for print and web.",
      benefit: "Custom branded QR menus",
      premium: true
    },
    {
      icon: <Lock className="w-6 h-6 text-red-500" />,
      title: "Password Protection",
      description: "Secure your content with password-protected links and managed access control.",
      benefit: "Verified client sharing",
      premium: true
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-400" />,
      title: "Expiring Links",
      description: "Set links to expire after a certain date or click count automatically.",
      benefit: "Auto-closing holiday sales",
      premium: true
    },
    {
      icon: <Layers id="enterprise" className="w-6 h-6 text-yellow-500" />,
      title: "Bulk Creation",
      description: "Generate up to 3,000 links instantly via API or CSV with enterprise-grade stability.",
      benefit: "Large scale campaign support",
      premium: true
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-lime-400">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">LinkShrink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="hidden sm:flex">Pricing</Button>
            </Link>
            <a href="/api/login">
              <Button variant="ghost" className="hidden sm:flex" data-testid="button-login">Log In</Button>
            </a>
            <Button onClick={() => window.location.href = "/pricing"}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Shorten links.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-yellow-400">
                Expand reach.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              A powerful, easy-to-use URL shortener for brands, marketers, and creators. No account required to start.
            </p>
          </motion.div>

          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-2xl border-lime-400/10 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-400/50">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Paste your long URL here..."
                      className="pl-10 h-14 text-lg border-transparent bg-black/50 focus:bg-black text-white transition-colors placeholder:text-slate-600"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={shortenMutation.isPending}
                    />
                  </div>
                  <Button 
                    size="xl" 
                    className="h-14 font-bold text-lg shrink-0 bg-lime-400 text-black hover:bg-lime-500 shadow-lg shadow-lime-400/20"
                    disabled={shortenMutation.isPending || !url}
                    data-testid="button-shorten"
                  >
                    {shortenMutation.isPending ? "Shortening..." : "Shorten URL"}
                  </Button>
                </form>

                {result && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 pt-4 border-t bg-green-50/50 -mx-4 -mb-4 px-4 py-4 sm:px-6 sm:py-6"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left overflow-hidden w-full">
                        <p className="text-sm text-muted-foreground mb-1">Your shortened link:</p>
                        <a 
                          href={result.shortUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-2xl font-bold text-primary truncate block hover:underline"
                        >
                          {result.shortUrl}
                        </a>
                      </div>
                      <Button 
                        variant={copied ? "default" : "secondary"}
                        className="w-full sm:w-auto shrink-0 gap-2"
                        onClick={copyToClipboard}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-400 rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-[120px] opacity-20" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything you need to grow</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Upgrade to Pro to unlock a suite of powerful tools designed for marketers and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-white/5 bg-slate-900 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-white/10">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-slate-400 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {feature.benefit}
                      </span>
                      <Button 
                        variant={isUnlocked ? "ghost" : "outline"} 
                        size="sm" 
                        className={`gap-1 font-bold ${isUnlocked ? 'text-lime-400' : 'border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockClick(feature.title);
                        }}
                      >
                        {isUnlocked ? "Active" : "Unlock"} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Button 
              variant="premium" 
              size="xl" 
              className="rounded-full px-12 text-lg font-bold"
              onClick={() => window.location.href = "/pricing"}
            >
              {isUnlocked ? "Manage Subscription" : "Unlock All Features"}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              {isUnlocked ? `You are currently on the ${userPlan} plan.` : "Upgrade today to access professional marketing tools."}
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise & Analytics In-depth Section */}
      <section id="enterprise-details" className="py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Enterprise Infrastructure</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Built for the most demanding marketing teams. LinkShrink Enterprise provides the stability, 
                security, and scale your global brand requires.
              </p>
              <div className="space-y-4">
                {[
                  { title: "SLA Guarantee", desc: "99.99% uptime with 24/7 dedicated support." },
                  { title: "Custom Domains", desc: "Connect up to 50 unique domains for localized branding." },
                  { title: "Team Management", desc: "Granular RBAC controls for your entire marketing department." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="bg-lime-400/10 p-2 rounded-lg h-fit">
                      <Shield className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 blur-3xl rounded-full" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-lime-400 uppercase">System Status: Optimal</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                  </div>
                </div>
                <div className="h-48 bg-black/40 rounded-xl border border-white/5 flex items-end p-4 gap-2">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-lime-400/20 rounded-t-sm relative group">
                      <div className="absolute bottom-0 w-full bg-lime-400 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Requests/sec</span>
                    <div className="text-xl font-bold text-white">4.2k</div>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase">Latency</span>
                    <div className="text-xl font-bold text-white">12ms</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div id="analytics-details" className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="order-2 lg:order-1 bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="font-bold text-white">Real-time Audience Insights</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Mobile Traffic", val: 68, color: "bg-yellow-400" },
                    { label: "Desktop Traffic", val: 24, color: "bg-lime-400" },
                    { label: "Tablet Traffic", val: 8, color: "bg-orange-400" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">{stat.label}</span>
                        <span className="text-white">{stat.val}%</span>
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-lime-400 rounded-full" />
                    <span className="text-[10px] text-slate-500 uppercase">Live Map Feed</span>
                  </div>
                  <div className="h-24 bg-slate-800/30 rounded-lg flex items-center justify-center italic text-slate-600 text-xs">
                    Geographic data processing...
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div className="order-1 lg:order-2" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Advanced Analytics</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Know your audience better than ever. LinkShrink Analytics provides deep behavioral data 
                without compromising user privacy.
              </p>
              <ul className="space-y-4">
                {[
                  "UTM Parameter tracking & preservation",
                  "Referrer identification & traffic scoring",
                  "Geographic distribution down to the city level",
                  "A/B testing link destination performance"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Detailed Section */}
      <section id="about-details" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Our Mission</h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              We started LinkShrink to simplify how people share information. In a world of long, 
              clunky URLs, we provide the elegance and efficiency required for modern communication.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Transparency", desc: "Open policies and clear pricing. No hidden fees or bait-and-switch tactics." },
              { title: "Innovation", desc: "Constantly evolving our tech stack to provide the fastest redirects on the market." },
              { title: "Privacy", desc: "We don't sell your data. Your audience's privacy is our top priority." }
            ].map((value, i) => (
              <Card key={i} className="bg-slate-900 border-white/5 p-8">
                <h4 className="text-xl font-bold text-lime-400 mb-4">{value.title}</h4>
                <p className="text-slate-400 leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="py-24 bg-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 text-center">Join the LinkShrink Team</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 text-center">
              We're a remote-first company building tools for millions of users worldwide. 
              Help us define the future of link management.
            </p>
          </div>
          <div className="grid gap-4 max-w-4xl mx-auto">
            {[
              { role: "Senior Frontend Engineer", type: "Remote", dept: "Engineering" },
              { role: "Backend Architect (Node.js)", type: "Remote", dept: "Engineering" },
              { role: "Product Designer", type: "Remote", dept: "Product" },
              { role: "Growth Marketer", type: "Remote", dept: "Marketing" }
            ].map((job, i) => (
              <div 
                key={i} 
                onClick={handleJobClick}
                className="group flex items-center justify-between p-6 bg-black rounded-2xl border border-white/5 hover:border-lime-400/50 transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-lime-400 transition-colors">{job.role}</h4>
                  <div className="flex gap-4 mt-1 text-sm text-slate-500">
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.dept}</span>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-700 group-hover:text-lime-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-slate-500 mb-6">Don't see a fit? Send a general application.</p>
            <Button 
              variant="outline" 
              className="border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black font-bold h-12 px-8"
              onClick={handleJobClick}
              data-testid="button-careers-email"
            >
              Email Us Your CV
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white mb-4">
                <Link2 className="w-6 h-6 text-lime-400" />
                <span className="text-xl font-bold">LinkShrink</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                The most reliable URL shortener for personal and professional use. Built with modern web technologies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-lime-400 transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="/pricing" className="hover:text-lime-400 transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><a href="#enterprise-details" className="hover:text-lime-400 transition-colors" data-testid="link-footer-enterprise">Enterprise</a></li>
                <li><a href="#analytics-details" className="hover:text-lime-400 transition-colors" data-testid="link-footer-analytics">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about-details" className="hover:text-lime-400 transition-colors" data-testid="link-footer-about">About</a></li>
                <li><a href="#careers" className="hover:text-lime-400 transition-colors" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="mailto:ProductionLinks@yahoo.com" className="hover:text-lime-400 transition-colors" data-testid="link-footer-contact">Contact</a></li>
                <li><a href="/rules" className="hover:text-lime-400 transition-colors" data-testid="link-footer-rules">Rules & Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left">
            © {new Date().getFullYear()} LinkShrink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
