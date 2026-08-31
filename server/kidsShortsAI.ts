/**
 * Fresh AI-generated kids Short concepts — new idea + scene script on every generate.
 * Uses OpenAI-compatible APIs (OpenAI, DeepSeek, etc.) via OPENAI_API_KEY + optional OPENAI_BASE_URL.
 */

import {
  attachPipelineToConcept,
  KIDS_DURATION_OPTIONS,
  KIDS_VISUAL_STYLES,
  VIRAL_SHORTS_METHOD,
  type KidsDurationMinutes,
  type KidsGenerationMode,
  type KidsScene,
  type KidsShortConcept,
  type KidsVisualStyle,
  type ViralFormat,
} from "./kidsShorts";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL ||
  (process.env.DEEPSEEK_API_KEY ? "https://api.deepseek.com/v1" : "https://api.openai.com/v1")
).replace(/\/$/, "");
const OPENAI_MODEL = process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4o-mini");

const STYLE_CREATIVE_DIRECTION: Record<KidsVisualStyle, string> = {
  cocomelon: `3D CARTOON SONG (Cocomelon-inspired):
- Bright 3D round-faced original child characters, saturated pastels, bouncy camera
- Song-driven with props and clear lyric visuals
- Best for: sing-alongs, wrong-sound quizzes with toy props, cute story beats`,

  chuchu: `2D SING-ALONG (ChuChu TV-inspired):
- Flat 2D animation, thick outlines, primary colors, large on-screen lyric text
- Simple shapes, gentle pacing, read-along friendly
- Best for: classic nursery rhymes, emoji-chat with big text bubbles, ASMR with flat icons`,

  blippi: `PRESENTER EXPLORER (Blippi-inspired):
- Energetic adult presenter + real-world props and toys on table
- Hands-on discovery, close-ups, curious reactions — NOT pure cartoon
- Best for: parent POV humor, wrong-sound with real toys, story remix with props, ASMR textures hands-on`,
};

const VIRAL_PSYCHOLOGY_TYPES = `
Viral psychology types (pick ONE that fits the visual style best):
1. Expectation vs. Reality — mismatch sound, kid catches the mistake, satisfying reveal
2. Story Remix — familiar rhyme character with a fresh plot twist parents haven't heard
3. Parent POV Speed Run — rhyme melody over relatable parent chaos, glitch rewind loop
4. ASMR Soundscape — satisfying textures synced to beatbox rhythm, bass drop payoff
5. Emoji Chat — rhyme as texting conversation with a prank or tiny learning moment`;

