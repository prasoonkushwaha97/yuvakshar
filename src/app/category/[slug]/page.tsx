"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Search, 
  Calendar, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight,
  ArrowLeft
} from "lucide-react";

import { useCms, Article } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { stripMarkdown } from "@/lib/markdown";

const categorySlugMap: Record<string, string> = {
  "news": "समाचार",
  "samachar": "समाचार",
  "special": "विशेष लेख",
  "vishesh-lekh": "विशेष लेख",
  "opinion": "विचार",
  "vichar": "विचार",
  "literature": "साहित्य",
  "sahitya": "साहित्य",
  "interviews": "साक्षात्कार",
  "sakshatkar": "साक्षात्कार",
  "education": "शिक्षा",
  "shiksha": "शिक्षा",
  "environment": "पर्यावरण",
  "paryavaran": "पर्यावरण",
  "history": "इतिहास",
  "itihas": "इतिहास",
  "video": "वीडियो",
  "magazine": "पत्रिका",
  "patrika": "पत्रिका"
};

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { articles } = useCms();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("yuvakshar_bookmarks");
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
    localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(updated));
  };

  const categoryName = categorySlugMap[slug] || slug;

  const filteredArticles = articles.filter(art => {
    const matchesCategory = art.category === categoryName || art.category.toLowerCase() === slug.toLowerCase();
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "time") {
      const timeA = parseInt(a.readTime) || 0;
      const timeB = parseInt(b.readTime) || 0;
      return timeB - timeA;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen space-y-10 text-[#0F172A] dark:text-slate-200">
      
      {/* Back Link */}
      <div>
        <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-primary transition-colors font-medium font-serif">
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर वापस जाएं</span>
        </Link>
      </div>

      {/* Title */}
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold font-hindi">
          श्रेणी: {categoryName}
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-wider mt-2">
          Category ledger block for {slug} indexation
        </p>
      </div>

      {/* Advanced Filter and Search Bar row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-border">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="इस श्रेणी में खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border hover:border-primary/45 rounded-full px-4 py-2.5 text-xs text-foreground pl-9 focus:outline-none focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Sorting controls */}
        <div className="flex space-x-3 w-full md:w-auto shrink-0 justify-end">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-border hover:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none transition-all cursor-pointer"
            >
              <option value="latest">Latest Updates</option>
              <option value="time">Reading Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedArticles.length > 0 ? (
          sortedArticles.map((art) => (
            <GlassCard key={art.id} glow="none" className="p-0">
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Image cover */}
                  <div className="relative h-[220px] w-full overflow-hidden">
                    <img 
                      src={art.coverImage} 
                      alt={art.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 brightness-95"
                    />
                    <div className="absolute top-3 left-3 bg-background border border-border px-2.5 py-0.5 rounded text-[9px] text-primary font-bold tracking-wider uppercase">
                      {art.category}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{art.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.readTime}</span>
                      </span>
                    </div>

                    <Link href={`/editorial?id=${art.id}`} className="block group">
                      <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 font-hindi">
                        {stripMarkdown(art.title)}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed line-clamp-3">
                      {stripMarkdown(art.summary)}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-border mt-auto flex items-center justify-between">
                  <div className="flex space-x-1 overflow-hidden max-w-[70%]">
                    {art.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[9px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded border border-border shrink-0">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleBookmark(art.id)}
                      className="p-1.5 rounded bg-background border border-border hover:border-primary text-slate-400 hover:text-primary transition-all cursor-pointer"
                    >
                      {mounted && bookmarks.includes(art.id) ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link 
                      href={`/editorial?id=${art.id}`}
                      className="p-1.5 rounded bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400">
            इस श्रेणी में कोई लेख नहीं मिला।
          </div>
        )}
      </div>

    </div>
  );
}
