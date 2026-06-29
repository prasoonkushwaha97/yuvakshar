"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";

export default function BreakingTicker() {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [isPaused, setIsPaused] = useState(false);

  const breakingStories = articles
    .filter((art: any) => art.status === "Published" || art.status === "Approved" || !art.status)
    .filter((art: any) => art.trending || art.category === "समाचार" || art.breaking)
    .slice(0, 8);

  if (breakingStories.length === 0) return null;

  return (
    <div className="w-full bg-[#f97316] text-white py-2 px-4 flex items-center overflow-hidden z-20 relative select-none font-sans shadow-sm">
      {/* Label Badge */}
      <div className="flex items-center space-x-1.5 bg-black/95 text-white font-extrabold text-[10.5px] tracking-widest uppercase px-3 py-1.5 rounded-sm shrink-0 mr-4 z-10 shadow-sm animate-pulse">
        <Zap className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
        <span>{locale === "hi" ? "ब्रेकिंग न्यूज़" : "Breaking News"}</span>
      </div>

      {/* Marquee Wrapper */}
      <div 
        className="flex-1 overflow-hidden relative h-5 flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex whitespace-nowrap space-x-16 text-xs md:text-sm font-semibold tracking-wide"
          style={{
            animation: "marquee 28s linear infinite",
            animationPlayState: isPaused ? "paused" : "running"
          }}
        >
          {breakingStories.map((story: any) => {
            const cleanTitle = stripMarkdown(story.title || "");
            return (
              <Link 
                key={story.id} 
                href={`/articles/${story.slug || story.id}`}
                className="hover:underline flex items-center space-x-2 shrink-0 text-white hover:text-white/90"
              >
                <span>✦</span>
                <span>{cleanTitle}</span>
              </Link>
            );
          })}
          {/* Duplicate for infinite loop */}
          {breakingStories.map((story: any) => {
            const cleanTitle = stripMarkdown(story.title || "");
            return (
              <Link 
                key={`${story.id}-dup`} 
                href={`/articles/${story.slug || story.id}`}
                className="hover:underline flex items-center space-x-2 shrink-0 text-white hover:text-white/90"
              >
                <span>✦</span>
                <span>{cleanTitle}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
