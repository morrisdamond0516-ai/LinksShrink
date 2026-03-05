import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, AlertCircle, ArrowLeft, Loader2, Copy, Check, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function ExpiringLinks() {
  const [url, setUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a URL.", variant: "destructive" });
      return;
    }
    if (!expiryDate) {
      toast({ title: "Expiry Required", description: "Please set an expiration date.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/premium/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url, expiresAt: new Date(expiryDate).toISOString() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create link");
      }

      const data = await response.json();
      setResult({ shortUrl: data.shortUrl, expiresAt: data.expiresAt });
      toast({ title: "Expiring Link Created", description: "Your link will automatically expire on the set date." });
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

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
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
          <div className="bg-orange-500/10 p-3 rounded-2xl">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Expiring Links</h1>
            <p className="text-slate-400">Automatic deactivation for time-sensitive content.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" /> Create Expiring Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Target URL</Label>
              <div className="relative">
                <Input 
                  id="target-url"
                  placeholder="https://example.com/promo" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiration Date & Time</Label>
              <Input 
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={getMinDateTime()}
                className="bg-black border-white/10 h-12"
                data-testid="input-expiry"
              />
            </div>

            <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the link expires, visitors will see an "Expired" page instead of being redirected to your destination URL.
              </p>
            </div>

            <Button 
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12" 
              onClick={handleCreate}
              disabled={isCreating}
              data-testid="button-create"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
              {isCreating ? "Creating..." : "Create Expiring Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-orange-400/10 border-orange-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-400 font-bold uppercase mb-1">Your Expiring Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyLink}
                    className="border-orange-400/50 text-orange-400 hover:bg-orange-400 hover:text-black"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Expires: {new Date(result.expiresAt).toLocaleString()}
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
