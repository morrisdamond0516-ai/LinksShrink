import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, TrendingUp, Users, Globe, Monitor, ArrowLeft, Loader2, MousePointer, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface UrlWithAnalytics {
  id: number;
  shortCode: string;
  originalUrl: string;
  visitCount: number;
  createdAt: string;
  analytics: {
    totalClicks: number;
    uniqueVisitors: number;
  };
}

interface DetailedAnalytics {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; clicks: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
}

export default function Analytics() {
  const [urls, setUrls] = useState<UrlWithAnalytics[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/premium/my-urls");
      if (!response.ok) throw new Error("Failed to fetch URLs");
      const data = await response.json();
      setUrls(data.urls || []);
      if (data.urls?.length > 0) {
        setSelectedUrl(data.urls[0].id.toString());
        fetchAnalytics(data.urls[0].id);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async (urlId: number) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/premium/analytics/${urlId}?days=30`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUrlChange = (urlId: string) => {
    setSelectedUrl(urlId);
    fetchAnalytics(parseInt(urlId));
  };

  const selectedUrlData = urls.find(u => u.id.toString() === selectedUrl);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-2xl">
            <BarChart className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-slate-400">Deep insights into your link performance.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
          </div>
        ) : urls.length === 0 ? (
          <Card className="bg-slate-900 border-white/10">
            <CardContent className="py-16 text-center">
              <BarChart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-bold mb-2">No Links Yet</h3>
              <p className="text-slate-400 mb-6">Create premium links to start tracking analytics.</p>
              <Link href="/">
                <Button className="bg-lime-400 text-black hover:bg-lime-500">Create Your First Link</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Select value={selectedUrl || ""} onValueChange={handleUrlChange}>
                <SelectTrigger className="w-full max-w-md bg-slate-900 border-white/10" data-testid="select-url">
                  <SelectValue placeholder="Select a link to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {urls.map((url) => (
                    <SelectItem key={url.id} value={url.id.toString()}>
                      /{url.shortCode} - {url.originalUrl.substring(0, 40)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUrlData && (
                <a href={selectedUrlData.originalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="border-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>

            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
              </div>
            ) : analytics && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-lime-400/10 p-2 rounded-lg">
                          <MousePointer className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="stat-total-clicks">{analytics.totalClicks}</p>
                          <p className="text-xs text-slate-400">Total Clicks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-400/10 p-2 rounded-lg">
                          <Users className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="stat-unique-visitors">{analytics.uniqueVisitors}</p>
                          <p className="text-xs text-slate-400">Unique Visitors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-400/10 p-2 rounded-lg">
                          <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics.topCountries.length}</p>
                          <p className="text-xs text-slate-400">Countries</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900 border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-400/10 p-2 rounded-lg">
                          <Monitor className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics.deviceBreakdown.length}</p>
                          <p className="text-xs text-slate-400">Device Types</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-lime-400" />
                        Clicks Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.clicksByDay.length > 0 ? (
                        <div className="h-48 flex items-end gap-1">
                          {analytics.clicksByDay.slice(-14).map((day, i) => {
                            const maxClicks = Math.max(...analytics.clicksByDay.map(d => d.clicks), 1);
                            const height = (day.clicks / maxClicks) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center group">
                                <div 
                                  className="w-full bg-lime-400 rounded-t transition-all hover:bg-lime-300"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                  title={`${day.date}: ${day.clicks} clicks`}
                                />
                                <span className="text-[8px] text-slate-500 mt-1 rotate-45 origin-left">
                                  {day.date.split("-").slice(1).join("/")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No click data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        Top Referrers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.topReferrers.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.topReferrers.slice(0, 5).map((ref, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-slate-300 truncate max-w-[200px]">{ref.referrer}</span>
                              <span className="text-sm font-bold text-lime-400">{ref.count}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No referrer data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-purple-400" />
                        Devices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.deviceBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.deviceBreakdown.map((device, i) => {
                            const total = analytics.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                            const percentage = Math.round((device.count / total) * 100);
                            return (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300 capitalize">{device.device}</span>
                                  <span className="text-slate-400">{percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No device data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-yellow-400" />
                        Browsers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.browserBreakdown.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.browserBreakdown.slice(0, 5).map((browser, i) => {
                            const total = analytics.browserBreakdown.reduce((sum, b) => sum + b.count, 0);
                            const percentage = Math.round((browser.count / total) * 100);
                            return (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300">{browser.browser}</span>
                                  <span className="text-slate-400">{percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No browser data yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
