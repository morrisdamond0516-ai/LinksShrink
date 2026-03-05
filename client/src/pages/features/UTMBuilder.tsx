import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Copy, Check, Link2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function UTMBuilder() {
  const [url, setUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const previewUrl = () => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (utmSource) u.searchParams.set("utm_source", utmSource);
      if (utmMedium) u.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) u.searchParams.set("utm_campaign", utmCampaign);
      if (utmTerm) u.searchParams.set("utm_term", utmTerm);
      if (utmContent) u.searchParams.set("utm_content", utmContent);
      return u.toString();
    } catch {
      return url;
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: url,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmTerm: utmTerm || undefined,
        utmContent: utmContent || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl });
      toast({ title: "UTM Link Created", description: "Your tracked link is ready to share." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a destination URL.", variant: "destructive" });
      return;
    }
    if (!utmSource) {
      toast({ title: "Source Required", description: "UTM Source is required.", variant: "destructive" });
      return;
    }
    mutation.mutate();
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
          <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <Tag className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">UTM Builder</h1>
            <p className="text-slate-400">Add campaign tracking parameters to your links.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-lime-400" /> Build UTM Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Destination URL</Label>
              <div className="relative">
                <Input
                  id="target-url"
                  placeholder="https://example.com/landing"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source *</Label>
                <Input
                  placeholder="google, newsletter, twitter"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-utm-source"
                />
              </div>
              <div className="space-y-2">
                <Label>Medium</Label>
                <Input
                  placeholder="cpc, email, social"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-utm-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Input
                  placeholder="spring_sale, launch"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-utm-campaign"
                />
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Input
                  placeholder="running+shoes"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-utm-term"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Content</Label>
                <Input
                  placeholder="logolink, textlink"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-utm-content"
                />
              </div>
            </div>

            <div className="p-4 bg-lime-400/5 rounded-xl border border-lime-400/10">
              <p className="text-sm text-slate-300">
                <strong className="text-lime-400">Preview:</strong>{" "}
                {previewUrl() ? (
                  <span className="font-mono text-xs break-all" data-testid="text-preview-url">{previewUrl()}</span>
                ) : (
                  <span className="text-slate-500">Enter a URL and UTM parameters above</span>
                )}
              </p>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Tag className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Create UTM Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-lime-400/10 border-lime-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-lime-400 font-bold uppercase mb-1">Your UTM Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-lime-400/50 text-lime-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}