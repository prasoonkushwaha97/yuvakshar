"use client";

import React from "react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";

const DEFAULT_TAGS = ["भारत", "राजनीति", "शिक्षा", "पर्यावरण", "AI", "इतिहास", "मध्यप्रदेश", "संविधान", "विज्ञान", "युवा"];

export default function Trending() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  // Extract dynamic tags from articles
  const dynamicTags = published
    .flatMap((art: any) => art.tags || [])
    .filter(Boolean)
    .map((tag: string) => tag.trim());

  // Deduplicate and merge dynamic tags with default fallback tags
  const uniqueTags = Array.from(new Set([...dynamicTags, ...DEFAULT_TAGS]))
    .slice(0, 10)
    .map(tag => tag.startsWith("#") ? tag : `#${tag}`);

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center justify-start gap-4 h-auto">
      {/* Title block */}
      <div className="flex items-center space-x-2 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-150 dark:border-gray-850 pb-2.5 lg:pb-0 lg:pr-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
        <h4 className="font-serif font-black text-xs md:text-sm text-gray-900 dark:text-gray-250 uppercase tracking-wider">
          {locale === "hi" ? "आज के ट्रेंडिंग विषय" : "Trending Topics Today"}
        </h4>
      </div>

      {/* Responsive wrapping tags list with horizontal scroll */}
      <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {uniqueTags.map((tag) => {
          const query = tag.replace("#", "");
          return (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(query)}`}
              className="px-4 py-1.5 bg-gray-100 hover:bg-[#f97316]/10 hover:text-[#f97316] dark:bg-gray-900 dark:hover:bg-[#f97316]/15 dark:text-gray-350 text-xs font-bold font-sans rounded-full border border-transparent hover:border-[#f97316]/20 transition-all duration-300 whitespace-nowrap shadow-sm cursor-pointer snap-start"
            >
              {tag}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
