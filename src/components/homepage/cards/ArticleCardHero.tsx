"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";
import { getArticleUrl } from "@/utils/routes";

interface ArticleCardHeroProps {
  article: any;
}

export default function ArticleCardHero({ article }: ArticleCardHeroProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const summary = stripMarkdown(article.summary || article.summary_hi || article.content || "");
  const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col w-full h-full bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700/60 hover:shadow-md transition-all duration-300">
      {/* 1. Cover Image */}
      <Link href={getArticleUrl(article)} className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/50 shrink-0">
        <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" loading="eager" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" />
        <div className="absolute top-4 left-4 z-10">
          <CategoryBadge category={article.category || "समाचार"} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
      </Link>

      {/* 2. Text Content */}
      <div className="flex-1 flex flex-col p-6 sm:p-7">
        <Link href={getArticleUrl(article)} className="block group-hover:text-[#F97316] transition-colors duration-300">
          <h1 className="text-2xl md:text-3xl font-black font-serif leading-[1.25] text-slate-900 dark:text-zinc-100 group-hover:text-[#F97316] dark:group-hover:text-[#F97316] mb-3 tracking-tight">
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
