import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowLeft,
  Globe,
  Clock,
} from "lucide-react";

interface FunnelStat {
  eventType: string;
  page: string | null;
  count: number;
  uniqueSessions: number;
}

interface DailyEvent {
  date: string;
  eventType: string;
  count: number;
}

interface RecentEvent {
  id: number;
  eventType: string;
  page: string | null;
  metadata: any;
  sessionId: string | null;
  userId: string | null;
  referrer: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface ReferrerStat {
  referrer: string;
  count: number;
}

interface FunnelData {
  events: FunnelStat[];
  dailyEvents: DailyEvent[];
  recentEvents: RecentEvent[];
  topReferrers: ReferrerStat[];
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page Views",
  shorten_click: "URL Shortened",
  buy_click: "Buy Button Clicks",
  checkout_started: "Checkout Started",
  checkout_completed: "Checkout Completed",
  register: "Registrations",
  login: "Logins",
};

const EVENT_ICONS: Record<string, any> = {
  page_view: Eye,
  shorten_click: MousePointerClick,
  buy_click: ShoppingCart,
  checkout_started: TrendingUp,
  checkout_completed: ShoppingCart,
};

export default function AdminFunnel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery<FunnelData>({
    queryKey: [`/api/funnel/stats?days=${days}`],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">You must be logged in to view analytics.</p>
        <Link href="/login">
          <Button data-testid="button-login">Log In</Button>
        </Link>
      </div>
    );
  }

  const getEventCount = (eventType: string): number => {
    if (!data?.events) return 0;
    return data.events
      .filter((e) => e.eventType === eventType)
      .reduce((sum, e) => sum + e.count, 0);
  };

  const getUniqueSessionCount = (eventType: string): number => {
    if (!data?.events) return 0;
    return data.events
      .filter((e) => e.eventType === eventType)
      .reduce((sum, e) => sum + e.uniqueSessions, 0);
  };

  const pageViews = getEventCount("page_view");
  const buyClicks = getEventCount("buy_click");
  const shortenClicks = getEventCount("shorten_click");
  const conversionRate = pageViews > 0 ? ((buyClicks / pageViews) * 100).toFixed(1) : "0";

  const pageBreakdown = data?.events
    ?.filter((e) => e.eventType === "page_view")
    ?.sort((a, b) => b.count - a.count) || [];

  const buyBreakdown = data?.events
    ?.filter((e) => e.eventType === "buy_click")
    ?.sort((a, b) => b.count - a.count) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-funnel-title">
              <BarChart3 className="inline w-8 h-8 mr-2 text-lime-400" />
              Purchase Funnel Analytics
            </h1>
            <p className="text-gray-400 mt-1">Track how visitors move through your purchase flow</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
              className={days === d ? "bg-lime-500 text-black hover:bg-lime-400" : "border-gray-700 text-gray-400 hover:text-white"}
              data-testid={`button-days-${d}`}
            >
              {d}d
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            Failed to load analytics data. Please try again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-800" data-testid="card-page-views">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">Page Views</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{pageViews.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{getUniqueSessionCount("page_view")} unique sessions</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-shorten-clicks">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MousePointerClick className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 text-sm">URLs Shortened</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{shortenClicks.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-buy-clicks">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-5 h-5 text-lime-400" />
                    <span className="text-gray-400 text-sm">Buy Button Clicks</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{buyClicks.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-conversion-rate">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Conversion Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">views → buy clicks</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    Page Views Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No page view data yet. Views will appear as visitors browse your site.</p>
                  ) : (
                    <div className="space-y-3">
                      {pageBreakdown.map((item, i) => {
                        const maxCount = pageBreakdown[0]?.count || 1;
                        const width = Math.max(5, (item.count / maxCount) * 100);
                        return (
                          <div key={i} data-testid={`stat-page-${i}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 font-mono">{item.page || "unknown"}</span>
                              <span className="text-white font-semibold">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-lime-400" />
                    Buy Click Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {buyBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No buy clicks yet. Data will appear when visitors click purchase buttons.</p>
                  ) : (
                    <div className="space-y-3">
                      {buyBreakdown.map((item, i) => {
                        const maxCount = buyBreakdown[0]?.count || 1;
                        const width = Math.max(5, (item.count / maxCount) * 100);
                        return (
                          <div key={i} data-testid={`stat-buy-${i}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 font-mono">{item.page || "unknown"}</span>
                              <span className="text-white font-semibold">{item.count}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-lime-500 rounded-full transition-all"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.topReferrers || data.topReferrers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No referrer data yet. This shows where your visitors come from.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topReferrers.map((ref, i) => (
                        <div key={i} className="flex justify-between items-center" data-testid={`stat-referrer-${i}`}>
                          <span className="text-gray-300 text-sm truncate max-w-[250px]">{ref.referrer}</span>
                          <span className="text-white font-semibold text-sm">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.recentEvents || data.recentEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No activity yet. Events will appear as visitors use your site.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {data.recentEvents.slice(0, 20).map((event, i) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 text-sm py-2 border-b border-gray-800 last:border-0"
                          data-testid={`event-recent-${i}`}
                        >
                          <div className="flex-1">
                            <span className="text-lime-400 font-medium">
                              {EVENT_LABELS[event.eventType] || event.eventType}
                            </span>
                            {event.page && (
                              <span className="text-gray-500 ml-2 font-mono text-xs">{event.page}</span>
                            )}
                            {event.metadata && typeof event.metadata === "object" && (event.metadata as any).planName && (
                              <span className="text-yellow-400 ml-2 text-xs">({(event.metadata as any).planName})</span>
                            )}
                            {event.metadata && typeof event.metadata === "object" && (event.metadata as any).featureKey && (
                              <span className="text-blue-400 ml-2 text-xs">({(event.metadata as any).featureKey})</span>
                            )}
                          </div>
                          <span className="text-gray-600 text-xs whitespace-nowrap">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-lime-400" />
                  Purchase Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Visited Site", count: pageViews, color: "bg-blue-500" },
                    { label: "Shortened a URL", count: shortenClicks, color: "bg-green-500" },
                    { label: "Clicked Buy", count: buyClicks, color: "bg-lime-500" },
                  ].map((step, i) => {
                    const maxVal = Math.max(pageViews, 1);
                    const width = Math.max(3, (step.count / maxVal) * 100);
                    const dropoff = i > 0 ? (
                      [pageViews, shortenClicks, buyClicks][i - 1] > 0
                        ? ((([ pageViews, shortenClicks, buyClicks][i - 1] - step.count) / [pageViews, shortenClicks, buyClicks][i - 1]) * 100).toFixed(0)
                        : "0"
                    ) : null;
                    return (
                      <div key={i} data-testid={`funnel-step-${i}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300">{step.label}</span>
                          <div className="flex items-center gap-3">
                            {dropoff !== null && (
                              <span className="text-red-400 text-xs">-{dropoff}% drop-off</span>
                            )}
                            <span className="text-white font-bold">{step.count.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded overflow-hidden">
                          <div
                            className={`h-full ${step.color} rounded transition-all flex items-center pl-3`}
                            style={{ width: `${width}%` }}
                          >
                            {width > 15 && (
                              <span className="text-white text-xs font-semibold">{step.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
