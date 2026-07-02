"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight
} from "lucide-react";
import MetaInfo from "@/components/homepage/shared/MetaInfo";

import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { stripMarkdown } from "@/lib/markdown";
import { getArticleUrl } from "@/utils/routes";

function CurrentAffairsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest"); // latest, popular, time
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const searchParams = useSearchParams();
  const categoryParam = searchParams ? searchParams.get("category") : null;

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setMounted(true);
    const saved = null;
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter(b => b !== id);
    } else {
      updated = [...bookmarks, id];
    }
    setBookmarks(updated);
  };

  const { articles, categories: cmsCategories } = useCms();
  const categories = ["All", ...cmsCategories?.map(c => c.name)];

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (art.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Simple sorting logic
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0; // Default unchanged
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-8 min-h-screen space-y-6">
      
      {/* Category selector row */}
      <div className="flex overflow-x-auto space-x-2 pb-2 select-none scrollbar-none border-b border-yuvakshar-gold/5">
        {categories?.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-yuvakshar-gold/15 border-yuvakshar-gold text-yuvakshar-gold font-semibold"
                : "bg-yuvakshar-card/40 border-yuvakshar-gold/10 hover:border-yuvakshar-gold/30 text-yuvakshar-gray hover:text-yuvakshar-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.length > 0 ? (
          sortedArticles?.map((art) => (
            <GlassCard key={art.id} glow="none" className="p-0">
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Image cover */}
                  <Link href={getArticleUrl(art)} className="block relative h-[220px] w-full overflow-hidden">
                    <Image src={art.coverImage} alt={art.title} fill className="object-cover hover:scale-105 transition-transform duration-500 brightness-95" />
                    <div className="absolute top-3 left-3 bg-yuvakshar-bg border border-yuvakshar-gold/25 px-2.5 py-0.5 rounded text-[9px] text-yuvakshar-gold font-bold tracking-wider uppercase">
                      {art.category}
                    </div>
                  </Link>

                  {/* Body details */}
                  <div className="p-6 space-y-3">
                    <div className="pt-2 border-t border-yuvakshar-gold/5">
                      <MetaInfo
                        articleId={art.id}
                        slug={art.slug}
                        author={art.author || "युवाक्षर डेस्क"}
                        authorProfile={art.authorProfile}
                        date={art.date}
                        updatedAt={art.updatedAt || art.updated_at}
                        showActions={false}
                      />
                    </div>

                    <Link href={getArticleUrl(art)} className="block group">
                      <h3 className="font-serif text-lg font-bold text-yuvakshar-text group-hover:text-yuvakshar-gold transition-colors leading-snug line-clamp-2">
                        {stripMarkdown(art.title)}
                      </h3>
                    </Link>
                    <p className="text-xs text-yuvakshar-gray font-light leading-relaxed line-clamp-3">
                      {stripMarkdown(art.summary)}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-yuvakshar-gold/5 mt-auto flex items-center justify-between">
                  <div className="flex space-x-1 overflow-hidden max-w-[70%]">
                    {(art.tags || []).slice(0, 2)?.map((t: string, idx: number) => (
                      <span key={idx} className="text-[9px] text-yuvakshar-gray font-mono bg-yuvakshar-card/85 px-2 py-0.5 rounded border border-yuvakshar-gold/5 shrink-0">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleBookmark(art.id)}
                      className="p-1.5 rounded bg-yuvakshar-card border border-yuvakshar-gold/10 hover:border-yuvakshar-gold/45 text-yuvakshar-gray hover:text-yuvakshar-gold transition-all"
                    >
                      {mounted && bookmarks.includes(art.id) ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-yuvakshar-gold" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link 
                      href={getArticleUrl(art)}
                      className="p-1.5 rounded bg-yuvakshar-gold text-yuvakshar-bg hover:bg-white transition-all flex items-center justify-center cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-yuvakshar-gray">
            No analytical papers found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}

export default function CurrentAffairsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CurrentAffairsPageContent />
    </Suspense>
  );
}
