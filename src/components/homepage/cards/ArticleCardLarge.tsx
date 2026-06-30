"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { stripMarkdown } from "@/lib/markdown";
import CategoryBadge from "../shared/CategoryBadge";
import MetaInfo from "../shared/MetaInfo";

interface ArticleCardLargeProps {
  article: any;
}

export default function ArticleCardLarge({ article }: ArticleCardLargeProps) {
  if (!article) return null;

  const title = stripMarkdown(article.title || article.title_hi || "");
  const summary = stripMarkdown(article.summary || article.summary_hi || article.content || "");
  const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col w-full h-full bg-transparent rounded-none overflow-hidden border-b border-stone-200 dark:border-stone-800 pb-4 transition-all duration-300">
      {/* Image Block */}
      <Link href={`/articles/${article.slug || article.id}`} className="block relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0">
        <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }} loading="lazy" fill />
        <div className="absolute top-3 left-3 z-10">
          <CategoryBadge category={article.category} />
        </div>
      </Link>

      {/* Content Block */}
      <div className="flex-1 flex flex-col py-4 px-1">
        <Link href={`/articles/${article.slug || article.id}`} className="block group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors duration-200">
          <h3 className="text-xl md:text-2xl font-semibold font-serif leading-[1.3] text-stone-900 dark:text-stone-100 mb-2.5 line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed mb-5 font-serif line-clamp-3">
          {summary}
        </p>

        <MetaInfo
          articleId={article.id}
          slug={article.slug}
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
