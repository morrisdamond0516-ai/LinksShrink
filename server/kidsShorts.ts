/**
 * Kids Shorts Studio — random AI cartoon kids videos (ViewMax / jadablue33-style).
 * Duration: 1, 3, or 5 minutes. Three visual styles: Cocomelon / Blippi / ChuChu inspired.
 */

export type KidsVisualStyle = "cocomelon" | "blippi" | "chuchu";
export type KidsDurationMinutes = 1 | 3 | 5;
export type ViralFormat =
  | "sing_along"
  | "wrong_sound"
  | "story_remix"
  | "parent_pov"
  | "asmr_texture"
  | "emoji_chat";

/** Basic = gentle toddler sing-along. Viral = retention-first Shorts method (not plain sing-along). */
export type KidsGenerationMode = "basic" | "viral";

/**
 * What DeepSeek described — the procedure, not a fixed video count.
 * Viral mode applies this to however many videos you batch (1, 3, 10…).
 */
export const VIRAL_SHORTS_METHOD = {
  summary:
    "Same workflow you used with DeepSeek: idea first, then scene-by-scene script, then render the video from that script.",
  steps: [
    "Step 1 — Generate a viral nursery rhyme Short idea (hook, concept, script snippet, viral moment, why it spreads).",
    "Step 2 — Generate a scene-by-scene breakdown for that idea (timestamps, visuals, audio, text overlays).",
    "Step 3 — Create the video from Step 2's script using HeyGen Video Agent.",
  ],
  secretSauce:
    "Leave the last note hanging. End on a loop CTA so viewers rewatch or click through for Part 2.",
} as const;

/** Step 1 output — matches the shape DeepSeek returns when you ask for viral Short ideas. */
export interface ViralShortIdea {
  format: Exclude<ViralFormat, "sing_along">;
  psychologyTitle: string;
  hook: string;
  concept: string;
  script: string;
  viralMoment: string;
  viralWhy: string;
  rhyme: string;
  loopCta: string;
}

/** Full pipeline output exposed to UI / API before render. */
export interface KidsVideoPlan {
  step1_idea: string;
  step2_sceneScript: string;
  concept: KidsShortConcept;
}

export function listViralShortsMethod() {
  return VIRAL_SHORTS_METHOD;
}

export interface KidsScene {
  startSec: number;
  endSec: number;
  label: string;
  visual: string;
  audio: string;
  textOverlay?: string;
}

export interface KidsShortConcept {
  id: string;
  format: ViralFormat;
  title: string;
  hook: string;
  viralWhy: string;
  suggestedShortTitle: string;
  tags: string[];
  scenes: KidsScene[];
  loopCta: string;
  retentionTrick: string;
  rhyme: string;
  generatedAt: string;
  durationMinutes: KidsDurationMinutes;
  durationSeconds: number;
  autoMusic?: string;
  autoStyle?: KidsVisualStyle;
  /** Step 1 — viral idea brief (DeepSeek "give me ideas" output). */
  ideaBrief?: string;
  /** Step 2 — scene-by-scene script (DeepSeek breakdown — this is what HeyGen renders). */
  sceneScriptText?: string;
}

export const KIDS_DURATION_OPTIONS: Record<
  KidsDurationMinutes,
  { seconds: number; label: string; hint: string }
> = {
  1: { seconds: 60, label: "1 minute", hint: "YouTube Shorts — fast viral hook" },
  3: { seconds: 180, label: "3 minutes", hint: "Standard kids video — full rhyme + dance break" },
  5: { seconds: 300, label: "5 minutes", hint: "Full episode — intro, song, learning, goodbye" },
};

/** End-card destinations shown on every kids cartoon outro. */
export const KIDS_BRAND_OUTRO = {
  ebookgamez: {
    label: "EbookGamez",
    url: "https://ebookgamez.com",
    tagline: "Ebooks, games & fun for the whole family!",
  },
  learnforge: {
    label: "LearnForge",
    url: "https://knowledge-builder.replit.app/",
    tagline: "AI-powered learning — practice, quizzes & more!",
  },
} as const;

export function kidsBrandOutroDescription(): string {
  return `Visit ${KIDS_BRAND_OUTRO.ebookgamez.label}: ${KIDS_BRAND_OUTRO.ebookgamez.url}\nVisit ${KIDS_BRAND_OUTRO.learnforge.label}: ${KIDS_BRAND_OUTRO.learnforge.url}`;
}

export const KIDS_VISUAL_STYLES: Record<
  KidsVisualStyle,
  { label: string; description: string; heygenStyleBlock: string }
> = {
  cocomelon: {
    label: "3D Cartoon Song",
    description: "Bright 3D kids animation — Cocomelon-inspired, original characters",
    heygenStyleBlock: `Visual style: Bright 3D cartoon animation inspired by modern kids song channels.
Use ORIGINAL round-faced child characters — do NOT copy Cocomelon, JJ, or trademarked characters.
Saturated pastel colors, bouncy camera, toddler-safe mood. Vertical 9:16. Bold color-highlight subtitles.`,
  },
  blippi: {
    label: "Presenter Explorer",
    description: "Energetic presenter + real props — Blippi-inspired energy",
    heygenStyleBlock: `Visual style: Energetic educational presenter in bright outfit exploring real props and toys.
Curious, hands-on, safe for kids. Close-ups of objects plus presenter reactions.
Vertical 9:16. Bold captions; cut every 2-3 seconds.`,
  },
  chuchu: {
    label: "2D Sing-Along",
    description: "Flat 2D animation — ChuChu TV-inspired, original art",
    heygenStyleBlock: `Visual style: Flat 2D kids animation, simple shapes, thick outlines, primary colors.
Original cute characters only — no ChuChu TV trademark assets. Sing-along text on screen.
Vertical 9:16. Large readable overlays.`,
  },
};

const RHYMES = [
  { name: "Wheels on the Bus", line: "The horn on the bus goes", correct: "beep beep beep", prop: "toy yellow school bus", verse2: "The wipers on the bus go swish swish swish" },
  { name: "Old MacDonald", line: "Old MacDonald had a farm, E-I-E-I-O", correct: "moo moo", prop: "toy barn with animals", verse2: "And on that farm he had a pig, E-I-E-I-O" },
  { name: "Itsy Bitsy Spider", line: "The itsy bitsy spider climbed up the waterspout", correct: "rain washed out", prop: "spider toy on drain pipe", verse2: "Out came the sun and dried up all the rain" },
  { name: "Twinkle Twinkle", line: "Twinkle twinkle little star", correct: "how I wonder what you are", prop: "glowing star prop on stick", verse2: "Up above the world so high, like a diamond in the sky" },
  { name: "Rain Rain Go Away", line: "Rain rain go away", correct: "come again another day", prop: "blue umbrella and rain cloud cutout", verse2: "Little Johnny wants to play" },
  { name: "Baa Baa Black Sheep", line: "Baa baa black sheep have you any wool", correct: "yes sir yes sir three bags full", prop: "fluffy black sheep plush", verse2: "One for the master, one for the dame" },
  { name: "Jack and Jill", line: "Jack and Jill went up the hill", correct: "to fetch a pail of water", prop: "mini hill diorama with bucket", verse2: "To fetch a pail of water" },
  { name: "Humpty Dumpty", line: "Humpty Dumpty sat on a wall", correct: "had a great fall", prop: "egg with drawn face on brick wall", verse2: "All the king's horses and all the king's men" },
  { name: "Row Row Row Your Boat", line: "Row row row your boat gently down the stream", correct: "merrily merrily", prop: "paper boat in blue water tray", verse2: "Life is but a dream" },
  { name: "Five Little Ducks", line: "Five little ducks went out one day", correct: "quack quack quack", prop: "five rubber ducks", verse2: "Over the hills and far away" },
];

const WRONG_SOUNDS = [
  { sound: "DUCK QUACK", emoji: "🦆", animal: "Duck" },
  { sound: "CAT MEOW", emoji: "🐱", animal: "Cat" },
  { sound: "COW MOO", emoji: "🐄", animal: "Cow" },
  { sound: "ROOSTER CROW", emoji: "🐓", animal: "Rooster" },
  { sound: "SQUEAKY TOY", emoji: "🧸", animal: "Teddy Bear" },
  { sound: "DINOSAUR ROAR (cute)", emoji: "🦕", animal: "Dino" },
];

const STORY_HEROES = [
  { name: "Humpty Dumpty", prop: "egg with sunglasses", fall: "cracks in half", fix: "duct tape mustache" },
  { name: "Little Bo Peep", prop: "shepherd staff toy", fall: "loses sheep", fix: "GPS collar on sheep" },
  { name: "Jack Be Nimble", prop: "candlestick toy", fall: "trips over candle", fix: "wears helmet made of yogurt lid" },
  { name: "Miss Muffet", prop: "curds and whey bowl", fall: "spider sits beside", fix: "spider becomes tea party guest" },
  { name: "Goldilocks", prop: "three bowls", fall: "sits in wrong chair", fix: "brings own tiny stool" },
];

const PARENT_CHAOS = [
  { task: "washing bottles in sink while singing", emoji: "🍼" },
  { task: "folding laundry mountain while singing", emoji: "👕" },
  { task: "stepping on LEGO while singing", emoji: "🧱" },
  { task: "baby food spit-up on shirt while singing", emoji: "🌧️" },
  { task: "searching for lost pacifier while singing", emoji: "🔍" },
  { task: "diaper change sprint while singing", emoji: "🏃" },
];

