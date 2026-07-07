"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Article } from "@/store/types";

const BATCH_SIZE = 12;

interface UseInfiniteArticleFeedOptions {
  /** All published articles from CmsContext */
  allArticles: Article[];
  /** Article IDs already shown in homepage sections — these are excluded from the feed */
  excludeIds: string[];
}

interface UseInfiniteArticleFeedReturn {
  /** Articles currently visible in the feed */
  visibleArticles: Article[];
  /** Load the next batch of articles */
  loadMore: () => void;
  /** Whether there are more articles to load */
  hasMore: boolean;
  /** Whether a batch is currently being "loaded" (simulated delay for UX) */
  isLoading: boolean;
}

/**
 * Paginates through the remaining published articles in batches,
 * excluding any already displayed in homepage sections.
 *
 * All data is client-side (from CmsContext), so "loading" is a brief
 * simulated delay to allow skeleton cards to render for smooth UX.
 */
export function useInfiniteArticleFeed({
  allArticles,
  excludeIds,
}: UseInfiniteArticleFeedOptions): UseInfiniteArticleFeedReturn {
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  // Build the sorted, deduplicated pool of articles not shown in homepage sections
  const feedPool = useMemo(() => {
    const excludeSet = new Set(excludeIds);
    return allArticles
      .filter((a) => !excludeSet.has(a.id))
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Descending (newest first)
      });
  }, [allArticles, excludeIds]);

  const totalPages = Math.ceil(feedPool.length / BATCH_SIZE);

  const visibleArticles = useMemo(() => {
    return feedPool.slice(0, (page + 1) * BATCH_SIZE);
  }, [feedPool, page]);

  const hasMore = page + 1 < totalPages;

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);

    // Brief simulated delay so skeletons render and scroll feels natural
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
      loadingRef.current = false;
    }, 300);
  }, [hasMore]);

  return { visibleArticles, loadMore, hasMore, isLoading };
}
