"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/content';
import { stripMarkdown } from '@/lib/markdown';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';
import { getArticleImage, handleImageError } from "@/utils/imageHelper";

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-6 border-t border-slate-200 dark:border-slate-800 mt-16 bg-transparent">
      <h3 className="text-[22px] md:text-2xl font-serif font-black mb-8 text-slate-900 dark:text-slate-100 flex items-center gap-2">
        संबंधित लेख
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {articles.slice(0, 8).map(article => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col h-full">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 mb-4 border border-slate-100 dark:border-slate-800">
              <Image 
                src={getArticleImage(article)} 
                alt={article.title_hi || "Article"} 
                fill 
                unoptimized
                onError={handleImageError}
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            
            {article.categories && (
              <span className="text-[#f97316] font-bold text-[10px] md:text-[11px] uppercase tracking-wider mb-2">
                {article.categories.name_hi || ""}
              </span>
            )}
            
            <h4 className="font-serif font-bold text-[18px] md:text-[20px] leading-snug mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-slate-100">
              {stripMarkdown(article.title_hi || "")}
            </h4>
            
            <p className="text-[14px] md:text-[15px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
               {stripMarkdown(article.summary_hi || "")}
            </p>

            <div className="mt-auto flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-500 font-sans">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {article.profiles?.name || "युवाक्षर डेस्क"}
              </span>
              <span>•</span>
              <time>
                {article.published_at 
                  ? format(new Date(article.published_at), 'd MMM yyyy', { locale: hi })
                  : format(new Date(article.created_at), 'd MMM yyyy', { locale: hi })
                }
              </time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