/** Map ASMR squish actions to sounds FROM the chosen rhyme — never random thunder/boom. */
function asmrActionsForRhyme(rhyme: (typeof RHYMES)[0]) {
  const name = rhyme.name.toLowerCase();
  if (name.includes("wheels on the bus")) {
    return [
      { material: "yellow toy bus horn button", action: "press horn — cute beep beep beep", sfx: "beep beep beep", lyric: "The horn on the bus goes beep beep beep" },
      { material: "soft brush on toy windshield", action: "swish swish like wipers", sfx: "swish swish swish", lyric: "The wipers on the bus go swish swish swish" },
      { material: "round play-doh wheels", action: "spin wheels round and round", sfx: "round and round", lyric: "The wheels on the bus go round and round" },
    ];
  }
  if (name.includes("itsy bitsy")) {
    return [
      { material: "blue water beads on pipe", action: "spider climbs slowly up", sfx: "soft plink plink", lyric: "The itsy bitsy spider climbed up the waterspout" },
      { material: "clear water drip", action: "gentle rain down the spout", sfx: "rain pitter patter", lyric: "Down came the rain and washed the spider out" },
      { material: "yellow kinetic sand sun", action: "sun dries the spout — warm glow", sfx: "soft sunny hum", lyric: "Out came the sun and dried up all the rain" },
    ];
  }
  if (name.includes("row row")) {
    return [
      { material: "blue water tray with paper boat", action: "boat glides gently", sfx: "soft splash", lyric: "Row row row your boat gently down the stream" },
      { material: "shiny stream ripples", action: "water shimmers merrily", sfx: "gentle lapping", lyric: "Merrily merrily merrily merrily" },
      { material: "sparkle stars above water", action: "dreamy slow drift", sfx: "soft chime", lyric: "Life is but a dream" },
    ];
  }
  // Generic fallback — always tied to this rhyme's words, no random SFX
  return [
    { material: rhyme.prop, action: `show ${rhyme.prop} while singing opening`, sfx: rhyme.correct, lyric: `${rhyme.line} ${rhyme.correct}` },
    { material: "colorful soft blocks", action: "gentle tap to the beat of the melody", sfx: "soft taps", lyric: rhyme.verse2 },
    { material: rhyme.prop, action: "happy wiggle dance with prop", sfx: "gentle giggle", lyric: `${rhyme.line} ${rhyme.correct}` },
  ];
}

function rhymeLyricScript(rhyme: (typeof RHYMES)[0]): string {
  return [
    `Verse 1: "${rhyme.line} ${rhyme.correct}"`,
    `Verse 2: "${rhyme.verse2}"`,
    `Main prop: ${rhyme.prop}`,
  ].join("\n");
}

const SCIENCE_FACTS = [
  { fakeScary: "I'm a giant ball of burning hydrogen", emoji: "☀️", subject: "Star" },
  { fakeScary: "Clouds are actually cotton candy factories", emoji: "☁️", subject: "Cloud" },
  { fakeScary: "The moon is made of cheese (Swiss)", emoji: "🌙", subject: "Moon" },
  { fakeScary: "Trees breathe fire at night (just kidding)", emoji: "🌳", subject: "Tree" },
  { fakeScary: "Rainbows are angry color fights", emoji: "🌈", subject: "Rainbow" },
];

const LOOP_CTAS = [
  "Did your kid get it right? Comment 👇",
  "Tap to hear the ending... Part 2 on channel!",
  "Reply SNACKS for Part 2! 🍿",
  "Show this to a parent who needs a laugh 😂",
  "Watch again — can you spot it faster? 🔁",
];

const LEARNING_BITS = [
  { topic: "colors", text: "Can you name RED, BLUE, and YELLOW?" },
  { topic: "counting", text: "Let's count 1-2-3-4-5 together!" },
  { topic: "animals", text: "What sound does the cow make?" },
  { topic: "shapes", text: "Circle! Square! Triangle!" },
  { topic: "letters", text: "A is for Apple — can you say A?" },
];

/** Auto-picked music moods per format — paired to rhyme in the HeyGen prompt. */
const MUSIC_BY_FORMAT: Record<ViralFormat, string[]> = {
  sing_along: [
    "quiet sing-along tempo — visuals illustrate the rhyme prop and lyrics",
    "gentle ukulele nursery rhyme — clear vocals for ages 2–5",
    "soft piano lullaby pace with one rhyme melody only",
  ],
  wrong_sound: [
    "upbeat nursery rhyme piano with playful pauses for the quiz",
    "bouncy xylophone kids tune with space for sound effects",
    "cheerful ukulele sing-along with clear beat drops on reveals",
  ],
  story_remix: [
    "cartoon adventure orchestral with comedic stings",
    "silly sneaky bassoon then heroic brass rescue",
    "light cinematic kids comedy score",
  ],
  parent_pov: [
    "gentle nursery rhyme piano — same melody throughout, never switch songs",
    "soft lullaby piano with parent-humor visuals but correct lyrics on screen",
    "calm ukulele sing-along — lyrics stay on one rhyme only",
  ],
  asmr_texture: [
    "human beatbox rain rhythm — mouth sounds only, no piano",
    "ASMR texture taps synced to beatbox drops",
    "lo-fi beatbox build then cinematic bass on sun reveal",
  ],
  emoji_chat: [
    "playful notification pings and light electronic pop",
    "twinkle twinkle inspired soft piano with prank sting",
    "gentle night-sky ambient with cartoon comedy beats",
  ],
};

const CARTOON_STYLES: KidsVisualStyle[] = ["cocomelon", "chuchu"];
const ALL_VISUAL_STYLES: KidsVisualStyle[] = ["cocomelon", "chuchu", "blippi"];

export type KidsStyleCounts = {
  cocomelon: number;
  chuchu: number;
  blippi: number;
  random: number;
};

export const MAX_DAILY_DROP_VIDEOS = 10;

export function totalStyleCounts(counts: KidsStyleCounts): number {
  return counts.cocomelon + counts.chuchu + counts.blippi + counts.random;
}

export function parseStyleCounts(input: unknown): KidsStyleCounts {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const clamp = (n: unknown) => Math.min(10, Math.max(0, parseInt(String(n ?? 0), 10) || 0));
  return {
    cocomelon: clamp(raw.cocomelon),
    chuchu: clamp(raw.chuchu),
    blippi: clamp(raw.blippi),
    random: clamp(raw.random),
  };
}

export function expandStyleCountsToStyles(counts: KidsStyleCounts): KidsVisualStyle[] {
  const styles: KidsVisualStyle[] = [];
  for (let i = 0; i < counts.cocomelon; i++) styles.push("cocomelon");
  for (let i = 0; i < counts.chuchu; i++) styles.push("chuchu");
  for (let i = 0; i < counts.blippi; i++) styles.push("blippi");
  for (let i = 0; i < counts.random; i++) styles.push(pick(ALL_VISUAL_STYLES));
  return styles;
}

export function describeStyleCountsPlan(counts: KidsStyleCounts): string {
  const parts: string[] = [];
  if (counts.cocomelon) parts.push(`${counts.cocomelon}× ${KIDS_VISUAL_STYLES.cocomelon.label}`);
  if (counts.chuchu) parts.push(`${counts.chuchu}× ${KIDS_VISUAL_STYLES.chuchu.label}`);
  if (counts.blippi) parts.push(`${counts.blippi}× ${KIDS_VISUAL_STYLES.blippi.label}`);
  if (counts.random) parts.push(`${counts.random}× Random style`);
  return parts.join(" + ");
}

/** Legacy count/style → style counts (backward compatible). */
export function styleCountsFromLegacy(
  count: number,
  includePresenterForTwo = false,
  chosenStyle?: KidsVisualStyle | "random" | null
): KidsStyleCounts {
  const styles = getDailyStylePlan(count, includePresenterForTwo, chosenStyle);
  const counts: KidsStyleCounts = { cocomelon: 0, chuchu: 0, blippi: 0, random: 0 };
  for (const s of styles) counts[s]++;
  return counts;
}

/** Rough count of unique random combinations (formats × rhymes × pools × styles). */
export function estimateLibrarySize(): number {
  return (
    5 *
    RHYMES.length *
    WRONG_SOUNDS.length *
    STORY_HEROES.length *
    PARENT_CHAOS.length *
    RHYMES.length *
    SCIENCE_FACTS.length *
    ALL_VISUAL_STYLES.length
  );
}

export function assignAutoMusic(concept: Pick<KidsShortConcept, "format" | "rhyme" | "durationMinutes">): string {
  const mood = pick(MUSIC_BY_FORMAT[concept.format]);
  const tempo =
    concept.durationMinutes >= 5
      ? "full-episode sing-along tempo with verse repeats"
      : concept.durationMinutes >= 3
        ? "moderate kids song tempo with dance break"
        : "fast Shorts tempo, hook in first 2 seconds";
  return `${mood}. Tempo: ${tempo}. Match the melodic feel of "${concept.rhyme}" using ORIGINAL royalty-free music only — never use copyrighted recordings (no Cocomelon/Disney/etc. tracks).`;
}

/** Which visual style each daily-drop video gets (guaranteed mix, not random duplicates). */
export function getDailyStylePlan(
  count: number,
  includePresenterForTwo = false,
  chosenStyle?: KidsVisualStyle | "random" | null
): KidsVisualStyle[] {
  const n = Math.min(3, Math.max(1, count || 1));
  if (n === 1) {
    if (chosenStyle && chosenStyle !== "random" && ALL_VISUAL_STYLES.includes(chosenStyle)) {
      return [chosenStyle];
    }
    return [pick(ALL_VISUAL_STYLES)];
  }
  if (n === 2) {
    return includePresenterForTwo ? ["cocomelon", "blippi"] : ["cocomelon", "chuchu"];
  }
  return ["cocomelon", "chuchu", "blippi"];
}

export function describeDailyStylePlan(
  count: number,
  includePresenterForTwo = false,
  chosenStyle?: KidsVisualStyle | "random" | null
): string {
  return getDailyStylePlan(count, includePresenterForTwo, chosenStyle)
    .map((s) => KIDS_VISUAL_STYLES[s].label)
    .join(" + ");
}

export function autoPickCartoonStyle(): KidsVisualStyle {
  return pick(CARTOON_STYLES);
}

