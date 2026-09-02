import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Footer from "@/components/Footer";
import { ArrowLeft, Loader2, Sparkles, Youtube, Shield, ExternalLink } from "lucide-react";

const ADMIN_EMAIL = "morrisdamond0516@gmail.com";

interface ViralAngle {
  id: string;
  style: string;
  styleLabel: string;
  angleTitle: string;
  hook: string;
  script: string;
  suggestedTitle: string;
  thumbnailConcept: string;
  durationSeconds: number;
  viralScore: number;
  whyItCouldWork: string;
  channelId?: string;
  channelName?: string;
  methodName?: string;
  ideaBrief?: string;
  sceneScript?: string;
}

interface ChannelPlaybook {
  id: string;
  channelName: string;
  methodName: string;
  niche: string;
  psychology: string;
  mappedStyle: string;
  titlePattern: string;
}

interface ResearchBrief {
  topic: string;
  researchedAt: string;
  sourcesNote: string;
  patterns: string[];
  bannedOrRisky: boolean;
  riskNotes: string[];
  topInspiration: { title: string; channel?: string; views?: number; reason: string }[];
  angles: ViralAngle[];
}

interface VideoAd {
  id: number;
  status: string;
  prompt: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export default function AdminYouTubeStudio() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [packId, setPackId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [boardId, setBoardId] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private");
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null);

