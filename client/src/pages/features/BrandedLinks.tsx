import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ArrowLeft, Loader2, Copy, Check, Link2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function BrandedLinks() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [slugError, setSlugError] = useState("");
  const { toast } = useToast();

  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError("");
      return true;
    }
    if (slug.length < 3) {
      setSlugError("Slug must be at least 3 characters");
      return false;
    }
    if (slug.length > 50) {
      setSlugError("Slug must be 50 characters or less");
      return false;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      setSlugError("Only letters, numbers, hyphens, and underscores allowed");
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleCreate = async () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a destination URL.", variant: "destructive" });
      return;
    }
    if (!customSlug) {
      toast({ title: "Custom Slug Required", description: "Please enter a custom slug for your branded link.", variant: "destructive" });
      return;
    }
    if (!validateSlug(customSlug)) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/premium/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-feature-key": "slug_single" },
        body: JSON.stringify({ originalUrl: url, customSlug }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.message?.includes("already exists")) {
          setSlugError("This slug is already taken. Try another.");
        }
        throw new Error(data.message || "Failed to create link");
      }

      const data = await response.json();
      setResult({ shortUrl: data.shortUrl, shortCode: data.shortCode });
      toast({ title: "Branded Link Created", description: "Your custom link is ready to share." });
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
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <Sparkles className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Branded Links</h1>
            <p className="text-slate-400">Create custom, memorable URLs for your brand.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-lime-400" /> Create Custom Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Destination URL</Label>
              <div className="relative">
                <Input 
                  id="target-url"
                  placeholder="https://example.com/your-page" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm whitespace-nowrap">linkshrink.io/</span>
                <Input 
                  placeholder="my-brand-link"
                  value={customSlug}
                  onChange={(e) => {
                    setCustomSlug(e.target.value);
                    validateSlug(e.target.value);
                  }}
                  className={`bg-black border-white/10 h-12 flex-1 ${slugError ? "border-red-500" : ""}`}
                  data-testid="input-slug"
                />
              </div>
              {slugError ? (
                <p className="text-xs text-red-400">{slugError}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Use letters, numbers, hyphens, or underscores. 3-50 characters.
                </p>
              )}
            </div>

            <div className="p-4 bg-lime-400/5 rounded-xl border border-lime-400/10">
              <p className="text-sm text-slate-300">
                <strong className="text-lime-400">Preview:</strong>{" "}
                {customSlug ? (
                  <span className="font-mono">linkshrink.io/{customSlug}</span>
                ) : (
                  <span className="text-slate-500">Enter a custom slug above</span>
                )}
              </p>
            </div>

            <Button 
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12" 
              onClick={handleCreate}
              disabled={isCreating || !!slugError}
              data-testid="button-create"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isCreating ? "Creating..." : "Create Branded Link"}
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
                    <p className="text-xs text-lime-400 font-bold uppercase mb-1">Your Branded Link</p>
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
                  Share this memorable link anywhere. It's uniquely yours!
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
