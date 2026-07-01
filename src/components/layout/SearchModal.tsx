"use client";
import Image from "next/image";


import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, User, BookOpen, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";

const RECENT_SEARCHES_KEY = "yuvakshar_recent_searches";

const trendingTopics = [
  "नई शिक्षा नीति", "जलवायु परिवर्तन", "भारतीय साहित्य", "युवा उद्यमी",
  "डिजिटल इंडिया", "महिला सशक्तिकरण", "UPSC तैयारी", "कविता संग्रह"
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const { articles, categories, users, magazines, tags, currentUser } = useCms();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Results
  const [results, setResults] = useState<{
    articles: any[];
    categories: any[];
    authors: any[];
    tags: any[];
    magazines: any[];
  }>({ articles: [], categories: [], authors: [], tags: [], magazines: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      try {
        const saved = null;
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Search logic
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsSearching(true);
      const q = debouncedQuery.trim().toLowerCase();
      
      const matchedArticles = articles.filter(a => 
        a.title_hi?.toLowerCase().includes(q) || 
        a.title_en?.toLowerCase().includes(q) ||
        a.summary_hi?.toLowerCase().includes(q)
      ).slice(0, 5);

      const matchedCategories = categories.filter(c => 
        c.name.toLowerCase().includes(q)
      ).slice(0, 3);

      const matchedAuthors = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        (u.bio && u.bio.toLowerCase().includes(q))
      ).slice(0, 3);

      const matchedTags = tags?.filter(t => 
        t.name.toLowerCase().includes(q)
      ).slice(0, 3) || [];

      const matchedMagazines = magazines?.filter(m => 
        m.issue?.toLowerCase().includes(q) || m.month?.toLowerCase().includes(q)
      ).slice(0, 3) || [];

      setResults({
        articles: matchedArticles,
        categories: matchedCategories,
        authors: matchedAuthors,
        tags: matchedTags,
        magazines: matchedMagazines
      });
      setIsSearching(false);
    } else {
      setResults({ articles: [], categories: [], authors: [], tags: [], magazines: [] });
    }
  }, [debouncedQuery, articles, categories, users, tags, magazines]);

  const handleSelectResult = (url: string, term?: string) => {
    if (term) {
      const updated = [term, ...recentSearches.filter(r => r !== term)].slice(0, 8);
      setRecentSearches(updated);

    }
    onClose();
    router.push(url);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const Highlight = ({ text }: { text: string }) => {
    if (!debouncedQuery) return <>{text}</>;
    const parts = text.split(new RegExp(`(${debouncedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === debouncedQuery.toLowerCase() ? 
            <span key={i} className="text-[#f97316] font-bold bg-[#f97316]/10">{part}</span> : part
        )}
      </>
    );
  };

  const hasResults = Object.values(results).some(arr => arr.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[60] bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-xl flex flex-col items-center pt-safe"
        >
          {/* Main Search Container */}
          <div className="w-full max-w-3xl mx-auto flex flex-col h-full lg:h-auto lg:mt-24 lg:rounded-2xl lg:shadow-2xl lg:border lg:border-slate-200 lg:dark:border-slate-800 bg-white dark:bg-[#0E1322] overflow-hidden">
            
            {/* Header with search input */}
            <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onClose();
                  }}
                  placeholder="लेख, लेखक, श्रेणी या पत्रिका खोजें..."
                  className="w-full h-12 bg-transparent pl-10 pr-4 text-lg lg:text-xl focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={onClose}
                className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                title="बंद करें (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results / Suggestions */}
            <div className="flex-grow overflow-y-auto w-full">
              {query.length >= 2 ? (
                isSearching ? (
                  <div className="p-8 text-center text-slate-500">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block">
                      <Search className="w-6 h-6 opacity-50" />
                    </motion.div>
                    <p className="mt-2 text-sm">खोजा जा रहा है...</p>
                  </div>
                ) : hasResults ? (
                  <div className="p-4 lg:p-6 space-y-6">
                    
                    {/* Articles */}
                    {results.articles.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">लेख</h3>
                        <div className="space-y-1">
                          {results.articles.map(a => (
                            <button key={a.id} onClick={() => handleSelectResult(`/articles/${a.slug}`, query)} className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group flex items-start gap-3">
                              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 group-hover:text-[#f97316]" />
                              <div>
                                <h4 className="text-slate-900 dark:text-slate-100 font-serif text-lg"><Highlight text={a.title_hi || a.title_en || ""} /></h4>
                                {a.summary_hi && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1"><Highlight text={a.summary_hi} /></p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Authors & Categories Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.authors.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">लेखक</h3>
                          <div className="space-y-1">
                            {results.authors.map(u => (
                              <button key={u.id} onClick={() => handleSelectResult(`/u/${u.slug || u.username || u.id}`, query)} className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex items-center gap-3">
                                {u.avatar_url ? (
                                  <Image src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" width={48} height={48} />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><User className="w-4 h-4 text-slate-500" /></div>
                                )}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100"><Highlight text={u.name} /></h4>
                                  {u.role && <p className="text-xs text-slate-500">{u.role}</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.categories.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">श्रेणियाँ</h3>
                          <div className="space-y-1">
                            {results.categories.map(c => (
                              <button key={c.id} onClick={() => handleSelectResult(`/category/${c.slug}`, query)} className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center"><Tag className="w-4 h-4 text-[#f97316]" /></div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100"><Highlight text={c.name} /></h4>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">कोई परिणाम नहीं मिला</p>
                    <p className="text-sm mt-1 text-slate-500">"{query}" के लिए कुछ और खोजने का प्रयास करें।</p>
                  </div>
                )
              ) : (
                <div className="p-4 lg:p-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">हाल की खोज</p>
                        <button onClick={clearRecent} className="text-xs text-[#f97316] font-bold hover:underline">साफ़ करें</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(s); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:border-[#f97316] hover:text-[#f97316] transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{s}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Topics */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-[#f97316]" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ट्रेंडिंग विषय</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(topic); }}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-[#f97316] hover:text-[#f97316] transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Instructions */}
            <div className="hidden lg:flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 bg-slate-50 dark:bg-[#0A0F1D]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-sans text-slate-700 dark:text-slate-300">↑↓</kbd> नेविगेट करें</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-sans text-slate-700 dark:text-slate-300">Enter</kbd> चुनें</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-sans text-slate-700 dark:text-slate-300">Esc</kbd> बंद करें</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
