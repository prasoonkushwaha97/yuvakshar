"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search as SearchIcon, Calendar, Clock, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";

import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { stripMarkdown } from "@/lib/markdown";

// Helper to generate author profile URL slugs safely
const slugifyAuthor = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0900-\u097F-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function SearchPage() {
  const { articles, logSearchQuery } = useCms();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = null;
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = articles.filter(art => 
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.summary.toLowerCase().includes(query.toLowerCase()) ||
      art.tags?.some((t: string) => t.toLowerCase().includes(query.toLowerCase())) ||
      art.category.toLowerCase().includes(query.toLowerCase()) ||
      art.author.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    
    // Log telemetry search
    logSearchQuery(query, filtered.length === 0);
  }, [query, articles]);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter(b => b !== id);
    } else {
      updated = [...bookmarks, id];
    }
    setBookmarks(updated);
    undefined;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen space-y-10 text-[#0F172A] dark:text-slate-200">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold">खोज विमर्श</h1>
        <p className="text-xs text-slate-400 uppercase tracking-wider">
          Query articles, news feed, authors, and digital archives instantly
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="खोजने के लिए शब्द लिखें (उदा. पर्यावरण, शिक्षा, विचार)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-4 text-xs text-slate-800 dark:text-slate-200 pl-12 focus:outline-none focus:border-primary shadow-md focus:shadow-primary/5 transition-all"
        />
        <SearchIcon className="w-5 h-5 text-primary absolute left-4 top-4" />
      </div>

      {/* Results grid */}
      <div className="space-y-4">
        {query.trim() && (
          <p className="text-xs text-slate-400 tracking-wider uppercase font-mono">
            Found {results.length} results matching "{query}"
          </p>
        )}

        <div className="space-y-4">
          {results?.map((art) => (
            <GlassCard key={art.id} glow="none" className="p-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {art.readTime} • लेखक: <Link href={`/profile/${slugifyAuthor(art.author)}`} className="text-primary hover:underline font-bold">{art.author}</Link>
                    </span>
                  </div>

                  <Link href={`/articles/${art.slug || art.id}`} className="block">
                    <h3 className="font-serif text-base font-bold hover:text-primary transition-colors">
                      {stripMarkdown(art.title)}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light line-clamp-2 leading-relaxed">
                    {stripMarkdown(art.summary)}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0 mt-3 sm:mt-0">
                  <button 
                    onClick={() => toggleBookmark(art.id)}
                    className="p-2 rounded bg-white dark:bg-slate-855 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-all cursor-pointer"
                  >
                    {mounted && bookmarks.includes(art.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                  <Link 
                    href={`/articles/${art.slug || art.id}`}
                    className="p-2 rounded bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching articles found in local index.
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-20 text-slate-400 text-xs space-y-3">
              <p>खोजने के लिए ऊपर टाइप करना शुरू करें...</p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto pt-2">
                {["पर्यावरण", "शिक्षा", "विचार", "साहित्य"]?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] text-slate-500 hover:text-primary transition-all cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
