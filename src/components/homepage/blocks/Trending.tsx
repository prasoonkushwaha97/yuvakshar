"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import TrendingCard from "../cards/TrendingCard";

const TOPICS = [
  { name: "राजनीति", englishName: "Politics", icon: "🗳️" },
  { name: "पर्यावरण", englishName: "Environment", icon: "🌿" },
  { name: "शिक्षा", englishName: "Education", icon: "🎓" },
  { name: "विज्ञान", englishName: "Science", icon: "🔬" },
  { name: "इतिहास", englishName: "History", icon: "📜" },
  { name: "तकनीक", englishName: "Technology", icon: "💻" },
  { name: "साहित्य", englishName: "Literature", icon: "✍️" },
  { name: "संस्कृति", englishName: "Culture", icon: "🏛️" }
];

export default function Trending() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const trendingTopics = TOPICS.map((topic) => {
    const count = articles.filter(
      (a: any) => a.category?.trim().toLowerCase() === topic.name.toLowerCase() ||
                  a.category?.trim().toLowerCase() === topic.englishName.toLowerCase()
    ).length;

    // Fallback to mock count if no articles are matching
    return {
      ...topic,
      count: count > 0 ? count : Math.floor(Math.random() * 8) + 3
    };
  });

  return (
    <div className="w-full py-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="w-1 bg-[#f97316] h-4 rounded-sm" />
        <h4 className="font-serif font-black text-xs md:text-sm text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {locale === "hi" ? "चर्चित विषय" : "Trending Topics"}
        </h4>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
        {trendingTopics.map((topic) => (
          <TrendingCard key={topic.name} topic={topic} />
        ))}
      </div>
    </div>
  );
}