  const isAdmin = !!user && (user as any).email === ADMIN_EMAIL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("youtube") === "connected") {
      toast({ title: "YouTube connected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social/status"] });
    }
    if (params.get("pinterest") === "connected") {
      toast({ title: "Pinterest connected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social/status"] });
    }
    if (params.get("youtube") === "error" || params.get("pinterest") === "error") {
      toast({
        title: "Connect failed",
        description: params.get("msg") || "Check OAuth credentials",
        variant: "destructive",
      });
    }
  }, []);

  const { data: playbookMeta } = useQuery<{
    playbooks: ChannelPlaybook[];
    aiConfigured: boolean;
    aiHint: string;
  }>({
    queryKey: ["/api/admin/youtube/playbooks"],
    enabled: isAuthenticated && isAdmin,
  });


  const { data: packs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/youtube/packs"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: social } = useQuery<any>({
    queryKey: ["/api/admin/social/status"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: myVideos = [] } = useQuery<VideoAd[]>({
    queryKey: ["/api/video-ads/my-videos"],
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 15000,
  });

  const { data: boards = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/pinterest/boards"],
    enabled: isAuthenticated && isAdmin && !!social?.pinterest?.connected,
  });

  useEffect(() => {
    if (boards.length && !boardId) setBoardId(boards[0].id);
  }, [boards, boardId]);

  const researchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/youtube/research", { topic, count });
      return res.json();
    },
    onSuccess: (data) => {
      setBrief(data.brief);
      setPackId(data.packId);
      setSelected(new Set((data.brief?.angles || []).map((a: ViralAngle) => a.id)));
      queryClient.invalidateQueries({ queryKey: ["/api/admin/youtube/packs"] });
      if (data.brief?.bannedOrRisky) {
        toast({ title: "Topic blocked", description: data.brief.riskNotes?.join(" "), variant: "destructive" });
      } else {
        toast({ title: "Research ready", description: `${data.brief.angles.length} angles scored` });
      }
    },
    onError: (err: any) => toast({ title: "Research failed", description: err.message, variant: "destructive" }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/youtube/generate", {
        packId,
        angleIds: Array.from(selected),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Generating ${data.created?.length || 0} videos`,
        description: "When completed, upload to YouTube or pin to Pinterest below.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
    },
    onError: (err: any) => toast({ title: "Generate failed", description: err.message, variant: "destructive" }),
  });

  const uploadYtMutation = useMutation({
    mutationFn: async (videoAdId: number) => {
      const video = myVideos.find((v) => v.id === videoAdId);
      const res = await apiRequest("POST", "/api/admin/youtube/upload", {
        videoAdId,
        title: video?.prompt?.split("\n")[0]?.replace(/^\[YT[^\]]*\]\s*/, "").slice(0, 90) || "Shorts upload",
        description: video?.prompt || "",
        privacyStatus: privacy,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Uploaded to YouTube", description: data.url });
    },
    onError: (err: any) => toast({ title: "YouTube upload failed", description: err.message, variant: "destructive" }),
  });

  const pinMutation = useMutation({
    mutationFn: async (videoAdId: number) => {
      const video = myVideos.find((v) => v.id === videoAdId);
      const res = await apiRequest("POST", "/api/admin/pinterest/pin", {
        videoAdId,
        boardId,
        title: video?.prompt?.split("\n")[0]?.replace(/^\[YT[^\]]*\]\s*/, "").slice(0, 90) || "Pin",
        description: video?.prompt || "",
        link: "https://www.pinterest.com/morris_damond/",
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Pinned to Pinterest", description: data.url });
    },
    onError: (err: any) => toast({ title: "Pinterest pin failed", description: err.message, variant: "destructive" }),
  });

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
        <p className="text-gray-400 text-center">This studio is private admin-only. Customers cannot access it.</p>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    );
  }

  const toggleAngle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedVideos = myVideos.filter((v) => v.status === "completed" && v.videoUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href="/admin/funnel">
              <Button variant="ghost" size="sm" className="text-slate-400 -ml-2 mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Youtube className="w-7 h-7 text-red-500" />
              YouTube + Pinterest Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Private to you only. Research → generate → upload to YouTube or pin to{" "}
              <a
                href="https://www.pinterest.com/morris_damond/"
                target="_blank"
                rel="noreferrer"
                className="text-red-400 underline inline-flex items-center gap-1"
              >
                morris_damond <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/admin/kids-shorts">
              <Button variant="outline" className="border-yellow-500/40 text-yellow-300">
                Kids Shorts Studio
              </Button>
            </Link>
            <Link href="/features/video-ads">
              <Button variant="outline" className="border-white/20">Open Video Ads</Button>
            </Link>
          </div>
        </div>

        <Link href="/admin/kids-shorts">
          <Card className="bg-gradient-to-r from-yellow-500/25 to-lime-500/15 border-yellow-400/50 cursor-pointer hover:border-yellow-300 transition-colors">
            <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-yellow-300 text-lg">One-Click Cartoon Generator</p>
                <p className="text-sm text-slate-300">Make 1–3 AI kids cartoons per day → auto-upload to YouTube</p>
              </div>
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold shrink-0">
                Open Cartoon Generator →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Connect accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between p-3 rounded-lg bg-black/30 border border-white/5">
              <div>
                <p className="font-medium text-white">YouTube</p>
                <p className="text-xs text-slate-400">
                  {social?.youtube?.connected
                    ? `Connected: ${social.youtube.accountLabel || "channel"}`
                    : social?.youtube?.configured
                      ? "Not connected"
                      : "Add YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET to .env"}
                </p>
              </div>
              <div className="flex gap-2">
                {social?.youtube?.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20"
                    onClick={async () => {
                      await apiRequest("POST", "/api/admin/youtube/disconnect");
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/social/status"] });
                      toast({ title: "YouTube disconnected" });
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-500"
                    disabled={!social?.youtube?.configured}
                    onClick={() => { window.location.href = "/api/admin/youtube/connect"; }}
                  >
                    Connect YouTube
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between p-3 rounded-lg bg-black/30 border border-white/5">
              <div>
                <p className="font-medium text-white">Pinterest</p>
                <p className="text-xs text-slate-400">
                  {social?.pinterest?.connected
                    ? `Connected: ${social.pinterest.accountLabel || "@morris_damond"}`
                    : social?.pinterest?.configured
                      ? "Not connected — will authorize morris_damond"
                      : "Add PINTEREST_APP_ID + PINTEREST_APP_SECRET to .env"}
                </p>
              </div>
              <div className="flex gap-2">
                {social?.pinterest?.connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20"
                    onClick={async () => {
                      await apiRequest("POST", "/api/admin/pinterest/disconnect");
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/social/status"] });
                      toast({ title: "Pinterest disconnected" });
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-red-700 hover:bg-red-600"
                    disabled={!social?.pinterest?.configured}
                    onClick={() => { window.location.href = "/api/admin/pinterest/connect"; }}
                  >
                    Connect Pinterest
                  </Button>
                )}
              </div>
            </div>

            {social?.pinterest?.connected && (
              <div>
                <Label className="text-slate-300">Default board for pins</Label>
                <select
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md bg-black/40 border border-white/10 px-2 text-white"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="text-slate-300">YouTube privacy on upload</Label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="mt-1 w-full h-10 rounded-md bg-black/40 border border-white/10 px-2 text-white"
              >
                <option value="private">Private (recommended first)</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">5 viral channel methods</CardTitle>
            <p className="text-xs text-slate-400">
              Each research angle applies one proven viral formula — same idea → scene script → HeyGen flow as Kids Shorts.
            </p>
            {playbookMeta?.aiHint && (
              <p className={`text-xs mt-2 ${playbookMeta.aiConfigured ? "text-lime-400" : "text-amber-400"}`}>
                {playbookMeta.aiConfigured ? "✓ AI on — fresh angles every research run" : playbookMeta.aiHint}
              </p>
            )}
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(playbookMeta?.playbooks || []).map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-1">
                <p className="font-semibold text-white text-sm">{p.channelName}</p>
                <p className="text-xs text-lime-400">{p.methodName}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{p.psychology}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lime-400" /> One-button research pack
            </CardTitle>
            <p className="text-xs text-slate-400">
              Pick 1–5 videos — each uses a different channel method (MrBeast, Veritasium, Bright Side, Dude Perfect, GaryVee-style).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <Label className="text-slate-300">Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. side hustles, AI tools, productivity myths"
                  className="bg-black/40 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Videos</Label>
                <select
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                  className="mt-1 w-full h-10 rounded-md bg-black/40 border border-white/10 px-2 text-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => researchMutation.mutate()}
                disabled={!topic.trim() || researchMutation.isPending}
                className="bg-lime-400 text-black hover:bg-lime-500 font-bold"
              >
                {researchMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Researching…</>
                ) : (
                  "Research & Build Angles"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {brief && (
          <Card className="bg-slate-900/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Brief: {brief.topic}</CardTitle>
              <p className="text-xs text-slate-400">{brief.sourcesNote}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {brief.bannedOrRisky ? (
                <p className="text-red-400 text-sm">{brief.riskNotes.join(" ")}</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-lime-400">Angles ({brief.angles.length})</p>
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={!packId || selected.size === 0 || generateMutation.isPending}
                      className="bg-red-600 hover:bg-red-500 text-white"
                    >
                      {generateMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                      ) : (
                        `Generate ${selected.size} video(s)`
                      )}
                    </Button>
                  </div>
                  {brief.angles.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-xl border ${
                        selected.has(a.id) ? "border-lime-400/60 bg-lime-400/5" : "border-white/10 bg-black/20"
                      }`}
                    >
                      <label className="block p-4 cursor-pointer">
                        <div className="flex gap-3">
                          <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleAngle(a.id)} className="mt-1" />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-white font-semibold">{a.suggestedTitle}</span>
                              {a.channelName && (
                                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">{a.channelName}</span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded bg-white/10">{a.styleLabel}</span>
                              <span className="text-xs text-lime-400">score {a.viralScore}</span>
                            </div>
                            {a.methodName && <p className="text-xs text-slate-400">{a.methodName}</p>}
                            <p className="text-sm text-slate-300"><strong>Hook:</strong> {a.hook}</p>
                            <p className="text-xs text-slate-500 line-clamp-2">{a.whyItCouldWork}</p>
                          </div>
                        </div>
                      </label>
                      {(a.sceneScript || a.ideaBrief) && (
                        <div className="px-4 pb-4">
                          <button
                            type="button"
                            className="text-xs text-lime-400 underline"
                            onClick={() => setExpandedAngle(expandedAngle === a.id ? null : a.id)}
                          >
                            {expandedAngle === a.id ? "Hide scene script" : "Show idea + scene script"}
                          </button>
                          {expandedAngle === a.id && (
                            <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-black/40 rounded-lg p-3 max-h-64 overflow-y-auto border border-white/5">
                              {a.sceneScript || a.ideaBrief}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Publish completed videos</CardTitle>
            <p className="text-xs text-slate-400">Upload to YouTube or pin to your morris_damond Pinterest</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedVideos.length === 0 ? (
              <p className="text-sm text-slate-500">No completed videos yet. Generate a pack first.</p>
            ) : (
              completedVideos.slice(0, 12).map((v) => (
                <div key={v.id} className="flex flex-wrap gap-2 items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{v.prompt.split("\n")[0]}</p>
                    <p className="text-xs text-slate-500">#{v.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-500"
                      disabled={!social?.youtube?.connected || uploadYtMutation.isPending}
                      onClick={() => uploadYtMutation.mutate(v.id)}
                    >
                      Upload YT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-300"
                      disabled={!social?.pinterest?.connected || !boardId || pinMutation.isPending}
                      onClick={() => pinMutation.mutate(v.id)}
                    >
                      Pin
                    </Button>
                    {v.videoUrl && (
                      <a href={v.videoUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost">Preview</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {packs.length > 0 && (
          <Card className="bg-slate-900/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Recent packs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {packs.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full text-left text-sm p-3 rounded-lg bg-black/30 border border-white/5 hover:border-white/20"
                  onClick={() => {
                    if (p.brief) {
                      setBrief(p.brief);
                      setPackId(p.id);
                      setSelected(new Set((p.brief.angles || []).map((a: ViralAngle) => a.id)));
                      setTopic(p.topic);
                    }
                  }}
                >
                  <span className="text-white font-medium">{p.topic}</span>
                  <span className="text-slate-500 ml-2">{p.status} · {p.count} videos</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