/** Toddler joy beats (CDC / early-childhood research): immediate praise, sensory sparkle, physical celebration — BEFORE parent URLs. */
const TODDLER_CELEBRATIONS: {
  label: string;
  visual: string;
  audio: string;
  textOverlay: string;
  praiseLine: string;
}[] = [
  {
    label: "Star shower",
    visual:
      "Gold stars and soft rainbow confetti rain down. Characters point at the camera, eyes wide with pride, jumping in place.",
    audio:
      'Bright bell ding! Warm narrator: "WOW! You sang with us!" Characters clap and cheer. Happy xylophone flourish.',
    textOverlay: "⭐ YOU DID IT! ⭐",
    praiseLine: "You sang so great!",
  },
  {
    label: "Bubble party",
    visual:
      "Gentle bubbles float everywhere. Characters giggle, pop bubbles, and blow kisses toward the camera.",
    audio:
      'Soft pop-pop-pop bubbles. Characters: "Yay! Bubbles for YOU!" Giggles and light clapping.',
    textOverlay: "🫧 YAY! 🫧",
    praiseLine: "You did amazing!",
  },
  {
    label: "Victory dance",
    visual:
      "Characters do a silly toddler dance — stomp, spin, wiggle. Colorful confetti cannons (soft, no loud flash).",
    audio:
      'Upbeat 3-second dance beat. "Great job singing!" Characters chant: "Go go go!"',
    textOverlay: "💃 DANCE! 💃",
    praiseLine: "Great job singing!",
  },
  {
    label: "High-five cam",
    visual:
      "Main character runs toward camera with open hand for a BIG high-five. Sparkles and heart stars burst on impact.",
    audio:
      'Whoosh then satisfying HIGH-FIVE slap (gentle). "High five! You\'re a super singer!"',
    textOverlay: "✋ HIGH FIVE! ✋",
    praiseLine: "High five, super singer!",
  },
  {
    label: "Sticker star",
    visual:
      "Giant shiny gold star sticker stamps onto screen with a satisfying bounce. Characters hold up matching star badges.",
    audio:
      'Stamp squish SFX. "You earned a star!" Triumphant but soft trumpet toot.',
    textOverlay: "🌟 SUPER STAR! 🌟",
    praiseLine: "You earned a star!",
  },
  {
    label: "Parade cheer",
    visual:
      "Cute original animals (duck, bear, bunny) march in waving flags that say YAY. Characters lead the parade toward camera.",
    audio:
      'Mini marching tune 3 seconds. Animals and kids chorus: "HOORAY for YOU!"',
    textOverlay: "🎉 HOORAY! 🎉",
    praiseLine: "Hooray for you!",
  },
  {
    label: "Big hug moment",
    visual:
      "Characters hug each other then open arms wide to camera as if hugging the viewer. Warm golden glow, floating hearts.",
    audio:
      'Soft aww sound. "We\'re so proud of you!" Gentle group aww and clapping.',
    textOverlay: "🤗 SO PROUD! 🤗",
    praiseLine: "We're so proud of you!",
  },
];

function toddlerCelebrationScene(
  startSec: number,
  endSec: number,
  rhymeName: string
): KidsScene {
  const moment = pick(TODDLER_CELEBRATIONS);
  return {
    startSec,
    endSec,
    label: "Toddler victory celebration",
    visual: `${moment.visual} Celebration for finishing "${rhymeName}". Faces stay happy and encouraging — made for ages 2–5.`,
    audio: `${moment.audio} Specific praise: "${moment.praiseLine}" Then soft breath before parent message.`,
    textOverlay: `${moment.textOverlay}\n${moment.praiseLine}`,
  };
}

function brandOutroScene(startSec: number, endSec: number): KidsScene {
  const eg = KIDS_BRAND_OUTRO.ebookgamez;
  const lf = KIDS_BRAND_OUTRO.learnforge;
  return {
    startSec,
    endSec,
    label: "Brand outro",
    visual: `After the celebration, characters calm down and turn toward parents. Bright end card: left "${eg.label}" with books and games; right "${lf.label}" with learning icons. URLs large and readable for parents only — keep visuals still cheerful for kids watching.`,
    audio: `Gentle transition chime. Friendly narrator speaks to PARENTS: "Grown-ups, visit ${eg.label} dot com and ${lf.label} for ebooks, games, and learning!" Kids hear a soft happy hum underneath.`,
    textOverlay: `📚 ${eg.url}\n🎓 ${lf.url}`,
  };
}

function applyBrandOutro(
  scenes: KidsScene[],
  targetSec: number,
  durationMinutes: KidsDurationMinutes,
  rhymeName: string
): KidsScene[] {
  const brandLen = durationMinutes === 1 ? 8 : 12;
  const celebrationLen = durationMinutes === 1 ? 6 : durationMinutes === 3 ? 10 : 12;
  const brandStart = Math.max(0, targetSec - brandLen);
  const celebrationStart = Math.max(0, brandStart - celebrationLen);

  const body = scenes
    .filter(
      (s) =>
        s.label !== "Brand outro" &&
        s.label !== "Toddler victory celebration" &&
        s.startSec < celebrationStart
    )
    .map((s) => (s.endSec > celebrationStart ? { ...s, endSec: celebrationStart } : s))
    .filter((s) => s.startSec < s.endSec);

  body.push(toddlerCelebrationScene(celebrationStart, brandStart, rhymeName));
  body.push(brandOutroScene(brandStart, targetSec));
  return body;
}

function pickRhyme(nameIncludes: string): (typeof RHYMES)[0] {
  const match = RHYMES.find((r) => r.name.toLowerCase().includes(nameIncludes.toLowerCase()));
  return match ?? pick(RHYMES);
}

function pickRhymeExact(name: string): (typeof RHYMES)[0] {
  return RHYMES.find((r) => r.name === name) ?? pick(RHYMES);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function uniqueId(): string {
  return `kids_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function parseKidsDurationMinutes(raw: unknown): KidsDurationMinutes {
  const n = parseInt(String(raw ?? "1"), 10);
  if (n === 3) return 3;
  if (n === 5) return 5;
  return 1;
}

export function parseKidsGenerationMode(raw: unknown): KidsGenerationMode {
  return raw === "viral" ? "viral" : "basic";
}

/** Second lyric line for basic sing-along — matched to rhyme, never random words. */
function basicSecondLine(rhyme: (typeof RHYMES)[0]): string {
  const name = rhyme.name.toLowerCase();
  if (name.includes("itsy bitsy")) return "Down came the rain and washed the spider out";
  if (name.includes("wheels on the bus")) return "The wipers on the bus go swish swish swish";
  if (name.includes("twinkle")) return "Up above the world so high, like a diamond in the sky";
  if (name.includes("rain rain")) return "Little Johnny wants to play";
  if (name.includes("baa baa")) return "Yes sir, yes sir, three bags full";
  if (name.includes("row row")) return "Merrily, merrily, merrily, merrily";
  if (name.includes("five little ducks")) return "Over the hills and far away";
  if (name.includes("humpty")) return "Humpty Dumpty had a great fall";
  if (name.includes("jack and jill")) return "To fetch a pail of water";
  return rhyme.correct;
}

function buildBasicSingAlongConcept(
  durationMinutes: KidsDurationMinutes,
  rhyme: (typeof RHYMES)[0] = pick(RHYMES)
): KidsShortConcept {
  const hook = `Let's sing ${rhyme.name}! 🎵`;
  const line1 = rhyme.line;
  const line2 = basicSecondLine(rhyme);
  const line3 = rhyme.verse2;

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "sing_along",
      title: `Sing-Along: ${rhyme.name}`,
      hook,
      viralWhy:
        "Gentle, clear sing-along for ages 2–5 — one rhyme only, visuals match every lyric, no confusing sound effects.",
      suggestedShortTitle: `${rhyme.name} Sing-Along 🎵 #shorts`,
      rhyme: rhyme.name,
      tags: ["nurseryrhymes", "kidsshorts", "singalong", "toddlers"],
      retentionTrick:
        "Each scene shows ONE lyric line with a matching gentle sound — no random booms, thunder, or words from other rhymes.",
      loopCta: "Sing it again! 🔁",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 6,
          label: "Intro",
          visual: `Bright intro. Show ${rhyme.prop} center frame. Original cartoon kids wave hello.`,
          audio: `Sing clearly: "${line1} ${rhyme.correct}"`,
          textOverlay: `${line1}...`,
        },
        {
          startSec: 7,
          endSec: 18,
          label: "Line 1",
          visual: `Act out "${line1}" with ${rhyme.prop} — slow, clear movement toddlers can follow.`,
          audio: `Sing "${line1}" — gentle SFX ONLY when visual matches (soft taps, no thunder or bass booms).`,
          textOverlay: line1,
        },
        {
          startSec: 19,
          endSec: 28,
          label: "Line 2",
          visual: `Visual matches line 2 exactly — toddler-safe props, bright colors.`,
          audio: `Sing "${line2}" — soft matching SFX only (rain = pitter patter, horn = beep, etc.).`,
          textOverlay: line2,
        },
        {
          startSec: 29,
          endSec: 38,
          label: "Line 3",
          visual: `Warm, happy visual for "${line3}". Characters smile and point at the prop.`,
          audio: `Sing "${line3}" — calm happy melody, clear pronunciation.`,
          textOverlay: line3,
        },
        {
          startSec: 39,
          endSec: 46,
          label: "Verse 2",
          visual: `Characters dance gently with ${rhyme.prop}. Repeat the favorite line together.`,
          audio: `Sing verse 2: "${line3}" — encourage clapping along.`,
          textOverlay: line3,
        },
      ],
    },
    durationMinutes,
    rhyme.verse2
  );
}

