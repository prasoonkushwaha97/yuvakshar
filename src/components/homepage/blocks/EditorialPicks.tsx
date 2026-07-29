"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { Award } from "lucide-react";
import SectionContainer from "../layout/SectionContainer";
import { getArticleUrl } from "@/utils/routes";
import MetaInfo from "../shared/MetaInfo";

interface EditorialPicksProps {
  excludeIds?: string[];
}

export default function EditorialPicks({ excludeIds = [] }: EditorialPicksProps) {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles
    ? [...articles].filter(
        (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
      )
    : [];

  if (published.length === 0) return null;

  // Filter out any articles rendered in Hero or TopStories/LatestNews/Categories
  const remaining = published.filter((a: any) => !excludeIds.includes(a.id));

  // Editorial Picks filter
  let picks = remaining.filter((a: any) => a.editors_pick || a.recommended);
  if (picks.length === 0) {
    picks = remaining.slice(0, 4); // fallback slice to avoid duplicates
  } else {
    picks = picks.slice(0, 4);
  }

  if (picks.length === 0) return null;

  return (
    <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]">
      <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-stone-800 dark:text-stone-300" />
          <h2 className="font-serif font-medium text-lg md:text-xl text-stone-900 dark:text-stone-100 uppercase tracking-widest">
            {locale === "hi" ? "संपादकीय चयन" : "Editorial Picks"}
          </h2>
        </div>
      </div>

      {/* Grid: 4 cols on desktop, 2 cols on tablet, swipe on mobile */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {picks.map((art: any) => {
          const title = stripMarkdown(art.title || art.title_hi || "");
          const summary = stripMarkdown(art.summary || art.summary_hi || art.content || "");
          const imageUrl = art.coverImage || art.cover_image || art.image || "/images/placeholder-news.jpg";



          return (
            <div 
              key={art.id} 
              className="group flex flex-col w-[80vw] sm:w-auto shrink-0 sm:shrink bg-transparent rounded-none overflow-hidden border-b sm:border-r sm:border-b-0 border-stone-200 dark:border-stone-800 last:border-0 hover:-translate-y-0.5 transition-transform duration-300 snap-start"
            >
              {/* Image Section */}
              <Link 
                href={getArticleUrl(art)} 
                className="block relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 mb-3 shrink-0"
              >
                <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" loading="lazy" fill />
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-white/90 dark:bg-black/90 text-stone-800 dark:text-stone-300 text-[10px] font-sans font-medium uppercase tracking-widest px-2 py-0.5 rounded-sm">
                    {art.category || "संपादकीय"}
                  </span>
                </div>
              </Link>

              {/* Text Section */}
              <div className="flex-1 flex flex-col px-1">
                {/* Title */}
                <Link href={getArticleUrl(art)} className="block mb-2">
                  <h3 className="text-base md:text-lg font-serif font-semibold leading-[1.5] text-stone-900 dark:text-stone-100 line-clamp-2">
                    {title}
                  </h3>
                </Link>

                {/* Summary */}
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4 font-serif line-clamp-2">
                  {summary}
                </p>

                {/* Footer details */}
                <div className="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <MetaInfo
                    articleId={art.id}
                    slug={art.slug}
                    author={art.profiles?.name || art.author || "युवाक्षर डेस्क"}
                    authorProfile={art.profiles || art.authorProfile}
                    date={art.date}
                    showActions={false}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </SectionContainer>
  );
}
