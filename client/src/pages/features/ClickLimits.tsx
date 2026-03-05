import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Copy, Check, Link2, MousePointerClick, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function ClickLimits() {
  const [url, setUrl] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; maxClicks: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: url,
        maxClicks: parseInt(maxClicks, 10),
      }, { "x-feature-key": "click_limit_single" });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl, maxClicks: parseInt(maxClicks, 10) });
      toast({ title: "Click-Limited Link Created", description: `Your link will deactivate after ${maxClicks} clicks.` });
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
    const clicks = parseInt(maxClicks, 10);
    if (!maxClicks || isNaN(clicks) || clicks < 1) {
      toast({ title: "Invalid Limit", description: "Please enter a valid click limit (minimum 1).", variant: "destructive" });
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
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <MousePointerClick className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Click Limits</h1>
            <p className="text-slate-400">Automatically deactivate links after a set number of clicks.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-red-400" /> Set Click Limit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Destination URL</Label>
              <div className="relative">
                <Input
                  id="target-url"
                  placeholder="https://example.com/offer"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Maximum Clicks</Label>
              <Input
                type="number"
                min="1"
                placeholder="100"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                className="bg-black border-white/10 h-12"
                data-testid="input-max-clicks"
              />
              <p className="text-xs text-slate-500">
                The link will stop redirecting after this many clicks.
              </p>
            </div>

            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the click limit is reached, visitors will see a deactivated page instead of being redirected.
              </p>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MousePointerClick className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Create Click-Limited Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-red-400/10 border-red-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-red-400 font-bold uppercase mb-1">Your Click-Limited Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-red-400/50 text-red-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2" data-testid="text-limit-info">
                  Limit: {result.maxClicks} clicks
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