/** Scale 60s base scenes to target duration and insert extra beats for 3/5 min episodes. */
function expandToDuration(
  baseScenes: KidsScene[],
  durationMinutes: KidsDurationMinutes,
  rhymeName: string,
  rhymeLine?: string,
  format?: ViralFormat
): KidsScene[] {
  const targetSec = KIDS_DURATION_OPTIONS[durationMinutes].seconds;
  const isViralOneMinute = durationMinutes === 1 && format != null && format !== "sing_along";

  if (durationMinutes === 1) {
    const scaled = baseScenes.map((s) => ({
      ...s,
      startSec: Math.round((s.startSec / 60) * 60),
      endSec: Math.round((s.endSec / 60) * 60),
    }));
    if (isViralOneMinute) {
      return scaled;
    }
    return applyBrandOutro(scaled, targetSec, durationMinutes, rhymeName);
  }

  const ratio = targetSec / 60;
  const scaled = baseScenes.map((s) => ({
    ...s,
    startSec: Math.round(s.startSec * ratio),
    endSec: Math.round(s.endSec * ratio),
  }));

  const extras: KidsScene[] = [];
  const learn = pick(LEARNING_BITS);

  if (durationMinutes >= 3) {
    extras.push(
      {
        startSec: Math.round(62 * ratio),
        endSec: Math.round(78 * ratio),
        label: "Intro characters",
        visual: `Original cartoon kids wave hello. Title card: "${rhymeName}".`,
        audio: "Cheerful intro jingle.",
        textOverlay: `Let's sing ${rhymeName}! 👋`,
      },
      {
        startSec: Math.round(80 * ratio),
        endSec: Math.round(95 * ratio),
        label: "Verse 2",
        visual: "Characters act out second verse with props dancing.",
        audio: rhymeLine ? `"${rhymeLine}..." full sing-along.` : "Second verse melody.",
        textOverlay: "Sing with us! 🎵",
      },
      {
        startSec: Math.round(97 * ratio),
        endSec: Math.round(112 * ratio),
        label: "Dance break",
        visual: "Characters do silly toddler dance — jump, spin, clap.",
        audio: "Upbeat instrumental loop.",
        textOverlay: "DANCE BREAK! 💃",
      },
      {
        startSec: Math.round(114 * ratio),
        endSec: Math.round(128 * ratio),
        label: "Learning moment",
        visual: `On-screen ${learn.topic} graphics. Character points and teaches.`,
        audio: "Friendly narrator voice.",
        textOverlay: learn.text,
      }
    );
  }

  if (durationMinutes >= 5) {
    extras.push(
      {
        startSec: Math.round(130 * ratio),
        endSec: Math.round(148 * ratio),
        label: "Call and response",
        visual: "Character covers ears — audience sings back.",
        audio: "Call: line of rhyme. Response: kids chorus.",
        textOverlay: "YOUR TURN! 🎤",
      },
      {
        startSec: Math.round(150 * ratio),
        endSec: Math.round(168 * ratio),
        label: "Slow teaching verse",
        visual: "Word-by-word lyrics appear on screen with bouncing ball.",
        audio: "Slow clear pronunciation for learning.",
        textOverlay: "Learn the words 📖",
      },
      {
        startSec: Math.round(170 * ratio),
        endSec: Math.round(188 * ratio),
        label: "Character parade",
        visual: "All original characters march across screen waving.",
        audio: "Marching band kids tune.",
        textOverlay: "Parade time! 🎺",
      },
      {
        startSec: Math.round(190 * ratio),
        endSec: Math.round(205 * ratio),
        label: "Final chorus",
        visual: "Full cast sings together, confetti falls.",
        audio: "Big happy chorus of full rhyme.",
        textOverlay: "One more time! 🎉",
      },
      {
        startSec: Math.round(207 * ratio),
        endSec: Math.round(220 * ratio),
        label: "Goodbye",
        visual: "Characters wave bye-bye. Subscribe reminder for kids channel.",
        audio: "Soft outro. See you next time!",
        textOverlay: "Bye bye! 👋 Subscribe!",
      }
    );
  }

  const merged = [...scaled, ...extras].sort((a, b) => a.startSec - b.startSec);
  if (isViralOneMinute) {
    return merged;
  }
  return applyBrandOutro(merged, targetSec, durationMinutes, rhymeName);
}

function finalizeConcept(
  partial: Omit<KidsShortConcept, "durationMinutes" | "durationSeconds">,
  durationMinutes: KidsDurationMinutes,
  rhymeLine?: string
): KidsShortConcept {
  const durationSeconds = KIDS_DURATION_OPTIONS[durationMinutes].seconds;
  const scenes = expandToDuration(
    partial.scenes,
    durationMinutes,
    partial.rhyme,
    rhymeLine,
    partial.format
  );
  const suffix = durationMinutes === 1 ? " #shorts" : ` ${durationMinutes}min`;
  return {
    ...partial,
    durationMinutes,
    durationSeconds,
    scenes,
    suggestedShortTitle: partial.suggestedShortTitle.replace(/ #shorts$/i, "").slice(0, 80) + suffix,
    tags: durationMinutes === 1 ? partial.tags : [...partial.tags.filter((t) => t !== "shorts"), "kidsvideo"],
  };
}

function buildWrongSoundConcept(durationMinutes: KidsDurationMinutes): KidsShortConcept {
  // Idea 1: Expectation vs. Reality (Sensory Edition) — Wheels on the Bus canonical example
  const rhyme = pickRhyme("Wheels on the Bus");
  const wrong = WRONG_SOUNDS.find((w) => w.sound.includes("QUACK")) ?? pick(WRONG_SOUNDS);
  const quizAnimals = pickN(WRONG_SOUNDS, 4);
  if (!quizAnimals.find((a) => a.animal === wrong.animal)) quizAnimals[0] = wrong;
  const hook = "Can you spot the mistake?";

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "wrong_sound",
      title: `Wrong Sound Quiz: ${rhyme.name}`,
      hook,
      viralWhy:
        "Kids yell the correct answer; parents tag friends in comments (\"It's a duck!\"). Pause forces engagement.",
      suggestedShortTitle: `${rhyme.name} — BUT WRONG! ${wrong.emoji} #shorts`,
      rhyme: rhyme.name,
      tags: ["nurseryrhymes", "kidsshorts", "interactive", "wrongsound"],
      retentionTrick:
        "Pause 2 seconds on the wrong sound so kids shout the answer. 5-second countdown on quiz grid. Speed-ramp: slow-mo on reactions, 2x on filler.",
      loopCta: "Show this to your kid! Did they get it right? 👇",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 5,
          label: "Setup",
          visual: `Close-up of ${rhyme.prop} on a bright table. Upbeat classic "${rhyme.name}" piano intro.`,
          audio: "Classic nursery rhyme piano intro — hook in first 2 seconds.",
          textOverlay: hook,
        },
        {
          startSec: 6,
          endSec: 12,
          label: "Mismatch",
          visual: `Child's hand pushes the bus forward. Lyrics: "The horn on the bus goes..."`,
          audio: `"The horn on the bus goes..." then loud clear ${wrong.sound} — NOT ${rhyme.correct}. Bus stops abruptly.`,
          textOverlay: `Wait... ${wrong.emoji}?`,
        },
        {
          startSec: 13,
          endSec: 20,
          label: "Confusion",
          visual: "Screen glitches and freezes. Giant red X over the bus. Adult face in corner looks confused, scratches head.",
          audio: "Music stops abruptly.",
          textOverlay: "That's NOT right!",
        },
        {
          startSec: 21,
          endSec: 35,
          label: "Quiz countdown",
          visual: `Screen splits into 4 quadrants: ${quizAnimals.map((a) => a.animal).join(", ")}. 5-second countdown timer: "Which one makes the sound?"`,
          audio: "Tense upbeat quiz music builds.",
          textOverlay: "Which one makes the sound?",
        },
        {
          startSec: 36,
          endSec: 45,
          label: "Reveal",
          visual: `${wrong.animal} quadrant explodes with green checkmarks and sparkles. Deep satisfying SEMI-TRUCK HONK (real horn). ${rhyme.prop} shakes from the bass.`,
          audio: `Correct ${rhyme.correct} — deep bass HONK synced to reveal.`,
          textOverlay: "YES! 🎉",
        },
        {
          startSec: 46,
          endSec: 55,
          label: "Celebrate",
          visual: "Child's hand gives thumbs up. Bus wiggles side to side (little dance).",
          audio: `"${rhyme.correct}" sung in silly slowed chipmunk voice.`,
          textOverlay: rhyme.correct.toUpperCase(),
        },
        {
          startSec: 56,
          endSec: 60,
          label: "Loop CTA",
          visual: "Giant arrow pointing to comment section. Do NOT finish the full song — leave last note hanging.",
          audio: "Cut before final verse — loop bait.",
          textOverlay: "Show this to your kid! Did they get it right?",
        },
      ],
    },
    durationMinutes,
    rhyme.verse2
  );
}

function buildStoryRemixConcept(durationMinutes: KidsDurationMinutes): KidsShortConcept {
  // Idea 2: Unsolved Mystery (Story Remix) — Humpty Dumpty duct-tape canonical example
  const hero = STORY_HEROES.find((h) => h.name === "Humpty Dumpty") ?? pick(STORY_HEROES);
  const hook = "Every hero has an origin story.";

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "story_remix",
      title: `Story Remix: ${hero.name}`,
      hook,
      viralWhy:
        "Fresh twist parents haven't heard — duct-tape mustache is highly shareable. Slow-mo disaster → fast rescue montage.",
      suggestedShortTitle: `${hero.name} — DUCT TAPE MUSTACHE?! 😂 #shorts`,
      rhyme: hero.name,
      tags: ["storytime", "funnykids", "nurseryrhymes", "storyremix"],
      retentionTrick:
        "Slow-mo cinematic intro (0-8s), disaster in slow-mo (9-18s), then 1-second fast cuts on tape montage. Speed-ramping mandatory.",
      loopCta: "Close enough 😂 — Tap for Part 2?",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 8,
          label: "Hero shot",
          visual: `Slow-motion cinematic intro. ${hero.prop} (egg with drawn sunglasses) standing on brick wall. Epic lighting.`,
          audio: "Epic orchestral music.",
          textOverlay: hook,
        },
        {
          startSec: 9,
          endSec: 18,
          label: "Disaster",
          visual: "Plastic toy bird swoops in (on string), gently taps egg. Egg falls in extreme slow-motion. Loud CRACK. Shell splits in half.",
          audio: "CRACK SFX on impact.",
          textOverlay: "Oh no...",
        },
        {
          startSec: 19,
          endSec: 28,
          label: "Sad montage",
          visual: "Egg's sunglasses fall off. Single tear emoji over yolk. Text: The King's men are on the way...",
          audio: "Sad trombone.",
          textOverlay: "Help is coming...",
        },
        {
          startSec: 29,
          endSec: 38,
          label: "Rescue",
          visual: "Toy horse gallops in pulling tiny ruler and roll of silver duct tape. Hand (King's man) picks up tape.",
          audio: "Heroic drum roll.",
          textOverlay: "MacGyver mode!",
        },
        {
          startSec: 39,
          endSec: 48,
          label: "Transformation montage",
          visual: "Fast punchy 1-second cuts: tape ripped, slapped across crack, egg squeezed back together.",
          audio: "Tape rips and slaps — rapid cuts.",
          textOverlay: "FIX IT!",
        },
        {
          startSec: 49,
          endSec: 55,
          label: "Punchline",
          visual: `Egg turns around — thick silver duct-tape mustache below eyes. Puffs chest. Text: "The King's men are MacGyvers."`,
          audio: "Comedy sting.",
          textOverlay: "Close enough 😂",
        },
        {
          startSec: 56,
          endSec: 60,
          label: "Stinger",
          visual: "Egg looks into camera lens, shrugs (wiggles). Text bubble: Close enough. Fade to black.",
          audio: "Brief silence beat.",
          textOverlay: "Close enough.",
        },
      ],
    },
    durationMinutes,
    hero.name
  );
}