function uniqueId(): string {
  return `kids_ai_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isKidsAiConfigured(): boolean {
  return OPENAI_API_KEY.length > 10;
}

export function kidsAiConfigHint(): string {
  if (isKidsAiConfigured()) {
    return `AI script writer: ${OPENAI_MODEL} (${OPENAI_BASE_URL.replace(/\/v1$/, "")})`;
  }
  return "Add OPENAI_API_KEY to .env for fresh AI ideas every generate (otherwise uses built-in templates).";
}

async function chatCompletion(system: string, user: string): Promise<string> {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.95,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI request failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");
  return content;
}

function normalizeFormat(raw: unknown, mode: KidsGenerationMode): ViralFormat {
  if (mode === "basic") return "sing_along";
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("wrong") || s.includes("sound") || s.includes("quiz")) return "wrong_sound";
  if (s.includes("story") || s.includes("remix")) return "story_remix";
  if (s.includes("parent") || s.includes("pov")) return "parent_pov";
  if (s.includes("asmr") || s.includes("texture") || s.includes("soundscape")) return "asmr_texture";
  if (s.includes("emoji") || s.includes("chat") || s.includes("text")) return "emoji_chat";
  return "wrong_sound";
}

function parseScenes(raw: unknown, targetSec: number): KidsScene[] {
  if (!Array.isArray(raw) || !raw.length) throw new Error("AI returned no scenes");
  const scenes: KidsScene[] = raw.map((item, i) => {
    const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const startSec = Math.max(0, parseInt(String(o.startSec ?? o.start ?? 0), 10) || 0);
    const endSec = Math.min(
      targetSec,
      Math.max(startSec + 1, parseInt(String(o.endSec ?? o.end ?? startSec + 8), 10) || startSec + 8)
    );
    return {
      startSec,
      endSec,
      label: String(o.label ?? `Scene ${i + 1}`).slice(0, 80),
      visual: String(o.visual ?? o.description ?? "").slice(0, 500),
      audio: String(o.audio ?? o.sound ?? "").slice(0, 300),
      textOverlay: o.textOverlay ? String(o.textOverlay).slice(0, 120) : undefined,
    };
  });
  return scenes.filter((s) => s.visual.length > 5);
}

function conceptFromAiJson(
  json: Record<string, unknown>,
  style: KidsVisualStyle,
  mode: KidsGenerationMode,
  durationMinutes: KidsDurationMinutes
): KidsShortConcept {
  const durationSeconds = KIDS_DURATION_OPTIONS[durationMinutes].seconds;
  const format = normalizeFormat(json.format, mode);
  const scenes = parseScenes(json.scenes, durationSeconds);

  const concept: KidsShortConcept = {
    id: uniqueId(),
    format,
    title: String(json.title ?? "AI Kids Short").slice(0, 120),
    hook: String(json.hook ?? "Hey kids!").slice(0, 200),
    viralWhy: String(json.viralWhy ?? json.whyItGoesViral ?? "Built for retention and shares.").slice(0, 400),
    suggestedShortTitle: String(json.suggestedShortTitle ?? json.title ?? "Kids Short #shorts").slice(0, 80),
    tags: Array.isArray(json.tags) ? json.tags.map(String).slice(0, 8) : ["kidsshorts", "nurseryrhymes"],
    scenes,
    loopCta: String(json.loopCta ?? "Watch again! 🔁").slice(0, 120),
    retentionTrick: String(json.retentionTrick ?? json.viralMoment ?? "Hook in 2s, loop bait at end.").slice(0, 300),
    rhyme: String(json.rhyme ?? json.nurseryRhyme ?? "Nursery Rhyme").slice(0, 80),
    generatedAt: new Date().toISOString(),
    durationMinutes,
    durationSeconds,
    autoStyle: style,
    ideaBrief: json.ideaBrief ? String(json.ideaBrief) : undefined,
  };

  if (!concept.suggestedShortTitle.includes("#shorts") && durationMinutes === 1) {
    concept.suggestedShortTitle = `${concept.suggestedShortTitle.replace(/ #shorts$/i, "")} #shorts`;
  }

  return attachPipelineToConcept(concept);
}

/**
 * Ask AI fresh every call: Step 1 idea + Step 2 scene breakdown for this visual style.
 */
export async function generateKidsConceptWithAI(options: {
  style: KidsVisualStyle;
  mode: KidsGenerationMode;
  durationMinutes: KidsDurationMinutes;
  batchIndex?: number;
}): Promise<KidsShortConcept> {
  if (!isKidsAiConfigured()) {
    throw new Error(kidsAiConfigHint());
  }

  const { style, mode, durationMinutes, batchIndex = 0 } = options;
  const styleInfo = KIDS_VISUAL_STYLES[style];
  const secs = KIDS_DURATION_OPTIONS[durationMinutes].seconds;
  const modeRules =
    mode === "basic"
      ? `MODE: BASIC toddler sing-along — sing ONE full nursery rhyme, lyrics MUST match visuals, gentle for ages 2–5. NO quiz tricks or random SFX. Finish the song clearly.`
      : `MODE: VIRAL YouTube Short — ${VIRAL_SHORTS_METHOD.summary} ${VIRAL_SHORTS_METHOD.secretSauce} Do NOT finish the full song — end on loop bait.`;

  const system = `You are an expert kids YouTube Shorts writer (2026 retention algorithms).
${modeRules}

VISUAL STYLE FOR THIS VIDEO (every scene must suit this look):
${STYLE_CREATIVE_DIRECTION[style]}
${styleInfo.description}

${mode === "viral" ? VIRAL_PSYCHOLOGY_TYPES : ""}

Return ONLY valid JSON with this shape:
{
  "format": "wrong_sound|story_remix|parent_pov|asmr_texture|emoji_chat|sing_along",
  "title": "...",
  "hook": "...",
  "rhyme": "nursery rhyme name",
  "viralWhy": "...",
  "retentionTrick": "...",
  "loopCta": "...",
  "suggestedShortTitle": "...",
  "tags": ["..."],
  "ideaBrief": "Full Step 1 text: Hook, Concept, Script snippet, Viral Moment, Why it goes viral",
  "scenes": [
    { "startSec": 0, "endSec": 5, "label": "...", "visual": "...", "audio": "...", "textOverlay": "..." }
  ]
}

Rules:
- Scenes must cover exactly ${secs} seconds total (${durationMinutes} min).
- For 1-minute Shorts use ~7 scenes (setup → conflict → climax → loop CTA).
- Original characters only — never use Cocomelon, Blippi, ChuChu trademark names or characters.
- Made-for-kids safe. Bold text overlays on key words.
- Be CREATIVE and DIFFERENT every time — vary rhyme, twist, and hook.`;

  const user = `Generate video #${batchIndex + 1} for ${styleInfo.label} style.

Step 1: Give me a ${mode === "viral" ? "viral nursery rhyme YouTube Short" : "gentle toddler sing-along"} idea that works great in ${styleInfo.label} format.

Step 2: Give me a scene-by-scene breakdown for a ${durationMinutes}-minute (${secs}s) vertical video.

Make something fresh I have not seen before — pick a nursery rhyme and angle that fits ${style === "blippi" ? "presenter + props" : style === "chuchu" ? "2D sing-along" : "3D cartoon song"}.`;

  const raw = await chatCompletion(system, user);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return conceptFromAiJson(parsed, style, mode, durationMinutes);
}
