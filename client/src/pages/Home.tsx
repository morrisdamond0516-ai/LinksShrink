import { useState } from "react";
import { useShortenUrl } from "@/hooks/use-shortener";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shortenMutation = useShortenUrl();

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

  const features = [
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "Branded Links",
      description: "Build trust with custom domains like brand.link/sale.",
      benefit: "Looks professional"
    },
    {
      icon: <BarChart className="w-6 h-6 text-green-500" />,
      title: "Detailed Analytics",
      description: "Track clicks, location, devices, and traffic sources.",
      benefit: "Businesses love this"
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-500" />,
      title: "Smart QR Codes",
      description: "High-resolution, custom colors, and fully downloadable.",
      benefit: "Bridge physical & digital"
    },
    {
      icon: <Lock className="w-6 h-6 text-red-500" />,
      title: "Password Protection",
      description: "Secure your content with password-protected links.",
      benefit: "Privacy focused"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: "Expiring Links",
      description: "Set links to expire after a certain date or click count.",
      benefit: "Limited-time offers"
    },
    {
      icon: <Layers className="w-6 h-6 text-cyan-500" />,
      title: "Bulk Creation",
      description: "Generate thousands of links instantly via API or CSV.",
      benefit: "For power users"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">SnapLink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="hidden sm:flex">Pricing</Button>
            </Link>
            <Button variant="ghost" className="hidden sm:flex">Log In</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Shorten links.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
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
            <Card className="shadow-2xl border-primary/10 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-2 sm:p-4">
                <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Paste your long URL here..."
                      className="pl-10 h-14 text-lg border-transparent bg-secondary/50 focus:bg-white transition-colors"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={shortenMutation.isPending}
                    />
                  </div>
                  <Button 
                    size="xl" 
                    className="h-14 font-semibold text-lg shrink-0"
                    disabled={shortenMutation.isPending || !url}
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
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 bg-secondary/10">
                  <CardContent className="p-8">
                    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 border">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {feature.benefit}
                      </span>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-1 hover-elevate active-elevate-2 shadow-sm"
                        onClick={() => window.alert("Premium features require a paid subscription. No free trial available.")}
                      >
                        Unlock <ArrowRight className="w-4 h-4" />
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
              onClick={() => window.alert("Premium features require a paid subscription. No free trial available.")}
            >
              Unlock All Features
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Upgrade today to access professional marketing tools.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white mb-4">
                <Link2 className="w-6 h-6" />
                <span className="text-xl font-bold">SnapLink</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                The most reliable URL shortener for personal and professional use. Built with modern web technologies.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left">
            © {new Date().getFullYear()} SnapLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