function buildParentPovConcept(durationMinutes: KidsDurationMinutes): KidsShortConcept {
  // Idea 3: Parent Trap (POV Speed Run) — Itsy Bitsy Spider canonical example
  const rhyme = pickRhyme("Itsy Bitsy");
  const hook = "POV: You're a parent.";

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "parent_pov",
      title: `Parent Trap: ${rhyme.name}`,
      hook,
      viralWhy:
        "Relatable parent chaos — parents share on Instagram stories immediately. Speed ramp 1x → 2x → lullaby → glitch rewind.",
      suggestedShortTitle: `POV: ${rhyme.name} PARENT LIFE 🍼 #shorts`,
      rhyme: rhyme.name,
      tags: ["parentlife", "relatable", "funny", "pov"],
      retentionTrick:
        "Speed ramping: normal → 1.5x → 2x → lullaby whisper → record scratch on baby whimper → instant rewind to 0:00. ONE melody only.",
      loopCta: "Press play to repeat the cycle 🔁",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 5,
          label: "Trigger",
          visual: "POV looking down at parent hands. Baby crying off-screen. Kitchen sink visible (waterspout).",
          audio: `"${rhyme.name}" melody at normal speed.`,
          textOverlay: hook,
        },
        {
          startSec: 6,
          endSec: 15,
          label: "Bottles chaos",
          visual: "Hands frantically grab dirty baby bottles from sink (the waterspout). Violent scrubbing. Soap bubbles fly.",
          audio: `Music 1.5x. Sing/hum: "${rhyme.line}"`,
          textOverlay: "Up the waterspout...",
        },
        {
          startSec: 16,
          endSec: 25,
          label: "Spit-up",
          visual: "Baby in highchair. Parent feeds puree. Baby spits it out — hits parent shirt (slow-mo then 2x).",
          audio: `Music 2x. "${rhyme.verse2}" under chaos.`,
          textOverlay: "Down came the rain...",
        },
        {
          startSec: 26,
          endSec: 35,
          label: "Nap calm",
          visual: "Baby placed in crib. Music slows to lullaby whisper. Parent tiptoes backward, sits on couch.",
          audio: "Lullaby whisper — same melody, very soft.",
          textOverlay: "Finally quiet...",
        },
        {
          startSec: 36,
          endSec: 45,
          label: "False hope",
          visual: "Parent reaches for bag of chips — fingers almost touch...",
          audio: "Almost silent — hold breath.",
          textOverlay: "Finally...",
        },
        {
          startSec: 46,
          endSec: 52,
          label: "Glitch",
          visual: "Tiny baby whimper. Screen glitches red. Record scratch. Parent head drops in defeat.",
          audio: "Record scratch — calm music stops.",
          textOverlay: "NOOO 😱",
        },
        {
          startSec: 53,
          endSec: 60,
          label: "Loop rewind",
          visual: "Video instantly rewinds to 0:00. Baby cries again. Text: Press play to repeat the cycle.",
          audio: "Rewind SFX then baby cry — loop bait.",
          textOverlay: "Press play to repeat the cycle 🔁",
        },
      ],
    },
    durationMinutes,
    rhyme.verse2
  );
}

function buildAsmrConcept(durationMinutes: KidsDurationMinutes): KidsShortConcept {
  // Idea 4: Soundscape (ASMR Textures) — Rain Rain Go Away beatbox + kinetic sand canonical example
  const rhyme = pickRhyme("Rain Rain");
  const hook = "Turn sound ON 🔊";

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "asmr_texture",
      title: `ASMR Soundscape: ${rhyme.name}`,
      hook,
      viralWhy:
        "Satisfying squish + beatbox rain → bass drop on sun = dopamine loop. Kids rewatch for texture sounds.",
      suggestedShortTitle: `${rhyme.name} ASMR TEXTURES 🧘 #shorts`,
      rhyme: rhyme.name,
      tags: ["asmr", "satisfying", "kidsshorts", "textures"],
      retentionTrick:
        "Human beatbox ONLY (no piano). Each texture matches lyric moment. Cinematic bass drop when yellow play-doh sun is slammed — then soft resolve.",
      loopCta: "Watch again to relax 🧘",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 6,
          label: "Drip open",
          visual: "Black screen. Single drop of blue water hits hot cast-iron pan — sizzle is first note.",
          audio: "Sizzle = first note of melody. Beatbox begins.",
          textOverlay: hook,
        },
        {
          startSec: 7,
          endSec: 18,
          label: "Rain rhythm",
          visual: "Close-up: hand squeezes blue kinetic sand through garlic press — sand squirts like rain.",
          audio: "Human beatbox mimicking rainstorm — rhythmic clicks and spits.",
          textOverlay: "Rain rain go away...",
        },
        {
          startSec: 19,
          endSec: 28,
          label: "Build",
          visual: "Pipette drips food coloring into clear water beads — beads expand in time-lapse.",
          audio: "Beatboxing faster — drum-and-bass style build.",
          textOverlay: "Come again another day...",
        },
        {
          startSec: 29,
          endSec: 38,
          label: "Lightning slime",
          visual: "Hands squish neon green slime on glass — slime stretches like lightning bolts.",
          audio: "Beatbox high-pitched synth peak.",
          textOverlay: "⚡",
        },
        {
          startSec: 39,
          endSec: 48,
          label: "Bass drop sun",
          visual: "Bright glowing yellow play-doh sun SLAMMED onto table by fist. White flash.",
          audio: "Massive cinematic sub-bass BOOM — sun moment only.",
          textOverlay: "☀️ SUN!",
        },
        {
          startSec: 49,
          endSec: 55,
          label: "Resolve",
          visual: "Hand molds play-doh sun into smiley face. Slime, water beads, sand lined up perfectly.",
          audio: "Soft happy beatbox hum returns.",
          textOverlay: "Another day ☀️",
        },
        {
          startSec: 56,
          endSec: 60,
          label: "Sensory loop",
          visual: "Peace sign. Looped squish animation hint. Do NOT finish full song — loop bait.",
          audio: "Fade on satisfying texture sound.",
          textOverlay: "Watch again to relax 🧘",
        },
      ],
    },
    durationMinutes,
    rhyme.verse2
  );
}

function buildEmojiChatConcept(durationMinutes: KidsDurationMinutes): KidsShortConcept {
  // Idea 5: Emoji Chat (Interactive Texting) — Twinkle Twinkle star prank canonical example
  const rhyme = pickRhyme("Twinkle");
  const hook = "🌟 Hey kid. Guess what?";

  return finalizeConcept(
    {
      id: uniqueId(),
      format: "emoji_chat",
      title: `Emoji Chat: Twinkle Twinkle`,
      hook,
      viralWhy:
        "Mini science joke + prank = educational humor parents share. Comment bait: Reply SNACKS for Part 2.",
      suggestedShortTitle: `Twinkle Twinkle TEXTED Me?! 🌟 #shorts`,
      rhyme: rhyme.name,
      tags: ["scienceforkids", "funny", "learning", "emojichat"],
      retentionTrick:
        "Split-screen phone UI. Scary NASA sun clip 2 seconds only. Prank reveal then facepalm. Bold thick subtitles with color highlights.",
      loopCta: "Reply 'SNACKS' in the comments for Part 2! 🍿",
      generatedAt: new Date().toISOString(),
      scenes: [
        {
          startSec: 0,
          endSec: 8,
          label: "First text",
          visual: "Split screen: left = dark night sky with glowing star emoji; right = child's bedroom window. Phone UI pops up.",
          audio: "Notification ping.",
          textOverlay: "🌟: Hey kid. Guess what?",
        },
        {
          startSec: 9,
          endSec: 18,
          label: "Flattery",
          visual: "Child reads and types back. Star replies with blushing emoji and gold star sticker flies across screen.",
          audio: "Typing sounds.",
          textOverlay: "👦: Are you a diamond? You're so sparkly.",
        },
        {
          startSec: 19,
          endSec: 28,
          label: "Truth bomb",
          visual: `Star text changes: "Actually, I'm a giant ball of burning hydrogen and helium." Cut to 2-second cinematic NASA-style sun burning clip.`,
          audio: "Dramatic sting on truth bomb.",
          textOverlay: "🌟: burning gas ball",
        },
        {
          startSec: 29,
          endSec: 38,
          label: "Horror reaction",
          visual: "Cut back to child's face — giant zoom on eyes. TERRIFIED. Animated sweat drops. Slowly looks up at sky.",
          audio: "Safe horror drone (cartoon, not scary).",
          textOverlay: "😱",
        },
        {
          startSec: 39,
          endSec: 48,
          label: "Prank reveal",
          visual: "Star sends three laughing-crying emojis. Star does happy dance in split-screen box.",
          audio: "Giggle SFX.",
          textOverlay: "🌟: 😂😂😂 KID, I'M JOKING. Twinkle twinkle!",
        },
        {
          startSec: 49,
          endSec: 55,
          label: "Payoff",
          visual: "Child exhales, rolls eyes, facepalms. Types back annoyed.",
          audio: "Exhale sigh.",
          textOverlay: "👦: You're not funny, Star.",
        },
        {
          startSec: 56,
          endSec: 60,
          label: "Sign-off loop",
          visual: "Star wiggles. Final text: See you tomorrow night. Bring snacks. Screen glitches.",
          audio: "Notification ping.",
          textOverlay: "Reply SNACKS for Part 2! 🍿",
        },
      ],
    },
    durationMinutes,
    rhyme.verse2
  );
}

const FORMAT_BUILDERS: Record<ViralFormat, (d: KidsDurationMinutes) => KidsShortConcept> = {
  wrong_sound: buildWrongSoundConcept,
  story_remix: buildStoryRemixConcept,
  parent_pov: buildParentPovConcept,
  asmr_texture: buildAsmrConcept,
  emoji_chat: buildEmojiChatConcept,
};

/** Viral TikTok/YouTube Shorts formats only (not basic sing-along). */
const VIRAL_FORMATS: ViralFormat[] = [
  "wrong_sound",
  "story_remix",
  "parent_pov",
  "asmr_texture",
  "emoji_chat",
];

/**
 * Example format templates from the DeepSeek conversation — psychology types the generator cycles through.
 * Not a fixed batch size; each template is a 7-scene / 60-second script pattern.
 */
