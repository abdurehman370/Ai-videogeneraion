"use client";

import { motion } from "framer-motion";

/**
 * VoiceSelector: Dropdown with a few sample voice options.
 */
export default function VoiceSelector({
  voices,
  selectedId,
  onSelect,
  loading = false,
}: {
  voices: { voice_id: string; name: string; language: string; gender: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <div className="card p-4">
      <label className="block text-sm font-medium mb-2">Choose a Voice</label>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-neutral-500">Loading voices...</div>
        </div>
      ) : (
        <div className="relative">
          <motion.select
            whileTap={{ scale: 0.99 }}
            className="input-base appearance-none pr-8"
            value={selectedId || ""}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="" disabled>
              Select a voice
            </option>
            {voices.map((v) => (
              <option key={v.voice_id} value={v.voice_id}>
                {v.name} · {v.language} · {v.gender}
              </option>
            ))}
          </motion.select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">▾</span>
        </div>
      )}
    </div>
  );
}
