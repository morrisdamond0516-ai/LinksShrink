import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Copy, Check, Link2, Globe, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "KR", name: "South Korea" },
  { code: "SE", name: "Sweden" },
];

interface GeoRoute {
  country: string;
  url: string;
}

export default function GeoRouting() {
  const [defaultUrl, setDefaultUrl] = useState("");
  const [routes, setRoutes] = useState<GeoRoute[]>([{ country: "", url: "" }]);
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const addRoute = () => {
    setRoutes([...routes, { country: "", url: "" }]);
  };

  const removeRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const updateRoute = (index: number, field: keyof GeoRoute, value: string) => {
    const updated = [...routes];
    updated[index] = { ...updated[index], [field]: value };
    setRoutes(updated);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const geoRoutes: Record<string, string> = {};
      routes.forEach((r) => {
        if (r.country && r.url) {
          geoRoutes[r.country] = r.url;
        }
      });

      const res = await apiRequest("POST", "/api/premium/shorten", {
        originalUrl: defaultUrl,
        geoRoutes,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult({ shortUrl: data.shortUrl });
      toast({ title: "Geo-Targeted Link Created", description: "Visitors will be routed based on their location." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!defaultUrl) {
      toast({ title: "Default URL Required", description: "Please enter a default destination URL.", variant: "destructive" });
      return;
    }
    const validRoutes = routes.filter((r) => r.country && r.url);
    if (validRoutes.length === 0) {
      toast({ title: "Routes Required", description: "Please add at least one country route.", variant: "destructive" });
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

  const usedCountries = routes.map((r) => r.country).filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl">
            <Globe className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Geo Routing</h1>
            <p className="text-slate-400">Route visitors to different URLs based on their country.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" /> Configure Geo Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-url">Default URL (fallback)</Label>
              <div className="relative">
                <Input
                  id="default-url"
                  placeholder="https://example.com/global"
                  value={defaultUrl}
                  onChange={(e) => setDefaultUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                  data-testid="input-default-url"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-500">
                Visitors from countries not listed below will be sent here.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Country Routes</Label>
              {routes.map((route, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={route.country}
                    onValueChange={(v) => updateRoute(index, "country", v)}
                  >
                    <SelectTrigger className="bg-black border-white/10 w-48" data-testid={`select-country-${index}`}>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.filter(
                        (c) => !usedCountries.includes(c.code) || c.code === route.country
                      ).map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://example.com/us"
                    value={route.url}
                    onChange={(e) => updateRoute(index, "url", e.target.value)}
                    className="bg-black border-white/10 h-9 flex-1"
                    data-testid={`input-route-url-${index}`}
                  />
                  {routes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRoute(index)}
                      className="text-slate-500"
                      data-testid={`button-remove-route-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addRoute}
                className="border-white/10 text-slate-300"
                data-testid="button-add-route"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Country
              </Button>
            </div>

            <Button
              className="w-full bg-lime-400 text-black font-bold h-12"
              onClick={handleCreate}
              disabled={mutation.isPending}
              data-testid="button-create"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
              {mutation.isPending ? "Creating..." : "Create Geo-Targeted Link"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-emerald-400/10 border-emerald-400/30 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-emerald-400 font-bold uppercase mb-1">Your Geo-Targeted Link</p>
                    <p className="text-lg font-bold text-white" data-testid="text-result-url">{result.shortUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    className="border-emerald-400/50 text-emerald-400"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2" data-testid="text-routes-info">
                  {routes.filter((r) => r.country && r.url).length} country route(s) configured
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}