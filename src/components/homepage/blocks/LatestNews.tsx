"use client";

import React, { useState } from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { ChevronDown, Loader2 } from "lucide-react";
import ArticleCardMedium from "../cards/ArticleCardMedium";
import SectionContainer from "../layout/SectionContainer";
import { supabase } from "@/lib/supabaseClient";

interface LatestNewsProps {
  excludeIds?: string[];
}

export default function LatestNews({ excludeIds = [] }: LatestNewsProps) {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [visibleCount, setVisibleCount] = useState(10);
  const [extraArticles, setExtraArticles] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);

  // Initial local articles from CmsContext
  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  // Filter out any articles rendered in Hero or TopStories
  const feedArticles = published.filter((a: any) => !excludeIds.includes(a.id));

  // Combine local initial feed + independently paginated articles
  // Remove duplicates just in case
  const combinedArticles = [...feedArticles, ...extraArticles].reduce((acc: any[], current) => {
    if (!acc.find(a => a.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  if (combinedArticles.length === 0) return null;

  const visibleArticles = combinedArticles.slice(0, visibleCount);
  
  // We have more to show if we haven't exhausted the Supabase backend OR if we still have local articles to reveal
  const hasMore = !isExhausted || combinedArticles.length > visibleCount;

  const handleLoadMore = async () => {
    if (isLoadingMore) return;

    // First, check if we have enough articles in memory to just reveal more
    if (visibleCount + 10 <= combinedArticles.length) {
      setVisibleCount(prev => prev + 10);
      return;
    }

    if (isExhausted) return;

    setIsLoadingMore(true);

    try {
      // Gather all known IDs to prevent duplication (including Hero)
      const allKnownIds = [
        ...excludeIds,
        ...combinedArticles.map(a => a.id)
      ];

      // Format array for Supabase .not.in filter
      const excludeString = `(${allKnownIds.map(id => `"${id}"`).join(",")})`;

      const { data, error } = await supabase
        .from("articles")
        .select("*, profiles(id, name, username, slug, avatar_url), categories(name)")
        .or("status.eq.Published,status.eq.Approved,status.is.null")
        .not("id", "in", excludeString)
        .order("created_at", { ascending: false }) // Fallback since published_at might not be reliably indexed everywhere
        .limit(10);

      if (error) {
        console.error("Error fetching more articles:", error);
        setIsLoadingMore(false);
        return;
      }

      if (data && data.length > 0) {
        // Map data to match CmsContext structure
        const mapped = data.map((art: any) => ({
          ...art,
          author: art.profiles?.name || art.author || "Yuvakshar",
          authorProfile: art.profiles ? {
            id: art.profiles.id,
            name: art.profiles.name,
            username: art.profiles.username,
            slug: art.profiles.slug,
            avatar_url: art.profiles.avatar_url
          } : undefined,
          category: art.categories?.name || art.category || "General",
          isFeatured: art.featured || false,
          status: art.status || "Draft",
          views: art.views || 0,
          likes: art.likes || 0
        }));

        setExtraArticles(prev => [...prev, ...mapped]);
        setVisibleCount(prev => prev + 10);

        if (data.length < 10) {
          setIsExhausted(true); // Fetched the very last batch
        }
      } else {
        setIsExhausted(true); // Nothing left in the DB
      }
    } catch (err) {
      console.error("Failed to load more articles", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]">
      <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-150 dark:border-gray-850 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
          <h2 className="font-serif font-medium text-lg md:text-xl text-stone-900 dark:text-stone-100 uppercase tracking-widest">
            {locale === "hi" ? "हाल ही में प्रकाशित" : "Recently Published"}
          </h2>
        </div>
      </div>

      {/* Feed List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-4">
        {visibleArticles.map((art: any) => (
          <ArticleCardMedium key={art.id} article={art} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`inline-flex items-center space-x-2 px-6 py-2 bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900 dark:hover:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800 font-sans text-xs uppercase tracking-widest font-medium transition-all duration-300 ${isLoadingMore ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span>
              {isLoadingMore 
                ? (locale === "hi" ? "लोड हो रहा है..." : "Loading...") 
                : (locale === "hi" ? "और अधिक लेख लोड करें" : "Load More Articles")}
            </span>
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      </div>
    </SectionContainer>
  );
}
