import { useState, useEffect, useRef, useCallback } from "react";
import { useShortenUrl } from "@/hooks/use-shortener";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageView, trackFunnelEvent } from "@/hooks/use-funnel";
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
  Shield,
  Zap,
  Plus,
  ShieldCheck,
  FileText,
  Ban,
  MousePointerClick,
  TrendingUp,
  Share2,
  Tag,
  Target,
  CalendarClock,
  FlaskConical,
  User,
  Users,
  LineChart,
  ShoppingBag,
  Pencil,
  Smartphone,
  Infinity,
  Trash2,
  ExternalLink,
  Clapperboard,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

interface CreditInfo {
  freeRemaining: number;
  paidRemaining: number;
  totalRemaining: number;
  freeUsed: number;
  paidUsed: number;
  monthKey: string;
}

interface UserUrl {
  id: number;
  shortCode: string;
  originalUrl: string;
  visitCount: number;
  createdAt: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [buyingLinks, setBuyingLinks] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const pendingPlanProcessed = useRef(false);
  const linkPackProcessed = useRef(false);
  usePageView("/");
  
  const shortenMutation = useShortenUrl();
  
  // Fetch credits
  const { data: credits, refetch: refetchCredits } = useQuery<CreditInfo>({
    queryKey: ['/api/credits'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch user's saved links (authenticated users only)
  const { data: myLinks = [], refetch: refetchLinks } = useQuery<UserUrl[]>({
    queryKey: ['/api/my-links'],
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/my-links/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete link");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-links'] });
      toast({ title: "Link deleted", description: "Your link has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete link.", variant: "destructive" });
    },
  });

  const handleBuyLinks = async () => {
    trackFunnelEvent("buy_click", "/", { type: "link_pack", amount: 20 });
    setBuyingLinks(true);
    try {
      const response = await fetch("/api/create-link-pack-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      if (response.ok && data.url) {
        trackFunnelEvent("checkout_started", "/", { type: "link_pack" });
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create checkout",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setBuyingLinks(false);
    }
  };

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    trackFunnelEvent("shorten_click", "/");
    
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
        refetchCredits();
        if (isAuthenticated) refetchLinks();
        toast({
          title: "URL Shortened!",
          description: "Your link is ready to share.",
        });
      },
      onError: (error: any) => {
        refetchCredits();
        if (error.message?.includes("free links")) {
          toast({
            title: "Out of Credits",
            description: "You've used all your free links. Buy 20 more for $20!",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
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
      const linkPackSession = params.get("link_pack_session");
      const featureSession = params.get("feature_session");
      
      if (featureSession) {
        setIsVerifying(true);
        try {
          const response = await fetch(`/api/verify-session/${featureSession}`);
          const data = await response.json();
          
          if (data.success && data.purchaseType === 'individual_feature') {
            toast({
              title: "Purchase Successful!",
              description: `Your "${data.featureName}" purchase is confirmed. You can now use this feature.`,
            });
            window.history.replaceState({}, document.title, "/");
          } else {
            toast({
              title: "Payment Pending",
              description: "Your payment is being processed. Please check back shortly.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Feature verification error:", err);
          toast({
            title: "Verification Error",
            description: "Could not verify payment. Please contact support.",
            variant: "destructive",
          });
        } finally {
          setIsVerifying(false);
        }
        return;
      }
      
      // Handle link pack purchase verification
      if (linkPackSession && !linkPackProcessed.current) {
        linkPackProcessed.current = true;
        setIsVerifying(true);
        try {
          const response = await fetch(`/api/verify-session/${linkPackSession}`);
          const data = await response.json();
          
          if (data.success && data.purchaseType === 'link_pack') {
            refetchCredits();
            toast({
              title: "Credits Added!",
              description: `You now have ${data.credits} additional link credits. Start shortening!`,
            });
            window.history.replaceState({}, document.title, "/");
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
        return;
      }
      
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
        
        try {
          const response = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planName: pendingPlan }),
          });
          
          const data = await response.json();
          if (response.ok && data.url) {
            // Redirect the current page to Stripe checkout
            window.location.href = data.url;
          }
        } catch (err) {
          console.error("Error creating checkout:", err);
        }
      }
    };
    
    handlePendingPlan();
  }, [isAuthenticated, authLoading]);

  const featureRoutes: Record<string, string> = {
    "Branded Links": "/features/branded",
    "Bulk Creation": "/features/bulk",
    "Detailed Analytics": "/features/analytics",
    "Smart QR Codes": "/features/qr",
    "Password Protection": "/features/password",
    "Expiring Links": "/features/expiry",
    "UTM Builder": "/features/utm",
    "Retargeting Pixels": "/features/retargeting",
    "A/B Testing": "/features/ab-testing",
    "Geo Routing": "/features/geo-routing",
    "Link Scheduling": "/features/scheduling",
    "Click Limits": "/features/click-limits",
    "Link-in-Bio Pages": "/features/bio",
    "Bio Page Shop": "/features/bio",
    "Team Workspaces": "/features/teams",
    "Conversion Tracking": "/features/conversions",
    "Link Editing": "/pricing",
    "Mobile Deep Links": "/features/deep-links",
    "Unlimited Links": "/pricing",
  };

  const handleUnlockClick = (featureTitle: string) => {
    const route = featureRoutes[featureTitle];
    if (route) {
      window.location.href = route;
      return;
    }
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
    },
    {
      icon: <Tag className="w-6 h-6 text-lime-400" />,
      title: "UTM Builder",
      description: "Auto-append campaign tracking parameters to your links. Track source, medium, and campaign performance.",
      benefit: "Example: ?utm_source=newsletter",
      premium: true
    },
    {
      icon: <Target className="w-6 h-6 text-purple-500" />,
      title: "Retargeting Pixels",
      description: "Embed Facebook, Google, and TikTok tracking pixels in your short links to build custom audiences.",
      benefit: "Build audiences from any link",
      premium: true
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-cyan-400" />,
      title: "A/B Testing",
      description: "Split traffic between two URLs with a configurable percentage to find what converts best.",
      benefit: "Example: 60/40 traffic split",
      premium: true
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      title: "Geo Routing",
      description: "Route visitors to different URLs based on their country. Perfect for localized campaigns and multi-region offers.",
      benefit: "US → /en, DE → /de, JP → /jp",
      premium: true
    },
    {
      icon: <CalendarClock className="w-6 h-6 text-blue-400" />,
      title: "Link Scheduling",
      description: "Schedule links to activate at a future date and time. Perfect for product launches and timed promotions.",
      benefit: "Set it and forget it",
      premium: true
    },
    {
      icon: <MousePointerClick className="w-6 h-6 text-red-400" />,
      title: "Click Limits",
      description: "Set a maximum number of clicks before a link auto-deactivates. Great for limited offers and giveaways.",
      benefit: "Example: First 500 clicks only",
      premium: true
    },
    {
      icon: <User className="w-6 h-6 text-lime-500" />,
      title: "Link-in-Bio Pages",
      description: "Build beautiful, customizable landing pages with multiple links, social icons, and 6 stunning themes.",
      benefit: "Your personal landing page",
      premium: true
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-pink-400" />,
      title: "Bio Page Shop",
      description: "Sell digital products directly from your bio page. Add items with images, descriptions, and pricing.",
      benefit: "Monetize your bio page",
      premium: true
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: "Team Workspaces",
      description: "Create workspaces, invite team members with role-based access. Owners, admins, and members.",
      benefit: "Collaborate with your team",
      premium: true
    },
    {
      icon: <LineChart className="w-6 h-6 text-yellow-400" />,
      title: "Conversion Tracking",
      description: "Track conversions and revenue per link via API. Measure ROI on every campaign you run.",
      benefit: "Revenue attribution per link",
      premium: true
    },
    {
      icon: <Pencil className="w-6 h-6 text-emerald-400" />,
      title: "Link Editing",
      description: "Change your link's destination URL anytime without creating a new short link. Update campaigns on the fly.",
      benefit: "Update links without breaking them",
      premium: true
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-400" />,
      title: "Mobile Deep Links",
      description: "Route mobile visitors directly to your iOS or Android app instead of the website.",
      benefit: "App-first mobile experience",
      premium: true
    },
    {
      icon: <Infinity className="w-6 h-6 text-lime-400" />,
      title: "Unlimited Links",
      description: "All paid plans include unlimited link creation with no monthly caps or restrictions.",
      benefit: "No limits on growth",
      premium: true
    },
    {
      icon: <Clapperboard className="w-6 h-6 text-pink-500" />,
      title: "AI Video Ads",
      description: "Create professional AI video ads in minutes. Scrape up to 3 websites, auto-generate a script, and pick an AI avatar & voice. Perfect for Google Ads, social media, and YouTube campaigns.",
      benefit: "From URL to video ad in minutes",
      premium: true
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-violet-400" />,
      title: "Learn & Grow Resources",
      description: "Level up your digital marketing game with our curated partner resources — ebooks, guides, and an AI-powered knowledge builder to sharpen your skills.",
      benefit: "Knowledge is your best link",
      premium: false,
      links: [
        { label: "EbookGamez.com", href: "https://ebookgamez.com", icon: "book" },
        { label: "Knowledge Builder", href: "https://knowledge-builder.replit.app/", icon: "grad" },
      ]
    }
  ];

  const bubbleMessages = [
    "Discover ebooks you won't find anywhere else",
    "Rare & exclusive digital reads",
    "New titles added weekly",
    "Games, guides & hidden gems",
    "Visit EbookGamez.com",
  ];
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [bubbleFading, setBubbleFading] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  useEffect(() => {
    if (bubbleDismissed) return;
    const interval = setInterval(() => {
      setBubbleFading(true);
      setTimeout(() => {
        setBubbleIndex((i) => (i + 1) % bubbleMessages.length);
        setBubbleFading(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [bubbleDismissed]);

  return (
    <div className="min-h-screen bg-black">

      {/* EbookGamez Affiliate Top Banner */}
      <a
        href="https://ebookgamez.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-[hsl(43,68%,10%)] via-[hsl(43,68%,14%)] to-[hsl(43,68%,10%)] border-b border-[hsl(43,68%,54%)]/30 py-2 px-4 text-center group hover:from-[hsl(43,68%,12%)] hover:to-[hsl(43,68%,12%)] transition-all"
        data-testid="banner-ebookgamez"
      >
        <span className="text-[hsl(43,68%,54%)] text-xs font-semibold tracking-widest uppercase">✦ An EbookGamez.com Brand</span>
        <span className="text-slate-500 text-xs mx-3">·</span>
        <span className="text-slate-400 text-xs group-hover:text-[hsl(43,80%,68%)] transition-colors">
          LinksShrink is the link-management tool of the EbookGamez family — visit our parent platform →
        </span>
      </a>

      {!bubbleDismissed && (
        <div className="fixed top-28 right-6 z-50 flex flex-col items-end gap-2" data-testid="ebookgamez-bubble">
          <div
            className="relative border backdrop-blur-md rounded-2xl rounded-br-sm px-4 py-3 shadow-xl max-w-[220px] cursor-pointer group transition-all"
            style={{ background: "hsl(43,68%,8%)", borderColor: "hsl(43,68%,54%,0.35)" }}
            onClick={() => window.open("https://EbookGamez.com", "_blank")}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setBubbleDismissed(true); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors text-xs"
              data-testid="button-dismiss-bubble"
              aria-label="Dismiss"
            >
              ×
            </button>
            <p className={`text-xs text-slate-300 group-hover:text-white transition-all duration-300 ${bubbleFading ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
              {bubbleMessages[bubbleIndex]}
            </p>
            <p className="text-[10px] mt-1 font-semibold transition-colors" style={{ color: "hsl(43,68%,54%)" }}>
              EbookGamez.com →
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform animate-bounce"
            style={{ background: "linear-gradient(135deg, hsl(43,68%,54%), hsl(43,68%,38%))", boxShadow: "0 0 20px hsl(43,68%,54%,0.3)", animationDuration: "3s" }}
            onClick={() => window.open("https://EbookGamez.com", "_blank")}
          >
            <span className="text-xl">📚</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Link2 className="w-6 h-6 text-lime-400" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight text-lime-400">LinksShrink.com</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "hsl(43,68%,54%)" }}>
                An EbookGamez Brand
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="hidden sm:flex">Pricing</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/features/video-ads">
                  <Button variant="ghost" className="hidden sm:flex text-lime-400 hover:text-lime-300" data-testid="button-nav-video-ads">
                    🎬 Video Ads
                  </Button>
                </Link>
                <span className="hidden sm:block text-slate-400 text-sm" data-testid="text-nav-username">
                  Hi, {user?.firstName || user?.email?.split("@")[0] || "there"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => { (window as any).__logout?.(); window.location.href = "/api/logout"; }}
                  data-testid="button-logout"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex" data-testid="button-login">Log In</Button>
                </Link>
                <Button onClick={() => window.location.href = "/pricing"} data-testid="button-get-started">Get Started</Button>
              </>
            )}
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
            {/* Affiliate badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <a
                href="https://ebookgamez.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all hover:scale-105"
                style={{ borderColor: "hsl(43,68%,54%,0.5)", background: "hsl(43,68%,54%,0.08)", color: "hsl(43,68%,60%)" }}
                data-testid="badge-ebookgamez-affiliate"
              >
                <span>📚</span>
                <span>A branch of EbookGamez.com</span>
                <span className="opacity-60">→</span>
              </a>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Shorten links.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-yellow-400">
                Expand reach.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              The all-in-one link management platform with AI Video Ad Creator, analytics, QR codes, retargeting pixels, A/B testing, geo-routing, link-in-bio pages, team workspaces, and 20 premium tools. Built for marketers, businesses, and creators.
            </p>
            <p className="text-sm text-slate-500 mb-12 max-w-xl mx-auto">
              Free to start — 5 free links per month. Paid plans include unlimited links starting at $9.50/mo. Part of the <a href="https://ebookgamez.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: "hsl(43,68%,60%)" }}>EbookGamez</a> ecosystem.
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

                {/* Credits Display */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-lime-400" />
                      {credits ? (
                        <span className="text-slate-300">
                          <span className="font-bold text-lime-400">{credits.totalRemaining}</span>
                          {" "}link{credits.totalRemaining !== 1 ? "s" : ""} remaining this month
                          {credits.paidRemaining > 0 && (
                            <span className="text-slate-500 text-xs ml-1">
                              ({credits.freeRemaining} free + {credits.paidRemaining} paid)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">Loading credits...</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBuyLinks}
                      disabled={buyingLinks}
                      className="gap-1 border-lime-400/50 text-lime-400 hover:bg-lime-400 hover:text-black"
                      data-testid="button-buy-links"
                    >
                      <Plus className="w-3 h-3" />
                      {buyingLinks ? "Loading..." : "Buy 20 Links - $20"}
                    </Button>
                  </div>
                  {credits && credits.totalRemaining === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <p className="text-red-400 text-sm text-center">
                        You've used all your free links this month. Buy 20 more for just $20!
                      </p>
                    </motion.div>
                  )}
                </div>

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

      {/* My Links Section (authenticated users) */}
      {isAuthenticated && myLinks.length > 0 && (
        <section className="py-12 bg-slate-950 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-lime-400" />
              My Links
              <span className="text-slate-500 text-sm font-normal ml-1">({myLinks.length})</span>
            </h2>
            <div className="space-y-3" data-testid="links-list">
              {myLinks.map((link) => (
                <div
                  key={link.id}
                  data-testid={`row-link-${link.id}`}
                  className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-xl px-4 py-3 hover:border-lime-400/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/${link.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime-400 font-semibold text-sm hover:underline flex items-center gap-1"
                      data-testid={`link-short-${link.id}`}
                    >
                      linksshrink.com/{link.shortCode}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                    <p className="text-slate-400 text-xs truncate mt-0.5" data-testid={`text-original-${link.id}`}>
                      {link.originalUrl}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-slate-500 text-xs" data-testid={`text-clicks-${link.id}`}>
                      {link.visitCount ?? 0} click{(link.visitCount ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => deleteLinkMutation.mutate(link.id)}
                      disabled={deleteLinkMutation.isPending}
                      data-testid={`button-delete-link-${link.id}`}
                      aria-label="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-black via-slate-900/50 to-black border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-lime-400/10 text-lime-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                NEW — AI Video Ad Creator
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Create Video Ads with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-yellow-400">
                  Realistic AI Presenters
                </span>
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Generate professional video ads in seconds. Pick a realistic AI person, write your script, and get ready-to-use ads for Google, Microsoft, YouTube, Instagram, and TikTok — all from one click.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Choose from 1,000+ realistic AI avatars & voices",
                  "One-click Full Ad Package: 3 videos + 3 banner images (horizontal, vertical & square)",
                  "Perfect for Google Ads, Performance Max & social media",
                  "Download and upload directly to your ad campaigns",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-lime-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/features/video-ads">
                <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold h-12 px-8 text-base" data-testid="button-try-video-ads">
                  Try AI Video Ads →
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-yellow-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Presenter</p>
                    <p className="text-slate-500 text-xs">Speaking your script</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 bg-lime-400/10 text-lime-400 px-2.5 py-1 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                    Live Preview
                  </div>
                </div>
                <div className="bg-black rounded-xl aspect-video flex items-center justify-center border border-white/5 mb-5 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-yellow-400/5" />
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-lime-400/30 flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-500 text-xs">Your AI presenter appears here</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/60 rounded-lg p-3 border border-white/5 text-center">
                    <div className="w-8 h-5 rounded bg-slate-800 border border-slate-700 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-500">Horizontal</p>
                    <p className="text-[9px] text-slate-600">1920×1080</p>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 border border-white/5 text-center">
                    <div className="w-3.5 h-6 rounded bg-slate-800 border border-slate-700 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-500">Vertical</p>
                    <p className="text-[9px] text-slate-600">1080×1920</p>
                  </div>
                  <div className="bg-black/60 rounded-lg p-3 border border-white/5 text-center">
                    <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-500">Square</p>
                    <p className="text-[9px] text-slate-600">1080×1080</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-lime-400/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How LinksShrink Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              More than just a URL shortener — LinksShrink.com is a complete link management platform with 20 premium tools including AI Video Ads, unlimited links, mobile deep linking, A/B testing, retargeting, geo-routing, and link-in-bio pages.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Share2 className="w-7 h-7 text-lime-400" />,
                step: "1",
                title: "Paste Your Link",
                desc: "Enter any long URL into our shortener. We create a compact, branded short link using Base62 encoding for the shortest codes possible."
              },
              {
                icon: <MousePointerClick className="w-7 h-7 text-yellow-400" />,
                step: "2",
                title: "Share Everywhere",
                desc: "Use your short link in social media, emails, print materials, or anywhere. Every click is tracked with detailed analytics."
              },
              {
                icon: <TrendingUp className="w-7 h-7 text-lime-500" />,
                step: "3",
                title: "Measure & Optimize",
                desc: "See real-time click data, device breakdowns, geographic insights, and referrer analysis to optimize your marketing campaigns."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="bg-slate-900 border-white/5 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 border border-white/10">
                      {item.icon}
                    </div>
                    <div className="text-xs font-bold text-lime-400 uppercase tracking-wider mb-2">Step {item.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Trust & Safety</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              We take platform integrity seriously. LinksShrink.com is built with security, transparency, and compliance at its core.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Ban className="w-6 h-6 text-red-400" />,
                title: "Anti-Abuse Policy",
                desc: "Spam, phishing, malware, and illegal content are strictly prohibited. Violators are permanently banned."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-lime-400" />,
                title: "Secure Payments",
                desc: "All payments processed through Stripe with industry-standard encryption. We never store card details."
              },
              {
                icon: <FileText className="w-6 h-6 text-yellow-400" />,
                title: "Clear Policies",
                desc: "Transparent Terms of Service, Privacy Policy, and 7-day Refund Policy. No hidden fees or surprises."
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-400" />,
                title: "Privacy First",
                desc: "We don't sell your data. Analytics are aggregated and anonymized. Your audience's privacy is protected."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black border-white/5 h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">{item.icon}</div>
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Read our full{" "}
              <a href="/terms" className="text-lime-400 hover:underline">Terms of Service</a>,{" "}
              <a href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</a>, and{" "}
              <a href="/rules" className="text-lime-400 hover:underline">Acceptable Use Policy</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything you need to grow</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Unlock 20 premium tools starting at $9.50/mo — or buy any feature individually.
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
                    {"links" in feature && feature.links ? (
                      <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
                          {feature.benefit}
                        </span>
                        {feature.links.map((link: { label: string; href: string; icon: string }) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-violet-400/30 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-400/60 transition-all group"
                            data-testid={`link-resource-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-violet-300 group-hover:text-violet-200">
                              {link.icon === "book"
                                ? <BookOpen className="w-4 h-4" />
                                : <GraduationCap className="w-4 h-4" />}
                              {link.label}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-violet-400/60 group-hover:text-violet-300 transition-colors" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {feature.benefit}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 font-bold border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockClick(feature.title);
                          }}
                          data-testid={`button-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          Try It <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
                Built for the most demanding marketing teams. LinksShrink.com Enterprise provides the stability, 
                security, and scale your global brand requires.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Unlimited Links", desc: "Create as many short links as you need with no monthly caps." },
                  { title: "All 20 Premium Tools", desc: "Access every feature including AI Video Ads, deep links, A/B testing, retargeting, and bio pages." },
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
                  <div>
                    <span className="text-xs font-bold text-lime-400 uppercase">Enterprise Dashboard</span>
                    <span className="text-[10px] text-slate-500 ml-2">(Example data)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-lime-400">Live</span>
                    <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-lg font-bold text-white">99.99%</div>
                    <span className="text-[9px] text-slate-500 uppercase">Uptime</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-lg font-bold text-white">24</div>
                    <span className="text-[9px] text-slate-500 uppercase">Domains</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <div className="text-lg font-bold text-white">8</div>
                    <span className="text-[9px] text-slate-500 uppercase">Team Members</span>
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
                Know your audience better than ever. LinksShrink.com Analytics provides deep behavioral data 
                without compromising user privacy.
              </p>
              <ul className="space-y-4">
                {[
                  "UTM parameter tracking & preservation",
                  "Referrer identification & traffic scoring",
                  "Geographic distribution & device breakdowns",
                  "A/B testing & conversion tracking",
                  "Unlimited analytics data retention"
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
              We started LinksShrink.com to simplify how people share information. In a world of long, 
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

      <Footer />
    </div>
  );
}
