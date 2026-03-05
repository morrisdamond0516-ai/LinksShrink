import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Copy, Check, Link2, CalendarClock, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function LinkScheduling() {
  const [url, setUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; scheduledAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: url,
        scheduledAt: new Date(scheduledDate).toISOString(),
      }, { "x-feature-key": "scheduling_single" });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl, scheduledAt: data.scheduledAt || scheduledDate });
      toast({ title: "Scheduled Link Created", description: "Your link will activate at the scheduled time." });
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
    if (!scheduledDate) {
      toast({ title: "Schedule Required", description: "Please select an activation date and time.", variant: "destructive" });
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

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const isScheduled = result ? new Date(result.scheduledAt) > new Date() : false;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-2xl">
            <CalendarClock className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Link Scheduling</h1>
            <p className="text-slate-400">Schedule when your links become active.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Schedule a Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Destination URL</Label>
              <div className="relative">
                <Input
                  id="target-url"
                  placeholder="https://example.com/launch"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activation Date & Time</Label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getMinDateTime()}
                className="bg-black border-white/10 h-12"
                data-testid="input-scheduled-date"
              />
              <p className="text-xs text-slate-500">
                The link will not redirect visitors until this date and time.
              </p>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarClock className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Schedule Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-blue-400/10 border-blue-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-blue-400 font-bold uppercase mb-1">Your Scheduled Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-blue-400/50 text-blue-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isScheduled ? "bg-yellow-400" : "bg-green-400"}`} />
                  <p className="text-xs text-slate-400" data-testid="text-status">
                    {isScheduled
                      ? `Scheduled - activates ${new Date(result.scheduledAt).toLocaleString()}`
                      : "Active"}
                  </p>
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