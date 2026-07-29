"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";
import { getArticleUrl } from "@/utils/routes";

interface ArticleCardLargeProps {
  article: any;
}

export default function ArticleCardLarge({ article }: ArticleCardLargeProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const summary = stripMarkdown(article.summary || article.summary_hi || article.content || "");
  const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col w-full h-full bg-white dark:bg-zinc-900/40 rounded-2xl p-3 border border-slate-200/60 dark:border-zinc-800/50 hover:border-[#f97316]/30 dark:hover:border-[#f97316]/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      {/* Image Block */}
      <Link href={getArticleUrl(article)} className="block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 shrink-0">
        <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out" loading="lazy" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px" />
        <div className="absolute top-3 left-3 z-10">
          <CategoryBadge category={article.category} />
        </div>
      </Link>

      {/* Content Block */}
      <div className="flex-1 flex flex-col pt-3.5">
        <Link href={getArticleUrl(article)} className="block min-h-0">
          <h3 className="text-xl md:text-2xl font-bold font-serif leading-[1.5] text-slate-900 dark:text-zinc-100 mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="text-slate-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed mb-4 font-serif line-clamp-3">
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
