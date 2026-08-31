import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Youtube,
  Shield,
  Wand2,
  Upload,
  Play,
  Trash2,
  Star,
  AlertCircle,
  RotateCcw,
  Minus,
  Plus,
  Wallet,
  ClipboardPaste,
  Download,
} from "lucide-react";

const ADMIN_EMAIL = "morrisdamond0516@gmail.com";

type KidsVisualStyle = "cocomelon" | "blippi" | "chuchu";

interface VideoAd {
  id: number;
  status: string;
  prompt: string;
  heygenVideoId?: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  errorMessage?: string | null;
  kidsSaved?: boolean;
  createdAt: string;
}

type KidsGenerationMode = "basic" | "viral";

const FORMAT_LABELS: Record<string, string> = {
  sing_along: "Toddler Sing-Along",
  wrong_sound: "Wrong Sound Quiz",
  story_remix: "Story Remix",
  parent_pov: "Parent POV Speed Run",
  asmr_texture: "ASMR Soundscape",
  emoji_chat: "Emoji Chat",
};

function parseKidsVideoMeta(prompt: string) {
  const line = (re: RegExp) => prompt.match(re)?.[1]?.trim() ?? "";
  const styleRaw = line(/^\[KIDS (\w+)\]/);
  const style = (styleRaw in STYLE_META ? styleRaw : null) as KidsVisualStyle | null;
  const conceptLine = line(/CONCEPT: ([^\n]+)/);
  const formatId =
    Object.keys(FORMAT_LABELS).find((k) => conceptLine.toLowerCase().includes(k.replace(/_/g, " "))) ||
    (conceptLine.includes("Parent Trap") ? "parent_pov" : conceptLine.includes("ASMR") ? "asmr_texture" : "");
  return {
    style,
    styleLabel: style ? STYLE_META[style].label : styleRaw || "Unknown",
    rhyme: line(/NURSERY RHYME BASE: ([^\n]+)/),
    hook: line(/HOOK \(first 2 seconds\): ([^\n]+)/),
    concept: conceptLine,
    formatLabel: FORMAT_LABELS[formatId] || conceptLine.split(":")[0] || "Kids Short",
    youtubeTitle: line(/Suggested title: ([^\n]+)/),
    displayTitle: prompt.split("\n")[0]?.replace(/^\[KIDS[^\]]*\]\s*/, "").replace(/\s*\[[^\]]+\]\s*$/, "").trim(),
    requestedSeconds: parseInt(line(/TARGET LENGTH: exactly (\d+) seconds/), 10) || null,
  };
}

const STYLE_META: Record<KidsVisualStyle, { label: string; short: string; color: string; desc: string }> = {
  cocomelon: {
    label: "3D Cartoon Song",
    short: "3D",
    color: "bg-pink-500/20 border-pink-500/40 text-pink-300",
    desc: "Cocomelon-style 3D animation",
  },
  blippi: {
    label: "Presenter Explorer",
    short: "Presenter",
    color: "bg-orange-500/20 border-orange-500/40 text-orange-300",
    desc: "Blippi-style live presenter + props",
  },
  chuchu: {
    label: "2D Sing-Along",
    short: "2D",
    color: "bg-sky-500/20 border-sky-500/40 text-sky-300",
    desc: "ChuChu TV-style flat 2D cartoon",
  },
};

type StyleCounts = {
  cocomelon: number;
  chuchu: number;
  blippi: number;
  random: number;
};

const MAX_BATCH_VIDEOS = 10;
const STYLE_COUNT_KEYS = ["cocomelon", "chuchu", "blippi", "random"] as const;

function totalVideos(counts: StyleCounts): number {
  return counts.cocomelon + counts.chuchu + counts.blippi + counts.random;
}

function describeStylePlan(counts: StyleCounts): string {
  const parts: string[] = [];
  if (counts.cocomelon) parts.push(`${counts.cocomelon}× 3D`);
  if (counts.chuchu) parts.push(`${counts.chuchu}× 2D`);
  if (counts.blippi) parts.push(`${counts.blippi}× Presenter`);
  if (counts.random) parts.push(`${counts.random}× Random`);
  return parts.join(" + ");
}

const STYLE_COUNT_META: Record<
  (typeof STYLE_COUNT_KEYS)[number],
  { label: string; short: string; color: string; desc: string }
