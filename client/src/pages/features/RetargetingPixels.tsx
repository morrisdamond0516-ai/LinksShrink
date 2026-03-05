import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Copy, Check, Link2, Target, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function RetargetingPixels() {
  const [url, setUrl] = useState("");
  const [facebookPixel, setFacebookPixel] = useState("");
  const [googleAnalytics, setGoogleAnalytics] = useState("");
  const [tiktokPixel, setTiktokPixel] = useState("");
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const pixels: Record<string, string> = {};
      if (facebookPixel) pixels.facebook = facebookPixel;
      if (googleAnalytics) pixels.google = googleAnalytics;
      if (tiktokPixel) pixels.tiktok = tiktokPixel;

      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: url,
        retargetingPixels: JSON.stringify(pixels),
      }, { "x-feature-key": "retargeting_single" });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl });
      toast({ title: "Retargeting Link Created", description: "Your pixels are now embedded in the link." });
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
    if (!facebookPixel && !googleAnalytics && !tiktokPixel) {
      toast({ title: "Pixel Required", description: "Please enter at least one pixel ID.", variant: "destructive" });
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
          <div className="bg-purple-500/10 p-3 rounded-2xl">
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Retargeting Pixels</h1>
            <p className="text-slate-400">Embed tracking pixels in your short links.</p>
          </div>
        </div>

        <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 flex gap-3 max-w-2xl">
          <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400 leading-relaxed">
            <p className="text-purple-300 font-semibold mb-1">How retargeting works</p>
            <p>When someone clicks your short link, the tracking pixels fire before redirecting to the destination. This lets you build custom audiences on Facebook, Google, and TikTok for retargeting ads, even if you don't own the destination website.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Setup Retargeting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Destination URL</Label>
              <div className="relative">
                <Input
                  id="target-url"
                  placeholder="https://example.com/product"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input
                  placeholder="123456789012345"
                  value={facebookPixel}
                  onChange={(e) => setFacebookPixel(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-facebook-pixel"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  placeholder="G-XXXXXXXXXX"
                  value={googleAnalytics}
                  onChange={(e) => setGoogleAnalytics(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-google-analytics"
                />
              </div>
              <div className="space-y-2">
                <Label>TikTok Pixel ID</Label>
                <Input
                  placeholder="CXXXXXXXXXXXXXXXXX"
                  value={tiktokPixel}
                  onChange={(e) => setTiktokPixel(e.target.value)}
                  className="bg-black border-white/10 h-12"
                  data-testid="input-tiktok-pixel"
                />
              </div>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Create Retargeting Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-purple-400/10 border-purple-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-purple-400 font-bold uppercase mb-1">Your Retargeting Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-purple-400/50 text-purple-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Pixels: {facebookPixel && "Facebook"} {googleAnalytics && "Google"} {tiktokPixel && "TikTok"}
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