export const VIRAL_PLAYBOOK: {
  id: ViralFormat;
  order: number;
  title: string;
  hook: string;
  rhyme: string;
  psychology: string;
}[] = [
  {
    id: "wrong_sound",
    order: 1,
    title: 'The "Expectation vs. Reality" (Sensory Edition)',
    hook: "Can you spot the mistake?",
    rhyme: "Wheels on the Bus",
    psychology: "Kids yell the correct answer; mismatch sound forces engagement.",
  },
  {
    id: "story_remix",
    order: 2,
    title: 'The "Unsolved Mystery" (Story Remix)',
    hook: "Every hero has an origin story.",
    rhyme: "Humpty Dumpty",
    psychology: "Fresh twist parents haven't heard — duct-tape mustache is shareable.",
  },
  {
    id: "parent_pov",
    order: 3,
    title: 'The "Parent Trap" (POV Speed Run)',
    hook: "POV: You're a parent.",
    rhyme: "Itsy Bitsy Spider",
    psychology: "Relatable parent chaos — speed ramp + glitch rewind loop.",
  },
  {
    id: "asmr_texture",
    order: 4,
    title: 'The "Soundscape" (ASMR Textures)',
    hook: "Turn sound ON 🔊",
    rhyme: "Rain Rain Go Away",
    psychology: "Satisfying squish + beatbox rain → bass drop on sun = dopamine loop.",
  },
  {
    id: "emoji_chat",
    order: 5,
    title: 'The "Emoji Chat" (Interactive Texting)',
    hook: "🌟 Hey kid. Guess what?",
    rhyme: "Twinkle Twinkle",
    psychology: "Mini science joke + prank — comment bait: Reply SNACKS for Part 2.",
  },
];

/** Step 1 — generate a viral idea in the same shape DeepSeek returns. */
export function step1_generateViralIdea(
  format: Exclude<ViralFormat, "sing_along">
): ViralShortIdea {
  const pb = VIRAL_PLAYBOOK.find((p) => p.id === format)!;
  const rhymeEntry =
    RHYMES.find((r) => r.name.toLowerCase().includes(pb.rhyme.toLowerCase().split(" ")[0])) ??
    pick(RHYMES);

  const ideas: Record<
    Exclude<ViralFormat, "sing_along">,
    Pick<ViralShortIdea, "concept" | "script" | "viralMoment" | "viralWhy" | "loopCta">
  > = {
    wrong_sound: {
      concept:
        "Start the classic rhyme normally, but intentionally mismatch the sound so the child corrects you.",
      script: `Sing "${rhymeEntry.name}." When you say the horn goes beep beep beep, show the bus but dub in a duck quack.`,
      viralMoment:
        "Pause the video. Confused emoji zoom. Child yells the answer. Cut to a real bus horn with satisfying bass.",
      viralWhy:
        'Parents tag other parents to see if their kids "catch the mistake." Comments fill with "It\'s a duck!"',
      loopCta: "Show this to your kid! Did they get it right?",
    },
    story_remix: {
      concept:
        "Take a familiar nursery rhyme character and give it a logical, hilarious plot twist parents haven't heard.",
      script: `"${pb.rhyme}" — egg-shaped hero tries to fly, bumps a bird, falls and cracks.`,
      viralMoment:
        "King's men arrive with duct tape. Egg gets a duct-tape mustache. Shrugs: Close enough.",
      viralWhy: "Fresh twist for parents. Duct-tape mustache is highly shareable.",
      loopCta: "Close enough 😂 — Tap for Part 2?",
    },
    parent_pov: {
      concept: `Turn "${rhymeEntry.name}" into a frantic day-in-the-life of a parent at 2× speed.`,
      script: `Play "${rhymeEntry.name}" fast. Parent = spider. Waterspout = sink of bottles. Rain = spit-up. Sun = baby napping.`,
      viralMoment:
        "Baby wakes as parent sits down. Screen glitches: Repeat x 100.",
      viralWhy: "Relatable parent chaos — shared instantly in parenting groups.",
      loopCta: "Press play to repeat the cycle.",
    },
    asmr_texture: {
      concept: `"${rhymeEntry.name}" told through satisfying textures synced to human beatbox — no piano.`,
      script: `Kinetic sand rain, water beads, slime lightning, play-doh sun slammed for the payoff.`,
      viralMoment: "Beatbox builds, then cinematic bass drop when the sun appears.",
      viralWhy: "ASMR textures trigger dopamine — kids rewatch for the squish sounds.",
      loopCta: "Watch again to relax 🧘",
    },
    emoji_chat: {
      concept: `"${rhymeEntry.name}" told as a text-message conversation between the star and a child.`,
      script: `Star texts kid. Diamond guess → science truth bomb → prank → twinkle twinkle.`,
      viralMoment:
        'Star: "I\'m a giant ball of burning gas." Child terrified — then "Just kidding!"',
      viralWhy: "Tiny science fact + humor. Educational without feeling like homework.",
      loopCta: "Reply 'SNACKS' in the comments for part 2!",
    },
  };

  const detail = ideas[format];
  return {
    format,
    psychologyTitle: pb.title,
    hook: pb.hook,
    rhyme: rhymeEntry.name,
    ...detail,
  };
}

/** Format Step 1 idea brief — same sections DeepSeek uses. */
export function formatViralIdeaBrief(idea: ViralShortIdea): string {
  return [
    idea.psychologyTitle,
    "",
    `The Hook: ${idea.hook}`,
    "",
    `The Concept: ${idea.concept}`,
    "",
    `The Script: ${idea.script}`,
    "",
    `The Viral Moment: ${idea.viralMoment}`,
    "",
    `Why it goes viral: ${idea.viralWhy}`,
  ].join("\n");
}

function formatBasicIdeaBrief(concept: KidsShortConcept): string {
  return [
    "Basic Toddler Sing-Along",
    "",
    `The Hook: ${concept.hook}`,
    "",
    `The Concept: Sing "${concept.rhyme}" in full — every visual and sound matches the lyrics.`,
    "",
    `Why it works: Clear, gentle learning for ages 2–5. No quiz tricks or random sounds.`,
  ].join("\n");
}

/** Format Step 1 from an already-built concept (matches the scenes in Step 2). */
export function formatViralIdeaBriefFromConcept(concept: KidsShortConcept): string {
  const pb = VIRAL_PLAYBOOK.find((p) => p.id === concept.format);
  return formatViralIdeaBrief({
    format: concept.format as Exclude<ViralFormat, "sing_along">,
    psychologyTitle: pb?.title ?? concept.title,
    hook: concept.hook,
    concept: concept.title,
    script: `Nursery rhyme base: "${concept.rhyme}" — see Step 2 scenes for the full script.`,
    viralMoment: concept.retentionTrick,
    viralWhy: concept.viralWhy,
    rhyme: concept.rhyme,
    loopCta: concept.loopCta,
  });
}

/** Attach Step 1 + Step 2 text to a concept after scenes are built. */
export function attachPipelineToConcept(concept: KidsShortConcept): KidsShortConcept {
  const ideaBrief =
    concept.ideaBrief ??
    (concept.format === "sing_along"
      ? formatBasicIdeaBrief(concept)
      : formatViralIdeaBriefFromConcept(concept));
  const sceneScriptText = formatConceptAsPastedScript({ ...concept, ideaBrief });
  return { ...concept, ideaBrief, sceneScriptText };
}

/** Full DeepSeek-style plan: idea → scene script → concept ready for HeyGen. */
export function buildKidsVideoPlan(concept: KidsShortConcept): KidsVideoPlan {
  const enriched = concept.ideaBrief ? concept : attachPipelineToConcept(concept);
  return {
    step1_idea: enriched.ideaBrief!,
    step2_sceneScript: enriched.sceneScriptText!,
    concept: enriched,
  };
}

/** @deprecated alias */
const DAILY_DROP_FORMATS = VIRAL_FORMATS;

/** Generate N random concepts at 1, 3, or 5 minutes. Up to MAX_DAILY_DROP_VIDEOS per batch. */
export function generateRandomKidsShorts(
  count: number = 1,
  durationMinutes: KidsDurationMinutes = 1,
  formatPoolOrMode: ViralFormat[] | KidsGenerationMode = VIRAL_FORMATS,
  modeArg?: KidsGenerationMode
): KidsShortConcept[] {
  const n = Math.min(MAX_DAILY_DROP_VIDEOS, Math.max(1, count || 1));
  const duration = parseKidsDurationMinutes(durationMinutes);

  let mode: KidsGenerationMode = "viral";
  let formatPool = VIRAL_FORMATS;
  if (formatPoolOrMode === "basic" || formatPoolOrMode === "viral") {
    mode = formatPoolOrMode;
  } else if (Array.isArray(formatPoolOrMode)) {
    formatPool = formatPoolOrMode.filter((f) => f !== "sing_along");
    mode = modeArg ?? "viral";
  }

  if (mode === "basic") {
    const chosenRhymes =
      n <= RHYMES.length
        ? pickN(RHYMES, n)
        : [...pickN(RHYMES, RHYMES.length), ...Array.from({ length: n - RHYMES.length }, () => pick(RHYMES))];
    return chosenRhymes.map((rhyme) => attachPipelineToConcept(buildBasicSingAlongConcept(duration, rhyme)));
  }

  const playbookOrder = VIRAL_FORMATS.filter(
    (f) => formatPool.includes(f) && FORMAT_BUILDERS[f]
  );
  if (!playbookOrder.length) return [];

  const chosenFormats = Array.from({ length: n }, (_, i) => playbookOrder[i % playbookOrder.length]);
  return chosenFormats.map((f) => attachPipelineToConcept(FORMAT_BUILDERS[f](duration)));
}

/** Fully automatic daily video: random concept + auto music + auto cartoon style. Zero manual picks. */
export function generateDailyDrop(durationMinutes: KidsDurationMinutes = 1): {
  concept: KidsShortConcept;
  style: KidsVisualStyle;
  music: string;
} {
  return generateDailyDrops(1, durationMinutes)[0];
}

