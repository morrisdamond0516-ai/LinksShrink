/**
 * OpenAI-powered viral angle generator — fresh idea + scene script per channel method.
 */

import {
  channelForIndex,
  formatChannelIdeaBrief,
  type ViralChannelId,
  type ViralChannelPlaybook,
} from "./youtubeChannelPlaybooks";
import type { ViralAngle } from "./youtubeViral";
import { isKidsAiConfigured } from "./kidsShortsAI";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL ||
  (process.env.DEEPSEEK_API_KEY ? "https://api.deepseek.com/v1" : "https://api.openai.com/v1")
).replace(/\/$/, "");
const OPENAI_MODEL = process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-4o-mini");

export function isYoutubeViralAiConfigured(): boolean {
  return isKidsAiConfigured();
}

async function chatJson(system: string, user: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.92,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content) as Record<string, unknown>;
}

function uniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function generateViralAngleWithAI(
  topic: string,
  playbook: ViralChannelPlaybook,
  index: number
): Promise<ViralAngle & { channelId: ViralChannelId; ideaBrief: string; sceneScript: string }> {
  const system = `You write viral YouTube Shorts scripts by copying the METHOD of famous viral channels — never impersonate or claim to be them.

CHANNEL METHOD TO APPLY:
${JSON.stringify(playbook, null, 2)}

Return JSON:
{
  "angleTitle": "specific angle on the topic",
  "hook": "first 2 second line",
  "suggestedTitle": "max 60 chars, curiosity gap",
  "thumbnailConcept": "describe thumbnail",
  "whyItCouldWork": "1-2 sentences",
  "ideaBrief": "Hook, Concept, Viral Moment, Why it spreads",
  "scenes": [
    { "startSec": 0, "endSec": 8, "label": "...", "visual": "...", "audio": "...", "textOverlay": "..." }
  ],
  "fullScript": "narration lines for HeyGen"
}

Rules:
- Exactly 60 seconds, ~7 scenes matching playbook.sceneLabels
- Original content only — no trademark characters
- Bold on-screen text. Cut every 2-4 seconds.
- ${playbook.secretSauce}`;

  const user = `Topic: "${topic}"
Channel method: ${playbook.channelName} — ${playbook.methodName}
Generate a FRESH angle #${index + 1} — different from generic listicles.`;

  const json = await chatJson(system, user);
  const scenes = Array.isArray(json.scenes) ? json.scenes : [];
  const hook = String(json.hook ?? playbook.hookPattern);
  const ideaBrief = String(json.ideaBrief ?? formatChannelIdeaBrief(playbook, topic, String(json.angleTitle ?? topic)));

  const sceneLines = scenes.map((s: any, i: number) => {
    const start = s.startSec ?? i * 8;
    const end = s.endSec ?? start + 8;
    return `[${start}s–${end}s] ${s.label ?? playbook.sceneLabels[i]}\n  Visual: ${s.visual}\n  Audio: ${s.audio}${s.textOverlay ? `\n  Text: "${s.textOverlay}"` : ""}`;
  });

  const sceneScript = [
    ideaBrief,
    "",
    "SCENE-BY-SCENE (60s):",
    ...sceneLines,
    "",
    `Full narration:\n${json.fullScript ?? hook}`,
  ].join("\n");

  const fullScript = String(json.fullScript ?? sceneScript);

  return {
    id: uniqueId(playbook.id),
    channelId: playbook.id,
    channelName: playbook.channelName,
    methodName: playbook.methodName,
    style: playbook.mappedStyle,
    styleLabel: playbook.channelName,
    angleTitle: String(json.angleTitle ?? `${topic} — ${playbook.methodName}`),
    hook,
    script: fullScript,
    suggestedTitle: String(json.suggestedTitle ?? topic).slice(0, 60),
    thumbnailConcept: String(json.thumbnailConcept ?? playbook.thumbnailRule),
    durationSeconds: 60,
    viralScore: 88 - index,
    whyItCouldWork: String(json.whyItCouldWork ?? playbook.psychology),
    ideaBrief,
    sceneScript,
  };
}

export async function generateViralAnglesWithAI(topic: string, count: number): Promise<(ViralAngle & { channelId?: ViralChannelId; ideaBrief?: string; sceneScript?: string })[]> {
  const n = Math.min(5, Math.max(1, count));
  const out: (ViralAngle & { channelId?: ViralChannelId; ideaBrief?: string; sceneScript?: string })[] = [];
  for (let i = 0; i < n; i++) {
    const playbook = channelForIndex(i);
    out.push(await generateViralAngleWithAI(topic, playbook, i));
  }
  return out.sort((a, b) => b.viralScore - a.viralScore);
}
