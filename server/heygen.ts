const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "";
const HEYGEN_BASE = "https://api.heygen.com";

async function heygenFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${HEYGEN_BASE}${path}`, {
    ...options,
    headers: {
      "X-Api-Key": HEYGEN_API_KEY,
      "accept": "application/json",
      ...(options.headers || {}),
    },
  });
  return res.json();
}

export async function listAvatars() {
  const data = await heygenFetch("/v2/avatars");
  if (data?.data?.avatars) {
    return data.data.avatars.map((a: any) => ({
      avatar_id: a.avatar_id,
      avatar_name: a.avatar_name,
      gender: a.gender,
      preview_image_url: a.preview_image_url,
      preview_video_url: a.preview_video_url,
    }));
  }
  return [];
}

export async function listVoices() {
  const data = await heygenFetch("/v2/voices");
  if (data?.data?.voices) {
    return data.data.voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      language: v.language,
      gender: v.gender,
      preview_audio: v.preview_audio,
    }));
  }
  return [];
}

export async function generateVideoAgent(prompt: string, callbackId?: string) {
  const body: any = { prompt };
  if (callbackId) body.callback_id = callbackId;

  const data = await heygenFetch("/v1/video_agent/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data;
}

export async function generateAvatarVideo(
  avatarId: string,
  voiceId: string,
  script: string,
  callbackId?: string,
  dimension?: { width: number; height: number }
) {
  const body: any = {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          input_text: script,
          voice_id: voiceId,
        },
      },
    ],
    dimension: dimension || { width: 1920, height: 1080 },
  };
  if (callbackId) body.callback_id = callbackId;

  const data = await heygenFetch("/v2/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data;
}

export const AD_PACKAGE_SPECS = {
  videos: [
    { label: "Horizontal Video (16:9)", dimension: { width: 1920, height: 1080 }, suffix: "landscape" },
    { label: "Vertical Video (9:16)", dimension: { width: 1080, height: 1920 }, suffix: "portrait" },
    { label: "Square Video (1:1)", dimension: { width: 1080, height: 1080 }, suffix: "square" },
  ],
};

export async function getVideoStatus(videoId: string) {
  const data = await heygenFetch(`/v1/video_status.get?video_id=${videoId}`);
  return data;
}

export async function registerWebhook(url: string) {
  const data = await heygenFetch("/v1/webhook/endpoint.add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      events: [
        "avatar_video.success",
        "avatar_video.fail",
        "video_agent.success",
        "video_agent.fail",
      ],
    }),
  });
  return data;
}

export async function listWebhooks() {
  const data = await heygenFetch("/v1/webhook/endpoint.list");
  return data;
}
