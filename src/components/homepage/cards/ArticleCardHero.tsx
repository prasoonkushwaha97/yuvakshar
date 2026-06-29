"use client";

import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";

interface ArticleCardHeroProps {
  article: any;
}

export default function ArticleCardHero({ article }: ArticleCardHeroProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || "");
  const summary = stripMarkdown(article.summary || article.content || "");
  const imageUrl = article.coverImage || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col w-full h-full bg-white dark:bg-[#0A0A0A] rounded-lg overflow-hidden border border-gray-150 dark:border-gray-850 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.08)] transition-all duration-500">
      {/* 1. Large Cover Image */}
      <Link href={`/editorial?id=${article.id}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850 shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
          loading="eager"
        />
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4 z-10">
          <CategoryBadge category={article.category || "समाचार"} />
        </div>
        {/* Subtle bottom shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
      </Link>

      {/* 2. Text Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Headline */}
        <Link href={`/editorial?id=${article.id}`} className="block group-hover:text-[#f97316] transition-colors duration-300">
          <h1 className="text-2xl md:text-3xl font-black font-serif leading-[1.25] text-gray-900 dark:text-gray-150 mb-3 tracking-tight">
            {title}
          </h1>
        </Link>

        {/* Summary Description */}
        <p className="text-gray-650 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-6 font-serif line-clamp-3">
          {summary}
        </p>

        {/* Metadata section */}
        <MetaInfo
          articleId={article.id}
          author={article.author || "युवाक्षर डेस्क"}
          date={article.date || ""}
          readTime={article.readTime}
          views={article.views}
          title={title}
          showActions={true}
        />
      </div>
    </div>
  );
}
