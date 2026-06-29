"use client";

import React from "react";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { ArrowRight, Clock, Calendar } from "lucide-react";

export default function Hero() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Main Cover Hero Story
  const heroStory = published.find((a: any) => a.hero || a.isFeatured) || published[0];

  const title = stripMarkdown(heroStory.title || heroStory.title_hi || "");
  const summary = stripMarkdown(heroStory.summary || heroStory.summary_hi || heroStory.content || "");
  const imageUrl = heroStory.coverImage || heroStory.cover_image || heroStory.image || "/images/placeholder-news.jpg";

  const dateStr = heroStory.published_at 
    ? new Date(heroStory.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
    : heroStory.created_at
      ? new Date(heroStory.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })
      : "";

  const readTimeVal = heroStory.content
    ? Math.max(1, Math.ceil(heroStory.content.split(/\s+/).length / 150))
    : 3;

  return (
    <div className="max-w-[1100px] mx-auto w-full">
      <div className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white dark:bg-[#0E1322] rounded-xl overflow-hidden border border-gray-150 dark:border-gray-850 shadow-sm hover:shadow-md hover:border-[#f97316]/30 transition-all duration-300">
        
        {/* LEFT COLUMN: HERO IMAGE (7 cols desktop) */}
        <Link 
          href={`/articles/${heroStory.slug || heroStory.id}`} 
          className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-[480px] w-full overflow-hidden bg-gray-50 dark:bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-150 dark:border-gray-850"
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            loading="eager"
          />
          {/* Saffron Category Badge Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#f97316] text-white text-[10px] font-sans font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {heroStory.category || "समाचार"}
            </span>
          </div>
          {/* Elegant bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
        </Link>

        {/* RIGHT COLUMN: HERO CONTENT (5 cols desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-center p-6 md:p-8 lg:p-10">
          
          {/* Metadata Row */}
          <div className="flex items-center space-x-3 text-[10px] font-sans font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTimeVal} मिनट पठन</span>
            </span>
          </div>

          {/* Headline */}
          <Link href={`/articles/${heroStory.slug || heroStory.id}`} className="block hover:text-[#f97316] transition-colors duration-300">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black font-serif leading-tight text-gray-900 dark:text-white mb-4 tracking-tight">
              {title}
            </h1>
          </Link>

          {/* Short Description */}
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed mb-6 font-serif line-clamp-4">
            {summary}
          </p>

          {/* Author info & Call to Action */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-450 uppercase tracking-wider block font-sans">लेखक</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {heroStory.author || "युवाक्षर डेस्क"}
              </span>
            </div>

            <Link 
              href={`/articles/${heroStory.slug || heroStory.id}`}
              className="inline-flex items-center space-x-1 text-xs font-black font-sans text-[#f97316] hover:text-[#ea580c] transition-colors group/btn"
            >
              <span>{locale === "hi" ? "आगे पढ़ें" : "Read More"}</span>
              <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
