"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Header component with app branding and dark mode toggle.
 * Uses Tailwind for styling and Framer Motion for subtle interactions.
 */
export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored ? stored === "dark" : prefersDark;
    setIsDark(shouldDark);
    root.classList.toggle("dark", shouldDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="border-b border-neutral-200/60 dark:border-neutral-800/60">
      <div className="container-max flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand to-brand-dark" />
          <span className="text-lg font-semibold">AdGen Studio</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={toggleTheme}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm bg-white/70 dark:bg-neutral-900/70"
          aria-label="Toggle theme"
        >
          {isDark ? "Light" : "Dark"} mode
        </motion.button>
      </div>
    </header>
  );
}
