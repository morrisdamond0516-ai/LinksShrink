/**
 * Five YouTube channels known for repeatable viral formulas — methods extracted for the generator.
 * Each playbook: psychology → hook → structure → scene template → loop/retention rule.
 */

import type { VideoStyle } from "./youtubeViral";

export type ViralChannelId =
  | "mrbeast"
  | "veritasium"
  | "bright_side"
  | "dude_perfect"
  | "contrarian_clip";

export interface ViralChannelPlaybook {
  id: ViralChannelId;
  channelName: string;
  methodName: string;
  niche: string;
  psychology: string;
  hookPattern: string;
  structure: string;
  retentionRule: string;
  thumbnailRule: string;
  titlePattern: string;
  secretSauce: string;
  mappedStyle: VideoStyle;
  sceneLabels: string[];
}

export const VIRAL_CHANNEL_PLAYBOOKS: ViralChannelPlaybook[] = [
  {
    id: "mrbeast",
    channelName: "MrBeast-style",
    methodName: "Stakes Escalation + Packaging First",
    niche: "Challenge / spectacle / high-stakes Shorts",
    psychology:
      "Viewers stay for unresolved curiosity — who wins? what happens? Stakes must rise every beat.",
    hookPattern: "State the impossible premise + prize/stakes in the first 2 seconds.",
    structure:
      "Packaging first (title/thumbnail promise) → cold open on stakes → re-hook every 20–40s → payoff → loop tease.",
    retentionRule:
      "Something new every 3–5 seconds. No dead air. Mid-video twist before the final reveal.",
    thumbnailRule: "Face + exaggerated emotion + 3–5 words max. Never repeat the title verbatim.",
    titlePattern: "Superlative + stakes + clarity (e.g. \"$1 vs $1,000,000 …\")",
    secretSauce:
      "Open loop until the end — the viewer cannot get the answer without watching. Cut anything that flatlines retention.",
    mappedStyle: "realistic_avatar",
    sceneLabels: [
      "Cold open stakes",
      "Setup the challenge",
      "First escalation",
      "Mid twist",
      "Peak tension",
      "Payoff moment",
      "Loop CTA",
    ],
  },
  {
    id: "veritasium",
    channelName: "Veritasium-style",
    methodName: "Curiosity Question → Wrong Intuition → Reveal",
    niche: "Science / explainers / mind-bending Shorts",
    psychology:
      "People click to resolve a question they thought they already knew. The flip must feel genuinely surprising.",
    hookPattern: "Ask a question everyone gets wrong — \"What if I told you …?\"",
    structure:
      "Question hook → common wrong answer → visual proof of truth → \"but here's what's really happening\" → mic-drop fact.",
    retentionRule:
      "Never bury the question. Each scene answers one layer while opening a smaller mystery.",
    thumbnailRule: "Single bold question or paradox object. Minimal text.",
    titlePattern: "Question or paradox (e.g. \"Why doesn't …?\" / \"The truth about …\")",
    secretSauce:
      "Deliver a counterintuitive truth that feels share-worthy — viewers tag friends saying \"I didn't know that!\"",
    mappedStyle: "myth_vs_truth",
    sceneLabels: [
      "The question",
      "What most people think",
      "Visual demo",
      "The real answer",
      "Mind-blow moment",
      "Quick recap",
      "Loop tease",
    ],
  },
  {
    id: "bright_side",
    channelName: "Bright Side / BE AMAZED-style",
    methodName: "Countdown Escalation (#5 → #1)",
    niche: "List facts / tips / traps — rapid-fire Shorts",
    psychology:
      "Escalating lists create anticipation — #1 must be the most shareable beat. Faster pacing as numbers count down.",
    hookPattern: "\"5 [topic] secrets — #1 changes everything\" in first 2 seconds.",
    structure:
      "#5 (weakest) → #4 → #3 → #2 → #1 (shock/save). Each beat 8–12 seconds. On-screen number huge.",
    retentionRule:
      "Speed up edits as you approach #1. Bold captions. Never spoil #1 in the title.",
    thumbnailRule: "Giant number + curious face or icon. High contrast yellow/blue.",
    titlePattern: "Number + topic + curiosity gap (\"5 X You … — #1 Is Illegal\")",
    secretSauce:
      "Hold #1 until the last 10 seconds — that's the replay and comment driver.",
    mappedStyle: "countdown_facts",
    sceneLabels: ["Hook + #5", "#4", "#3", "#2", "Build to #1", "#1 reveal", "Save + loop"],
  },
  {
    id: "dude_perfect",
    channelName: "Dude Perfect-style",
    methodName: "Impossible Setup → Attempts → Epic Payoff",
    niche: "Spectacle / trick / satisfying payoff Shorts",
    psychology:
      "Tension from \"will they make it?\" — failed attempts make the final success more satisfying and shareable.",
    hookPattern: "Show the impossible goal in frame 1 — \"Can we …?\"",
    structure:
      "State goal → 2 quick failed attempts → slow-mo final attempt → explosive success → reaction.",
    retentionRule:
      "Cut fast on failures, slow-mo on the money shot. Sound design on impact.",
    thumbnailRule: "Mid-action freeze frame + bold action word (INSANE, WORLD RECORD).",
    titlePattern: "Impossible feat + disbelief (\"We tried …\")",
    secretSauce:
      "The payoff must be visually satisfying in one frame — that's the screenshot people share.",
    mappedStyle: "cartoon_story",
    sceneLabels: [
      "The impossible goal",
      "Attempt 1 fail",
      "Attempt 2 fail",
      "The setup",
      "Slow-mo try",
      "Epic payoff",
      "Reaction + loop",
    ],
  },
  {
    id: "contrarian_clip",
    channelName: "GaryVee / viral clip-style",
    methodName: "Contrarian Hook → Proof → Punchy CTA",
    niche: "Business / motivation / hot-take Shorts",
    psychology:
      "Bold contrarian statements stop the scroll. Proof must land fast or trust is lost.",
    hookPattern: "\"Stop doing X\" / \"Everyone is wrong about …\" — first line is the fight.",
    structure:
      "Contrarian hook → 3 rapid proof beats → one actionable takeaway → follow/save CTA.",
    retentionRule:
      "No throat-clearing. First sentence is the thesis. Captions mandatory (muted viewers).",
    thumbnailRule: "Direct eye contact + 2–4 word hot take. High contrast.",
    titlePattern: "Contrarian command (\"Stop …\" / \"Why … is dead\")",
    secretSauce:
      "End before you run out of energy — leave one line unsaid so comments finish the argument.",
    mappedStyle: "faceless_broll",
    sceneLabels: [
      "Contrarian hook",
      "Proof 1",
      "Proof 2",
      "Proof 3",
      "The takeaway",
      "CTA",
      "Comment bait",
    ],
  },
];

