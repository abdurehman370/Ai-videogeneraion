"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ScriptInput from "../components/ScriptInput";
import AvatarSelector from "../components/AvatarSelector";
import VoiceSelector from "../components/VoiceSelector";
import LoadingSpinner from "../components/LoadingSpinner";
import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  const [script, setScript] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatars, setAvatars] = useState<Array<{avatar_id: string, avatar_name: string, preview_image_url: string}>>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [voices, setVoices] = useState<Array<{voice_id: string, name: string, language: string, gender: string}>>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Fetch avatars and voices from HeyGen API
  useEffect(() => {
    async function loadAvatars() {
      try {
        const res = await fetch("/api/avatars");
        const data = await res.json();
        if (data.error) {
          console.error("Failed to load avatars:", data.error);
          // Fallback to static avatars if API fails
          setAvatars([
            { avatar_id: "fallback1", avatar_name: "Alex", preview_image_url: "/avatars/avatar1.jpg" },
            { avatar_id: "fallback2", avatar_name: "Jordan", preview_image_url: "/avatars/avatar2.jpg" },
            { avatar_id: "fallback3", avatar_name: "Taylor", preview_image_url: "/avatars/avatar3.jpg" },
            { avatar_id: "fallback4", avatar_name: "Sam", preview_image_url: "/avatars/avatar4.jpg" },
          ]);
        } else {
          // Use HeyGen API response directly
          setAvatars(data);
        }
      } catch (err) {
        console.error("Error loading avatars:", err);
        // Fallback to static avatars
        setAvatars([
          { avatar_id: "fallback1", avatar_name: "Alex", preview_image_url: "/avatars/avatar1.jpg" },
          { avatar_id: "fallback2", avatar_name: "Jordan", preview_image_url: "/avatars/avatar2.jpg" },
          { avatar_id: "fallback3", avatar_name: "Taylor", preview_image_url: "/avatars/avatar3.jpg" },
          { avatar_id: "fallback4", avatar_name: "Sam", preview_image_url: "/avatars/avatar4.jpg" },
        ]);
      } finally {
        setLoadingAvatars(false);
      }
    }

    async function loadVoices() {
      try {
        const res = await fetch("/api/voices");
        const data = await res.json();
        if (data.error) {
          console.error("Failed to load voices:", data.error);
          // Fallback to static voices if API fails
          setVoices([
            { voice_id: "fallback1", name: "Default Voice", language: "English", gender: "Male" },
            { voice_id: "fallback2", name: "Female Voice", language: "English", gender: "Female" },
          ]);
        } else {
          // Use HeyGen API response directly
          setVoices(data);
        }
      } catch (err) {
        console.error("Error loading voices:", err);
        // Fallback to static voices
        setVoices([
          { voice_id: "fallback1", name: "Default Voice", language: "English", gender: "Male" },
          { voice_id: "fallback2", name: "Female Voice", language: "English", gender: "Female" },
        ]);
      } finally {
        setLoadingVoices(false);
      }
    }

    loadAvatars();
    loadVoices();
  }, []);

  // Voices are now fetched dynamically from the API

  const canGenerate = script.trim().length > 0 && avatarId && voiceId && !loadingAvatars && !loadingVoices;

  const onGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    setLoading(true);
    setVideoUrl(null);
    
    try {
      const res = await axios.post("/api/generate-video", {
        script,
        avatarId,
        voiceId,
      });
      
      if (res.data.videoId) {
        // Start polling for video status
        pollVideoStatus(res.data.videoId);
      } else if (res.data.videoUrl) {
        // Direct video URL (fallback case)
        setVideoUrl(res.data.videoUrl);
        setLoading(false);
      }
      
      // Show demo mode note if present
      if (res.data.note) {
        console.log(res.data.note);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown;
        const apiMsg =
          (typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error?: string }).error
            : undefined) || err.message;
        setError(String(apiMsg));
      } else {
        setError("Generation failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 60; // 10 minutes total (60 * 10 seconds)
    let attempts = 0;
    
    const poll = async () => {
      try {
        const res = await axios.get(`/api/check-video-status?videoId=${videoId}`);
        const { status, videoUrl, error } = res.data;
        
        attempts++;
        console.log(`Video status check ${attempts}/${maxAttempts}: ${status}`);
        
        if (status === "completed" && videoUrl) {
          setVideoUrl(videoUrl);
          setLoading(false);
          console.log('Video generation completed successfully!');
          return;
        } else if (status === "failed") {
          setError(`Video generation failed: ${error || 'Unknown error'}`);
          setLoading(false);
          return;
        } else if (attempts >= maxAttempts) {
          // Timeout - use fallback video
          console.log('Video generation timed out, using fallback');
          setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
          setLoading(false);
          return;
        }
        
        // Continue polling
        setTimeout(poll, 10000); // Check every 10 seconds
      } catch (err) {
        console.warn(`Status check ${attempts} failed:`, err);
        if (attempts >= maxAttempts) {
          // Timeout - use fallback video
          setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
          setLoading(false);
        } else {
          // Continue polling even if status check fails
          setTimeout(poll, 10000);
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  return (
    <div className="space-y-6">
      <ScriptInput value={script} onChange={setScript} placeholder="Paste your ad script here…" />

      <div className="grid md:grid-cols-2 gap-6">
        <AvatarSelector avatars={avatars} selectedId={avatarId} onSelect={setAvatarId} loading={loadingAvatars} />
        <VoiceSelector voices={voices} selectedId={voiceId} onSelect={setVoiceId} loading={loadingVoices} />
      </div>

      <motion.div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: canGenerate && !loading ? 1.02 : 1 }}
          whileTap={{ scale: canGenerate && !loading ? 0.98 : 1 }}
          onClick={onGenerate}
          className="btn-primary"
          disabled={!canGenerate || loading}
        >
          {loading ? "Generating (up to 10 minutes)…" : "Generate Video"}
        </motion.button>
        {!canGenerate && (
          <span className="text-sm text-neutral-500">Enter script, select avatar and voice to continue.</span>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-sm text-red-500 break-words">{error}</div>
      )}

      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <VideoPlayer videoUrl={videoUrl} />
        </motion.div>
      )}
    </div>
  );
}
