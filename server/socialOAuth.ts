import fs from "fs";
import path from "path";
import { Readable } from "stream";

export type SocialProvider = "youtube" | "pinterest";

function baseUrlFromEnv(reqHost?: string, protocol?: string): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  if (reqHost) return `${protocol || "http"}://${reqHost}`;
  return "http://localhost:5000";
}

export function youtubeConfigured(): boolean {
  return !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET);
}

export function pinterestConfigured(): boolean {
  return !!(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET);
}

export function getYouTubeAuthUrl(state: string, reqHost?: string, protocol?: string): string {
  const redirect =
    process.env.YOUTUBE_REDIRECT_URI ||
    `${baseUrlFromEnv(reqHost, protocol)}/api/admin/youtube/callback`;
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: redirect,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function getPinterestAuthUrl(state: string, reqHost?: string, protocol?: string): string {
  const redirect =
    process.env.PINTEREST_REDIRECT_URI ||
    `${baseUrlFromEnv(reqHost, protocol)}/api/admin/pinterest/callback`;
  const params = new URLSearchParams({
    client_id: process.env.PINTEREST_APP_ID!,
    redirect_uri: redirect,
    response_type: "code",
    scope: ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"].join(","),
    state,
  });
  return `https://www.pinterest.com/oauth/?${params}`;
}

export async function exchangeYouTubeCode(
  code: string,
  reqHost?: string,
  protocol?: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number; token_type?: string }> {
  const redirect =
    process.env.YOUTUBE_REDIRECT_URI ||
    `${baseUrlFromEnv(reqHost, protocol)}/api/admin/youtube/callback`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "YouTube token exchange failed");
  return data;
}

export async function refreshYouTubeToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "YouTube refresh failed");
  return data;
}

export async function exchangePinterestCode(
  code: string,
  reqHost?: string,
  protocol?: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const redirect =
    process.env.PINTEREST_REDIRECT_URI ||
    `${baseUrlFromEnv(reqHost, protocol)}/api/admin/pinterest/callback`;
  const basic = Buffer.from(
    `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirect,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Pinterest token exchange failed");
  return data;
}

export async function refreshPinterestToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const basic = Buffer.from(
    `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Pinterest refresh failed");
  return data;
}

export async function getYouTubeChannel(accessToken: string): Promise<{ id?: string; title?: string }> {
  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  const ch = data.items?.[0];
  return { id: ch?.id, title: ch?.snippet?.title };
}

export async function getPinterestUser(accessToken: string): Promise<{ username?: string; id?: string }> {
  const res = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load Pinterest user");
  return { username: data.username, id: data.id };
}

export async function listPinterestBoards(accessToken: string): Promise<any[]> {
  const res = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to list boards");
  return data.items || [];
}

async function resolveLocalVideoPath(videoUrl: string): Promise<{ filePath?: string; buffer?: Buffer; contentType: string }> {
  if (videoUrl.includes("/uploads/")) {
    const filename = videoUrl.split("/uploads/").pop()?.split("?")[0];
    if (filename) {
      const filePath = path.join(process.cwd(), "server", "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        return { filePath, contentType: "video/mp4" };
      }
    }
  }
  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error("Could not download video for upload");
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "video/mp4";
  return { buffer, contentType };
}

/** Upload a video to YouTube via resumable upload. */
export async function uploadYouTubeVideo(opts: {
  accessToken: string;
  videoUrl: string;
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "private" | "unlisted" | "public";
  categoryId?: string;
}): Promise<{ id: string; url: string }> {
  const meta = {
    snippet: {
      title: opts.title.slice(0, 100),
      description: (opts.description || "").slice(0, 5000),
      tags: opts.tags || [],
      categoryId: opts.categoryId || "22",
    },
    status: {
      privacyStatus: opts.privacyStatus || "private",
      selfDeclaredMadeForKids: false,
    },
  };

  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/*",
      },
      body: JSON.stringify(meta),
    }
  );
  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`YouTube init upload failed: ${err}`);
  }
  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return upload URL");

  const media = await resolveLocalVideoPath(opts.videoUrl);
  let body: any;
  let size: number;
  if (media.filePath) {
    size = fs.statSync(media.filePath).size;
    body = fs.createReadStream(media.filePath);
  } else {
    size = media.buffer!.length;
    body = Readable.from(media.buffer!);
  }

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": media.contentType,
      "Content-Length": String(size),
    },
    // @ts-expect-error Node fetch accepts streams
    body,
    duplex: "half",
  } as any);

  const result = await putRes.json();
  if (!putRes.ok) {
    throw new Error(result.error?.message || JSON.stringify(result));
  }
  return {
    id: result.id,
    url: `https://www.youtube.com/watch?v=${result.id}`,
  };
}

export async function createPinterestImagePin(opts: {
  accessToken: string;
  boardId: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl: string;
}): Promise<{ id: string; url: string }> {
  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: opts.boardId,
      title: opts.title.slice(0, 100),
      description: (opts.description || "").slice(0, 500),
      link: opts.link || "https://linksshrink.com",
      media_source: {
        source_type: "image_url",
        url: opts.imageUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return {
    id: data.id,
    url: `https://www.pinterest.com/pin/${data.id}`,
  };
}

export async function createPinterestVideoPin(opts: {
  accessToken: string;
  boardId: string;
  title: string;
  description?: string;
  link?: string;
  videoUrl: string;
  coverImageUrl?: string;
}): Promise<{ id: string; url: string }> {
  const register = await fetch("https://api.pinterest.com/v5/media", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ media_type: "video" }),
  });
  const regData = await register.json();
  if (!register.ok) throw new Error(regData.message || "Pinterest media register failed");

  const { media_id, upload_url, upload_parameters } = regData;
  const media = await resolveLocalVideoPath(opts.videoUrl);

  const form = new FormData();
  for (const [k, v] of Object.entries(upload_parameters || {})) {
    form.append(k, String(v));
  }
  if (media.filePath) {
    const buf = fs.readFileSync(media.filePath);
    form.append("file", new Blob([buf], { type: "video/mp4" }), path.basename(media.filePath));
  } else {
    form.append("file", new Blob([media.buffer!], { type: media.contentType }), "video.mp4");
  }

  const uploadRes = await fetch(upload_url, { method: "POST", body: form });
  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    throw new Error(`Pinterest S3 upload failed: ${t}`);
  }

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await fetch(`https://api.pinterest.com/v5/media/${media_id}`, {
      headers: { Authorization: `Bearer ${opts.accessToken}` },
    });
    const stData = await st.json();
    if (stData.status === "succeeded") break;
    if (stData.status === "failed") throw new Error("Pinterest media processing failed");
    if (i === 29) throw new Error("Timed out waiting for Pinterest media processing");
  }

  const pinBody: any = {
    board_id: opts.boardId,
    title: opts.title.slice(0, 100),
    description: (opts.description || "").slice(0, 500),
    link: opts.link || "https://www.pinterest.com/morris_damond/",
    media_source: {
      source_type: "video_id",
      media_id,
    },
  };
  if (opts.coverImageUrl) {
    pinBody.media_source.cover_image_url = opts.coverImageUrl;
  }

  const pinRes = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pinBody),
  });
  const pinData = await pinRes.json();
  if (!pinRes.ok) throw new Error(pinData.message || JSON.stringify(pinData));
  return {
    id: pinData.id,
    url: `https://www.pinterest.com/pin/${pinData.id}`,
  };
}
