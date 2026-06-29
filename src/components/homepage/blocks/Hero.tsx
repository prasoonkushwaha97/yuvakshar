"use client";

import React from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import ArticleCardHero from "../cards/ArticleCardHero";
import ArticleCardMedium from "../cards/ArticleCardMedium";
import ArticleCardSmall from "../cards/ArticleCardSmall";
import { stripMarkdown } from "@/lib/markdown";
import Link from "next/link";

export default function Hero() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Fallback Logic mapping
  // 1. Center Hero Story
  const heroStory = published.find((a: any) => a.hero || a.isFeatured) || published[0];

  // Remaining articles excluding the main hero
  const remaining = published.filter((a: any) => a.id !== heroStory.id);

  // 2. Left Timeline: 10 latest articles
  const timelineStories = remaining.slice(0, 10);

  // 3. Center Secondary Featured: 2 stories
  const secondaryFeatured = remaining.slice(10, 12).length >= 2 
    ? remaining.slice(10, 12) 
    : remaining.slice(0, 2);

  // 4. Right Editor's Picks: 4 stories
  let editorsPicks = published.filter((a: any) => a.editors_pick || a.recommended);
  if (editorsPicks.length === 0) {
    editorsPicks = remaining.slice(2, 6);
  } else {
    editorsPicks = editorsPicks.slice(0, 4);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full py-6">
      
      {/* COLUMN 1: LEFT TIMELINE (3 cols) */}
      <div className="lg:col-span-3 border-r-0 lg:border-r border-gray-150 dark:border-gray-850 pr-0 lg:pr-6">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-900 dark:border-gray-800 pb-2">
          <h3 className="font-serif font-black text-sm uppercase tracking-tight text-gray-900 dark:text-gray-200">
            {locale === "hi" ? "ताजा घटनाक्रम" : "Latest Updates"}
          </h3>
          <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
        </div>
        <div className="flex flex-col">
          {timelineStories.map((art: any, index: number) => {
            const cleanTitle = stripMarkdown(art.title);
            const timeStr = art.date ? art.date.split(",")[1]?.trim().substring(0, 5) || "09:30" : "09:30";
            return (
              <div key={art.id} className="group py-3 border-b border-gray-100 dark:border-gray-850 last:border-0">
                <div className="flex items-center space-x-2 text-[9px] uppercase tracking-wider font-extrabold text-[#f97316] mb-1">
                  <span>{timeStr}</span>
                  <span className="text-gray-300">•</span>
                  <span>{art.category}</span>
                </div>
                <Link href={`/articles/${art.slug || art.id}`} className="block group-hover:text-[#f97316] transition-colors">
                  <h4 className="font-serif font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                    {cleanTitle}
                  </h4>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: CENTER FEATURED & SECONDARY STORIES (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Main Hero Card */}
        <ArticleCardHero article={heroStory} />

        {/* 2 Secondary Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {secondaryFeatured.map((art: any) => (
            <ArticleCardMedium key={art.id} article={art} showImage={true} />
          ))}
        </div>
      </div>

      {/* COLUMN 3: RIGHT EDITOR'S PICKS (3 cols) */}
      <div className="lg:col-span-3 border-l-0 lg:border-l border-gray-150 dark:border-gray-850 pl-0 lg:pl-6">
        <div className="flex items-center space-x-2 mb-4 border-b-2 border-gray-900 dark:border-gray-800 pb-2">
          <h3 className="font-serif font-black text-sm uppercase tracking-tight text-gray-900 dark:text-gray-200">
            {locale === "hi" ? "संपादकीय चयन" : "Editor's Picks"}
          </h3>
        </div>
        <div className="flex flex-col">
          {editorsPicks.map((art: any, idx: number) => (
            <ArticleCardSmall 
              key={art.id} 
              article={art} 
              showThumbnail={true} 
              indexNumber={idx + 1} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}
