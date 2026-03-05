import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Loader2, Copy, Check, Link2, Split, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function ABTesting() {
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [secondaryUrl, setSecondaryUrl] = useState("");
  const [split, setSplit] = useState(50);
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: primaryUrl,
        abTestUrl: secondaryUrl,
        abTestSplit: split,
      }, { "x-feature-key": "ab_test_single" });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl });
      toast({ title: "A/B Test Link Created", description: "Traffic will be split between your two URLs." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!primaryUrl) {
      toast({ title: "Primary URL Required", description: "Please enter a primary URL.", variant: "destructive" });
      return;
    }
    if (!secondaryUrl) {
      toast({ title: "Secondary URL Required", description: "Please enter a secondary URL for the A/B test.", variant: "destructive" });
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
          <div className="bg-cyan-500/10 p-3 rounded-2xl">
            <FlaskConical className="w-8 h-8 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">A/B Testing</h1>
            <p className="text-slate-400">Split traffic between two URLs to find what works best.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Split className="w-5 h-5 text-cyan-400" /> Configure A/B Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Primary URL (Variant A)</Label>
              <div className="relative">
                <Input
                  placeholder="https://example.com/page-a"
                  value={primaryUrl}
                  onChange={(e) => setPrimaryUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-primary-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary URL (Variant B)</Label>
              <div className="relative">
                <Input
                  placeholder="https://example.com/page-b"
                  value={secondaryUrl}
                  onChange={(e) => setSecondaryUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-secondary-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Traffic Split</Label>
              <Slider
                value={[split]}
                onValueChange={(v) => setSplit(v[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
                data-testid="slider-split"
              />
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">Variant A: {split}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400" />
                  <span className="text-slate-300">Variant B: {100 - split}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
              <div className="flex gap-1 h-6 rounded-md overflow-hidden">
                <div
                  className="bg-cyan-400 transition-all duration-300 rounded-l-md flex items-center justify-center text-xs font-bold text-black"
                  style={{ width: `${split}%` }}
                  data-testid="visual-split-a"
                >
                  {split > 15 && "A"}
                </div>
                <div
                  className="bg-pink-400 transition-all duration-300 rounded-r-md flex items-center justify-center text-xs font-bold text-black"
                  style={{ width: `${100 - split}%` }}
                  data-testid="visual-split-b"
                >
                  {100 - split > 15 && "B"}
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Create A/B Test Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-cyan-400/10 border-cyan-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-cyan-400 font-bold uppercase mb-1">Your A/B Test Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-cyan-400/50 text-cyan-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2" data-testid="text-split-info">
                  Split: {split}% A / {100 - split}% B
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