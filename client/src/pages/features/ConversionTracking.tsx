import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, TrendingUp, DollarSign, Target, Code, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface ConversionEvent {
  id: number;
  urlId: number;
  type: string;
  revenue: number | null;
  currency: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ConversionData {
  conversions: ConversionEvent[];
  summary: {
    total: number;
    totalRevenue: number;
    types: string[];
  };
}

interface UserUrl {
  id: number;
  shortCode: string;
  originalUrl: string;
}

export default function ConversionTracking() {
  const [selectedUrlId, setSelectedUrlId] = useState<string>("");
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: urls = [], isLoading: urlsLoading } = useQuery<UserUrl[]>({
    queryKey: ["/api/premium/my-urls"],
    queryFn: async () => {
      const res = await fetch("/api/premium/my-urls", { credentials: "include", headers: { "x-feature-key": "conversion_tracking" } });
      if (!res.ok) throw new Error("Failed to fetch URLs");
      return res.json();
    },
    enabled: isAuthenticated,
    select: (data: any) => data?.urls || data || [],
  });

  const { data: conversionData, isLoading: conversionsLoading } = useQuery<ConversionData>({
    queryKey: ["/api/conversions", selectedUrlId],
    queryFn: async () => {
      const res = await fetch(`/api/conversions/${selectedUrlId}`, { credentials: "include", headers: { "x-feature-key": "conversion_tracking" } });
      if (!res.ok) throw new Error("Failed to fetch conversions");
      return res.json();
    },
    enabled: isAuthenticated && !!selectedUrlId,
  });

  const handleUrlChange = (urlId: string) => {
    setSelectedUrlId(urlId);
  };

  const totalConversions = conversionData?.summary?.total ?? 0;
  const totalRevenue = conversionData?.summary?.totalRevenue ?? 0;
  const events = conversionData?.conversions ?? [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Card className="bg-slate-900 border-white/10">
            <CardContent className="py-16 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-login-prompt">Login Required</h3>
              <p className="text-slate-400 mb-6">Please log in to view conversion tracking data.</p>
              <Link href="/login">
                <Button className="bg-lime-400 text-black" data-testid="button-login">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <Target className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Conversion Tracking</h1>
            <p className="text-slate-400">Track conversions and revenue from your shortened links.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedUrlId} onValueChange={handleUrlChange}>
            <SelectTrigger className="w-full max-w-md bg-slate-900 border-white/10" data-testid="select-url">
              <SelectValue placeholder="Select a link to view conversions" />
            </SelectTrigger>
            <SelectContent>
              {urlsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : urls.length === 0 ? (
                <SelectItem value="none" disabled>No links found</SelectItem>
              ) : (
                urls.map((url) => (
                  <SelectItem key={url.id} value={url.id.toString()}>
                    /{url.shortCode} - {url.originalUrl.substring(0, 40)}...
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedUrlId && (
          <>
            {conversionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-lime-400/10 p-2 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="stat-total-conversions">{totalConversions}</p>
                          <p className="text-xs text-slate-400">Total Conversions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-400/10 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="stat-total-revenue">
                            ${(totalRevenue / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">Total Revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-lime-400" /> Conversion Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {events.length === 0 ? (
                      <p className="text-slate-400 text-center py-8" data-testid="text-no-conversions">
                        No conversion events recorded yet for this link.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-slate-400">Type</TableHead>
                            <TableHead className="text-slate-400">Revenue</TableHead>
                            <TableHead className="text-slate-400">Currency</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {events.map((event) => (
                            <TableRow key={event.id} className="border-white/10" data-testid={`row-conversion-${event.id}`}>
                              <TableCell className="font-medium" data-testid={`text-conversion-type-${event.id}`}>
                                {event.type}
                              </TableCell>
                              <TableCell data-testid={`text-conversion-revenue-${event.id}`}>
                                {event.revenue != null ? `$${(event.revenue / 100).toFixed(2)}` : "-"}
                              </TableCell>
                              <TableCell className="uppercase text-slate-400">
                                {event.currency || "usd"}
                              </TableCell>
                              <TableCell className="text-slate-400" data-testid={`text-conversion-date-${event.id}`}>
                                {new Date(event.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="w-5 h-5 text-lime-400" /> How to Set Up Conversion Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-sm">
              Track conversions by sending a POST request to the conversion tracking API whenever a user
              completes a desired action (purchase, signup, etc.) after clicking your shortened link.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-lime-400 flex items-center gap-2">
                <Code className="w-4 h-4" /> API Endpoint
              </h4>
              <div className="bg-black rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto">
                <p className="text-slate-300">POST /api/conversions/track</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-lime-400 flex items-center gap-2">
                <Code className="w-4 h-4" /> Example Request
              </h4>
              <div className="bg-black rounded-lg p-4 border border-white/10 font-mono text-sm overflow-x-auto" data-testid="code-snippet">
                <pre className="text-slate-300 whitespace-pre">{`fetch("https://yourdomain.com/api/conversions/track", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    urlId: 123,
    type: "purchase",
    revenue: 4999,
    currency: "usd",
    metadata: {
      orderId: "order_abc123",
      product: "Premium Plan"
    }
  })
});`}</pre>
              </div>
            </div>
            <div className="p-4 bg-lime-400/5 rounded-lg border border-lime-400/10">
              <p className="text-sm text-slate-300">
                <strong className="text-lime-400">Note:</strong> Revenue values are in cents (e.g., 4999 = $49.99).
                The <code className="bg-black/50 px-1 rounded text-lime-400">urlId</code> is the ID of your shortened link,
                and <code className="bg-black/50 px-1 rounded text-lime-400">type</code> describes the conversion event
                (e.g., "purchase", "signup", "download").
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
