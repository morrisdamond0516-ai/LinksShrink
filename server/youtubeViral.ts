/**
 * Admin-only YouTube viral research + multi-angle video pack generator.
 * Does not guarantee virality; scores angles using researched retention/hook patterns.
 */

export type VideoStyle =
  | "realistic_avatar"
  | "faceless_broll"
  | "cartoon_story"
  | "myth_vs_truth"
  | "countdown_facts";

export interface ViralAngle {
  id: string;
  style: VideoStyle;
  styleLabel: string;
  angleTitle: string;
  hook: string;
  script: string;
  suggestedTitle: string;
  thumbnailConcept: string;
  durationSeconds: number;
  viralScore: number;
  whyItCouldWork: string;
}

export interface ResearchBrief {
  topic: string;
  researchedAt: string;
  sourcesNote: string;
  patterns: string[];
  bannedOrRisky: boolean;
  riskNotes: string[];
  topInspiration: { title: string; channel?: string; views?: number; reason: string }[];
  angles: ViralAngle[];
}

const BANNED_TOPIC_PATTERNS = [
  /\b(porn|onlyfans|nude|sex\s*tape)\b/i,
  /\b(how\s*to\s*(hack|steal|scam|fraud))\b/i,
  /\b(weapon|bomb|explosive)\s*(make|build)\b/i,
  /\b(child|minor|underage)\b.*\b(sexual|explicit)\b/i,
  /\b(kill|murder)\s+(someone|people)\b/i,
];

const STYLE_ROTATION: { style: VideoStyle; label: string; structure: string }[] = [
  {
    style: "realistic_avatar",
    label: "Realistic AI Presenter",
    structure: "Direct-to-camera authority hook → 3 points → clear CTA",
  },
  {
    style: "faceless_broll",
    label: "Faceless VO + B-roll",
    structure: "Rapid value-per-second facts with on-screen captions",
  },
  {
    style: "cartoon_story",
    label: "Cartoon / Animated Story",
    structure: "3-act mini story: problem → turn → payoff",
  },
  {
    style: "myth_vs_truth",
    label: "Myth vs Truth",
    structure: "Open with popular myth → flip with surprising truth",
  },
  {
    style: "countdown_facts",
    label: "Countdown Tension",
    structure: "Numbered stakes that escalate to the #1 reveal",
  },
];

function sanitizeTopic(topic: string): string {
  return topic.trim().slice(0, 120);
}

export function checkTopicSafety(topic: string): { ok: boolean; notes: string[] } {
  const notes: string[] = [];
  for (const re of BANNED_TOPIC_PATTERNS) {
    if (re.test(topic)) {
      notes.push("Topic matches a blocked/high-risk pattern and cannot be used.");
    }
  }
  return { ok: notes.length === 0, notes };
}

async function fetchYouTubeInspiration(topic: string): Promise<ResearchBrief["topInspiration"]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [
      {
        title: `(Pattern) High-retention Shorts on "${topic}"`,
        reason: "Hook in 0–2s, pay off the title promise, captions on-screen",
      },
      {
        title: `(Pattern) Contrarian / myth-busting angles outperform soft tips`,
        reason: "Negative or conflict framing often lifts CTR in saturated niches",
      },
      {
        title: `(Pattern) Story + reveal beats list dumps for shares`,
        reason: "Open loop early; deliver a clear twist before the end card",
      },
    ];
  }

  try {
    const q = encodeURIComponent(topic);
    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&order=viewCount&q=${q}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchJson: any = await searchRes.json();
    const ids = (searchJson.items || [])
      .map((i: any) => i.id?.videoId)
      .filter(Boolean)
      .slice(0, 8);

    if (!ids.length) return [];

    const statsUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsJson: any = await statsRes.json();

    return (statsJson.items || []).map((v: any) => ({
      title: v.snippet?.title || "Untitled",
      channel: v.snippet?.channelTitle,
      views: parseInt(v.statistics?.viewCount || "0", 10),
      reason: "High view count for this topic — study hook/title, do not copy",
    }));
  } catch (err) {
    console.error("YouTube research error:", err);
    return [
      {
        title: "Live YouTube research unavailable — using pattern library",
        reason: String(err),
      },
    ];
  }
}

function scoreAngle(style: VideoStyle, index: number): number {
  const base: Record<VideoStyle, number> = {
    realistic_avatar: 78,
    faceless_broll: 80,
    cartoon_story: 76,
    myth_vs_truth: 84,
    countdown_facts: 82,
  };
  return Math.min(95, base[style] + (2 - index));
}

