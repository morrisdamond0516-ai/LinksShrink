import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Video, Download, RefreshCw, Play, User, Mic, Sparkles, Package, Globe, Image, Clock, ExternalLink, Upload } from "lucide-react";
import { SiGoogleads, SiFacebook, SiTiktok, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

function triggerDownload(url: string, filename: string) {
  const proxyUrl = `/api/video-ads/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement("a");
  a.href = proxyUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
}

interface Voice {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
  preview_audio: string;
}

interface VideoAd {
  id: number;
  status: string;
  prompt: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  targetUrl: string | null;
  createdAt: string;
  errorMessage: string | null;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 seconds", words: "~40 words", singlePrice: "$5", packagePrice: "$15", singleKey: "video_ad_15s", packageKey: "video_ad_package_15s" },
  { value: "30", label: "30 seconds", words: "~80 words", singlePrice: "$8", packagePrice: "$20", singleKey: "video_ad_30s", packageKey: "video_ad_package_30s" },
  { value: "60", label: "60 seconds", words: "~160 words", singlePrice: "$12", packagePrice: "$28", singleKey: "video_ad_60s", packageKey: "video_ad_package_60s" },
  { value: "120", label: "2 minutes", words: "~320 words", singlePrice: "$20", packagePrice: "$48", singleKey: "video_ad_120s", packageKey: "video_ad_package_120s" },
  { value: "180", label: "3 minutes", words: "~480 words", singlePrice: "$28", packagePrice: "$65", singleKey: "video_ad_180s", packageKey: "video_ad_package_180s" },
];

export default function VideoAds() {
  const [mode, setMode] = useState<"agent" | "avatar">("agent");
  const [prompt, setPrompt] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [richImages, setRichImages] = useState<{ url: string; sourcePage: string; alt: string; context: string; type: string }[]>([]);
  const [storyboard, setStoryboard] = useState<{ section: string; text: string; suggestedImages: string[] }[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; originalName: string; keywords: string[]; description: string }[]>([]);
  const [pagesScraped, setPagesScraped] = useState(0);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [pollingId, setPollingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const currentDuration = DURATION_OPTIONS.find(d => d.value === selectedDuration) || DURATION_OPTIONS[1];

  const { data: avatars = [], isLoading: avatarsLoading } = useQuery<Avatar[]>({
    queryKey: ["/api/heygen/avatars"],
    enabled: mode === "avatar",
  });

  const { data: voices = [], isLoading: voicesLoading } = useQuery<Voice[]>({
    queryKey: ["/api/heygen/voices"],
    enabled: mode === "avatar",
  });

  const { data: myVideos = [], isLoading: videosLoading } = useQuery<VideoAd[]>({
    queryKey: ["/api/video-ads/my-videos"],
  });

  const filteredAvatars = avatars.filter((a) =>
    a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())
  ).slice(0, 20);

  const filteredVoices = voices.filter((v) =>
    (v.name?.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      v.language?.toLowerCase().includes(voiceSearch.toLowerCase())) &&
    v.language?.toLowerCase().includes("english")
  ).slice(0, 20);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const body: any = { prompt, targetUrl, mode, duration: selectedDuration };
      if (mode === "avatar") {
        body.avatarId = selectedAvatar;
        body.voiceId = selectedVoice;
      }
      const res = await apiRequest("POST", "/api/video-ads/generate", body, {
        "x-feature-key": currentDuration.singleKey,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Video generating!", description: `Your ${currentDuration.label} AI video ad is being created. This usually takes 5-10 minutes.` });
      setPollingId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
    },
    onError: (err: any) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const packageMutation = useMutation({
    mutationFn: async () => {
      const body: any = { prompt, targetUrl, mode, duration: selectedDuration };
      if (mode === "avatar") {
        body.avatarId = selectedAvatar;
        body.voiceId = selectedVoice;
      }
      const res = await apiRequest("POST", "/api/video-ads/generate-package", body, {
        "x-feature-key": currentDuration.packageKey,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const successCount = data.videos?.filter((v: any) => v.status === "processing").length || 0;
      toast({
        title: "Ad Package generating!",
        description: `${successCount} videos + 3 banner images being created (horizontal, vertical, square). This usually takes 5-10 minutes.`,
      });
      if (data.videos?.[0]?.id) {
        setPollingId(data.videos[0].id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
    },
    onError: (err: any) => {
      toast({ title: "Package generation failed", description: err.message, variant: "destructive" });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      if (!targetUrl) throw new Error("Enter a website URL first");
      let urlToScrape = targetUrl;
      if (!urlToScrape.startsWith("http")) urlToScrape = "https://" + urlToScrape;
      const res = await apiRequest("POST", "/api/video-ads/scrape-website", { url: urlToScrape });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.scriptSuggestion) {
        setPrompt(data.scriptSuggestion);
      }
      if (data.richImages && data.richImages.length > 0) {
        setRichImages(data.richImages);
      }
      if (data.storyboard && data.storyboard.length > 0) {
        setStoryboard(data.storyboard);
        setShowStoryboard(true);
      }
      if (data.images && data.images.length > 0) {
        setScrapedImages(data.images);
        setPagesScraped(data.pagesScraped || 1);
        toast({ title: "Website scraped!", description: `Found ${data.images.length} images across ${data.pagesScraped || 1} pages. Script & storyboard auto-generated.` });
      } else if (data.scriptSuggestion) {
        setPagesScraped(data.pagesScraped || 1);
        toast({ title: "Script generated!", description: `Pulled content from ${data.title || targetUrl}. No images found.` });
      } else {
        toast({ title: "Limited content found", description: "We couldn't extract much from that site. Try writing your script manually.", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Could not fetch website", description: err.message, variant: "destructive" });
    },
  });

  const processingVideos = myVideos.filter((v) => v.status === "processing");
  const hasProcessing = processingVideos.length > 0 || pollingId !== null;

  useEffect(() => {
    if (processingVideos.length > 0 && !pollingId) {
      setPollingId(processingVideos[0].id);
    }
  }, [processingVideos.length]);

  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(async () => {
      try {
        for (const pv of processingVideos) {
          const res = await fetch(`/api/video-ads/${pv.id}/status`, { credentials: "include" });
          const data = await res.json();
          if (data.status === "completed") {
            toast({ title: "Video ready!", description: "An AI video ad has been generated." });
          } else if (data.status === "failed") {
            toast({ title: "Video failed", description: data.errorMessage || "Something went wrong", variant: "destructive" });
          }
        }
        queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
        const remaining = processingVideos.filter(v => v.status === "processing");
        if (remaining.length === 0) setPollingId(null);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [hasProcessing, processingVideos.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lime-400">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-lime-400/10 text-lime-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Video className="w-4 h-4" />
              AI Video Ad Creator
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Create Stunning Video Ads with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-yellow-400">AI</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Generate professional video ads with realistic AI presenters. Perfect for Google Ads, social media, and marketing campaigns.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    Generation Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("agent")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        mode === "agent"
                          ? "border-lime-400 bg-lime-400/10"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                      data-testid="button-mode-agent"
                    >
                      <Sparkles className={`w-5 h-5 mb-2 ${mode === "agent" ? "text-lime-400" : "text-slate-500"}`} />
                      <p className="font-semibold text-sm text-white">AI Auto-Generate</p>
                      <p className="text-xs text-slate-400 mt-1">Describe what you want and AI creates the full video</p>
                    </button>
                    <button
                      onClick={() => setMode("avatar")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        mode === "avatar"
                          ? "border-lime-400 bg-lime-400/10"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                      data-testid="button-mode-avatar"
                    >
                      <User className={`w-5 h-5 mb-2 ${mode === "avatar" ? "text-lime-400" : "text-slate-500"}`} />
                      <p className="font-semibold text-sm text-white">Choose Avatar & Voice</p>
                      <p className="text-xs text-slate-400 mt-1">Pick a realistic person and voice for your ad</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {mode === "avatar" && (
                <Card className="bg-slate-900/80 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-lime-400" />
                      Select Avatar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search avatars..."
                      value={avatarSearch}
                      onChange={(e) => setAvatarSearch(e.target.value)}
                      className="bg-black/50 border-white/10 text-white"
                      data-testid="input-avatar-search"
                    />
                    {avatarsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {filteredAvatars.map((avatar) => (
                          <button
                            key={avatar.avatar_id}
                            onClick={() => setSelectedAvatar(avatar.avatar_id)}
                            className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                              selectedAvatar === avatar.avatar_id
                                ? "border-lime-400 ring-2 ring-lime-400/30"
                                : "border-white/10 hover:border-white/30"
                            }`}
                            data-testid={`button-avatar-${avatar.avatar_id}`}
                          >
                            {avatar.preview_image_url ? (
                              <img
                                src={avatar.preview_image_url}
                                alt={avatar.avatar_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <User className="w-8 h-8 text-slate-600" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                              <p className="text-[10px] text-white truncate">{avatar.avatar_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {mode === "avatar" && (
                <Card className="bg-slate-900/80 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-lime-400" />
                      Select Voice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search voices..."
                      value={voiceSearch}
                      onChange={(e) => setVoiceSearch(e.target.value)}
                      className="bg-black/50 border-white/10 text-white"
                      data-testid="input-voice-search"
                    />
                    {voicesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {filteredVoices.map((voice) => (
                          <button
                            key={voice.voice_id}
                            onClick={() => setSelectedVoice(voice.voice_id)}
                            className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                              selectedVoice === voice.voice_id
                                ? "border-lime-400 bg-lime-400/10"
                                : "border-white/10 bg-black/30 hover:border-white/20"
                            }`}
                            data-testid={`button-voice-${voice.voice_id}`}
                          >
                            <div>
                              <p className="text-sm font-medium text-white">{voice.name}</p>
                              <p className="text-xs text-slate-400">{voice.language} · {voice.gender}</p>
                            </div>
                            {voice.preview_audio && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const audio = new Audio(voice.preview_audio);
                                  audio.play();
                                }}
                                className="text-lime-400 hover:text-lime-300 p-1"
                                data-testid={`button-preview-voice-${voice.voice_id}`}
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    {mode === "agent" ? "Describe Your Video Ad" : "Write the Script"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Target URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://yourproduct.com"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        className="bg-black/50 border-white/10 text-white flex-1"
                        data-testid="input-target-url"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => scrapeMutation.mutate()}
                        disabled={!targetUrl || scrapeMutation.isPending}
                        className="border-lime-400/30 text-lime-400 hover:bg-lime-400/10 shrink-0"
                        data-testid="button-fetch-website"
                      >
                        {scrapeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-1" />
                            Fetch & Write Script
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {pagesScraped > 0
                        ? `Scraped ${pagesScraped} pages — found ${scrapedImages.length} images`
                        : "Enter a URL and click \"Fetch\" to auto-generate an ad script and pull images from the website"}
                    </p>
                    {scrapedImages.length > 0 && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">Website Images Found ({scrapedImages.length}):</p>
                          {storyboard.length > 0 && (
                            <button
                              onClick={() => setShowStoryboard(!showStoryboard)}
                              className="text-[10px] text-lime-400 hover:text-lime-300 underline"
                              data-testid="toggle-storyboard"
                            >
                              {showStoryboard ? "Hide Storyboard" : "Show Storyboard"}
                            </button>
                          )}
                        </div>
                        {showStoryboard && storyboard.length > 0 && (
                          <div className="rounded-lg border border-lime-400/20 bg-lime-400/5 p-3 space-y-3">
                            <p className="text-xs text-lime-400 font-medium">Visual Storyboard — Script sections matched with website images</p>
                            {storyboard.map((scene, i) => (
                              <div key={i} className="flex gap-3 p-2 rounded bg-black/30 border border-white/5" data-testid={`storyboard-section-${i}`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-lime-400 font-medium mb-1">{scene.section}</p>
                                  <p className="text-xs text-slate-300 leading-relaxed">{scene.text}</p>
                                </div>
                                {scene.suggestedImages.length > 0 && (
                                  <div className="flex gap-1 shrink-0">
                                    {scene.suggestedImages.map((img, j) => {
                                      const isUploaded = img.startsWith("/api/video-ads/uploaded/");
                                      return (
                                        <div key={j} className="relative">
                                          <img
                                            src={img}
                                            alt={`Scene ${i + 1} image ${j + 1}`}
                                            className={`w-14 h-14 object-cover rounded border ${isUploaded ? "border-yellow-400/50" : "border-white/10"}`}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                          />
                                          {isUploaded && (
                                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[6px] font-bold px-1 rounded">YOU</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                            <p className="text-[9px] text-slate-500">Images are auto-matched to script sections based on content. Edit the script freely — images are for reference.</p>
                          </div>
                        )}
                        {richImages.length > 0 ? (
                          <div>
                            {Object.entries(
                              richImages.reduce((acc, img) => {
                                const page = img.sourcePage;
                                if (!acc[page]) acc[page] = [];
                                acc[page].push(img);
                                return acc;
                              }, {} as Record<string, typeof richImages>)
                            ).map(([page, imgs]) => (
                              <div key={page} className="mb-2">
                                <p className="text-[10px] text-slate-500 mb-1">From: <span className="text-slate-400">{page}</span></p>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                  {imgs.map((img, i) => (
                                    <div key={i} className="group relative">
                                      <img
                                        src={img.url}
                                        alt={img.alt}
                                        className="w-full h-16 object-cover rounded border border-white/10 hover:border-lime-400/50 transition-colors"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        data-testid={`scraped-image-${page}-${i}`}
                                      />
                                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center p-1">
                                        <p className="text-[8px] text-white text-center leading-tight">{img.context || img.alt}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto rounded-lg bg-black/30 p-2">
                            {scrapedImages.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`Website image ${i + 1}`}
                                className="w-full h-16 object-cover rounded border border-white/10 hover:border-lime-400/50 transition-colors"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                data-testid={`scraped-image-${i}`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500">Hover over images to see where they came from and what content they relate to. Edit the script above to customize — the storyboard shows which images match each section.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Your Own Images (Optional)</Label>
                    <p className="text-[10px] text-slate-500 mb-2">Upload your own images — the app will read their filenames and match them to your script sections in the storyboard.</p>
                    <div className="flex items-center gap-2 mb-2">
                      <label
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 bg-black/30 hover:border-lime-400/40 transition-colors cursor-pointer text-xs text-slate-400 hover:text-lime-400"
                        data-testid="button-upload-images"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? "Uploading..." : "Choose Images"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploading}
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            setUploading(true);
                            try {
                              const formData = new FormData();
                              for (let i = 0; i < files.length; i++) {
                                formData.append("images", files[i]);
                              }
                              const res = await fetch("/api/video-ads/upload-images", {
                                method: "POST",
                                body: formData,
                                credentials: "include",
                              });
                              if (!res.ok) throw new Error("Upload failed");
                              const data = await res.json();
                              setUploadedImages(prev => [...prev, ...data.images]);

                              if (storyboard.length > 0) {
                                setStoryboard(prev => prev.map(scene => {
                                  const sceneWords = scene.text.toLowerCase().split(/\s+/);
                                  const matched = data.images.filter((img: any) =>
                                    img.keywords.some((kw: string) => sceneWords.some((w: string) => w.length > 3 && w.includes(kw)))
                                  );
                                  return {
                                    ...scene,
                                    suggestedImages: [...scene.suggestedImages, ...matched.map((m: any) => m.url)].slice(0, 5),
                                  };
                                }));
                              }

                              toast({ title: `Uploaded ${data.images.length} image${data.images.length > 1 ? "s" : ""}` });
                            } catch (err: any) {
                              toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                            } finally {
                              setUploading(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                      {uploadedImages.length > 0 && (
                        <span className="text-[10px] text-slate-500">{uploadedImages.length} uploaded</span>
                      )}
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                        {uploadedImages.map((img, i) => (
                          <div key={i} className="group relative">
                            <img
                              src={img.url}
                              alt={img.originalName}
                              className="w-full h-16 object-cover rounded border border-yellow-400/30 hover:border-yellow-400/60 transition-colors"
                              data-testid={`uploaded-image-${i}`}
                            />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center p-1">
                              <p className="text-[7px] text-yellow-400 font-medium">YOUR IMAGE</p>
                              <p className="text-[7px] text-white text-center leading-tight mt-0.5">{img.originalName}</p>
                              {img.keywords.length > 0 && (
                                <p className="text-[6px] text-slate-400 mt-0.5">Keywords: {img.keywords.join(", ")}</p>
                              )}
                            </div>
                            <button
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                              data-testid={`remove-uploaded-image-${i}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Video Duration</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedDuration(opt.value)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedDuration === opt.value
                              ? "border-lime-400 bg-lime-400/10 text-lime-400"
                              : "border-white/10 bg-black/30 text-slate-400 hover:border-white/20"
                          }`}
                          data-testid={`button-duration-${opt.value}`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-bold">{opt.label}</span>
                          </div>
                          <p className="text-[10px] opacity-70">{opt.words}</p>
                          <p className="text-[10px] mt-1 font-medium">
                            {opt.singlePrice} single · {opt.packagePrice} pkg
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      {mode === "agent" ? "Video Description" : "Script for the Presenter"}
                    </Label>
                    <Textarea
                      placeholder={
                        mode === "agent"
                          ? "e.g., A professional presenter in business attire explaining our new project management tool in 30 seconds. Upbeat tone, modern office background..."
                          : "e.g., Hi! Are you tired of messy links? LinksShrink.com helps you shorten, track, and manage all your URLs in one place..."
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={5}
                      className="bg-black/50 border-white/10 text-white resize-none"
                      data-testid="input-prompt"
                    />
                    <p className="text-xs text-slate-500 mt-1">{prompt.length} characters</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={
                        generateMutation.isPending || packageMutation.isPending ||
                        !prompt ||
                        (mode === "avatar" && (!selectedAvatar || !selectedVoice))
                      }
                      className="bg-lime-400 hover:bg-lime-500 text-black font-bold h-12"
                      data-testid="button-generate-video"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Single Video ({currentDuration.singlePrice})
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => packageMutation.mutate()}
                      disabled={
                        generateMutation.isPending || packageMutation.isPending ||
                        !prompt ||
                        (mode === "avatar" && (!selectedAvatar || !selectedVoice))
                      }
                      className="bg-gradient-to-r from-lime-400 to-yellow-400 hover:from-lime-500 hover:to-yellow-500 text-black font-bold h-12"
                      data-testid="button-generate-package"
                    >
                      {packageMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating package...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Full Ad Package ({currentDuration.packagePrice})
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 font-medium mb-2">Full Ad Package includes:</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-lime-400/60" />
                        3 Videos (16:9, 9:16, 1:1)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5 text-lime-400/60" />
                        3 Banner Images (16:9, 9:16, 1:1)
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">6 total assets optimized for Google Ads, Microsoft Ads, YouTube, Instagram & TikTok</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Your Videos</CardTitle>
                    {myVideos.filter(v => v.status === "completed").length > 0 && (
                      <button
                        onClick={() => {
                          const completedIds = myVideos.filter(v => v.status === "completed" && v.videoUrl).map(v => v.id);
                          if (selectedVideos.size === completedIds.length) {
                            setSelectedVideos(new Set());
                          } else {
                            setSelectedVideos(new Set(completedIds));
                          }
                        }}
                        className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                        data-testid="button-select-all-videos"
                      >
                        {selectedVideos.size === myVideos.filter(v => v.status === "completed" && v.videoUrl).length && selectedVideos.size > 0 ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedVideos.size > 0 && (
                    <div className="mb-4 p-3 rounded-lg border border-lime-400/30 bg-lime-400/5">
                      <p className="text-xs text-lime-400 mb-2 font-medium">{selectedVideos.size} video{selectedVideos.size > 1 ? "s" : ""} selected</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-lime-400/30 text-lime-400 hover:bg-lime-400/10"
                          onClick={() => {
                            const selected = myVideos.filter(v => selectedVideos.has(v.id) && v.videoUrl);
                            selected.forEach((v, i) => {
                              setTimeout(() => triggerDownload(v.videoUrl!, `video-ad-${v.id}.mp4`), i * 500);
                            });
                            toast({ title: `Downloading ${selected.length} video${selected.length > 1 ? "s" : ""}` });
                          }}
                          data-testid="button-bulk-download-videos"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download Videos ({selectedVideos.size})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                          onClick={() => {
                            const selected = myVideos.filter(v => selectedVideos.has(v.id) && v.thumbnailUrl);
                            selected.forEach((v, i) => {
                              setTimeout(() => triggerDownload(v.thumbnailUrl!, `banner-${v.id}.png`), i * 500);
                            });
                            toast({ title: `Downloading ${selected.length} banner${selected.length > 1 ? "s" : ""}` });
                          }}
                          data-testid="button-bulk-download-banners"
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Download Banners ({selectedVideos.size})
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-1.5">Step 1: Download above. Step 2: Upload to your platform:</p>
                      <div className="space-y-1.5">
                        <a href="https://ads.google.com/intl/en/home/" target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 transition-colors group"
                          data-testid="bulk-upload-google"
                        >
                          <span className="text-blue-400 mt-0.5 shrink-0"><SiGoogleads className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <span className="text-blue-400 text-[11px] font-medium group-hover:underline">Google Ads →</span>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">New: Campaigns → + New Campaign → choose goal → Add video/image assets. Existing: Campaigns → select campaign → Ads → Edit → replace or add media</p>
                          </div>
                        </a>
                        <a href="https://www.facebook.com/business/ads" target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded bg-indigo-500/5 border border-indigo-500/15 hover:bg-indigo-500/10 transition-colors group"
                          data-testid="bulk-upload-facebook"
                        >
                          <span className="text-indigo-400 mt-0.5 shrink-0"><SiFacebook className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <span className="text-indigo-400 text-[11px] font-medium group-hover:underline">Facebook / Instagram →</span>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">New: Ads Manager → Create → choose objective → Add Media → Upload. Existing: Ads Manager → select campaign → Edit → Ad Creative → Change Media</p>
                          </div>
                        </a>
                        <a href="https://ads.tiktok.com/i18n/home" target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded bg-pink-500/5 border border-pink-500/15 hover:bg-pink-500/10 transition-colors group"
                          data-testid="bulk-upload-tiktok"
                        >
                          <span className="text-pink-400 mt-0.5 shrink-0"><SiTiktok className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <span className="text-pink-400 text-[11px] font-medium group-hover:underline">TikTok Ads →</span>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">New: Campaign → Create → Ad Group → Upload video. Existing: Campaign → select it → Ad Group → Edit → replace creative</p>
                          </div>
                        </a>
                        <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded bg-red-500/5 border border-red-500/15 hover:bg-red-500/10 transition-colors group"
                          data-testid="bulk-upload-youtube"
                        >
                          <span className="text-red-400 mt-0.5 shrink-0"><SiYoutube className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <span className="text-red-400 text-[11px] font-medium group-hover:underline">YouTube →</span>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">New: Create (top right) → Upload Video → use in Google Ads campaign. Existing: Content → select video → use in linked Google Ads</p>
                          </div>
                        </a>
                        <a href="https://about.ads.microsoft.com/en-us" target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 transition-colors group"
                          data-testid="bulk-upload-microsoft"
                        >
                          <span className="text-cyan-400 mt-0.5 shrink-0"><Globe className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <span className="text-cyan-400 text-[11px] font-medium group-hover:underline">Microsoft Ads →</span>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">New: Create Campaign → Video ads → Upload assets. Existing: Campaigns → select campaign → Ads & extensions → Edit ad → replace media</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                  {videosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                    </div>
                  ) : myVideos.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No videos yet. Generate your first one!</p>
                  ) : (
                    <div className="space-y-3">
                      {myVideos.map((video) => (
                        <div
                          key={video.id}
                          className={`p-3 rounded-lg border bg-black/30 transition-colors ${selectedVideos.has(video.id) ? "border-lime-400/50 bg-lime-400/5" : "border-white/10"}`}
                          data-testid={`video-card-${video.id}`}
                        >
                          {video.status === "completed" && video.videoUrl ? (
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedVideos.has(video.id)}
                                  onChange={(e) => {
                                    const next = new Set(selectedVideos);
                                    if (e.target.checked) { next.add(video.id); } else { next.delete(video.id); }
                                    setSelectedVideos(next);
                                  }}
                                  className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-lime-400 focus:ring-lime-400 accent-lime-400 shrink-0 cursor-pointer"
                                  data-testid={`checkbox-video-${video.id}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <video
                                    src={video.videoUrl}
                                    controls
                                    className="w-full rounded-lg"
                                    poster={video.thumbnailUrl || undefined}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-slate-400 truncate pl-7">{video.prompt.substring(0, 60)}...</p>
                              <div className="flex items-center gap-3 flex-wrap pl-7">
                                <button
                                  onClick={() => triggerDownload(video.videoUrl!, `video-ad-${video.id}.mp4`)}
                                  className="flex items-center gap-1.5 text-lime-400 text-xs hover:text-lime-300 cursor-pointer"
                                  data-testid={`button-download-video-${video.id}`}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Video
                                </button>
                                {video.thumbnailUrl && (
                                  <button
                                    onClick={() => triggerDownload(video.thumbnailUrl!, `banner-${video.id}.png`)}
                                    className="flex items-center gap-1.5 text-yellow-400 text-xs hover:text-yellow-300 cursor-pointer"
                                    data-testid={`button-download-image-${video.id}`}
                                  >
                                    <Image className="w-3.5 h-3.5" />
                                    Banner Image
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : video.status === "processing" ? (
                            <div className="flex items-center gap-3 py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
                              <div>
                                <p className="text-sm text-white">Generating...</p>
                                <p className="text-xs text-slate-500">Usually takes 5-10 minutes</p>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2">
                              <p className="text-sm text-red-400">Failed</p>
                              <p className="text-xs text-slate-500">{video.errorMessage || "Something went wrong"}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Tips for Great Ads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold text-sm mt-0.5">1.</span>
                    <p className="text-xs text-slate-400">Keep it short — 15-30 second ads perform best on Google and social media</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold text-sm mt-0.5">2.</span>
                    <p className="text-xs text-slate-400">Start with a hook — mention the problem you solve in the first 5 seconds</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold text-sm mt-0.5">3.</span>
                    <p className="text-xs text-slate-400">End with a clear call-to-action — tell viewers exactly what to do next</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold text-sm mt-0.5">4.</span>
                    <p className="text-xs text-slate-400">For Google Ads, use horizontal (landscape) format for best results</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
