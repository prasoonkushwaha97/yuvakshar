import React from "react";
import Image from "next/image";
import { stripMarkdown } from "@/lib/markdown";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import MetaInfo from "@/components/homepage/shared/MetaInfo";
import ArticleActions from "@/components/articles/ArticleActions";
import CommentSection from "@/components/articles/CommentSection";
import { Article } from "@/types/content";

interface ArticleContentProps {
  article: Article;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const title = stripMarkdown(article?.title_hi || "");

  return (
    <div className="w-full max-w-[720px] mx-auto pt-8 md:pt-12 px-4 md:px-0">
      {/* Editorial Column */}
      <article className="w-full">
        {/* Category Tag */}
        {article?.categories && (
          <div className="mb-4 md:mb-5">
            <span className="text-[#f97316] font-sans font-black uppercase tracking-wider text-[11px] md:text-xs">
              {article.categories.name_hi || ""}
            </span>
          </div>
        )}

        {/* Article Main Headline */}
        <h1 className="font-serif font-black text-[32px] md:text-[46px] md:leading-[1.15] text-gray-900 dark:text-white leading-tight mb-4 md:mb-6 tracking-tight">
          {title}
        </h1>

        {/* Article Short Summary */}
        {article?.summary_hi && (
          <p className="text-[18px] md:text-[22px] text-gray-600 dark:text-gray-400 font-serif leading-[1.6] md:leading-[1.7] mb-6 md:mb-8">
            {stripMarkdown(article.summary_hi)}
          </p>
        )}

        {/* Unified Editorial Metadata */}
        <div className="border-y border-gray-200 dark:border-gray-800 py-3 md:py-4 mb-8 md:mb-10">
          <MetaInfo
            articleId={article.id}
            slug={article.slug}
            author={article.profiles?.name || "युवाक्षर डेस्क"}
            authorProfile={article.profiles}
            date={article.published_at || article.created_at || ""}
            showActions={false}
          />
        </div>

        {/* Cover Image — Full bleed relative to text container */}
        {article?.cover_image && (
          <div className="relative overflow-hidden mb-10 md:mb-12 aspect-[16/9] bg-gray-100 dark:bg-gray-900 -mx-4 md:mx-0">
            <Image 
              src={article.cover_image} 
              alt={title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Main Content Body */}
        <div className="font-serif leading-[1.7] md:leading-[1.8] text-[18px] md:text-[20px] text-gray-800 dark:text-gray-200">
          <ContentRenderer content={article?.content || ""} />
        </div>

        {/* Bottom metadata and actions */}
        <div className="mt-12 md:mt-16 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-sans">
          <div className="flex flex-wrap gap-2">
            {article?.tags?.slice(0, 3)?.map((tag: string) => (
              <span key={tag} className="uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                #{tag}
              </span>
            ))}
          </div>

          <ArticleActions articleId={article.id} slug={article.slug} title={title} />
        </div>

        {/* Comment Section */}
        <div className="mt-12">
          <CommentSection articleId={article.id} />
        </div>
        
      </article>
    </div>
  );
}