> = {
  cocomelon: { ...STYLE_META.cocomelon },
  chuchu: { ...STYLE_META.chuchu },
  blippi: { ...STYLE_META.blippi },
  random: {
    label: "Random style",
    short: "Random",
    color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
    desc: "Surprise — picks 3D, 2D, or Presenter per video",
  },
};

export default function AdminKidsShorts() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [durationMinutes, setDurationMinutes] = useState<1 | 3 | 5>(1);
  const [generationMode, setGenerationMode] = useState<KidsGenerationMode>("basic");
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private");
  const [autoUpload, setAutoUpload] = useState(true);
  const [styleCounts, setStyleCounts] = useState<StyleCounts>({
    cocomelon: 1,
    chuchu: 0,
    blippi: 0,
    random: 0,
  });
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [pendingUploadIds, setPendingUploadIds] = useState<Set<number>>(new Set());
  const [pastedScript, setPastedScript] = useState("");
  const [pasteStyle, setPasteStyle] = useState<KidsVisualStyle>("cocomelon");
  const [pasteDuration, setPasteDuration] = useState<1 | 3 | 5>(1);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteFormatHint, setPasteFormatHint] = useState<string>("");

  const batchTotal = totalVideos(styleCounts);
  const estHeyGenCost = batchTotal * durationMinutes * 2;
  const pasteEstCost = pasteDuration * 2;

  const adjustStyleCount = (key: (typeof STYLE_COUNT_KEYS)[number], delta: number) => {
    setStyleCounts((prev) => {
      const next = { ...prev, [key]: Math.max(0, Math.min(10, prev[key] + delta)) };
      if (totalVideos(next) > MAX_BATCH_VIDEOS) return prev;
      return next;
    });
  };

  const applyStylePreset = (preset: StyleCounts) => setStyleCounts(preset);

  const isAdmin = !!user && (user as { email?: string }).email === ADMIN_EMAIL;

  const { data: meta } = useQuery<{
    formats: { id: string; label: string; description: string }[];
    generationModes?: { id: KidsGenerationMode; label: string; description: string }[];
    viralMethod?: { summary: string; steps: string[]; secretSauce: string };
    aiConfigured?: boolean;
    aiHint?: string;
    durations?: { id: number; label: string; seconds: number; hint: string }[];
    librarySize?: number;
    libraryNote?: string;
  }>({
    queryKey: ["/api/admin/kids-shorts/formats"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: social } = useQuery<{ youtube?: { connected: boolean; accountLabel?: string } }>({
    queryKey: ["/api/admin/social/status"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: heygenWallet, refetch: refetchWallet } = useQuery<{
    remainingBalanceUsd: number | null;
    usdPerMinuteEstimate: number;
    billingType?: string | null;
  }>({
    queryKey: ["/api/admin/heygen/wallet"],
    enabled: isAuthenticated && isAdmin,
    staleTime: 30_000,
  });

  const walletBalance = heygenWallet?.remainingBalanceUsd;
  const walletTooLow =
    walletBalance != null && batchTotal > 0 && estHeyGenCost > walletBalance + 0.01;
  const pasteWalletTooLow =
    walletBalance != null && pasteEstCost > walletBalance + 0.01;

  const { data: scriptTemplates } = useQuery<{
    templates: { id: string; label: string; script: string }[];
  }>({
    queryKey: ["/api/admin/kids-shorts/templates"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: heygenVideos, refetch: refetchHeygenVideos, isLoading: heygenVideosLoading, isError: heygenVideosError, error: heygenVideosErrorObj } = useQuery<{
    videos: {
      id: string;
      title: string;
      status: string;
      duration: number | null;
      videoUrl: string | null;
      thumbnailUrl: string | null;
    }[];
  }>({
    queryKey: ["/api/admin/heygen/videos"],
    enabled: isAuthenticated && isAdmin,
    staleTime: 60_000,
  });

  const { data: myVideos = [], refetch: refetchVideos } = useQuery<VideoAd[]>({
    queryKey: ["/api/video-ads/my-videos"],
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 15000,
  });

  const dailyDropMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/kids-shorts/daily-drop", {
        durationMinutes,
        styleCounts,
        generationMode,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const items = data.created || [];
      const ids = items.map((x: { videoAd?: { id: number } }) => x.videoAd?.id).filter(Boolean) as number[];
      if (ids.length) setPendingUploadIds(new Set(ids));
      toast({
        title: `${data.count} cartoon${data.count > 1 ? "s" : ""} rendering`,
        description: data.note || (autoUpload ? "Will upload to YouTube when each finishes." : "Upload manually when done."),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      refetchWallet();
    },
    onError: (err: Error) =>
      toast({ title: "Daily drop failed", description: err.message, variant: "destructive" }),
  });

  const renderScriptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/kids-shorts/render-script", {
        script: pastedScript,
        style: pasteStyle,
        durationMinutes: pasteDuration,
        title: pasteTitle || undefined,
        formatHint: pasteFormatHint || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const id = data.videoAd?.id;
      if (id) setPendingUploadIds(new Set([id]));
      toast({
        title: "Rendering from your script",
        description: data.note || "HeyGen is processing your pasted scene breakdown.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      refetchWallet();
    },
    onError: (err: Error) =>
      toast({ title: "Render failed", description: err.message, variant: "destructive" }),
  });

  const recoverMutation = useMutation({
    mutationFn: async (heygenVideoId: string) => {
      const res = await apiRequest("POST", "/api/admin/kids-shorts/recover", { heygenVideoId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video recovered",
        description: data.note || "Back in your library — no credits spent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
    },
    onError: (err: Error) =>
      toast({ title: "Recover failed", description: err.message, variant: "destructive" }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (videoAdId: number) => {
      const video = myVideos.find((v) => v.id === videoAdId);
      const titleLine =
        video?.prompt?.split("\n")[0]?.replace(/^\[KIDS[^\]]*\]\s*/, "").slice(0, 90) ||
        "Kids Short";
      const res = await apiRequest("POST", "/api/admin/youtube/upload", {
        videoAdId,
        title: titleLine,
        description: `${video?.prompt || ""}\n\n📚 EbookGamez — ebooks, games & fun: https://ebookgamez.com\n🎓 LearnForge — AI learning: https://knowledge-builder.replit.app/\n\n#shorts #nurseryrhymes #kidsshorts #ebookgamez #learnforge`,
        privacyStatus: privacy,
        tags: ["shorts", "nurseryrhymes", "kidsshorts", "ebookgamez", "learnforge"],
      });
      return res.json();
    },
    onSuccess: (data) => toast({ title: "Uploaded to YouTube", description: data.url }),
    onError: (err: Error) =>
      toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, saved }: { id: number; saved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/video-ads/${id}/saved`, { saved });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      toast({
        title: data.kidsSaved ? "Saved — good video kept" : "Removed from saved",
        description: data.kidsSaved
          ? "This cartoon stays in your Saved list for YouTube upload."
          : "Moved back to review list.",
      });
    },
    onError: (err: Error) =>
      toast({ title: "Could not update", description: err.message, variant: "destructive" }),
  });

  const retryMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/video-ads/generate", { prompt, mode: "agent" });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Retry submitted", description: "HeyGen is processing the new render." });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      refetchWallet();
    },
    onError: (err: Error) =>
      toast({ title: "Retry failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/video-ads/${id}`);
      return id;
    },
    onSuccess: (id) => {
      setPendingUploadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      toast({ title: "Deleted", description: "Bad video removed from your library." });
    },
    onError: (err: Error) =>
      toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const handleDeleteVideo = (v: VideoAd) => {
    const label = parseKidsVideoMeta(v.prompt || "").displayTitle || `Video #${v.id}`;
    if (
      !window.confirm(
        `Delete "${label}"?\n\nThis removes it from your library. It cannot be undone.`
      )
    ) {
      return;
    }
    deleteMutation.mutate(v.id);
  };

  useEffect(() => {
    myVideos
      .filter((v) => v.status === "processing" && v.prompt?.includes("[KIDS"))
      .forEach((v) => {
        fetch(`/api/video-ads/${v.id}/status`, { credentials: "include" }).then(() =>
          refetchVideos()
        );
      });
  }, [myVideos, refetchVideos]);

  useEffect(() => {
    if (!pendingUploadIds.size || !autoUpload || !social?.youtube?.connected) return;
    for (const id of pendingUploadIds) {
      const v = myVideos.find((x) => x.id === id);
      if (v?.status === "completed" && v.videoUrl) {
        uploadMutation.mutate(id);
        setPendingUploadIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }, [myVideos, pendingUploadIds, autoUpload, social?.youtube?.connected]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-6">
        <Shield className="w-10 h-10 text-slate-500" />
        <h1 className="text-xl font-bold">One-Click Cartoon Generator</h1>
        <p className="text-gray-400 text-center max-w-md">
          Admin only. Log in as <strong className="text-yellow-400">morrisdamond0516@gmail.com</strong> to use Kids Shorts Studio.
        </p>
        <Link href="/login">
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">Log in</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  const kidsVideos = myVideos.filter((v) => v.prompt?.includes("[KIDS"));
  const savedKids = kidsVideos.filter((v) => v.kidsSaved);
  const completedKids = kidsVideos
    .filter((v) => v.status === "completed" && v.videoUrl)
    .sort((a, b) => a.id - b.id);
  const reviewKids = completedKids.filter((v) => !v.kidsSaved);
  const visibleCompleted =
    libraryFilter === "saved"
      ? completedKids.filter((v) => v.kidsSaved)
      : libraryFilter === "review"
        ? reviewKids
        : completedKids;
  const processingKids = kidsVideos.filter((v) => v.status === "processing");
  const failedKids = kidsVideos.filter((v) => v.status === "error");
  const recoverableHeygen = (heygenVideos?.videos ?? []).filter(
    (v) => v.status === "completed" && v.videoUrl
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950/30 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/admin/funnel">
              <Button variant="ghost" size="sm" className="text-slate-400 -ml-2 mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-yellow-400" />
              One-Click Cartoon Generator
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Each video asks <strong className="text-white">AI</strong> for a fresh idea matched to its style —{" "}
              <strong className="text-yellow-300">3D Cartoon</strong>,{" "}
              <strong className="text-pink-300">2D Sing-Along</strong>, or{" "}
              <strong className="text-orange-300">Presenter</strong>. Then HeyGen renders the scene script.
            </p>
            {meta?.aiConfigured === false && meta?.aiHint && (
              <p className="text-xs text-amber-400/90 mt-2 max-w-xl">{meta.aiHint}</p>
            )}
            {meta?.aiConfigured && meta?.aiHint && (
              <p className="text-xs text-green-400/90 mt-2">{meta.aiHint}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/youtube-studio">
              <Button variant="outline" className="border-white/20">
                YouTube Studio
              </Button>
            </Link>
            {!social?.youtube?.connected && (
              <Button
                className="bg-red-600 hover:bg-red-500"
                onClick={() => { window.location.href = "/api/admin/youtube/connect"; }}
              >
                Connect YouTube
              </Button>
            )}
          </div>
        </div>

        {social?.youtube?.connected && (
          <div className="text-xs text-green-400 flex items-center gap-1">
            <Youtube className="w-4 h-4" /> YouTube: {social.youtube.accountLabel || "connected"}
          </div>
        )}

        <Card className="bg-gradient-to-br from-yellow-500/20 to-lime-500/10 border-yellow-400/40 ring-2 ring-yellow-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-yellow-400" />
              One-Click — Make Today&apos;s Cartoons
            </CardTitle>
            <p className="text-sm text-slate-300 mt-1">
              Set style counts, then choose <strong className="text-sky-300">Basic</strong> or{" "}
              <strong className="text-orange-300">Viral</strong> before generating.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-white text-sm font-semibold uppercase tracking-wide mb-2 block">
                1. Content type
              </Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {(meta?.generationModes ?? [
                  {
                    id: "basic" as const,
                    label: "Basic — Toddler Sing-Along",
                    description: "One nursery rhyme, lyrics match visuals, gentle for ages 2–5.",
                  },
                  {
                    id: "viral" as const,
                    label: "Viral — TikTok / YouTube Shorts",
                    description: "Wrong-sound quiz, story remix, parent POV, ASMR, emoji chat.",
                  },
                ]).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGenerationMode(m.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      generationMode === m.id
                        ? m.id === "basic"
                          ? "border-sky-400 bg-sky-500/20 ring-2 ring-sky-400/40"
                          : "border-orange-400 bg-orange-500/20 ring-2 ring-orange-400/40"
                        : "border-white/15 bg-black/30 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{m.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <Label className="text-white text-sm font-semibold uppercase tracking-wide">
                  2. How many of each style?
                </Label>
                <span className="text-xs text-slate-400">
                  Total: <strong className="text-yellow-300">{batchTotal}</strong> / {MAX_BATCH_VIDEOS} max per batch
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {STYLE_COUNT_KEYS.map((key) => {
                  const meta = STYLE_COUNT_META[key];
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border p-3 space-y-2 ${meta.color}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">{meta.label}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">{meta.desc}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-white/20 bg-black/40"
                            disabled={styleCounts[key] === 0}
                            onClick={() => adjustStyleCount(key, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center text-lg font-bold text-white tabular-nums">
                            {styleCounts[key]}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-white/20 bg-black/40"
                            disabled={batchTotal >= MAX_BATCH_VIDEOS}
                            onClick={() => adjustStyleCount(key, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["1 each", { cocomelon: 1, chuchu: 1, blippi: 1, random: 0 }],
                    ["1 + 2 + 5", { cocomelon: 1, chuchu: 2, blippi: 5, random: 0 }],
                    ["5× 3D", { cocomelon: 5, chuchu: 0, blippi: 0, random: 0 }],
                    ["All random", { cocomelon: 0, chuchu: 0, blippi: 0, random: 3 }],
                  ] as const
                ).map(([label, preset]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => applyStylePreset(preset)}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/15 bg-black/30 text-slate-300 hover:border-yellow-400/50 hover:text-yellow-200"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-yellow-400/50 bg-black/40 p-4 space-y-2">
              <Label className="text-yellow-300 text-sm font-semibold uppercase tracking-wide">
                3. Your batch preview
              </Label>
              {batchTotal === 0 ? (
                <p className="text-sm text-slate-500">Set at least one style count above.</p>
              ) : (
                <>
                  <p className="text-white font-medium">{describeStylePlan(styleCounts)}</p>
                  <p className="text-xs text-lime-400/90">
                    {generationMode === "basic"
                      ? `${batchTotal} sing-along${batchTotal !== 1 ? "s" : ""} — AI picks rhyme + scenes per style (3D / 2D / Presenter)`
                      : `${batchTotal} viral Short${batchTotal !== 1 ? "s" : ""} — AI asks what's good for each style, writes scene script, HeyGen renders`}
                  </p>
                  <p className="text-xs text-amber-400/90 flex items-center gap-1.5 flex-wrap">
                    <Wallet className="w-3.5 h-3.5" />
                    Batch estimate: ~${estHeyGenCost.toFixed(0)}
                    {walletBalance != null ? (
                      <span className={walletTooLow ? "text-red-400 font-semibold" : "text-slate-400"}>
                        · HeyGen wallet: ${walletBalance.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">· wallet loading…</span>
                    )}
                  </p>
                  {walletTooLow && (
                    <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      Not enough HeyGen balance for this batch. Top up at{" "}
                      <a
                        href="https://app.heygen.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-yellow-300"
                      >
                        app.heygen.com
                      </a>{" "}
                      (need ~${estHeyGenCost}, have ${walletBalance?.toFixed(2)}), or lower your counts.
                    </p>
                  )}
                </>
              )}
            </div>

            {generationMode === "viral" && (
              <div className="rounded-lg border border-orange-400/30 bg-orange-500/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-orange-200/90 uppercase tracking-wide">
                  How each video is created
                </p>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                  <li>OpenAI writes a fresh viral idea for that style (3D / 2D / Presenter)</li>
                  <li>OpenAI writes the scene-by-scene script</li>
                  <li>HeyGen renders the video from that script</li>
                </ol>
              </div>
            )}

            {generationMode === "basic" && (
              <div className="rounded-lg border border-sky-400/30 bg-sky-500/5 p-3 text-xs text-slate-400">
                <strong className="text-sky-200">Basic mode:</strong> Each video sings one full nursery rhyme with matching visuals — no wrong-sound quizzes or random SFX.
                Best for toddlers who need clarity, not viral tricks.
              </div>
            )}

            {/* Length + upload */}
            <div>
              <Label className="text-white text-sm font-semibold uppercase tracking-wide">
                4. Video length &amp; upload
              </Label>
              <div className="mt-2 flex flex-wrap gap-3 items-end">
                <div>
                  <Label className="text-slate-400 text-xs">Length</Label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) as 1 | 3 | 5)}
                    className="mt-1 block h-10 rounded-md bg-black/40 border border-white/10 px-3 text-white min-w-[140px]"
                  >
                    {(meta?.durations || [
                      { id: 1, label: "1 minute", hint: "Shorts" },
                      { id: 3, label: "3 minutes", hint: "Standard" },
                      { id: 5, label: "5 minutes", hint: "Full episode" },
                    ]).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpload}
                onChange={(e) => setAutoUpload(e.target.checked)}
                className="rounded"
              />
              Auto-upload each to YouTube when render finishes (recommended)
            </label>
            <Button
              size="lg"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg h-14 px-8 shadow-lg shadow-yellow-500/25"
              disabled={
                dailyDropMutation.isPending ||
                batchTotal === 0 ||
                walletTooLow ||
                (!social?.youtube?.connected && autoUpload)
              }
              onClick={() => dailyDropMutation.mutate()}
            >
              {dailyDropMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-5 h-5 mr-2" />
              )}
              Make {batchTotal || 0} {generationMode === "basic" ? "sing-along" : "viral"}{" "}
              cartoon{batchTotal !== 1 ? "s" : ""} now
            </Button>
            <p className="text-center text-xs text-slate-500">
              {generationMode === "basic" ? (
                <>
                  Basic videos end with a{" "}
                  <strong className="text-yellow-400/90">toddler victory moment</strong> — then parent URLs.
                </>
              ) : (
                <>
                  Viral videos end on <strong className="text-orange-300/90">loop bait</strong> (comment CTA, Part 2 tease) — no
                  toddler celebration appended.
                </>
              )}
            </p>
            {autoUpload && !social?.youtube?.connected && (
              <p className="text-xs text-amber-400">Connect YouTube above for auto-upload, or uncheck the box.</p>
            )}
            {pendingUploadIds.size > 0 && (
              <p className="text-xs text-yellow-300 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Rendering {pendingUploadIds.size} video(s)… {autoUpload ? "Each uploads automatically when ready." : ""}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-lime-500/15 to-emerald-500/10 border-lime-400/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <ClipboardPaste className="w-6 h-6 text-lime-400" />
              Paste a scene-by-scene script (from ChatGPT or anywhere)
            </CardTitle>
            <p className="text-sm text-slate-300 mt-1">
              If you already have a scene breakdown written elsewhere, paste it here — HeyGen renders your exact scenes.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Label className="text-slate-400 text-xs shrink-0">Load template:</Label>
              {(scriptTemplates?.templates ?? []).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setPastedScript(t.script);
                    setPasteFormatHint(t.id);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-lime-400/30 bg-black/30 text-lime-200 hover:border-lime-400/60"
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <Label className="text-white text-sm font-semibold">Scene-by-scene script</Label>
              <Textarea
                value={pastedScript}
                onChange={(e) => setPastedScript(e.target.value)}
                placeholder={`Paste your full 60-second breakdown here, e.g.:\n\n:00 - :05 (Scene 1 - Setup): Close-up of toy yellow bus...\n  Audio: Classic nursery rhyme piano intro\n  Text overlay: "Can you spot the mistake?"\n\n:06 - :12 (Scene 2 - Mismatch): ...`}
                className="mt-2 min-h-[220px] bg-black/40 border-white/15 text-white font-mono text-xs leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Include timestamps, visuals, audio, and text overlays. Minimum ~80 characters.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-slate-400 text-xs">Visual style</Label>
                <select
                  value={pasteStyle}
                  onChange={(e) => setPasteStyle(e.target.value as KidsVisualStyle)}
                  className="mt-1 block h-10 w-full rounded-md bg-black/40 border border-white/10 px-3 text-white text-sm"
                >
                  <option value="cocomelon">3D Cartoon</option>
                  <option value="chuchu">2D Sing-Along</option>
                  <option value="blippi">Presenter Explorer</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Length</Label>
                <select
                  value={pasteDuration}
                  onChange={(e) => setPasteDuration(parseInt(e.target.value, 10) as 1 | 3 | 5)}
                  className="mt-1 block h-10 w-full rounded-md bg-black/40 border border-white/10 px-3 text-white text-sm"
                >
                  {(meta?.durations || [{ id: 1 }, { id: 3 }, { id: 5 }]).map((d) => (
                    <option key={d.id} value={d.id}>
                      {"label" in d && d.label ? d.label : `${d.id} min`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Format (coherence rules)</Label>
                <select
                  value={pasteFormatHint}
                  onChange={(e) => setPasteFormatHint(e.target.value)}
                  className="mt-1 block h-10 w-full rounded-md bg-black/40 border border-white/10 px-3 text-white text-sm"
                >
                  <option value="">Auto-detect from script</option>
                  {Object.entries(FORMAT_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Title (optional)</Label>
                <input
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="From script or custom"
                  className="mt-1 block h-10 w-full rounded-md bg-black/40 border border-white/10 px-3 text-white text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-amber-400/90 flex items-center gap-1.5 flex-wrap">
              <Wallet className="w-3.5 h-3.5" />
              Estimate: ~${pasteEstCost.toFixed(0)}
              {walletBalance != null ? (
                <span className={pasteWalletTooLow ? "text-red-400 font-semibold" : "text-slate-400"}>
                  · HeyGen wallet: ${walletBalance.toFixed(2)}
                </span>
              ) : null}
            </p>
            {pasteWalletTooLow && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                Not enough balance for this render. Top up at app.heygen.com or try 1-minute length.
              </p>
            )}

            <Button
              size="lg"
              className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold"
              disabled={
                renderScriptMutation.isPending ||
                pastedScript.trim().length < 80 ||
                pasteWalletTooLow
              }
              onClick={() => renderScriptMutation.mutate()}
            >
              {renderScriptMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ClipboardPaste className="w-5 h-5 mr-2" />
              )}
              Render from pasted script
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              Recover lost videos from HeyGen
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              If videos disappeared from your library (database reset or delete), they may still exist on HeyGen.
              Re-import here — <strong className="text-cyan-300">no extra credits</strong>.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-cyan-500/40"
                onClick={() => refetchHeygenVideos()}
              >
                Refresh HeyGen list
              </Button>
            </div>
            {heygenVideosLoading ? (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading HeyGen library…
              </p>
            ) : heygenVideosError ? (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                Could not load HeyGen videos: {(heygenVideosErrorObj as Error)?.message || "Unknown error"}. Check HEYGEN_API_KEY in .env and click Refresh.
              </p>
            ) : recoverableHeygen.length === 0 ? (
              <p className="text-sm text-slate-500">
                No completed HeyGen videos in the last 20 renders. If you just deleted local copies, click Refresh — your MP4s may still be on HeyGen.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recoverableHeygen.slice(0, 15).map((v) => {
                  const inLibrary = kidsVideos.some(
                    (k) => k.heygenVideoId === v.id || k.videoUrl === v.videoUrl
                  );
                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{v.title || v.id}</div>
                        <div className="text-xs text-slate-500">
                          {v.duration ? `${v.duration}s` : "—"} · {v.id.slice(0, 8)}…
                          {inLibrary ? " · already in library" : ""}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {v.videoUrl && (
                          <a href={v.videoUrl} target="_blank" rel="noreferrer">
                            <Button type="button" size="sm" variant="outline" className="h-8 border-white/20">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 bg-cyan-600 hover:bg-cyan-500"
                          disabled={recoverMutation.isPending || inLibrary}
                          onClick={() => recoverMutation.mutate(v.id)}
                        >
                          {inLibrary ? "In library" : "Recover"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Your first two renders were likely <strong className="text-slate-400">Wheels on the Bus ASMR</strong> (~41s) and{" "}
              <strong className="text-slate-400">Parent Trap: Row Row Row Your Boat</strong> (~45s) — look for those titles above.
              You can also download directly from{" "}
              <a href="https://app.heygen.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                app.heygen.com
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Your cartoon library — save good ones, delete bad ones
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Preview each video. Tap <strong className="text-yellow-300">Save</strong> to keep good cartoons for YouTube.
              Tap <strong className="text-red-300">Delete</strong> to remove bad ones from your library.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", `All (${completedKids.length})`],
                  ["review", `To review (${reviewKids.length})`],
                  ["saved", `Saved ⭐ (${savedKids.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLibraryFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    libraryFilter === key
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-100"
                      : "border-white/10 text-slate-400 hover:border-white/25"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <Label className="text-slate-300">Privacy</Label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                className="mt-1 w-full h-10 rounded-md bg-black/40 border border-white/10 px-2 text-white"
              >
                <option value="private">Private (test first)</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>

            {processingKids.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processingKids.length} video(s) still rendering…
                </p>
                {processingKids.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-2 p-2 rounded border border-yellow-500/20 bg-yellow-500/5 text-sm"
                  >
                    <span className="text-slate-300 truncate">#{v.id} rendering…</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-300 shrink-0"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDeleteVideo(v)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {failedKids.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {failedKids.length} video(s) failed on HeyGen
                </p>
                {failedKids.map((v) => {
                  const meta = parseKidsVideoMeta(v.prompt || "");
                  return (
                    <div
                      key={v.id}
                      className="flex flex-wrap items-start justify-between gap-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-sm"
                    >
                      <div className="flex-1 min-w-[200px] space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-white bg-red-500/20 px-2 py-0.5 rounded">
                            #{v.id} Failed
                          </span>
                          {meta.style && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STYLE_META[meta.style].color}`}>
                              {meta.styleLabel}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {meta.formatLabel}
                          </span>
                        </div>
                        <p className="text-white font-medium">{meta.displayTitle || meta.rhyme || "Kids Short"}</p>
                        <p className="text-xs text-slate-400">
                          <strong className="text-slate-300">Rhyme:</strong> {meta.rhyme || "—"}
                        </p>
                        <p className="text-xs text-red-300/90">
                          {v.errorMessage || "Generation failed on HeyGen"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-500/40 text-yellow-300"
                          disabled={retryMutation.isPending}
                          onClick={() => retryMutation.mutate(v.prompt)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/40 text-red-300"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDeleteVideo(v)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {visibleCompleted.length === 0 && processingKids.length === 0 && failedKids.length === 0 && (
              <p className="text-sm text-slate-500">No kids Shorts in this list yet. Generate above first.</p>
            )}

            {visibleCompleted.length === 0 && processingKids.length > 0 && libraryFilter !== "all" && (
              <p className="text-sm text-slate-500">Nothing in this filter yet — check All or wait for renders.</p>
            )}

            {visibleCompleted.length > 0 && (
              <p className="text-xs text-slate-500">
                Match by <strong className="text-slate-400">hook</strong> when you preview — that&apos;s the first 2 seconds.
              </p>
            )}

            <div className="space-y-3">
              {visibleCompleted.map((v, idx) => {
                const meta = parseKidsVideoMeta(v.prompt || "");
                const actualSec = v.duration;
                const lengthNote =
                  meta.requestedSeconds && actualSec && actualSec < meta.requestedSeconds - 5
                    ? `${actualSec}s rendered (asked for ${meta.requestedSeconds}s)`
                    : actualSec
                      ? `${actualSec}s`
                      : null;
                return (
                <div
                  key={v.id}
                  className={`flex flex-wrap items-start gap-3 p-3 rounded-lg border ${
                    v.kidsSaved
                      ? "bg-lime-500/10 border-lime-500/40"
                      : "bg-black/30 border-white/10"
                  }`}
                >
                  {v.thumbnailUrl && (
                    <div className="relative shrink-0">
                      <img src={v.thumbnailUrl} alt="" className="w-20 h-36 object-cover rounded border border-white/10" />
                      <span className="absolute top-1 left-1 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        #{v.id}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded">
                        Video {idx + 1} of {visibleCompleted.length}
                      </span>
                      {v.kidsSaved && (
                        <span className="text-xs px-2 py-0.5 rounded border border-lime-500/50 bg-lime-500/20 text-lime-200">
                          ⭐ Saved
                        </span>
                      )}
                      {meta.style && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${STYLE_META[meta.style].color}`}>
                          {STYLE_META[meta.style].short} · {meta.styleLabel}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-200">
                        {meta.formatLabel}
                      </span>
                      {lengthNote && (
                        <span className="text-xs text-slate-500">{lengthNote}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white">{meta.displayTitle || meta.youtubeTitle}</p>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p><strong className="text-slate-300">Rhyme:</strong> {meta.rhyme || "—"}</p>
                      <p><strong className="text-slate-300">Opens with:</strong> &quot;{meta.hook || "—"}&quot;</p>
                      <p className="text-slate-500">{meta.concept}</p>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono">DB id {v.id} · {new Date(v.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex gap-2">
                      {v.videoUrl && (
                        <a href={v.videoUrl} target="_blank" rel="noreferrer" title="Preview — check hook matches">
                          <Button size="sm" variant="outline" className="border-white/20">
                            <Play className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          v.kidsSaved
                            ? "border-lime-500/50 text-lime-300"
                            : "border-yellow-500/40 text-yellow-300"
                        }
                        disabled={saveMutation.isPending}
                        onClick={() => saveMutation.mutate({ id: v.id, saved: !v.kidsSaved })}
                      >
                        <Star className={`w-4 h-4 mr-1 ${v.kidsSaved ? "fill-lime-400" : ""}`} />
                        {v.kidsSaved ? "Saved" : "Save"}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-500 flex-1"
                        disabled={!social?.youtube?.connected || uploadMutation.isPending}
                        onClick={() => uploadMutation.mutate(v.id)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        YouTube
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/40 text-red-300"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDeleteVideo(v)}
                        title="Delete bad video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
