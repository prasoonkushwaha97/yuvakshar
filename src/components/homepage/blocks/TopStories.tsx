"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { ArrowRight, ChevronRight } from "lucide-react";
import SectionContainer from "../layout/SectionContainer";
import { getArticleUrl } from "@/utils/routes";
import MetaInfo from "../shared/MetaInfo";

export default function TopStories() {
  const { locale } = useLanguage();
  const { articles } = useCms();

  const published = articles
    ? [...articles].filter(
        (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
      )
    : [];

  if (published.length === 0) return null;

  // Main Hero Story (to exclude)
  const heroStory = published.find((a: any) => a.hero || a.isFeatured) || published[0];

  // Remaining articles
  const remaining = published.filter((a: any) => a.id !== heroStory.id);

  // Top Stories: Next 8 articles
  const topStories = remaining.slice(0, 8);

  if (topStories.length === 0) return null;

  return (
    <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]">
      <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <h2 className="font-serif font-black text-lg md:text-xl text-gray-900 dark:text-white uppercase tracking-tight">
            {locale === "hi" ? "मुख्य समाचार" : "Top Stories"}
          </h2>
        </div>
      </div>

      {/* Responsive layout: Grid on mobile, tablet, desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-4 sm:pb-0">
        {topStories.map((art: any) => {
          const title = stripMarkdown(art.title || art.title_hi || "");
          const summary = stripMarkdown(art.summary || art.summary_hi || art.content || "");
          const imageUrl = art.coverImage || art.cover_image || art.image || "/images/placeholder-news.jpg";



          return (
            <div 
              key={art.id} 
              className="group flex flex-col h-full bg-white dark:bg-[#0E1322] rounded-3xl overflow-hidden border border-gray-150/80 dark:border-gray-855/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300"
            >
              {/* Image Section */}
              <Link 
                href={getArticleUrl(art)} 
                className="block relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850 shrink-0"
              >
                <Image src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out" loading="lazy" fill />
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#f97316] text-white text-[9px] font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {art.category || "समाचार"}
                  </span>
                </div>
              </Link>

              {/* Text Section */}
              <div className="flex-1 flex flex-col p-5">


                {/* Title */}
                <Link href={getArticleUrl(art)} className="block hover:text-[#f97316] transition-colors duration-250 mb-2">
                  <h3 className="text-base md:text-lg font-bold font-serif leading-snug text-gray-900 dark:text-white line-clamp-2">
                    {title}
                  </h3>
                </Link>

                {/* Summary */}
                <p className="text-gray-555 dark:text-gray-400 text-xs md:text-sm leading-relaxed mb-4 font-serif line-clamp-2">
                  {summary}
                </p>

                {/* Unified Metadata & Link */}
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-850 flex flex-wrap items-center justify-between gap-3">
                  <MetaInfo
                    articleId={art.id}
                    slug={art.slug}
                    author={art.author || "युवाक्षर डेस्क"}
                    authorProfile={art.authorProfile}
                    date={art.date}
                    updatedAt={art.updatedAt || art.updated_at}
                    showActions={false}
                    className="flex-1 min-w-0"
                  />
                  <Link 
                    href={getArticleUrl(art)}
                    className="text-[#f97316] font-bold text-xs hover:underline flex items-center gap-1 shrink-0 cursor-pointer ml-auto"
                  >
                    <span>आगे पढ़ें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
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
