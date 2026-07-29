"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion } from "framer-motion";

type ThemeOption = "light" | "dark" | "system";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeOption>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme_preference") as ThemeOption) || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (option: ThemeOption) => {
    localStorage.setItem("theme_preference", option);
    if (option === "dark") {
      document.documentElement.classList.add("dark");
    } else if (option === "light") {
      document.documentElement.classList.remove("dark");
    } else if (option === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSelect = (option: ThemeOption) => {
    setTheme(option);
    applyTheme(option);
  };

  if (!mounted) return null;

  const options: { id: ThemeOption; label: string; icon: React.ElementType }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  return (
    <div className="relative flex items-center p-1 bg-slate-100 dark:bg-[#131927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl w-full">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelect(opt.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-colors z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] ${
              isSelected
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="theme-switcher-backdrop"
                className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 z-[-1]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
