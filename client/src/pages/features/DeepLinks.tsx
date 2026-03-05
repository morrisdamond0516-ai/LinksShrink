import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Smartphone, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function DeepLinks() {
  const [linkId, setLinkId] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/premium/url/${linkId}`, {
        iosDeepLink: iosUrl,
        androidDeepLink: androidUrl,
      }, { "x-feature-key": "deep_link_single" });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deep Links Saved", description: "Mobile users will now be routed to your app." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!linkId) {
      toast({ title: "Link ID Required", description: "Please enter the ID of the link to update.", variant: "destructive" });
      return;
    }
    if (!iosUrl && !androidUrl) {
      toast({ title: "App URL Required", description: "Please enter at least one app URL (iOS or Android).", variant: "destructive" });
      return;
    }
    mutation.mutate();
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
          <div className="bg-lime-400/10 p-3 rounded-2xl">
            <Smartphone className="w-8 h-8 text-lime-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mobile Deep Links</h1>
            <p className="text-slate-400">Route mobile visitors directly to your iOS or Android app.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-lime-400" /> Configure Deep Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="link-id">Link ID</Label>
              <Input
                id="link-id"
                type="number"
                placeholder="e.g., 42"
                value={linkId}
                onChange={(e) => setLinkId(e.target.value)}
                className="bg-black border-white/10 h-12"
                data-testid="input-link-id"
              />
              <p className="text-xs text-slate-500">
                The numeric ID of the short link you want to add deep links to.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ios-url">iOS App URL</Label>
              <div className="relative">
                <Input
                  id="ios-url"
                  placeholder="e.g., myapp://product/123 or https://apps.apple.com/..."
                  value={iosUrl}
                  onChange={(e) => setIosUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-ios-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="android-url">Android App URL</Label>
              <div className="relative">
                <Input
                  id="android-url"
                  placeholder="e.g., myapp://product/123 or https://play.google.com/..."
                  value={androidUrl}
                  onChange={(e) => setAndroidUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-android-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleSave}
              disabled={mutation.isPending}
              data-testid="button-save-deep-links"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Saving..." : "Save Deep Links"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}