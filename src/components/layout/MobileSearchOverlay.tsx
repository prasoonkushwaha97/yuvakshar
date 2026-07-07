"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, User, ArrowLeft, BookOpen, MessageSquare, Newspaper, Tag, Video, Folder, Users, Mic, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { globalSearch, SearchResult } from "@/lib/actions/searchActions";
import { useCms } from "@/store/CmsContext";
import { getArticleUrl } from "@/utils/routes";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

const RECENT_SEARCHES_KEY = "yuvakshar_recent_searches";

const trendingTopics = [
  "संविधान", "भारत", "AI", "UPSC",
  "ISRO", "NEP"
];

const categorySuggestions = [
  { name: "राजनीति", slug: "politics" },
  { name: "शिक्षा", slug: "education" },
  { name: "साहित्य", slug: "literature" },
  { name: "समाज", slug: "society" },
];

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const { articles: cmsArticles, users: cmsUsers } = useCms();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { isListening, speechError, startVoiceSearch, stopVoiceSearch, isSupported } = useVoiceSearch((text) => {
    setQuery(text);
  });

  // Suggested content
  const suggestedArticles = cmsArticles?.slice(0, 3) || [];
  const popularAuthors = cmsUsers?.slice(0, 3) || [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setDebouncedQuery("");
      document.body.style.overflow = "unset";
      if (isListening) stopVoiceSearch();
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open, isListening, stopVoiceSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsSearching(true);
      globalSearch(debouncedQuery).then((res) => {
        setResults(res);
        setIsSearching(false);
      }).catch((err) => {
        console.error(err);
        setIsSearching(false);
      });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSelectResult = (url: string, term?: string) => {
    if (term) {
      const updated = [term, ...recentSearches.filter(r => r !== term)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
    onClose();
    router.push(url);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(document.querySelectorAll("[data-search-item='true']")) as HTMLElement[];
      if (items.length === 0) return;
      
      const currentIndex = items.findIndex(el => el === document.activeElement);
      let nextIndex;
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        if (currentIndex === 0) {
          inputRef.current?.focus();
          return;
        }
      }
      items[nextIndex].focus();
    }
  };

  const Highlight = ({ text }: { text: string }) => {
    if (!debouncedQuery) return <>{text}</>;
    const parts = text.split(new RegExp(`(${debouncedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === debouncedQuery.toLowerCase() ? 
            <span key={i} className="text-[#ea580c] font-bold bg-[#ea580c]/10">{part}</span> : part
        )}
      </>
    );
  };

  const articles = results.filter(r => r.type === "article");
  const authors = results.filter(r => r.type === "author");
  const magazines = results.filter(r => r.type === "magazine");
  const videos = results.filter(r => r.type === "video");
  const taxonomies = results.filter(r => r.type === "category" || r.type === "tag");
  const chaupals = results.filter(r => r.type === "chaupal_post" || r.type === "chaupal_discussion" || r.type === "chaupal_group");

  const hasResults = results.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-white dark:bg-[#0E1322] flex flex-col pt-safe-top lg:hidden"
        >
          {/* Header */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (query.trim().length >= 2) {
              handleSelectResult(`/search?q=${encodeURIComponent(query.trim())}`, query.trim());
            }
          }}>
            <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-grow relative">
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyboardNav}
                  placeholder={isListening ? "बोलिए..." : "खोजें (Search)..."}
                  className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 pr-20 text-base font-hindi focus:outline-none focus:ring-1 focus:ring-[#ea580c] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                
                {query && !isListening && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {isSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopVoiceSearch();
                      } else {
                        startVoiceSearch();
                      }
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 flex items-center justify-center rounded-lg transition-colors ${
                      isListening 
                        ? "text-white bg-[#ea580c] animate-pulse" 
                        : "text-slate-400 hover:text-[#ea580c]"
                    }`}
                    title={isListening ? "वॉइस सर्च बंद करें" : "वॉइस सर्च"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {speechError && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-hindi flex items-center gap-2 border-b border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-3.5 h-3.5" /> {speechError}
              </div>
            )}
          </form>

          {/* Body */}
          <div className="flex-grow overflow-y-auto w-full pb-safe-bottom">
            {query.length >= 2 ? (
              isSearching ? (
                <div className="p-12 text-center text-slate-500 font-hindi flex flex-col items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block mb-3">
                    <Search className="w-6 h-6 opacity-50" />
                  </motion.div>
                  खोजा जा रहा है...
                </div>
              ) : hasResults ? (
                <div className="p-4 space-y-6">
                  {articles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase font-hindi flex items-center gap-2">
                         <Newspaper className="w-4 h-4" /> लेख
                      </h3>
                      {articles.slice(0, 3).map(article => (
                        <button
                          key={article.id}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => handleSelectResult(article.url, query)}
                          className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                        >
                          <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi text-base line-clamp-2">
                            <Highlight text={article.title} />
                          </h4>
                        </button>
                      ))}
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                        <Video className="w-4 h-4" /> वीडियो
                      </h3>
                      <div className="space-y-2">
                        {videos.slice(0, 2).map(video => (
                          <button
                            key={video.id}
                            data-search-item="true"
                            onKeyDown={handleKeyboardNav}
                            onClick={() => handleSelectResult(video.url, query)}
                            className="w-full text-left group flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                          >
                            {video.thumbnail && (
                              <img src={video.thumbnail} className="w-16 h-10 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-grow min-w-0">
                              <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi text-sm line-clamp-2">
                                <Highlight text={video.title} />
                              </h4>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chaupals.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase font-hindi flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> चौपाल
                      </h3>
                      {chaupals.slice(0, 3).map(post => (
                        <button
                          key={post.id}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => handleSelectResult(post.url, query)}
                          className="w-full text-left group flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                        >
                          {post.type === 'chaupal_post' && (
                            post.thumbnail ? (
                              <img src={post.thumbnail} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-500" />
                              </div>
                            )
                          )}
                          {post.type === 'chaupal_group' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-indigo-500" />
                            </div>
                          )}
                          {post.type === 'chaupal_discussion' && (
                            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4 text-pink-500" />
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-hindi line-clamp-2">
                              <Highlight text={post.title} />
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {authors.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase font-hindi flex items-center gap-2">
                         <User className="w-4 h-4" /> लेखक
                      </h3>
                      {authors.slice(0, 3).map(author => (
                        <button
                          key={author.id}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => handleSelectResult(author.url, query)}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                        >
                          {author.thumbnail ? (
                            <img src={author.thumbnail} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
                              {author.title.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi">
                              <Highlight text={author.title} />
                            </h4>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {magazines.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                        <BookOpen className="w-4 h-4" /> पत्रिका
                      </h3>
                      <div className="space-y-2">
                        {magazines.slice(0, 2).map(mag => (
                          <button
                            key={mag.id}
                            data-search-item="true"
                            onKeyDown={handleKeyboardNav}
                            onClick={() => handleSelectResult(mag.url, query)}
                            className="w-full text-left group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                          >
                            <div className="w-10 h-14 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden shrink-0">
                              {mag.thumbnail && (
                                <img src={mag.thumbnail} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi">
                                <Highlight text={mag.title} />
                              </h4>
                              <p className="text-xs text-slate-500 font-hindi">{mag.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {taxonomies.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                        <Folder className="w-4 h-4" /> श्रेणियां / टैग
                      </h3>
                      <div className="space-y-2">
                        {taxonomies.slice(0, 3).map(tax => (
                          <button
                            key={tax.id}
                            data-search-item="true"
                            onKeyDown={handleKeyboardNav}
                            onClick={() => handleSelectResult(tax.url, query)}
                            className="w-full text-left group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                          >
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {tax.type === 'category' ? <Folder className="w-4 h-4 text-slate-500" /> : <Tag className="w-4 h-4 text-slate-500" />}
                            </div>
                            <div>
                              <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi">
                                <Highlight text={tax.title} />
                              </h4>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    data-search-item="true"
                    onKeyDown={handleKeyboardNav}
                    onClick={() => handleSelectResult(`/search?q=${encodeURIComponent(query.trim())}`, query.trim())}
                    className="w-full py-4 text-center text-[#ea580c] font-bold font-hindi border-t border-slate-100 dark:border-slate-800 mt-4 focus:outline-none focus:underline"
                  >
                    "{query}" के सभी परिणाम देखें
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 font-hindi">
                  कोई परिणाम नहीं मिला।
                </div>
              )
            ) : (
              <div className="p-4 space-y-8">
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 font-hindi">
                        <Clock className="w-4 h-4" /> हाल की खोजें
                      </h3>
                      <button onClick={clearRecent} className="text-xs text-[#ea580c] font-hindi">
                        साफ़ करें
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => {
                            setQuery(term);
                            handleSelectResult(`/search?q=${encodeURIComponent(term)}`);
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-hindi focus:bg-slate-200 dark:focus:bg-slate-700 focus:outline-none"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 font-hindi">
                    <TrendingUp className="w-4 h-4" /> ट्रेंडिंग खोजें
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map(topic => (
                      <button
                        key={topic}
                        data-search-item="true"
                        onKeyDown={handleKeyboardNav}
                        onClick={() => {
                          setQuery(topic);
                          handleSelectResult(`/search?q=${encodeURIComponent(topic)}`);
                        }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-hindi focus:border-[#ea580c] focus:text-[#ea580c] focus:outline-none"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                    <Tag className="w-4 h-4" /> लोकप्रिय श्रेणियां
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categorySuggestions.map(cat => (
                      <button
                        key={cat.slug}
                        data-search-item="true"
                        onKeyDown={handleKeyboardNav}
                        onClick={() => handleSelectResult(`/category/${cat.slug}`)}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-xl text-center font-hindi transition-all border border-transparent focus:bg-[#ea580c] focus:text-white focus:outline-none"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {suggestedArticles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                      <Newspaper className="w-4 h-4" /> सुझाई गई खबरें
                    </h3>
                    <div className="space-y-2">
                      {suggestedArticles.map((article: any) => (
                        <button
                          key={article.id}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => handleSelectResult(getArticleUrl(article))}
                          className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                        >
                          <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi line-clamp-2">
                            {article.title}
                          </h4>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {popularAuthors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                      <User className="w-4 h-4" /> लोकप्रिय लेखक
                    </h3>
                    <div className="space-y-2">
                      {popularAuthors.map((author: any) => (
                        <button
                          key={author.id}
                          data-search-item="true"
                          onKeyDown={handleKeyboardNav}
                          onClick={() => handleSelectResult(`/u/${author.username}`)}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none"
                        >
                          {author.avatar_url ? (
                            <img src={author.avatar_url} alt={author.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold shrink-0">
                              {author.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi">
                              {author.name}
                            </h4>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
