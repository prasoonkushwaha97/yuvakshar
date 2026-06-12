"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";

const RECENT_SEARCHES_KEY = "yuvakshar_recent_searches";

const trendingTopics = [
  "नई शिक्षा नीति", "जलवायु परिवर्तन", "भारतीय साहित्य", "युवा उद्यमी",
  "डिजिटल इंडिया", "महिला सशक्तिकरण", "UPSC तैयारी", "कविता संग्रह"
];

const quickCategories = [
  { label: "📰 समाचार", href: "/category/news" },
  { label: "💬 विचार", href: "/category/opinion" },
  { label: "✍️ साहित्य", href: "/category/literature" },
  { label: "🎓 शिक्षा", href: "/category/education" },
  { label: "📖 पत्रिका", href: "/magazine" },
  { label: "🎬 वीडियो", href: "/category/video" },
];

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const { articles } = useCms();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
    } else {
      setQuery("");
      setSuggestions([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const q = query.trim().toLowerCase();
      const matches = articles
        .filter(a => a.title?.toLowerCase().includes(q))
        .slice(0, 5)
        .map(a => a.title);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [query, articles]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    // Save to recent
    const updated = [term, ...recentSearches.filter(r => r !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="lg:hidden fixed inset-0 z-[60] bg-white dark:bg-[#0A0F1D] flex flex-col"
        >
          {/* Header with search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 pt-safe">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) handleSearch(query.trim());
                  if (e.key === "Escape") onClose();
                }}
                placeholder="युवाक्षर में खोजें..."
                className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={onClose}
              className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results / Suggestions */}
          <div className="flex-grow overflow-y-auto">
            {suggestions.length > 0 && (
              <div className="px-4 pt-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">सुझाव</p>
                <div className="space-y-0.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-colors"
                    >
                      <Search className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="truncate">{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length < 2 && (
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">हाल की खोज</p>
                  <button onClick={clearRecent} className="text-[10px] text-primary font-bold">साफ़ करें</button>
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-colors"
                    >
                      <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="truncate">{s}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {query.length < 2 && (
              <div className="px-4 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ट्रेंडिंग विषय</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(topic)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Categories */}
            {query.length < 2 && (
              <div className="px-4 pt-6 pb-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">श्रेणियाँ</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickCategories.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex items-center justify-center text-center py-3 px-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all min-h-[52px]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
