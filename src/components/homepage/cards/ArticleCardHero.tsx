"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";
import { getArticleUrl } from "@/utils/routes";
import { getArticleImage, handleImageError } from "@/utils/imageHelper";

interface ArticleCardHeroProps {
  article: any;
}

export default function ArticleCardHero({ article }: ArticleCardHeroProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const summary = stripMarkdown(article.summary || article.summary_hi || article.content || "");
  const imageUrl = getArticleImage(article);

  return (
    <div className="group flex flex-col w-full h-full bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-800/50 hover:border-[#f97316]/30 dark:hover:border-[#f97316]/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* 1. Cover Image */}
      <Link href={getArticleUrl(article)} className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/50 shrink-0">
        <Image src={imageUrl} alt={title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out" loading="eager" fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" />
        <div className="absolute top-4 left-4 z-10">
          <CategoryBadge category={article.category || "समाचार"} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
      </Link>

      {/* 2. Text Content */}
      <div className="flex-1 flex flex-col p-6 sm:p-7">
        <Link href={getArticleUrl(article)} className="block">
          <h1 className="text-2xl md:text-3xl font-black font-serif leading-[1.5] text-slate-900 dark:text-zinc-100 mb-3 tracking-tight">
            {title}
          </h1>
        </Link>

        <p className="text-slate-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed mb-6 font-serif line-clamp-3">
          {summary}
        </p>

        <MetaInfo
          articleId={article.id}
          slug={article.slug}
          author={article.profiles?.name || article.author || "युवाक्षर डेस्क"}
          authorProfile={article.profiles || article.authorProfile}
          date={article.date || ""}
          title={title}
          showActions={true}
        />
      </div>
    </div>
  );
}