/** Batch daily drops — pick how many of each visual style (e.g. 1×3D + 2×2D + 5×Presenter). */
export function generateDailyDropsFromStyleCounts(
  styleCounts: KidsStyleCounts,
  durationMinutes: KidsDurationMinutes = 1,
  mode: KidsGenerationMode = "basic"
): { concept: KidsShortConcept; style: KidsVisualStyle; music: string }[] {
  const styles = expandStyleCountsToStyles(styleCounts);
  const concepts = generateRandomKidsShorts(styles.length, durationMinutes, mode);
  return concepts.map((concept, i) => {
    const style = styles[i] ?? styles[0];
    const music = assignAutoMusic(concept);
    return {
      concept: { ...concept, autoMusic: music, autoStyle: style },
      style,
      music,
    };
  });
}

/** @deprecated Use generateDailyDropsFromStyleCounts — kept for legacy callers. */
export function generateDailyDrops(
  count: number = 1,
  durationMinutes: KidsDurationMinutes = 1,
  includePresenterForTwo = false,
  chosenStyle?: KidsVisualStyle | "random" | null
): { concept: KidsShortConcept; style: KidsVisualStyle; music: string }[] {
  return generateDailyDropsFromStyleCounts(
    styleCountsFromLegacy(count, includePresenterForTwo, chosenStyle),
    durationMinutes
  );
}

export function listKidsFormats() {
  return VIRAL_FORMATS.map((id) => {
    const pb = VIRAL_PLAYBOOK.find((p) => p.id === id);
    const labels: Record<(typeof VIRAL_FORMATS)[number], { label: string; description: string }> = {
      wrong_sound: {
        label: "Expectation vs. Reality",
        description: "Wrong sound quiz — kid catches the mistake, satisfying reveal",
      },
      story_remix: {
        label: "Story Remix",
        description: "Nursery rhyme plot twist parents haven't heard before",
      },
      parent_pov: {
        label: "Parent POV Speed Run",
        description: "Relatable parent chaos synced to rhyme melody + glitch loop",
      },
      asmr_texture: {
        label: "ASMR Soundscape",
        description: "Satisfying textures synced to beat — bass drop on the payoff",
      },
      emoji_chat: {
        label: "Emoji Chat",
        description: "Rhyme told as texting conversation with a prank + comment bait",
      },
    };
    return {
      id,
      psychology: pb?.psychology ?? labels[id].description,
      exampleRhyme: pb?.rhyme,
      ...labels[id],
    };
  });
}

export function listGenerationModes() {
  return [
    {
      id: "basic" as const,
      label: "Basic — Toddler Sing-Along",
      description:
        "Gentle nursery rhyme sing-along for ages 2–5. One song, lyrics match visuals, no quiz tricks or random sounds.",
      default: true,
    },
    {
      id: "viral" as const,
      label: "Viral — TikTok / YouTube Shorts",
      description:
        "Retention-first method: hook → mini-movie scenes → loop bait. Not a plain sing-along — don't finish the song.",
      default: false,
    },
  ];
}

const VIRAL_FORMAT_PROMPT_RULES: Record<Exclude<ViralFormat, "sing_along">, string> = {
  wrong_sound: `FORMAT: Wrong Sound Quiz (Expectation vs. Reality)
- Interactive quiz — NOT a full sing-through. Use "${'"'}Wheels on the Bus${'"'}" melody snippets only where scripted.
- Wrong sound MUST mismatch visibly (horn → quack). Pause so kids shout the answer.
- Reveal uses satisfying real horn bass. Parents comment "my kid caught it!"`,

  story_remix: `FORMAT: Story Remix (Unsolved Mystery)
- Narrative mini-movie — NOT a nursery rhyme sing-along. Humpty Dumpty story with duct-tape punchline.
- Slow-mo hero/disaster, fast-cut montage on rescue. Shareable visual: duct-tape mustache.`,

  parent_pov: `FORMAT: Parent Trap (POV Speed Run)
- POV parent hands + ONE rhyme melody ("Itsy Bitsy Spider") throughout — speed ramp 1x → 1.5x → 2x → lullaby → glitch rewind.
- Lyrics on screen stay this rhyme only. Relatable parent chaos visuals (bottles, spit-up, false hope, baby whimper).`,

  asmr_texture: `FORMAT: ASMR Soundscape
- Human beatbox mouth sounds ONLY — no piano. Rain Rain Go Away rhythm via textures (kinetic sand, water beads, slime, play-doh sun).
- Bass drop ONLY when yellow play-doh sun is slammed — synced to "sun" moment. Satisfying loop bait.`,

  emoji_chat: `FORMAT: Emoji Chat (Interactive Texting)
- Split-screen phone UI texting — NOT singing. Twinkle Twinkle star prank with 2-second science clip then "just kidding."
- Comment bait ending: Reply SNACKS for Part 2.`,
};

const VIRAL_METHOD_PROMPT = `VIRAL SHORTS METHOD (apply to this video):
- ${VIRAL_SHORTS_METHOD.summary}
- Structure: ${VIRAL_SHORTS_METHOD.steps[2]}
- ${VIRAL_SHORTS_METHOD.secretSauce}
- Speed-ramping: slow-mo on reactions, 2× on filler. Bold subtitles with color highlights on key words.`;

const BASIC_ENDING_PROMPT = `TODDLER VICTORY CELEBRATION (required — comes BEFORE parent URLs):
- After the main content ends, include the "Toddler victory celebration" scene exactly as scripted.
- This is FOR THE CHILD: immediate praise, stars/confetti/bubbles/high-five, big smiles, clapping.
- Use specific encouraging words ("You sang great!", "You did it!") — toddlers respond to named praise.
- Keep it short, bright, and physical. NO URLs or parent messaging in this beat.
- THEN transition calmly to the brand outro for parents.

MANDATORY END CARD (final seconds — for parents after celebration):
- Show both URLs large on screen for parents to read/snapshot:
  • ${KIDS_BRAND_OUTRO.ebookgamez.label}: ${KIDS_BRAND_OUTRO.ebookgamez.url} — ${KIDS_BRAND_OUTRO.ebookgamez.tagline}
  • ${KIDS_BRAND_OUTRO.learnforge.label}: ${KIDS_BRAND_OUTRO.learnforge.url} — ${KIDS_BRAND_OUTRO.learnforge.tagline}
- Characters wave goodbye and point at the URLs.

Deliver the full video following every scene timestamp above.`;

const VIRAL_ENDING_PROMPT = `VIRAL ENDING (CRITICAL — do NOT add toddler celebration or parent URL cards):
- The scene script already ends on a loop CTA. That IS the ending.
- Do NOT finish the full nursery rhyme unless the script completes a story beat.
- Leave the last note hanging where scripted. The loop bait drives retention.

Deliver exactly the scene timestamps above — loop CTA is the final frame.`;

const BASIC_SING_ALONG_RULES = `FORMAT: Toddler Sing-Along (Basic — made for ages 2–5)
- Traditional sing-along — sing the FULL rhyme in order with clear, slow pronunciation.
- ONE song only. NEVER splice words, lines, or melodies from other nursery rhymes.
- Every sound effect MUST match what is visible (horn = beep, rain = pitter patter). NO random thunder, lightning, bass BOOM, or unrelated SFX.
- Visuals illustrate the words being sung at that moment. Finish one complete pass through the lyrics.
- End with toddler victory celebration, then brand outro for parents.`;

function sceneBlock(scene: KidsScene): string {
  const lines = [
    `[${scene.startSec}s–${scene.endSec}s] ${scene.label}`,
    `  Visual: ${scene.visual}`,
    `  Audio: ${scene.audio}`,
  ];
  if (scene.textOverlay) lines.push(`  On-screen text: "${scene.textOverlay}"`);
  return lines.join("\n");
}

