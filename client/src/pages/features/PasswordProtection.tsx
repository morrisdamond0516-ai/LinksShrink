import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck, Eye, EyeOff, Link2, ArrowLeft, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function PasswordProtection() {
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a URL to protect.", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password Required", description: "Please set a password for the link.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/premium/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-feature-key": "password_single" },
        body: JSON.stringify({ originalUrl: url, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create link");
      }

      const data = await response.json();
      setResult({ shortUrl: data.shortUrl, shortCode: data.shortCode });
      toast({ title: "Link Secured", description: "Password protection has been applied to your link." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (result) {
      navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Link copied to clipboard." });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Password Protection</h1>
            <p className="text-slate-400">Secure your links with password access control.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-lime-400" /> Create Protected Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Target URL</Label>
              <div className="relative">
                <Input 
                  id="target-url"
                  placeholder="https://example.com/sensitive-doc" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Set Link Password</Label>
              <div className="relative">
                <Input 
                  type={show ? "text" : "password"}
                  placeholder="Enter a strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-white/10 pr-10 h-12"
                  data-testid="input-password"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Visitors will need to enter this password to access the destination.</p>
            </div>

            <Button 
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12" 
              onClick={handleCreate}
              disabled={isCreating}
              data-testid="button-create"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {isCreating ? "Creating..." : "Create Protected Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-lime-400/10 border-lime-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-lime-400 font-bold uppercase mb-1">Your Protected Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyLink}
                    className="border-lime-400/50 text-lime-400 hover:bg-lime-400 hover:text-black"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Visitors will see a password prompt before being redirected to your destination.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
