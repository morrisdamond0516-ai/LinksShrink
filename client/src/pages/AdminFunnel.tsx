import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Smartphone,
  Monitor,
  Tablet,
  CreditCard,
  ArrowDownRight,
  Activity,
  Package,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
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
interface PageStat {
  page: string | null;
  count: number;
  uniqueSessions: number;
}
interface Purchase {
  id: number;
  userId: string | null;
  featureKey: string;
  sessionId: string;
  purchasedAt: string;
}
interface FeatureStat {
  featureKey: string;
  count: number;
}
interface HourlyEvent {
  hour: number;
  count: number;
}
interface FunnelData {
  events: FunnelStat[];
  dailyEvents: DailyEvent[];
  recentEvents: RecentEvent[];
  topReferrers: ReferrerStat[];
  topPages: PageStat[];
  recentPurchases: Purchase[];
  totalPurchases: number;
  purchasesByFeature: FeatureStat[];
  hourlyEvents: HourlyEvent[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page View",
  shorten_click: "URL Shortened",
  buy_click: "Buy Clicked",
  checkout_started: "Checkout Started",
  checkout_completed: "Purchase Complete",
  register: "Registration",
  login: "Login",
};

const EVENT_COLORS: Record<string, string> = {
  page_view: "bg-blue-500",
  shorten_click: "bg-green-500",
  buy_click: "bg-lime-500",
  checkout_started: "bg-yellow-500",
  checkout_completed: "bg-emerald-500",
  register: "bg-purple-500",
  login: "bg-sky-500",
};

const EVENT_DOT: Record<string, string> = {
  page_view: "bg-blue-400",
  shorten_click: "bg-green-400",
  buy_click: "bg-lime-400",
  checkout_started: "bg-yellow-400",
  checkout_completed: "bg-emerald-400",
  register: "bg-purple-400",
  login: "bg-sky-400",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatFeatureKey(key: string) {
  return key
    .replace(/_single$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.max(3, (value / max) * 100) : 3;
  return (
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex-1">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${w}%` }} />
    </div>
  );
}

export default function AdminFunnel() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState(30);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { data, isLoading, error } = useQuery<FunnelData>({
    queryKey: [`/api/funnel/stats?days=${days}`],
    enabled: isAuthenticated,
    refetchInterval: 60000,
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

  const getCount = (type: string) =>
    (data?.events || []).filter((e) => e.eventType === type).reduce((s, e) => s + e.count, 0);
  const getSessions = (type: string) =>
    (data?.events || []).filter((e) => e.eventType === type).reduce((s, e) => s + e.uniqueSessions, 0);

  const pageViews = getCount("page_view");
  const shortenClicks = getCount("shorten_click");
  const buyClicks = getCount("buy_click");
  const checkoutStarted = getCount("checkout_started");
  const checkoutCompleted = getCount("checkout_completed");
  const registrations = getCount("register");
  const logins = getCount("login");
  const totalPurchases = data?.totalPurchases ?? 0;

  const uniqueSessions = getSessions("page_view");
  const conversionRate = pageViews > 0 ? ((totalPurchases / pageViews) * 100).toFixed(2) : "0.00";

  const funnelSteps = [
    { label: "Visited the Site", count: pageViews, color: "bg-blue-500", icon: Eye },
    { label: "Shortened a URL", count: shortenClicks, color: "bg-green-500", icon: MousePointerClick },
    { label: "Clicked Buy / Pricing", count: buyClicks, color: "bg-lime-500", icon: ShoppingCart },
    { label: "Started Checkout", count: checkoutStarted, color: "bg-yellow-500", icon: CreditCard },
    { label: "Completed Purchase", count: checkoutCompleted || totalPurchases, color: "bg-emerald-500", icon: Package },
  ].filter((s) => s.count > 0 || s.label === "Visited the Site");

  const maxFunnel = funnelSteps[0]?.count || 1;

  const allDates = [...new Set((data?.dailyEvents || []).map((e) => e.date))].sort();
  const last14 = allDates.slice(-14);

  const eventTypes = ["page_view", "shorten_click", "buy_click", "checkout_completed", "register"];
  const getCountForDateType = (date: string, type: string) =>
    (data?.dailyEvents || []).find((e) => e.date === date && e.eventType === type)?.count || 0;

  const maxDailyCount = last14.reduce((max, date) => {
    const total = eventTypes.reduce((s, t) => s + getCountForDateType(date, t), 0);
    return Math.max(max, total);
  }, 1);

  const maxHourly = Math.max(...(data?.hourlyEvents || []).map((h) => h.count), 1);

  const device = data?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 };
  const totalDevice = device.mobile + device.desktop + device.tablet || 1;

  const displayedEvents = showAllEvents
    ? data?.recentEvents || []
    : (data?.recentEvents || []).slice(0, 20);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-funnel-title">
                <BarChart3 className="w-8 h-8 text-lime-400" />
                Customer Journey Analytics
              </h1>
              <p className="text-gray-400 mt-1">Every click, every step, every drop-off — all in one place</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-sm">Time range:</span>
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">Failed to load analytics. Please refresh.</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-800" data-testid="card-visitors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Total Visitors</span>
                  </div>
                  <p className="text-3xl font-bold" data-testid="stat-page-views">{pageViews.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{uniqueSessions.toLocaleString()} unique sessions</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-purchases">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-lime-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Purchases</span>
                  </div>
                  <p className="text-3xl font-bold text-lime-400" data-testid="stat-purchases">{totalPurchases.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">feature & plan sales</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-conversion">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Conversion Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400" data-testid="stat-conversion">{conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">visitors → paid</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800" data-testid="card-registrations">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-xs uppercase tracking-wide">New Sign-ups</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400" data-testid="stat-registrations">{registrations.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{logins.toLocaleString()} logins total</p>
                </CardContent>
              </Card>
            </div>

            {/* Customer Journey Funnel */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-lime-400" />
                  Customer Journey Funnel
                  <span className="text-xs font-normal text-gray-500 ml-2">— where do customers drop off?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnelSteps.map((step, i) => {
                  const prev = funnelSteps[i - 1]?.count ?? step.count;
                  const dropPct = i > 0 && prev > 0 ? Math.round(((prev - step.count) / prev) * 100) : null;
                  const barWidth = Math.max(3, (step.count / maxFunnel) * 100);
                  const Icon = step.icon;
                  return (
                    <div key={i} data-testid={`funnel-step-${i}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200 text-sm">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {dropPct !== null && (
                            <div className="flex items-center gap-1 text-red-400 text-xs">
                              <ArrowDownRight className="w-3 h-3" />
                              {dropPct}% dropped off
                            </div>
                          )}
                          <span className="text-white font-bold text-sm w-16 text-right">
                            {step.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-800 rounded overflow-hidden">
                        <div
                          className={`h-full ${step.color} rounded flex items-center pl-3 transition-all`}
                          style={{ width: `${barWidth}%` }}
                        >
                          {barWidth > 10 && (
                            <span className="text-white text-xs font-semibold">
                              {pageViews > 0 ? `${Math.round((step.count / pageViews) * 100)}%` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {funnelSteps.length <= 1 && (
                  <p className="text-gray-500 text-center py-6 text-sm">
                    Funnel data will populate as visitors move through your site. Tracking is active.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Daily Activity Chart */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Daily Activity (last {Math.min(14, last14.length)} days)
                </CardTitle>
                <div className="flex flex-wrap gap-3 mt-2">
                  {eventTypes.map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${EVENT_DOT[t]}`} />
                      <span className="text-gray-400 text-xs">{EVENT_LABELS[t]}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {last14.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">No daily data yet for this time range.</p>
                ) : (
                  <div className="flex items-end gap-1 h-48">
                    {last14.map((date) => {
                      const segments = eventTypes.map((t) => ({
                        type: t,
                        count: getCountForDateType(date, t),
                        color: EVENT_COLORS[t],
                      })).filter((s) => s.count > 0);
                      const total = segments.reduce((s, seg) => s + seg.count, 0);
                      const barH = Math.max(4, (total / maxDailyCount) * 100);
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center group relative">
                          <div
                            className="w-full flex flex-col-reverse overflow-hidden rounded-t"
                            style={{ height: `${barH}%` }}
                          >
                            {segments.map((seg) => (
                              <div
                                key={seg.type}
                                className={`w-full ${seg.color} flex-shrink-0`}
                                style={{ height: `${(seg.count / total) * 100}%` }}
                              />
                            ))}
                          </div>
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-800 border border-gray-700 rounded p-2 text-xs whitespace-nowrap shadow-xl">
                            <p className="text-white font-semibold mb-1">{date}</p>
                            {segments.map((seg) => (
                              <p key={seg.type} className="text-gray-300">
                                {EVENT_LABELS[seg.type]}: <span className="text-white font-bold">{seg.count}</span>
                              </p>
                            ))}
                            <p className="text-lime-400 font-bold mt-1">Total: {total}</p>
                          </div>
                          <span className="text-[8px] text-gray-600 mt-1 rotate-45 origin-left whitespace-nowrap">
                            {date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3-column row: Traffic Sources, Top Pages, Purchases by Feature */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.topReferrers?.length ? (
                    <p className="text-gray-500 text-sm text-center py-6">No referrer data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topReferrers.map((ref, i) => {
                        const max = data.topReferrers[0]?.count || 1;
                        let label = ref.referrer;
                        try { label = new URL(ref.referrer).hostname; } catch {}
                        return (
                          <div key={i} data-testid={`stat-referrer-${i}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 truncate max-w-[160px]" title={ref.referrer}>{label}</span>
                              <span className="text-white font-semibold">{ref.count}</span>
                            </div>
                            <MiniBar value={ref.count} max={max} color="bg-purple-500" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    Most Visited Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.topPages?.length ? (
                    <p className="text-gray-500 text-sm text-center py-6">No page view data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topPages.map((p, i) => {
                        const max = data.topPages[0]?.count || 1;
                        return (
                          <div key={i} data-testid={`stat-page-${i}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 font-mono text-xs truncate max-w-[160px]">{p.page || "/"}</span>
                              <span className="text-white font-semibold">{p.count}</span>
                            </div>
                            <MiniBar value={p.count} max={max} color="bg-blue-500" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-lime-400" />
                    Purchases by Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.purchasesByFeature?.length ? (
                    <p className="text-gray-500 text-sm text-center py-6">No purchases yet in this period.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.purchasesByFeature.map((f, i) => {
                        const max = data.purchasesByFeature[0]?.count || 1;
                        return (
                          <div key={i} data-testid={`stat-feature-${i}`}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 truncate max-w-[160px]">{formatFeatureKey(f.featureKey)}</span>
                              <span className="text-lime-400 font-semibold">{f.count}</span>
                            </div>
                            <MiniBar value={f.count} max={max} color="bg-lime-500" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Device Breakdown + Hourly Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    Device Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Desktop", key: "desktop", icon: Monitor, color: "bg-indigo-500", textColor: "text-indigo-400" },
                    { label: "Mobile", key: "mobile", icon: Smartphone, color: "bg-pink-500", textColor: "text-pink-400" },
                    { label: "Tablet", key: "tablet", icon: Tablet, color: "bg-orange-500", textColor: "text-orange-400" },
                  ].map(({ label, key, icon: Icon, color, textColor }) => {
                    const val = device[key as keyof typeof device];
                    const pct = Math.round((val / totalDevice) * 100);
                    return (
                      <div key={key} data-testid={`device-${key}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${textColor}`} />
                            <span className="text-gray-300 text-sm">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                            <span className="text-gray-500 text-xs">({val.toLocaleString()})</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Activity by Hour of Day
                    <span className="text-xs font-normal text-gray-500">(when are visitors most active?)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.hourlyEvents?.length ? (
                    <p className="text-gray-500 text-sm text-center py-6">No hourly data yet.</p>
                  ) : (
                    <div className="flex items-end gap-0.5 h-24">
                      {Array.from({ length: 24 }, (_, h) => {
                        const found = data.hourlyEvents.find((e) => e.hour === h);
                        const count = found?.count || 0;
                        const barH = Math.max(2, (count / maxHourly) * 100);
                        const isActive = count === Math.max(...data.hourlyEvents.map((e) => e.count));
                        return (
                          <div key={h} className="flex-1 flex flex-col items-center group relative">
                            <div
                              className={`w-full rounded-t transition-all ${isActive ? "bg-amber-400" : "bg-amber-500/50"}`}
                              style={{ height: `${barH}%` }}
                            />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-800 border border-gray-700 rounded p-1.5 text-xs whitespace-nowrap shadow-xl">
                              <span className="text-white">{h}:00 — <span className="font-bold">{count}</span> events</span>
                            </div>
                            {h % 4 === 0 && (
                              <span className="text-[7px] text-gray-600 mt-0.5">{h}h</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Purchases */}
            {data?.recentPurchases && data.recentPurchases.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Recent Purchases
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {totalPurchases} total this period
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.recentPurchases.slice(0, 10).map((p, i) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm"
                        data-testid={`purchase-${i}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium">{formatFeatureKey(p.featureKey)}</span>
                          {p.userId && (
                            <span className="text-gray-500 text-xs font-mono">{p.userId.slice(0, 8)}…</span>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs whitespace-nowrap">{formatTime(p.purchasedAt)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Event Feed */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-lime-400" />
                  Live Event Feed
                  <span className="text-xs font-normal text-gray-500 ml-1">— every tracked action</span>
                  <Badge className="ml-auto bg-gray-800 text-gray-400 border-gray-700 text-xs">
                    {data?.recentEvents?.length || 0} events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!data?.recentEvents?.length ? (
                  <p className="text-gray-500 text-center py-8 text-sm">No events recorded yet. They'll appear as visitors use your site.</p>
                ) : (
                  <>
                    <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                      {displayedEvents.map((event, i) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 text-sm py-2.5 border-b border-gray-800/60 last:border-0"
                          data-testid={`event-${i}`}
                        >
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${EVENT_DOT[event.eventType] || "bg-gray-500"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-medium">
                                {EVENT_LABELS[event.eventType] || event.eventType}
                              </span>
                              {event.page && (
                                <span className="text-gray-500 font-mono text-xs truncate">{event.page}</span>
                              )}
                              {event.metadata?.planName && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1.5 py-0">
                                  {event.metadata.planName}
                                </Badge>
                              )}
                              {event.metadata?.featureKey && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1.5 py-0">
                                  {formatFeatureKey(event.metadata.featureKey)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                              {event.referrer && (
                                <span className="truncate max-w-[180px]">from {event.referrer}</span>
                              )}
                              {event.sessionId && (
                                <span className="font-mono">sess:{event.sessionId.slice(0, 6)}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-600 text-xs whitespace-nowrap flex-shrink-0">
                            {formatTime(event.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(data?.recentEvents?.length || 0) > 20 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-gray-500 hover:text-white text-sm"
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        data-testid="button-show-all-events"
                      >
                        {showAllEvents ? (
                          <><ChevronUp className="w-4 h-4 mr-1" /> Show less</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-1" /> Show all {data?.recentEvents?.length} events</>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