export function listViralChannelPlaybooks() {
  return VIRAL_CHANNEL_PLAYBOOKS.map((p) => ({
    id: p.id,
    channelName: p.channelName,
    methodName: p.methodName,
    niche: p.niche,
    psychology: p.psychology,
    mappedStyle: p.mappedStyle,
    titlePattern: p.titlePattern,
  }));
}

export function getChannelPlaybook(id: ViralChannelId): ViralChannelPlaybook {
  return VIRAL_CHANNEL_PLAYBOOKS.find((p) => p.id === id)!;
}

export function channelForIndex(i: number): ViralChannelPlaybook {
  return VIRAL_CHANNEL_PLAYBOOKS[i % VIRAL_CHANNEL_PLAYBOOKS.length];
}

/** Step 1 idea brief — same sections we use for Kids Shorts / DeepSeek shape. */
export function formatChannelIdeaBrief(playbook: ViralChannelPlaybook, topic: string, angle: string): string {
  return [
    `${playbook.channelName} — ${playbook.methodName}`,
    `Topic: ${topic}`,
    `Angle: ${angle}`,
    "",
    `Psychology: ${playbook.psychology}`,
    "",
    `Hook pattern: ${playbook.hookPattern}`,
    "",
    `Structure: ${playbook.structure}`,
    "",
    `Retention rule: ${playbook.retentionRule}`,
    "",
    `Secret sauce: ${playbook.secretSauce}`,
  ].join("\n");
}

/** Template Step 2 — 60s scene skeleton when OpenAI is unavailable. */
export function buildTemplateSceneScript(
  playbook: ViralChannelPlaybook,
  topic: string,
  hook: string,
  durationSeconds: number = 60
): { scenes: { startSec: number; endSec: number; label: string; visual: string; audio: string; textOverlay?: string }[]; scriptText: string } {
  const n = playbook.sceneLabels.length;
  const slice = Math.floor(durationSeconds / n);
  const scenes = playbook.sceneLabels.map((label, i) => {
    const startSec = i * slice;
    const endSec = i === n - 1 ? durationSeconds : (i + 1) * slice;
    return {
      startSec,
      endSec,
      label,
      visual: `[${playbook.channelName}] ${label} — visual for "${topic}" (${playbook.structure})`,
      audio: i === 0 ? hook : `${label} VO — keep momentum, ${playbook.retentionRule}`,
      textOverlay: i === 0 ? hook.slice(0, 60) : i === n - 1 ? "Follow for Part 2 👇" : `#${n - i}`,
    };
  });

  const lines = [
    formatChannelIdeaBrief(playbook, topic, hook),
    "",
    `Total Time: ${durationSeconds} Seconds`,
    "",
  ];
  scenes.forEach((s, i) => {
    lines.push(
      `:${String(Math.floor(s.startSec / 60)).padStart(2, "0")} - :${String(s.startSec % 60).padStart(2, "0")} → :${String(Math.floor(s.endSec / 60)).padStart(2, "0")} - :${String(s.endSec % 60).padStart(2, "0")} (Scene ${i + 1} - ${s.label}): ${s.visual}`,
      `  Audio: ${s.audio}`,
      s.textOverlay ? `  Text: "${s.textOverlay}"` : "",
      ""
    );
  });
  return { scenes, scriptText: lines.join("\n") };
}
