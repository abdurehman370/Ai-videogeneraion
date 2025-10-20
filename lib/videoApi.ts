import axios from "axios";

/**
 * videoApi helper: handles calling HeyGen (preferred) or returns a mock video URL.
 * In production, provide HEYGEN_API_KEY; otherwise, a fast mock is used.
 */
export async function generateVideoViaProvider(params: {
  script: string;
  avatarId: string;
  voiceId: string;
}): Promise<{ videoUrl: string }>{
  const { script, avatarId, voiceId } = params;
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    };
  }

  const client = axios.create({
    baseURL: "https://api.heygen.com",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 20_000,
  });

  const looksLikeAvatarId = typeof avatarId === "string" && /[A-Za-z0-9_-]{6,}/.test(avatarId);
  const looksLikeVoiceId = typeof voiceId === "string" && /[A-Za-z0-9_-]{6,}/.test(voiceId);

  // Prepare canonical inputs
  const canonicalVideoInputs = [
    {
      type: "avatar",
      // some APIs expect avatar or avatar_id
      avatar: looksLikeAvatarId ? avatarId : undefined,
      avatar_id: looksLikeAvatarId ? avatarId : undefined,
      voice: looksLikeVoiceId ? voiceId : undefined,
      voice_id: looksLikeVoiceId ? voiceId : undefined,
      input_text: script,
      script,
    },
  ];

  const createCandidates: { path: string; body: Record<string, unknown> }[] = [];
  const paths = [
    "/v2/video.create",
    "/v2/video/generate",
    "/v1/video.create",
    "/v1/video/generate",
    "/v1/video/create",
    "/v1/videos",
  ];

  // Bodies covering different key names that HeyGen might require
  const bodies: Record<string, unknown>[] = [
    { video_inputs: canonicalVideoInputs },
    { data: { video_inputs: canonicalVideoInputs } },
    { inputs: canonicalVideoInputs },
    { script, avatar: looksLikeAvatarId ? avatarId : undefined, voice: looksLikeVoiceId ? voiceId : undefined },
    { input_text: script, avatar_id: looksLikeAvatarId ? avatarId : undefined, voice_id: looksLikeVoiceId ? voiceId : undefined },
  ];

  for (const path of paths) {
    for (const body of bodies) {
      createCandidates.push({ path, body });
    }
  }

  try {
    let rawCreate: unknown = null;
    let lastErr: unknown = null;

    for (const candidate of createCandidates) {
      try {
        const res = await client.post(candidate.path, candidate.body);
        rawCreate = res.data as unknown;
        break;
      } catch (err) {
        lastErr = err;
        if (axios.isAxiosError(err) && err.response?.status !== 404 && err.response?.status !== 400) {
          // If not a 404/400, stop trying alternates blindly
          break;
        }
      }
    }

    if (!rawCreate) {
      if (axios.isAxiosError(lastErr)) {
        const status = lastErr.response?.status;
        const data = lastErr.response?.data as unknown;
        throw new Error(`HeyGen create failed (${status}). ${typeof data === "string" ? data : JSON.stringify(data)}`);
      }
      throw new Error("HeyGen create failed: unknown error");
    }

    const videoUrlImmediate =
      typeof rawCreate === "object" && rawCreate !== null && "video_url" in rawCreate && typeof (rawCreate as { video_url?: unknown }).video_url === "string"
        ? (rawCreate as { video_url: string }).video_url
        : typeof rawCreate === "object" && rawCreate !== null && "data" in rawCreate &&
          typeof (rawCreate as { data?: unknown }).data === "object" && (rawCreate as { data: Record<string, unknown> }).data !== null &&
          typeof (rawCreate as { data: { video_url?: unknown } }).data.video_url === "string"
        ? (rawCreate as { data: { video_url: string } }).data.video_url
        : undefined;

    if (videoUrlImmediate) {
      return { videoUrl: videoUrlImmediate };
    }

    const videoId =
      typeof rawCreate === "object" && rawCreate !== null && "video_id" in rawCreate && typeof (rawCreate as { video_id?: unknown }).video_id === "string"
        ? (rawCreate as { video_id: string }).video_id
        : typeof rawCreate === "object" && rawCreate !== null && "id" in rawCreate && typeof (rawCreate as { id?: unknown }).id === "string"
        ? (rawCreate as { id: string }).id
        : typeof rawCreate === "object" && rawCreate !== null && "data" in rawCreate &&
          typeof (rawCreate as { data?: unknown }).data === "object" && (rawCreate as { data: Record<string, unknown> }).data !== null &&
          typeof (rawCreate as { data: { video_id?: unknown } }).data.video_id === "string"
        ? (rawCreate as { data: { video_id: string } }).data.video_id
        : undefined;

    if (!videoId) {
      console.error("HeyGen create response missing url and id", rawCreate);
      throw new Error("Provider did not return video id");
    }

    const deadline = Date.now() + 60_000;
    let delayMs = 1200;

    while (Date.now() < deadline) {
      const statusPaths = [
        `/v1/video.status?video_id=${encodeURIComponent(videoId)}`,
        `/v1/video/status?video_id=${encodeURIComponent(videoId)}`,
        `/v1/video.status/${encodeURIComponent(videoId)}`,
        `/v1/video/status/${encodeURIComponent(videoId)}`,
        `/v2/video/status/${encodeURIComponent(videoId)}`,
        `/v2/videos/${encodeURIComponent(videoId)}`,
      ];

      let statusData: unknown = null;
      for (const path of statusPaths) {
        try {
          const st = await client.get(path);
          statusData = st.data as unknown;
          break;
        } catch {
          // try next endpoint variant
        }
      }

      if (!statusData) break;

      const url =
        typeof statusData === "object" && statusData !== null && "video_url" in statusData && typeof (statusData as { video_url?: unknown }).video_url === "string"
          ? (statusData as { video_url: string }).video_url
          : typeof statusData === "object" && statusData !== null && "data" in statusData &&
            typeof (statusData as { data?: unknown }).data === "object" && (statusData as { data: Record<string, unknown> }).data !== null &&
            typeof (statusData as { data: { video_url?: unknown } }).data.video_url === "string"
          ? (statusData as { data: { video_url: string } }).data.video_url
          : undefined;

      if (url) return { videoUrl: url };

      const stateVal =
        typeof statusData === "object" && statusData !== null && "status" in statusData && typeof (statusData as { status?: unknown }).status === "string"
          ? (statusData as { status: string }).status
          : typeof statusData === "object" && statusData !== null && "data" in statusData &&
            typeof (statusData as { data?: unknown }).data === "object" && (statusData as { data: Record<string, unknown> }).data !== null &&
            typeof (statusData as { data: { status?: unknown } }).data.status === "string"
          ? (statusData as { data: { status: string } }).data.status
          : typeof statusData === "object" && statusData !== null && "state" in statusData && typeof (statusData as { state?: unknown }).state === "string"
          ? (statusData as { state: string }).state
          : undefined;

      if (stateVal && ["completed", "succeeded", "done", "ready"].includes(stateVal.toLowerCase())) {
        const asset =
          typeof statusData === "object" && statusData !== null && "asset_url" in statusData && typeof (statusData as { asset_url?: unknown }).asset_url === "string"
            ? (statusData as { asset_url: string }).asset_url
            : typeof statusData === "object" && statusData !== null && "data" in statusData &&
              typeof (statusData as { data?: unknown }).data === "object" && (statusData as { data: Record<string, unknown> }).data !== null &&
              typeof (statusData as { data: { asset_url?: unknown } }).data.asset_url === "string"
            ? (statusData as { data: { asset_url: string } }).data.asset_url
            : undefined;
        if (asset) return { videoUrl: asset };
      }

      await new Promise((r) => setTimeout(r, delayMs));
      delayMs = Math.min(Math.floor(delayMs * 1.3), 4000);
    }

    console.error("HeyGen polling timed out for video", { createCandidates });
    throw new Error("Timed out waiting for video");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data as unknown;
      console.error("HeyGen API error", status, data);
      const msg = typeof data === "string" ? data : typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "object" && (data as { error: { message?: unknown } }).error?.message
        ? String((data as { error: { message?: unknown } }).error?.message)
        : err.message;
      throw new Error(`HeyGen error ${status ?? ""}: ${msg}`);
    }
    if (err instanceof Error) {
      console.error("HeyGen integration error:", err.message);
      throw err;
    }
    console.error("Unknown HeyGen error", err);
    throw new Error("Unknown provider error");
  }
}
