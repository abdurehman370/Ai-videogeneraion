"use client";

import { motion } from "framer-motion";

/**
 * LoadingSpinner: Animated indicator shown while generating video.
 */
export default function LoadingSpinner({ label = "Generating your ad…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative h-10 w-10">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
        />
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{label}</p>
    </div>
  );
}