export function heygenPromptFromKidsShort(concept: KidsShortConcept, style: KidsVisualStyle): string {
  const enriched = concept.sceneScriptText ? concept : attachPipelineToConcept(concept);

  // Viral: Step 3 — render from Step 2's scene-by-scene script (same path as pasted DeepSeek output).
  if (enriched.format !== "sing_along") {
    return heygenPromptFromPastedScript(enriched.sceneScriptText!, style, enriched.durationMinutes, {
      title: enriched.suggestedShortTitle,
      formatHint: enriched.format,
    });
  }

  const styleInfo = KIDS_VISUAL_STYLES[style];
  const sceneScript = concept.scenes.map(sceneBlock).join("\n\n");
  const mins = concept.durationMinutes;
  const secs = concept.durationSeconds;
  const rhymeEntry = RHYMES.find((r) => r.name === concept.rhyme);
  const lyricScript = rhymeEntry
    ? rhymeLyricScript(rhymeEntry)
    : `Base rhyme/story: "${concept.rhyme}" — follow the scene script, not a different song.`;
  const formatRules =
    concept.format === "sing_along"
      ? BASIC_SING_ALONG_RULES
      : VIRAL_FORMAT_PROMPT_RULES[concept.format as Exclude<ViralFormat, "sing_along">];
  const formatNote =
    concept.format === "sing_along"
      ? mins === 1
        ? "YouTube Short — hook in 0-2s, but finish one complete pass through the rhyme lyrics. Gentle and clear for toddlers."
        : `${mins}-minute kids sing-along episode — full rhyme, dance break, learning moment, goodbye.`
      : mins === 1
        ? "YouTube Short — hook in 0-2s. 2026 retention rule: do NOT finish the full song on 1-min Shorts unless the scene script completes a story beat — leave loop bait / last note hanging where scripted."
        : `${mins}-minute kids episode — include intro, full pass, dance break, learning moment, and goodbye.`;

  const coherenceBlock =
    concept.format === "sing_along"
      ? `NURSERY RHYME COHERENCE RULES (CRITICAL — made for toddlers):
- ONE song only: "${concept.rhyme}". NEVER splice in words, lines, or melodies from other nursery rhymes.
- On-screen text MUST be actual lyrics from "${concept.rhyme}" or simple labels for props in that rhyme.
- Every sound effect MUST match what is visible. NO random thunder, lightning, bass BOOM, or sun slam unless this rhyme mentions that element.
- Do NOT jump between unrelated words mid-video. Lyrics progress forward — verse 1, then verse 2, then repeat.
- Visuals illustrate the words being sung at that moment. Clear, slow pronunciation for ages 2–5. Clarity beats viral tricks.`
      : concept.format === "parent_pov"
      ? `NURSERY RHYME COHERENCE (Parent POV):
- ONE melody only: "${concept.rhyme}". Lyrics on screen must stay this rhyme in order.
- Parent chaos is visual background — never splice words from other nursery rhymes.`
      : concept.format === "wrong_sound" || concept.format === "asmr_texture"
        ? `COHERENCE (this format):
- Base song: "${concept.rhyme}". Sound effects MUST match what's on screen at that moment.
- Follow the scene script timestamps exactly — quiz, reveal, and loop CTA are mandatory.`
        : concept.format === "story_remix" || concept.format === "emoji_chat"
          ? `COHERENCE (this format):
- This is a ${concept.format === "story_remix" ? "story narrative" : "text-message conversation"}, NOT a traditional sing-along.
- Follow scene script dialogue and visuals exactly. Toddler-safe humor only.`
          : `NURSERY RHYME COHERENCE RULES:
- ONE song/story only: "${concept.rhyme}". Clear pronunciation for ages 2–5.`;

  const isViral = concept.format !== "sing_along";

  return `Create a ${mins}-minute (${secs} seconds) vertical kids video (9:16, 1080x1920).

CONCEPT: ${concept.title}
${isViral ? "MODE: Viral YouTube Short (retention method — not a plain sing-along)" : "MODE: Basic Toddler Sing-Along"}
NURSERY RHYME / STORY BASE: ${concept.rhyme}
HOOK (first 2 seconds): ${concept.hook}
${isViral ? `WHY IT GOES VIRAL: ${concept.viralWhy}` : "PURPOSE: Clear, gentle learning video for toddlers — not a viral quiz or prank."}
Suggested title: ${concept.suggestedShortTitle}
TARGET LENGTH: exactly ${secs} seconds (${mins} min)

${isViral ? `${VIRAL_METHOD_PROMPT}\n\n` : ""}${formatRules}

OFFICIAL LYRICS FOR THIS VIDEO (use ONLY these — do not invent or mix other songs):
${lyricScript}

AUTO MUSIC (system-selected — do not ask the user):
${concept.autoMusic || assignAutoMusic(concept)}
${concept.format === "sing_along" ? "Use ONE nursery rhyme melody throughout. Sync cuts to the beat. Sing the lyrics above in order." : "Sync every cut to the beat. Use speed-ramping: slow-mo on reactions, 2x on filler actions."}

${styleInfo.heygenStyleBlock}

${coherenceBlock}

PRODUCTION RULES:
- ${formatNote}
- Bold thick subtitles${concept.format === "sing_along" ? "; color-highlight key rhyme words as they are sung" : " with color-changing highlights on key words (2026 Shorts best practice)"}
- ${concept.retentionTrick}
- ${concept.format === "sing_along" ? `End card: ${concept.loopCta}` : `Pre-loop CTA text: ${concept.loopCta}`}
- ORIGINAL characters only — no Cocomelon, Blippi, ChuChu trademark assets
- Made-for-kids safe content
- Cut every 2-4 seconds; no long static shots

SCENE-BY-SCENE BREAKDOWN (${concept.scenes.length} scenes — follow every timestamp):

${sceneScript}

${isViral ? VIRAL_ENDING_PROMPT : BASIC_ENDING_PROMPT}`;
}

function formatSecondsForScript(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `:${String(m).padStart(2, "0")} - :${String(s).padStart(2, "0")}`;
}

const FORMAT_DISPLAY_NAMES: Record<ViralFormat, string> = {
  wrong_sound: 'The "Expectation vs. Reality" (Sensory Edition)',
  story_remix: 'The "Unsolved Mystery" (Story Remix)',
  parent_pov: 'The "Parent Trap" (POV Speed Run)',
  asmr_texture: 'The "Soundscape" (ASMR Textures)',
  emoji_chat: 'The "Emoji Chat" (Interactive Texting)',
};

/** Step 2 — scene-by-scene breakdown in DeepSeek paste format (this is what HeyGen renders). */
export function formatConceptAsPastedScript(concept: KidsShortConcept): string {
  const lines: string[] = [];
  if (concept.ideaBrief) {
    lines.push(
      `--- STEP 1: ${concept.format === "sing_along" ? "IDEA" : "VIRAL IDEA"} ---`,
      concept.ideaBrief,
      "",
      "--- STEP 2: SCENE-BY-SCENE BREAKDOWN ---",
      ""
    );
  }
  const pb = VIRAL_PLAYBOOK.find((p) => p.id === concept.format);
  lines.push(
    pb?.title ?? concept.title,
    `Total Time: ${concept.durationSeconds} Seconds | Viral Hook: ${concept.hook}`,
    "",
    `WHY IT GOES VIRAL: ${concept.viralWhy}`,
    ""
  );
  concept.scenes.forEach((scene, i) => {
    const start = formatSecondsForScript(scene.startSec);
    const end = formatSecondsForScript(scene.endSec);
    lines.push(`${start} - ${end} (Scene ${i + 1} - ${scene.label}): ${scene.visual}`);
    lines.push(`  Audio: ${scene.audio}`);
    if (scene.textOverlay) lines.push(`  Text overlay: "${scene.textOverlay}"`);
    lines.push("");
  });
  lines.push(`Loop CTA: ${concept.loopCta}`);
  lines.push(`Suggested title: ${concept.suggestedShortTitle}`);
  return lines.join("\n");
}

export function getViralScriptTemplates(): { id: ViralFormat; label: string; script: string }[] {
  const labels = listKidsFormats();
  return VIRAL_FORMATS.map((id) => {
    const concept = attachPipelineToConcept(FORMAT_BUILDERS[id](1));
    const meta = labels.find((f) => f.id === id)!;
    return { id, label: meta.label, script: concept.sceneScriptText! };
  });
}

export function detectViralFormatFromScript(script: string): ViralFormat | null {
  const lower = script.toLowerCase();
  if (/wrong sound|spot the mistake|which one makes the sound|duck quack|expectation vs/i.test(lower)) {
    return "wrong_sound";
  }
  if (/humpty|duct.?tape|story remix|unsolved mystery/i.test(lower)) return "story_remix";
  if (/parent trap|pov.*parent|itsy bitsy|repeat the cycle|spit.?up/i.test(lower)) return "parent_pov";
  if (/asmr|kinetic sand|beatbox|rain rain go away|soundscape/i.test(lower)) return "asmr_texture";
  if (/emoji chat|twinkle twinkle|text message|reply.*snacks/i.test(lower)) return "emoji_chat";
  return null;
}

const CHILD_SENSE_RULES = `MADE-FOR-KIDS COHERENCE (CRITICAL — do NOT confuse toddlers):
- Follow the user's scene timestamps and story beat-for-beat. Do NOT rewrite scenes or splice random words from other nursery rhymes.
- Every sound effect MUST match what is on screen at that moment (horn = beep/honk, rain = pitter patter). Wrong sounds are ONLY intentional in quiz formats — fix in the reveal scene.
- On-screen text must match the script overlays — large, bold, color-highlight key words.
- Clear slow pronunciation for ages 2–5. Visuals always illustrate what is happening NOW in that scene.
- ONE story/song thread only — no random thunder, boom, or lyric mashups.
- Speed-ramping: slow-mo on important reactions, 2x on filler actions. Cut every 2-4 seconds.`;

/** Wrap a user-pasted DeepSeek / ChatGPT scene breakdown for HeyGen Video Agent. */
export function heygenPromptFromPastedScript(
  pastedScript: string,
  style: KidsVisualStyle,
  durationMinutes: KidsDurationMinutes = 1,
  options?: { title?: string; formatHint?: ViralFormat | null }
): string {
  const trimmed = pastedScript.trim();
  if (trimmed.length < 80) {
    throw new Error(
      "Script too short — paste the full scene-by-scene breakdown (at least a few scenes)."
    );
  }
  const mins = durationMinutes;
  const secs = KIDS_DURATION_OPTIONS[mins].seconds;
  const styleInfo = KIDS_VISUAL_STYLES[style];
  const format = options?.formatHint ?? detectViralFormatFromScript(trimmed);
  const formatRules = format ? VIRAL_FORMAT_PROMPT_RULES[format] : null;
  const titleMatch = trimmed.match(/Suggested title:\s*(.+)/i);
  const title = options?.title?.trim() || titleMatch?.[1]?.trim() || "Custom Kids Short";

  const isViralScript = format != null && format !== "sing_along";

  const formatNote =
    mins === 1
      ? isViralScript
        ? "YouTube Short — hook in 0-2s. Follow loop CTA — do NOT finish the full song unless the script completes a story beat."
        : "YouTube Short — hook in 0-2s. Follow the user's script, then toddler victory + brand outro."
      : `${mins}-minute kids episode pacing.`;

  const endingBlock = isViralScript
    ? `${VIRAL_METHOD_PROMPT}\n\n${VIRAL_ENDING_PROMPT}`
    : `${BASIC_ENDING_PROMPT}`;

  return `Create a ${mins}-minute (${secs} seconds) vertical kids video (9:16, 1080x1920).

USER-PROVIDED SCRIPT (follow EXACTLY — do not rewrite scenes or invent new plot beats):
---
${trimmed}
---

${formatRules ? `${formatRules}\n\n` : ""}${styleInfo.heygenStyleBlock}

${CHILD_SENSE_RULES}

PRODUCTION RULES:
- ${formatNote}
- Bold thick subtitles with color-changing highlights on key words (2026 Shorts best practice)
- ORIGINAL characters only — no Cocomelon, Blippi, ChuChu trademark assets
- Made-for-kids safe content
- Sync cuts to rhythm where the script specifies music or beatbox

Suggested title: ${title}
TARGET LENGTH: exactly ${secs} seconds (${mins} min)

${endingBlock}`;
}

export function buildKidsGenerationJobs(
  concepts: KidsShortConcept[],
  styles: KidsVisualStyle[]
): { concept: KidsShortConcept; style: KidsVisualStyle; prompt: string; title: string; durationSeconds: number }[] {
  const jobs: {
    concept: KidsShortConcept;
    style: KidsVisualStyle;
    prompt: string;
    title: string;
    durationSeconds: number;
  }[] = [];

  for (const concept of concepts) {
    for (const style of styles) {
      jobs.push({
        concept,
        style,
        prompt: heygenPromptFromKidsShort(concept, style),
        title: `${concept.suggestedShortTitle} [${KIDS_VISUAL_STYLES[style].label}]`,
        durationSeconds: concept.durationSeconds,
      });
    }
  }

  return jobs;
}
