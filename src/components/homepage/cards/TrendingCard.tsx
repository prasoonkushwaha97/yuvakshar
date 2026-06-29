"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/store/LanguageContext";

interface TrendingCardProps {
  topic: {
    name: string;
    englishName: string;
    count: number;
    icon?: string;
  };
}

export default function TrendingCard({ topic }: TrendingCardProps) {
  const { locale } = useLanguage();
  if (!topic) return null;

  const displayTitle = locale === "hi" ? topic.name : topic.englishName;

  return (
    <Link
      href={`/category/${encodeURIComponent(topic.name)}`}
      className="group flex flex-col justify-between bg-[#FAFAF9] dark:bg-[#121212] border border-gray-200/80 dark:border-gray-850 p-4 rounded-lg min-w-[150px] md:min-w-[170px] hover:border-[#f97316] hover:shadow-[0_4px_12px_-4px_rgba(249,115,22,0.15)] transition-all duration-300 select-none"
    >
      <div className="text-xl md:text-2xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
        {topic.icon || "🔥"}
      </div>
      <div>
        <h5 className="font-serif font-black text-xs md:text-sm text-gray-800 dark:text-gray-250 truncate mb-1">
          {displayTitle}
        </h5>
        <span className="text-[9.5px] font-sans font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {topic.count} {locale === "hi" ? "आर्टिकल्स" : "articles"}
        </span>
      </div>
    </Link>
  );
}
