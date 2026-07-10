import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, MoreHorizontal } from "lucide-react";
import { getArticleUrl } from "@/utils/routes";

interface ProfileArticleCardProps {
  article: any;
}

export default function ProfileArticleCard({ article }: ProfileArticleCardProps) {
  const coverImage = article.cover_image || article.coverImage || article.featured_image || article.image || "/images/placeholder-news.jpg";

  return (
    <div className="group flex flex-col sm:flex-row gap-6 sm:gap-8 py-8 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-[#0F172A]/30 transition-colors rounded-2xl sm:-mx-6 sm:px-6">
      
      {/* Content Right/Left flow (Image on left for Desktop) */}
      <Link href={getArticleUrl(article)} className="block w-full sm:w-[240px] md:w-[280px] h-[160px] shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
        <Image 
          src={coverImage} 
          alt={article.title || "Article"} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, 280px"
          unoptimized={coverImage.includes('supabase')}
        />
      </Link>

      <div className="flex flex-col justify-center flex-grow space-y-3 font-serif min-w-0">
        
        {/* Category */}
        <div className="flex items-center text-xs font-sans text-slate-500 dark:text-slate-400">
          <span className="text-[#F97316] font-bold tracking-wide uppercase">{article.category}</span>
        </div>

        {/* Title */}
        <Link href={getArticleUrl(article)} className="block">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#F97316] transition-colors line-clamp-2">
            {article.title}
          </h2>
        </Link>

        {/* Summary */}
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-2">
          {article.summary}
        </p>

        {/* Meta / Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex-1 min-w-0 pr-4">
            <span className="text-xs font-sans font-medium text-slate-400 dark:text-slate-500">
              {new Date(article.date).toLocaleDateString("hi-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white" title="बुकमार्क">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white" title="अधिक">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
