"use client";

import React, { useRef, useEffect, ReactNode } from "react";
import ArticleCardMedium from "@/components/homepage/cards/ArticleCardMedium";
import { FeedCardSkeleton } from "@/components/homepage/shared/Skeleton";
import SectionTitle from "@/components/homepage/shared/SectionTitle";
import { useInfiniteArticleFeed } from "@/hooks/useInfiniteArticleFeed";
import { Article } from "@/store/types";
import { ArrowUp } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center py-16 space-y-5">
          <p className="text-base font-serif font-bold text-stone-500 dark:text-stone-400 text-center">
            आप सभी प्रकाशित लेख पढ़ चुके हैं।
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center space-x-2 px-5 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-[#f97316] hover:text-[#f97316] transition-all duration-300 text-sm font-bold font-sans cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>ऊपर जाएँ</span>
          </button>
        </div>
      )}
    </section>
  );
}
