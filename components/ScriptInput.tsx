"use client";

import { motion } from "framer-motion";
import { TextareaHTMLAttributes } from "react";

/**
 * ScriptInput: Large textarea for user to paste or type the ad script.
 */
export default function ScriptInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
} & Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder">) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
      <label className="block text-sm font-medium mb-2">Ad Script</label>
      <textarea
        className="input-base min-h-40 resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste your ad script here..."}
      />
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Tip: Keep it concise for the best results (15–45 seconds).</p>
    </motion.div>
  );
}
