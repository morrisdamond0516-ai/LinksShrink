import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Video, Download, RefreshCw, Play, User, Mic, Sparkles, Package, Globe, Image, Clock, ExternalLink, Upload, Check, X } from "lucide-react";
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
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([""]);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [avatarGender, setAvatarGender] = useState<"all" | "male" | "female">("all");
  const [avatarPage, setAvatarPage] = useState(1);
  const [voiceSearch, setVoiceSearch] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [richImages, setRichImages] = useState<{ url: string; sourcePage: string; alt: string; context: string; type: string }[]>([]);
  const [storyboard, setStoryboard] = useState<{ section: string; text: string; suggestedImages: string[] }[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ id?: number; url: string; originalName: string; keywords: string[]; description: string }[]>([]);
  const [pagesScraped, setPagesScraped] = useState(0);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [pollingId, setPollingId] = useState<number | null>(null);
  const [videoPage, setVideoPage] = useState(0);
  const VIDEOS_PER_PAGE = 6;
  const { toast } = useToast();
  
  const targetUrl = websiteUrls[0] || "";
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

  const { data: persistedImages } = useQuery<{ images: { id: number; url: string; originalName: string; keywords: string[]; description: string }[] }>({
    queryKey: ["/api/video-ads/my-uploaded-images"],
  });

  useEffect(() => {
    if (persistedImages?.images && persistedImages.images.length > 0 && uploadedImages.length === 0) {
      setUploadedImages(persistedImages.images);
    }
  }, [persistedImages]);

  const deleteUploadedImageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/video-ads/my-uploaded-images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-uploaded-images"] });
    },
  });

  const AVATARS_PER_PAGE = 24;
  const filteredAvatars = avatars.filter((a) => {
    if (avatarGender !== "all" && a.gender?.toLowerCase() !== avatarGender) return false;
    if (avatarSearch && !a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())) return false;
    return true;
  });
  const visibleAvatars = filteredAvatars.slice(0, avatarPage * AVATARS_PER_PAGE);
  const hasMoreAvatars = visibleAvatars.length < filteredAvatars.length;

  const filteredVoices = voices.filter((v) =>
    (v.name?.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      v.language?.toLowerCase().includes(voiceSearch.toLowerCase())) &&
    v.language?.toLowerCase().includes("english")
  ).slice(0, 20);

  const matchImageToText = (text: string, candidates: typeof uploadedImages, usedUrls?: Set<string>) => {
    if (candidates.length === 0) return undefined;
    const textWords = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    let best: { url: string; score: number } = { url: "", score: -1 };
    for (const img of candidates) {
      if (usedUrls?.has(img.url)) continue;
      const score = img.keywords.reduce((acc, kw) => {
        const kwLow = kw.toLowerCase();
        return acc + textWords.filter(w => w.includes(kwLow) || kwLow.includes(w)).length;
      }, 0);
      if (score > best.score) best = { url: img.url, score };
    }
    return best.score > 0 ? best.url : undefined;
  };

  // Score how well an image matches a block of text
  const scoreImageForText = useCallback((text: string, img: { url: string; sourcePage?: string; alt?: string; context?: string; type?: string }) => {
    const textWords = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    const imgText = [img.sourcePage, img.alt, img.context].filter(Boolean).join(" ").toLowerCase();
    const imgWords = imgText.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    let score = 0;
    for (const tw of textWords) {
      for (const iw of imgWords) {
        if (tw === iw) score += 3;
        else if (tw.includes(iw) || iw.includes(tw)) score += 1;
      }
    }
    // Screenshots of real pages are higher quality for ads
    if (img.type === "screenshot") score += 2;
    return score;
  }, []);

  // Rebuild the storyboard by re-matching ALL available images to the new script
  const rebuildStoryboardFromScript = useCallback((script: string) => {
    const allImgs: { url: string; sourcePage: string; alt: string; context: string; type: string }[] = [
      ...richImages,
      ...uploadedImages.map(u => ({
        url: u.url,
        sourcePage: u.originalName,
        alt: u.description,
        context: u.keywords.join(" "),
        type: "uploaded",
      })),
      // Include plain scraped URLs with context derived from slug so they can be matched
      ...scrapedImages
        .filter(url => !richImages.some(r => r.url === url))
        .map(url => {
          const slug = url.split("/").pop()?.replace(/[_\-\.]/g, " ").replace(/\.(jpe?g|png|webp|gif)$/i, "") || "";
          return { url, sourcePage: slug, alt: slug, context: slug, type: "scraped" };
        }),
    ];
    if (!script.trim() || allImgs.length === 0) return;

    // Split by blank lines first; fall back to grouping sentences 2–3 at a time
    const rawSections = script.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
    const sections: string[] = rawSections.length > 1
      ? rawSections
      : (script.match(/[^.!?]+[.!?]+/g) || [script]).reduce((acc: string[], sent, i) => {
          const groupSize = 2;
          if (i % groupSize === 0) acc.push(sent.trim());
          else acc[acc.length - 1] += " " + sent.trim();
          return acc;
        }, []);

    const usedUrls = new Set<string>();
    const newStoryboard = sections.map((sectionText, i) => {
      const scored = allImgs
        .map(img => ({ img, score: scoreImageForText(sectionText, img) }))
        .filter(({ img }) => !usedUrls.has(img.url))
        .sort((a, b) => b.score - a.score);

      const topImages = scored.slice(0, 3).map(({ img }) => img.url);
      if (scored[0]?.score > 0) usedUrls.add(scored[0].img.url);

      return { section: `Scene ${i + 1}`, text: sectionText, suggestedImages: topImages };
    }).filter(s => s.text.length > 5);

    setStoryboard(newStoryboard);
    setShowStoryboard(newStoryboard.length > 0);
  }, [richImages, uploadedImages, scrapedImages, scoreImageForText]);

  // Live-update the storyboard 400ms after each script edit (only when images exist)
  const storyboardDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const hasImages = richImages.length > 0 || uploadedImages.length > 0 || scrapedImages.length > 0;
    if (!hasImages) return;
    if (storyboardDebounceRef.current) clearTimeout(storyboardDebounceRef.current);
    storyboardDebounceRef.current = setTimeout(() => {
      rebuildStoryboardFromScript(prompt);
    }, 400);
    return () => {
      if (storyboardDebounceRef.current) clearTimeout(storyboardDebounceRef.current);
    };
  }, [prompt, richImages, uploadedImages, scrapedImages]);

  const buildScenes = () => {
    const allImages = [
      ...uploadedImages.map(img => img.url),
      ...richImages.map(img => img.url),
      ...scrapedImages,
    ];
    // Build a rich candidate pool for scoring (same as rebuildStoryboardFromScript)
    const richCandidates: { url: string; sourcePage: string; alt: string; context: string; type: string }[] = [
      ...richImages,
      ...uploadedImages.map(u => ({
        url: u.url,
        sourcePage: u.originalName,
        alt: u.description,
        context: u.keywords.join(" "),
        type: "uploaded",
      })),
      ...scrapedImages
        .filter(url => !richImages.some(r => r.url === url))
        .map(url => {
          const slug = url.split("/").pop()?.replace(/[_\-\.]/g, " ").replace(/\.(jpe?g|png|webp|gif)$/i, "") || "";
          return { url, sourcePage: slug, alt: slug, context: slug, type: "scraped" };
        }),
    ];

    if (storyboard.length > 0) {
      const usedUrls = new Set<string>();
      return storyboard.map((section, idx) => {
        // Score ALL available images against this scene text (same algorithm as storyboard rebuild)
        const scored = richCandidates
          .filter(img => !usedUrls.has(img.url))
          .map(img => ({ url: img.url, score: scoreImageForText(section.text, img) }))
          .sort((a, b) => b.score - a.score);

        // Use the highest-scoring image; fall back to storyboard suggestion, then index
        const bestScored = scored[0]?.score > 0 ? scored[0].url : null;
        const bgUrl = bestScored || section.suggestedImages?.[0] || allImages[idx % allImages.length] || undefined;
        if (bgUrl) usedUrls.add(bgUrl);
        return { text: section.text, backgroundUrl: bgUrl };
      }).filter(s => s.text.trim());
    }

    if (allImages.length > 0 && prompt) {
      const sentences = prompt.match(/[^.!?]+[.!?]+/g) || [prompt];
      const numImages = Math.min(allImages.length, 6);
      const chunkSize = Math.max(1, Math.ceil(sentences.length / numImages));
      const scenes: { text: string; backgroundUrl?: string }[] = [];
      const usedUrls = new Set<string>();
      for (let i = 0; i < sentences.length; i += chunkSize) {
        const text = sentences.slice(i, i + chunkSize).join(" ").trim();
        if (!text) continue;
        const imgIdx = Math.floor(i / chunkSize);
        // Score all candidates for this sentence chunk
        const scored = richCandidates
          .filter(img => !usedUrls.has(img.url))
          .map(img => ({ url: img.url, score: scoreImageForText(text, img) }))
          .sort((a, b) => b.score - a.score);
        const bgUrl = (scored[0]?.score > 0 ? scored[0].url : null) || allImages[imgIdx % allImages.length];
        if (bgUrl) usedUrls.add(bgUrl);
        scenes.push({ text, backgroundUrl: bgUrl });
      }
      return scenes;
    }
    return null;
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const body: any = { prompt, targetUrl, mode, duration: selectedDuration };
      if (mode === "avatar") {
        body.avatarId = selectedAvatar;
        body.voiceId = selectedVoice;
      }
      const scenes = buildScenes();
      if (scenes && scenes.length > 0) {
        body.scenes = scenes;
      } else if (selectedBackgroundImage) {
        body.backgroundImageUrl = selectedBackgroundImage;
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
      const scenes = buildScenes();
      if (scenes && scenes.length > 0) {
        body.scenes = scenes;
      } else if (selectedBackgroundImage) {
        body.backgroundImageUrl = selectedBackgroundImage;
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
      const filledUrls = websiteUrls.map(u => u.trim()).filter(Boolean).map(u => u.startsWith("http") ? u : "https://" + u);
      if (filledUrls.length === 0) throw new Error("Enter at least one website URL");
      const endpoint = filledUrls.length === 1 ? "/api/video-ads/scrape-website" : "/api/video-ads/scrape-websites";
      const body = filledUrls.length === 1 ? { url: filledUrls[0] } : { urls: filledUrls };
      const res = await apiRequest("POST", endpoint, body);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.scriptSuggestion) setPrompt(data.scriptSuggestion);
      if (data.richImages && data.richImages.length > 0) setRichImages(data.richImages);
      if (data.storyboard && data.storyboard.length > 0) {
        const matchedStoryboard = data.storyboard.map((section: any) => {
          if (uploadedImages.length === 0) return section;
          const sceneWords = section.text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w: string) => w.length > 3);
          const matched = uploadedImages.filter(img =>
            img.keywords.some(kw => sceneWords.some((w: string) => w.includes(kw.toLowerCase()) || kw.toLowerCase().includes(w)))
          );
          return { ...section, suggestedImages: [...matched.map(m => m.url), ...(section.suggestedImages || [])].slice(0, 5) };
        });
        setStoryboard(matchedStoryboard);
        setShowStoryboard(true);
      }
      if (data.images && data.images.length > 0) {
        setScrapedImages(data.images);
        setPagesScraped(data.pagesScraped || 1);
        const siteCount = data.sitesScraped || 1;
        const siteLabel = siteCount > 1 ? `${siteCount} websites` : (data.siteData?.[0]?.title || websiteUrls[0]);
        toast({ title: "Websites scraped! ✅", description: `Found ${data.images.length} images across ${data.pagesScraped} pages from ${siteLabel}. AI script & storyboard ready.` });
      } else if (data.scriptSuggestion) {
        setPagesScraped(data.pagesScraped || 1);
        toast({ title: "Script generated!", description: `Pulled content from ${data.siteData?.length || 1} site(s). No images found — you can add your own below.` });
      } else {
        toast({ title: "Limited content found", description: "We couldn't extract much from those sites. Try writing your script manually.", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      const msg = err.message || "";
      const friendly = msg.includes("too long") ? "A website took too long to respond. Try again or write your script manually."
        : msg.includes("400") ? "Couldn't reach one of the websites. Check the URLs and try again."
        : "Couldn't fetch the websites. Try writing your script manually instead.";
      toast({ title: "Could not fetch websites", description: friendly, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/video-ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-videos"] });
      toast({ title: "Video removed" });
    },
    onError: (err: any) => {
      toast({ title: "Could not remove video", description: err.message, variant: "destructive" });
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
                  {mode === "agent" && uploadedImages.length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                      <p className="text-xs text-yellow-300">
                        <strong>AI Auto-Generate ignores custom images</strong> — the AI controls the visuals automatically. To use your {uploadedImages.length} uploaded image{uploadedImages.length > 1 ? "s" : ""} as backgrounds, switch to <button type="button" onClick={() => setMode("avatar")} className="underline hover:text-yellow-200 cursor-pointer">Avatar & Voice mode</button>.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {mode === "avatar" && (
                <Card className="bg-slate-900/80 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-lime-400" />
                      Choose Your Presenter
                      <span className="text-xs text-slate-500 font-normal ml-auto">{filteredAvatars.length} available</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg border border-white/10 overflow-hidden">
                        {(["all", "male", "female"] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => { setAvatarGender(g); setAvatarPage(1); }}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              avatarGender === g
                                ? "bg-lime-400 text-black"
                                : "bg-black/30 text-slate-400 hover:text-white"
                            }`}
                            data-testid={`button-avatar-filter-${g}`}
                          >
                            {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
                          </button>
                        ))}
                      </div>
                      <Input
                        placeholder="Filter by name..."
                        value={avatarSearch}
                        onChange={(e) => { setAvatarSearch(e.target.value); setAvatarPage(1); }}
                        className="bg-black/50 border-white/10 text-white h-8 text-xs flex-1"
                        data-testid="input-avatar-search"
                      />
                    </div>
                    {selectedAvatar && (() => {
                      const sel = avatars.find(a => a.avatar_id === selectedAvatar);
                      if (!sel) return null;
                      return (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-lime-400/10 border border-lime-400/30">
                          <img src={sel.preview_image_url} alt={sel.avatar_name} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-lime-400 font-medium">Selected: {sel.avatar_name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{sel.gender}</p>
                          </div>
                          <button onClick={() => setSelectedAvatar("")} className="text-[10px] text-red-400 hover:text-red-300 underline" data-testid="button-clear-avatar">Change</button>
                        </div>
                      );
                    })()}
                    {avatarsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[400px] overflow-y-auto pr-1">
                          {visibleAvatars.map((avatar) => (
                            <button
                              key={avatar.avatar_id}
                              onClick={() => setSelectedAvatar(avatar.avatar_id)}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${
                                selectedAvatar === avatar.avatar_id
                                  ? "border-lime-400 ring-2 ring-lime-400/30 scale-[1.02]"
                                  : "border-white/10 hover:border-white/30 hover:scale-[1.02]"
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
                              {selectedAvatar === avatar.avatar_id && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1 pt-4">
                                <p className="text-[10px] text-white truncate font-medium">{avatar.avatar_name}</p>
                                <p className="text-[8px] text-slate-400 capitalize">{avatar.gender}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        {hasMoreAvatars && (
                          <button
                            onClick={() => setAvatarPage(p => p + 1)}
                            className="w-full py-2 text-xs text-lime-400 hover:text-lime-300 border border-white/10 rounded-lg hover:border-lime-400/30 transition-colors"
                            data-testid="button-load-more-avatars"
                          >
                            Show More ({filteredAvatars.length - visibleAvatars.length} remaining)
                          </button>
                        )}
                      </>
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
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Websites to Advertise</Label>
                      <span className="text-[10px] text-slate-500">up to 3 websites in one ad</span>
                    </div>
                    <div className="space-y-2">
                      {websiteUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs text-slate-500 w-4 shrink-0">{idx + 1}.</span>
                          <Input
                            placeholder={idx === 0 ? "https://yourproduct.com" : `https://website${idx + 1}.com`}
                            value={url}
                            onChange={(e) => {
                              const next = [...websiteUrls];
                              next[idx] = e.target.value;
                              setWebsiteUrls(next);
                            }}
                            className="bg-black/50 border-white/10 text-white flex-1"
                            data-testid={`input-target-url-${idx}`}
                          />
                          {websiteUrls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setWebsiteUrls(websiteUrls.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                              data-testid={`button-remove-url-${idx}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {websiteUrls.length < 3 ? (
                        <button
                          type="button"
                          onClick={() => setWebsiteUrls([...websiteUrls, ""])}
                          className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                          data-testid="button-add-url"
                        >
                          + Add another website {websiteUrls.length === 1 ? "(advertise 2–3 sites in one ad)" : ""}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Maximum 3 websites</span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => scrapeMutation.mutate()}
                        disabled={!websiteUrls.some(u => u.trim()) || scrapeMutation.isPending}
                        className="border-lime-400/30 text-lime-400 hover:bg-lime-400/10 shrink-0"
                        data-testid="button-fetch-website"
                      >
                        {scrapeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Screenshotting…
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-1" />
                            {websiteUrls.filter(u => u.trim()).length > 1 ? `Screenshot ${websiteUrls.filter(u => u.trim()).length} Sites` : "Screenshot & Script"}
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {scrapeMutation.isPending
                        ? "Opening a real browser, visiting every page, and taking screenshots — this takes ~30–60 seconds…"
                        : pagesScraped > 0
                          ? `Screenshotted ${pagesScraped} pages — found ${richImages.length} images (${richImages.filter(i => i.type === "screenshot").length} page screenshots)`
                          : websiteUrls.length > 1
                            ? "Opens a real browser on each site, screenshots every page, and writes a combined ad script"
                            : "Enter a URL — we'll open it in a real browser, screenshot every page, and write your ad script"}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-lime-400 font-medium">Visual Storyboard</p>
                                <span className="flex items-center gap-1 text-[9px] text-lime-500 bg-lime-400/10 border border-lime-400/20 px-1.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse inline-block" />
                                  Live — updates as you edit the script
                                </span>
                              </div>
                              {uploadedImages.length > 0 && (
                                <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                                  {uploadedImages.length} your image{uploadedImages.length > 1 ? "s" : ""} + {richImages.filter(i => i.type === "screenshot").length} screenshots
                                </span>
                              )}
                            </div>
                            {storyboard.map((scene, i) => {
                              const uploadedMatch = scene.suggestedImages.find(img => img.startsWith("/api/video-ads/uploaded/") && !img.includes("screenshots/"));
                              const screenshotMatch = scene.suggestedImages.find(img => img.includes("screenshots/"));
                              const matchedImgData = uploadedMatch ? uploadedImages.find(u => u.url === uploadedMatch) : undefined;
                              const matchedRich = screenshotMatch ? richImages.find(r => r.url === screenshotMatch) : undefined;
                              return (
                                <div key={i} className="flex gap-3 p-2 rounded bg-black/30 border border-white/5" data-testid={`storyboard-section-${i}`}>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-lime-400 font-medium mb-1">{scene.section}</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">{scene.text}</p>
                                    {matchedImgData && (
                                      <p className="text-[9px] text-yellow-400 mt-1">
                                        ↳ Your image: <span className="text-yellow-300">{matchedImgData.originalName}</span>
                                        {matchedImgData.keywords.length > 0 && <span className="text-slate-500"> · keywords: {matchedImgData.keywords.slice(0, 3).join(", ")}</span>}
                                      </p>
                                    )}
                                    {!matchedImgData && matchedRich && (
                                      <p className="text-[9px] text-lime-500 mt-1">
                                        ↳ Screenshot: <span className="text-lime-300">{matchedRich.sourcePage}</span>
                                        {matchedRich.context && <span className="text-slate-500"> · {matchedRich.context.substring(0, 60)}</span>}
                                      </p>
                                    )}
                                  </div>
                                  {scene.suggestedImages.length > 0 && (
                                    <div className="flex gap-1 shrink-0">
                                      {scene.suggestedImages.slice(0, 3).map((img, j) => {
                                        const isUploaded = img.startsWith("/api/video-ads/uploaded/") && !img.includes("screenshots/");
                                        const isScreenshot = img.includes("screenshots/");
                                        return (
                                          <div key={j} className="relative cursor-pointer" onClick={() => setSelectedBackgroundImage(img)}>
                                            <img
                                              src={img}
                                              alt={`Scene ${i + 1} image ${j + 1}`}
                                              className={`w-16 object-cover rounded border-2 transition-colors ${
                                                isScreenshot ? "h-10" : "h-16"
                                              } ${
                                                selectedBackgroundImage === img
                                                  ? "border-lime-400"
                                                  : isUploaded ? "border-yellow-400/70 hover:border-yellow-400"
                                                  : "border-white/10 hover:border-lime-400/50"
                                              }`}
                                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                            />
                                            {isUploaded && j === 0 && (
                                              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[6px] font-bold px-1 rounded">YOURS</span>
                                            )}
                                            {isScreenshot && j === 0 && (
                                              <span className="absolute top-0 left-0 bg-lime-500/80 text-black text-[6px] font-bold px-1 rounded-br">📸</span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <p className="text-[9px] text-slate-500">
                              Storyboard auto-updates as you edit the script above. Images are matched by keywords in your script — page screenshots get priority. Click any image thumbnail to set it as your video background.
                            </p>
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
                                <div className={`grid gap-2 ${imgs.some(i => i.type === "screenshot") ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-4 sm:grid-cols-6"}`}>
                                  {imgs.map((img, i) => (
                                    <div key={i} className="group relative cursor-pointer" onClick={() => setSelectedBackgroundImage(img.url)}>
                                      <img
                                        src={img.url}
                                        alt={img.alt}
                                        className={`w-full rounded border-2 transition-colors object-cover ${
                                          img.type === "screenshot" ? "h-28" : "h-16"
                                        } ${
                                          selectedBackgroundImage === img.url
                                            ? "border-lime-400 ring-1 ring-lime-400/50"
                                            : "border-white/10 hover:border-lime-400/50"
                                        }`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        data-testid={`scraped-image-${page}-${i}`}
                                      />
                                      {img.type === "screenshot" && selectedBackgroundImage !== img.url && (
                                        <div className="absolute top-0.5 right-0.5 bg-black/70 text-[8px] text-white px-1 py-0.5 rounded flex items-center gap-0.5">
                                          📸 Page
                                        </div>
                                      )}
                                      {selectedBackgroundImage === img.url && (
                                        <div className="absolute top-0.5 left-0.5 bg-lime-400 text-black text-[6px] font-bold px-1 rounded">BG</div>
                                      )}
                                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center p-1">
                                        <p className="text-[7px] text-lime-400 font-medium mb-0.5">Click to set as background</p>
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
                              <div key={i} className="group relative cursor-pointer" onClick={() => setSelectedBackgroundImage(img)}>
                                <img
                                  src={img}
                                  alt={`Website image ${i + 1}`}
                                  className={`w-full h-16 object-cover rounded border-2 transition-colors ${
                                    selectedBackgroundImage === img
                                      ? "border-lime-400 ring-1 ring-lime-400/50"
                                      : "border-white/10 hover:border-lime-400/50"
                                  }`}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  data-testid={`scraped-image-${i}`}
                                />
                                {selectedBackgroundImage === img && (
                                  <div className="absolute top-0.5 left-0.5 bg-lime-400 text-black text-[6px] font-bold px-1 rounded">BG</div>
                                )}
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center p-1">
                                  <p className="text-[7px] text-lime-400 font-medium">Click to set as background</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500">Click any image to set it as the video background (avatar mode). Hover to see details. The storyboard shows which images match each script section.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Your Own Images (Optional)</Label>
                    <p className="text-[10px] text-slate-500 mb-2">Upload your own images to use as video backgrounds. They'll appear behind the avatar — one image per script section. Uploads are saved permanently to your account.</p>
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
                              setUploadedImages(prev => [...prev, ...data.images.map((img: any) => ({
                                id: img.id,
                                url: img.url,
                                originalName: img.originalName,
                                keywords: img.keywords,
                                description: img.description,
                              }))]);
                              queryClient.invalidateQueries({ queryKey: ["/api/video-ads/my-uploaded-images"] });

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
                    {selectedBackgroundImage && (
                      <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-lime-400/10 border border-lime-400/30">
                        <img src={selectedBackgroundImage} alt="Selected background" className="w-12 h-8 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-lime-400 font-medium">Video Background Selected</p>
                          <p className="text-[9px] text-slate-400 truncate">This image will appear behind the avatar in your video</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBackgroundImage(null)}
                          className="text-[10px] text-red-400 hover:text-red-300 underline shrink-0"
                          data-testid="button-clear-background"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
                        {uploadedImages.map((img, i) => (
                          <div key={i} className="group relative cursor-pointer" onClick={() => setSelectedBackgroundImage(img.url)}>
                            <img
                              src={img.url}
                              alt={img.originalName}
                              className={`w-full h-16 object-cover rounded border-2 transition-colors ${
                                selectedBackgroundImage === img.url
                                  ? "border-lime-400 ring-1 ring-lime-400/50"
                                  : "border-yellow-400/30 hover:border-yellow-400/60"
                              }`}
                              data-testid={`uploaded-image-${i}`}
                            />
                            {selectedBackgroundImage === img.url && (
                              <div className="absolute top-0.5 left-0.5 bg-lime-400 text-black text-[6px] font-bold px-1 rounded">BG</div>
                            )}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center p-1">
                              <p className="text-[7px] text-lime-400 font-medium">Click to set as background</p>
                              <p className="text-[7px] text-white text-center leading-tight mt-0.5">{img.originalName}</p>
                              {img.keywords.length > 0 && (
                                <p className="text-[6px] text-slate-400 mt-0.5">Keywords: {img.keywords.join(", ")}</p>
                              )}
                            </div>
                            <button
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedImages(prev => prev.filter((_, j) => j !== i));
                                if (selectedBackgroundImage === img.url) setSelectedBackgroundImage(null);
                                if (img.id) deleteUploadedImageMutation.mutate(img.id);
                              }}
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
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">
                        {mode === "agent" ? "Video Description" : "Script for the Presenter"}
                      </Label>
                      <div className="flex items-center gap-2">
                        {prompt && (
                          <button
                            type="button"
                            onClick={() => setPrompt("")}
                            className="text-[10px] text-red-400 hover:text-red-300 underline"
                            data-testid="button-clear-script"
                          >
                            Clear Script
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      {prompt
                        ? "Edit freely below — modify, add to, or delete this script and write your own."
                        : "Fetch a URL above to auto-generate a script, or write your own from scratch."}
                    </p>
                    <Textarea
                      placeholder={
                        mode === "agent"
                          ? "Write your own script here, or use Fetch above to auto-generate one from your website. You can always edit, add to, or completely replace the generated text."
                          : "Write your script for the presenter here, or use Fetch above to auto-generate one. You can edit, add to, or replace it anytime."
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={8}
                      className="bg-black/50 border-white/10 text-white"
                      data-testid="input-prompt"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">{prompt.length} characters · ~{Math.round(prompt.split(/\s+/).filter(w => w).length)} words</p>
                      <p className="text-[10px] text-slate-600">
                        Target: {DURATION_OPTIONS.find(d => d.value === selectedDuration)?.words || "~80 words"}
                      </p>
                    </div>
                  </div>
                  {mode === "avatar" && uploadedImages.length > 0 && prompt && (() => {
                    const scenes = buildScenes();
                    if (!scenes || scenes.length === 0) return null;
                    return (
                      <div className="rounded-lg border border-lime-400/20 bg-lime-400/5 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-lime-400 font-medium">Scene Preview — {scenes.length} scene{scenes.length > 1 ? "s" : ""}</p>
                          <span className="text-[9px] text-slate-500">{scenes.filter(s => s.backgroundUrl && s.backgroundUrl.startsWith("/api/video-ads/uploaded/")).length} of your images matched</span>
                        </div>
                        {scenes.map((scene, i) => {
                          const isYourImage = scene.backgroundUrl?.startsWith("/api/video-ads/uploaded/");
                          const imgData = isYourImage ? uploadedImages.find(u => u.url === scene.backgroundUrl) : undefined;
                          return (
                            <div key={i} className="flex gap-2 items-start p-2 rounded bg-black/30 border border-white/5">
                              <div className="shrink-0">
                                {scene.backgroundUrl ? (
                                  <div className="relative">
                                    <img src={scene.backgroundUrl} alt={`Scene ${i + 1}`} className={`w-16 h-11 object-cover rounded border ${isYourImage ? "border-yellow-400/60" : "border-white/10"}`}
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                    {isYourImage && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[5px] font-bold px-1 rounded">YOURS</span>}
                                  </div>
                                ) : (
                                  <div className="w-16 h-11 rounded border border-white/10 bg-black/40 flex items-center justify-center">
                                    <span className="text-[7px] text-slate-600">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-lime-400 font-medium mb-0.5">Scene {i + 1}</p>
                                <p className="text-[10px] text-slate-300 leading-tight line-clamp-2">{scene.text}</p>
                                {imgData ? (
                                  <p className="text-[8px] text-yellow-400 mt-0.5">
                                    ↳ <span className="text-yellow-300">{imgData.originalName}</span>
                                    {imgData.keywords.length > 0 && <span className="text-slate-500"> · {imgData.keywords.slice(0, 3).join(", ")}</span>}
                                  </p>
                                ) : isYourImage ? (
                                  <p className="text-[8px] text-yellow-400 mt-0.5">↳ Your image (sequential)</p>
                                ) : scene.backgroundUrl ? (
                                  <p className="text-[8px] text-slate-500 mt-0.5">↳ Website image</p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[9px] text-slate-600">Rename images descriptively (e.g. "checkout-page.jpg") to improve matching.</p>
                      </div>
                    );
                  })()}
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
                    <>
                      <div className="space-y-3">
                        {myVideos.slice(videoPage * VIDEOS_PER_PAGE, (videoPage + 1) * VIDEOS_PER_PAGE).map((video) => (
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
                                  <button
                                    onClick={() => deleteMutation.mutate(video.id)}
                                    disabled={deleteMutation.isPending}
                                    className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                                    title="Remove"
                                    data-testid={`button-delete-video-${video.id}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
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
                                <div className="flex-1">
                                  <p className="text-sm text-white">Generating...</p>
                                  <p className="text-xs text-slate-500">Usually takes 5-10 minutes</p>
                                </div>
                                <button
                                  onClick={() => deleteMutation.mutate(video.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-slate-600 hover:text-red-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                                  title="Remove"
                                  data-testid={`button-delete-video-${video.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="py-2 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm text-red-400 font-medium">Failed</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{video.errorMessage || "Something went wrong"}</p>
                                  <p className="text-[10px] text-slate-600 mt-1">Created {new Date(video.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                  onClick={() => deleteMutation.mutate(video.id)}
                                  disabled={deleteMutation.isPending}
                                  className="flex items-center gap-1.5 text-red-400/70 hover:text-red-400 border border-red-400/30 hover:border-red-400/60 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer shrink-0"
                                  data-testid={`button-dismiss-video-${video.id}`}
                                >
                                  {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {myVideos.length > VIDEOS_PER_PAGE && (
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                          <button
                            onClick={() => setVideoPage(p => Math.max(0, p - 1))}
                            disabled={videoPage === 0}
                            className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded border border-white/10 hover:border-white/20"
                            data-testid="button-video-prev"
                          >
                            ← Previous
                          </button>
                          <span className="text-xs text-slate-500">
                            {videoPage * VIDEOS_PER_PAGE + 1}–{Math.min((videoPage + 1) * VIDEOS_PER_PAGE, myVideos.length)} of {myVideos.length}
                          </span>
                          <button
                            onClick={() => setVideoPage(p => p + 1)}
                            disabled={(videoPage + 1) * VIDEOS_PER_PAGE >= myVideos.length}
                            className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded border border-white/10 hover:border-white/20"
                            data-testid="button-video-next"
                          >
                            Next 6 →
                          </button>
                        </div>
                      )}
                    </>
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