function buildScript(topic: string, style: VideoStyle, angle: string): { hook: string; script: string; title: string; thumb: string } {
  const t = topic;
  switch (style) {
    case "realistic_avatar":
      return {
        hook: `Stop scrolling — most people get ${t} completely wrong.`,
        title: `The ${t} Mistake Nobody Admits`,
        thumb: `Serious face + bold short text "WRONG" on contrasting background`,
        script: `Stop scrolling — most people get ${t} completely wrong.
Here's the mistake that costs people time and money.
First: they chase what looks popular instead of what actually retains attention.
Second: they copy videos instead of copying the reason those videos work.
Third: they bury the payoff after a long intro.
Do this instead: open with the promise, deliver one sharp insight, then end with one clear next step about ${t}.
If this helped, follow for the next angle.`,
      };
    case "faceless_broll":
      return {
        hook: `Three things about ${t} that almost nobody tells you.`,
        title: `3 ${t} Facts You Skip`,
        thumb: `High-contrast object close-up, minimal or no text`,
        script: `Three things about ${t} that almost nobody tells you.
Number one: the first two seconds decide if anyone stays.
Number two: short titles with a curiosity gap beat long keyword stuffing.
Number three: delivering what you promised beats flashy clickbait that tanks retention.
Save this if you're building around ${t}.`,
      };
    case "cartoon_story":
      return {
        hook: `A tiny story about someone who almost quit ${t}…`,
        title: `Almost Quit ${t}`,
        thumb: `Simple cartoon character looking shocked → hopeful`,
        script: `A tiny story about someone who almost quit ${t}.
They tried everything that looked viral and nothing stuck.
Then they changed one thing: they stopped copying videos and started copying hooks.
Same topic. New angle. Clear payoff in under a minute.
That's how ${t} content starts compounding.`,
      };
    case "myth_vs_truth":
      return {
        hook: `Myth: you need fancy gear to win at ${t}.`,
        title: `${t} Myth vs Truth`,
        thumb: `Split screen MYTH / TRUTH with bright colors`,
        script: `Myth: you need fancy gear to win at ${t}.
Truth: you need a stronger first line and a cleaner promise.
Myth: longer always equals more money.
Truth: retention beats length — especially on Shorts.
Myth: one perfect video is enough.
Truth: testing 3 to 5 angles on ${t} finds the winner faster.`,
      };
    case "countdown_facts":
    default:
      return {
        hook: `Five ${t} traps — number one ruins most creators.`,
        title: `5 ${t} Traps`,
        thumb: `Big number "5" with tense expression / bold icon`,
        script: `Five ${t} traps — number one ruins most creators.
Five: posting without a hook.
Four: repeating the same angle every time.
Three: weak captions when people watch muted.
Two: titles that explain everything and kill curiosity.
One: copying a viral video instead of learning why it worked.
Fix number one and ${t} gets easier.`,
      };
  }
}

export async function researchViralTopic(
  topicRaw: string,
  count: number = 3
): Promise<ResearchBrief> {
  const topic = sanitizeTopic(topicRaw || "making money online");
  const safety = checkTopicSafety(topic);
  const n = Math.min(5, Math.max(1, count || 3));

  if (!safety.ok) {
    return {
      topic,
      researchedAt: new Date().toISOString(),
      sourcesNote: "Blocked by safety filter",
      patterns: [],
      bannedOrRisky: true,
      riskNotes: safety.notes,
      topInspiration: [],
      angles: [],
    };
  }

  const inspiration = await fetchYouTubeInspiration(topic);

  const patterns = [
    "Hook in the first 1–2 seconds (Shorts) or 15 seconds (long-form)",
    "Title creates a curiosity gap; thumbnail does not repeat the title",
    "Pay off the promise — misleading CTR gets demoted",
    "Vary style + angle when batching 3–5 videos to test what the algorithm prefers",
    "Captions on-screen; cut every few seconds; no slow intros",
  ];

  const angleSeeds = [
    `The costly mistake around ${topic}`,
    `What experts won't say about ${topic}`,
    `A mini-story of failing then fixing ${topic}`,
    `Myths vs truth about ${topic}`,
    `Countdown of traps in ${topic}`,
  ];

  const angles: ViralAngle[] = STYLE_ROTATION.slice(0, n).map((s, i) => {
    const built = buildScript(topic, s.style, angleSeeds[i] || topic);
    return {
      id: `${s.style}-${i + 1}`,
      style: s.style,
      styleLabel: s.label,
      angleTitle: angleSeeds[i] || `${topic} angle ${i + 1}`,
      hook: built.hook,
      script: built.script,
      suggestedTitle: built.title.slice(0, 60),
      thumbnailConcept: built.thumb,
      durationSeconds: s.style === "faceless_broll" ? 25 : s.style === "countdown_facts" ? 35 : 45,
      viralScore: scoreAngle(s.style, i),
      whyItCouldWork: `${s.structure}. Differentiated style for A/B testing against other pack videos.`,
    };
  });

  angles.sort((a, b) => b.viralScore - a.viralScore);

  return {
    topic,
    researchedAt: new Date().toISOString(),
    sourcesNote: process.env.YOUTUBE_API_KEY
      ? "Live YouTube Data API + viral pattern library"
      : "Viral pattern library (add YOUTUBE_API_KEY for live top-video research)",
    patterns,
    bannedOrRisky: false,
    riskNotes: [],
    topInspiration: inspiration,
    angles,
  };
}

export function heygenPromptFromAngle(angle: ViralAngle, topic: string): string {
  return `Create a vertical YouTube Short (9:16) about "${topic}".
Style: ${angle.styleLabel}.
Hook (say this first): ${angle.hook}
Full script:
${angle.script}
Keep energy high, no long intro, end with a clear follow CTA.
Title concept: ${angle.suggestedTitle}`;
}
