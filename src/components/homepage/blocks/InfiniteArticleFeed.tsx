"use client";

import React, { useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import ArticleCardMedium from "@/components/homepage/cards/ArticleCardMedium";
import { FeedCardSkeleton } from "@/components/homepage/shared/Skeleton";
import SectionTitle from "@/components/homepage/shared/SectionTitle";
import { useInfiniteArticleFeed } from "@/hooks/useInfiniteArticleFeed";
import { Article } from "@/store/types";
import { ArrowUp, CheckCircle2, Compass } from "lucide-react";

const BATCH_SIZE = 12;

interface InfiniteArticleFeedProps {
  /** All published articles from CmsContext */
  allArticles: Article[];
  /** Article IDs already rendered in homepage sections */
  excludeIds: string[];
  /**
   * Future-ready slot renderer. Called between every batch boundary.
   * Return a ReactNode (ad, sponsored article, editorial promo) or null.
   * @param batchIndex - 0-based index of the batch that just ended
   */
  renderSlot?: (batchIndex: number) => ReactNode;
}

export default function InfiniteArticleFeed({
  allArticles,
  excludeIds,
  renderSlot,
}: InfiniteArticleFeedProps) {
  const { visibleArticles, loadMore, hasMore, isLoading } = useInfiniteArticleFeed({
    allArticles,
    excludeIds,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — triggers loadMore when sentinel enters viewport margin
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Don't render the section at all if there are no feed articles
  if (visibleArticles.length === 0 && !isLoading && !hasMore) {
    return null;
  }

  // Group articles into batches for slot insertion
  const batches: Article[][] = [];
  for (let i = 0; i < visibleArticles.length; i += BATCH_SIZE) {
    batches.push(visibleArticles.slice(i, i + BATCH_SIZE));
  }

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-10 pb-8">
      {/* Section Header */}
      <SectionTitle title="और भी पढ़ें" />

      {/* Article Grid with Slot Insertion */}
      {batches.map((batch, batchIndex) => (
        <React.Fragment key={`batch-${batchIndex}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {batch.map((article) => (
              <ArticleCardMedium key={article.id} article={article} />
            ))}
          </div>

          {/* Future-ready slot between batches */}
          {renderSlot && batchIndex < batches.length - 1 && (
            <div className="my-8">{renderSlot(batchIndex)}</div>
          )}

          {/* Spacer between batches (except last) */}
          {batchIndex < batches.length - 1 && !renderSlot && (
            <div className="my-8" />
          )}
        </React.Fragment>
      ))}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 mt-8">
          {[...Array(6)].map((_, i) => (
            <FeedCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* IntersectionObserver Sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}

      {/* End of Feed */}
      {!hasMore && visibleArticles.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4 bg-stone-50/50 dark:bg-zinc-900/30 border border-stone-200/50 dark:border-zinc-800/50 rounded-2xl my-10 text-center font-sans">
          <div className="w-12 h-12 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center border border-[#F97316]/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-serif font-extrabold text-slate-900 dark:text-zinc-100">
              आप सभी प्रकाशित लेख पढ़ चुके हैं।
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              नवीनतम विचारों और ताज़ा आलेखों के लिए पुनः आएं अथवा हमारी अन्य श्रेणियों को खोजें।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:border-[#F97316] hover:text-[#F97316] dark:hover:border-[#F97316] dark:hover:text-[#F97316] transition-all duration-200 text-xs font-bold cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              <span>ऊपर जाएँ</span>
            </button>

            <Link
              href="/categories"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white transition-all duration-200 text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>श्रेणियाँ देखें</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
