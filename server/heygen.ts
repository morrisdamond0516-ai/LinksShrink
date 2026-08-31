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
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || res.statusText;
    throw new Error(`HeyGen API ${res.status}: ${msg}`);
  }
  if (data?.error?.message) {
    throw new Error(data.error.message);
  }
  return data;
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
  dimension?: { width: number; height: number },
  backgroundImageUrl?: string,
  scenes?: { text: string; backgroundUrl?: string }[]
) {
  let videoInputs: any[];

  if (scenes && scenes.length > 0) {
    videoInputs = scenes.map((scene) => {
      const input: any = {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          input_text: scene.text,
          voice_id: voiceId,
        },
      };
      if (scene.backgroundUrl) {
        input.background = {
          type: "image",
          url: scene.backgroundUrl,
        };
      }
      return input;
    });
  } else {
    const input: any = {
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
    };
    if (backgroundImageUrl) {
      input.background = {
        type: "image",
        url: backgroundImageUrl,
      };
    }
    videoInputs = [input];
  }

  const body: any = {
    video_inputs: videoInputs,
    dimension: dimension || { width: 1920, height: 1080 },
  };
  if (callbackId) body.callback_id = callbackId;

  console.log(`[HeyGen] Generating video with ${videoInputs.length} scene(s), callback=${callbackId}`);

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

export async function listHeygenVideos(limit = 20, token?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (token) params.set("token", token);
  const data = await heygenFetch(`/v3/videos?${params.toString()}`);
  return data;
}

export async function getHeygenVideoV3(videoId: string) {
  const data = await heygenFetch(`/v3/videos/${videoId}`);
  return data;
}

export async function getVideoStatus(videoId: string) {
  const data = await heygenFetch(`/v1/video_status.get?video_id=${videoId}`);
  return data;
}

/** Safe wallet summary for admin UI — no secrets. Video Agent ≈ $2/min ($0.0333/sec). */
export async function getHeygenWalletSummary() {
  const [me, quota] = await Promise.all([
    heygenFetch("/v3/users/me"),
    heygenFetch("/v2/user/remaining_quota"),
  ]);
  const wallet = me?.data?.wallet;
  const usage = me?.data?.usage_based;
  const remainingBalanceUsd =
    wallet?.remaining_balance != null
      ? Number(wallet.remaining_balance)
      : usage?.remaining_credits != null
        ? Number(usage.remaining_credits)
        : null;
  return {
    billingType: me?.data?.billing_type ?? null,
    remainingBalanceUsd: Number.isFinite(remainingBalanceUsd) ? remainingBalanceUsd : null,
    remainingQuota: quota?.data?.remaining_quota ?? null,
    usdPerMinuteEstimate: 2,
  };
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
