"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, User, BookOpen, Tag, Newspaper, MessageSquare, Folder, Users, Mic, AlertCircle, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { globalSearch, SearchResult } from "@/lib/actions/searchActions";
import Link from "next/link";
import Image from "next/image";
import { useCms } from "@/store/CmsContext";
import { getArticleUrl } from "@/utils/routes";
import { getCanonicalProfileUrl } from "@/utils/username";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

const RECENT_SEARCHES_KEY = "yuvakshar_recent_searches";

const trendingTopics = [
  "संविधान", "भारत", "AI", "UPSC",
  "ISRO", "NEP", "भारतीय साहित्य", "कविता संग्रह"
];

const categorySuggestions = [
  { name: "राजनीति", slug: "politics" },
  { name: "शिक्षा", slug: "education" },
  { name: "साहित्य", slug: "literature" },
  { name: "समाज", slug: "society" },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
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
  const suggestedArticles = cmsArticles?.slice(0, 4) || [];
  const popularAuthors = cmsUsers?.slice(0, 4) || [];

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
    } else {
      setQuery("");
      setDebouncedQuery("");
      if (isListening) stopVoiceSearch();
    }
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
        let combined = [...res];

        if (cmsUsers && cmsUsers.length > 0) {
          const rawQ = debouncedQuery.trim().toLowerCase().replace(/^@/, '');
          const compactQ = rawQ.replace(/[\s\-_\.@]/g, '');

          cmsUsers.forEach((u: any) => {
            const name = (u.name || '').toLowerCase();
            const username = (u.username || u.slug || '').toLowerCase();
            const compactName = name.replace(/[\s\-_\.@]/g, '');
            const compactUsername = username.replace(/[\s\-_\.@]/g, '');

            const isMatch =
              name.includes(rawQ) ||
              username.includes(rawQ) ||
              compactName.includes(compactQ) ||
              compactUsername.includes(compactQ);

            if (isMatch) {
              const profileId = `profile-${u.id}`;
              const alreadyFound = combined.some(r => r.id === profileId || r.url.endsWith(`/${username}`));
              if (!alreadyFound) {
                combined.unshift({
                  id: profileId,
                  type: "author",
                  title: u.name || username || "लेखक",
                  subtitle: `@${username}`,
                  thumbnail: u.avatar_url,
                  url: `/u/${username}`,
                  score: 180,
                  meta: {
                    username,
                    slug: username,
                    role: u.role,
                    is_verified: u.is_verified
                  }
                });
              }
            }
          });
        }

        combined.sort((a, b) => b.score - a.score);
        setResults(combined);
        setIsSearching(false);
      }).catch((err) => {
        console.error(err);
        setIsSearching(false);
      });
    } else {
      setResults([]);
    }
  }, [debouncedQuery, cmsUsers]);

  const handleSelectResult = (url: string, term?: string) => {
    if (term) {
      const updated = [term, ...recentSearches.filter(r => r !== term)].slice(0, 10);
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

  // Keyboard Navigation Logic
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
        // If moving up from the first item, go back to input
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
  const chaupals = results.filter(r => r.type === "chaupal_post" || r.type === "chaupal_discussion" || r.type === "chaupal_group");

  const taxonomies = results.filter(r => r.type === "category" || r.type === "tag");

  const hasResults = results.length > 0;

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
          <div className="w-full max-w-5xl mx-auto flex flex-col h-full lg:h-auto lg:mt-24 lg:rounded-2xl lg:shadow-2xl lg:border lg:border-slate-200 lg:dark:border-slate-800 bg-white dark:bg-[#0E1322] overflow-hidden">
            
            {/* Header with search input */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (query.trim().length >= 2) {
                handleSelectResult(`/search?q=${encodeURIComponent(query.trim())}`, query.trim());
              }
            }} className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex-grow relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#ea580c] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyboardNav}
                  placeholder={isListening ? "बोलिए... सुन रहा हूँ..." : "लेख, न्यूज़, पत्रिका, चौपाल, वीडियो, लेखक खोजें..."}
                  className="w-full h-14 bg-transparent pl-12 pr-14 text-lg lg:text-xl font-hindi focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
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
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors flex items-center justify-center ${
                      isListening 
                        ? "text-white bg-[#ea580c] animate-pulse" 
                        : "text-slate-400 hover:text-[#ea580c] hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={isListening ? "वॉइस सर्च बंद करें" : "वॉइस सर्च (Voice Search)"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                title="बंद करें (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
            
            {speechError && (
              <div className="px-4 lg:px-6 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-hindi flex items-center gap-2 border-b border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4" /> {speechError}
              </div>
            )}

            {/* Results / Suggestions */}
            <div className="flex-grow overflow-y-auto w-full">
              {query.length >= 2 ? (
                isSearching ? (
                  <div className="p-12 text-center text-slate-500 font-hindi">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block">
                      <Search className="w-8 h-8 opacity-50" />
                    </motion.div>
                    <p className="mt-4 text-lg">परिणाम खोजे जा रहे हैं...</p>
                  </div>
                ) : hasResults ? (
                  <div className="p-4 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Column 1: Articles */}
                      <div className="space-y-8">
                        {articles.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                              <Newspaper className="w-4 h-4" /> लेख और खबरें
                            </h3>
                            <div className="space-y-2">
                              {articles.slice(0, 4).map(article => (
                                <button
                                  key={article.id}
                                  data-search-item="true"
                                  onKeyDown={handleKeyboardNav}
                                  onClick={() => handleSelectResult(article.url, query)}
                                  className="w-full text-left group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50 transition-colors"
                                >
                                  <div className="flex-grow min-w-0">
                                    <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi text-base line-clamp-1 group-hover:text-[#ea580c] transition-colors">
                                      <Highlight text={article.title} />
                                    </h4>
                                    {article.author && (
                                      <p className="text-xs text-slate-500 font-hindi truncate mt-1">
                                        {article.author}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Column 2: Chaupal */}
                      <div className="space-y-8">
                        {chaupals.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                              <MessageSquare className="w-4 h-4" /> चौपाल
                            </h3>
                            <div className="space-y-2">
                              {chaupals.slice(0, 6).map(post => (
                                <button
                                  key={post.id}
                                  data-search-item="true"
                                  onKeyDown={handleKeyboardNav}
                                  onClick={() => handleSelectResult(post.url, query)}
                                  className="w-full text-left group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50 transition-colors"
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
                                    <p className="text-[10px] uppercase text-slate-500 font-hindi mt-1">
                                      {post.type === 'chaupal_post' ? `Post by ${post.author}` : (post.type === 'chaupal_group' ? 'Group' : 'Discussion')}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Column 3: Authors, Magazines, Tags */}
                      <div className="space-y-8">
                        {authors.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                              <User className="w-4 h-4" /> लेखक एवं उपयोगकर्ता
                            </h3>
                            <div className="space-y-2">
                              {authors.slice(0, 3).map(author => (
                                <div key={author.id} className="flex items-center gap-2 group w-full p-2 rounded-xl hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-slate-800/50 dark:focus-within:bg-slate-800/50 transition-colors">
                                  <button
                                    data-search-item="true"
                                    onKeyDown={handleKeyboardNav}
                                    onClick={() => handleSelectResult(author.url, query)}
                                    className="flex-grow text-left flex items-center gap-3 focus:outline-none"
                                  >
                                    {author.thumbnail ? (
                                      <img src={author.thumbnail} alt={author.title} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                        {author.title.charAt(0)}
                                      </div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-slate-900 dark:text-slate-100 font-semibold font-hindi text-sm line-clamp-1 group-hover:text-[#ea580c] transition-colors">
                                          <Highlight text={author.title} />
                                        </h4>
                                        {author.meta?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                                        {author.meta?.role && (author.meta.role === 'founder' || author.meta.role === 'admin' || author.meta.role === 'editor') && (
                                          <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                                            {author.meta.role}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-500 font-hindi truncate">
                                        {(() => {
                                          const userSlug = author.meta?.slug || (author.url ? author.url.split('/').pop() : null);
                                          if (!userSlug || userSlug === "undefined" || userSlug === "null") return null;
                                          return <Highlight text={`@${userSlug}`} />;
                                        })()}
                                      </p>
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  >
                                    Follow
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {magazines.length > 0 && (
                          <div className="space-y-4">
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
                                  className="w-full text-left group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50 transition-colors"
                                >
                                  <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden shrink-0">
                                    {mag.thumbnail && (
                                      <img src={mag.thumbnail} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi group-hover:text-[#ea580c] transition-colors">
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
                          <div className="space-y-4">
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
                                  className="w-full text-left group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    {tax.type === 'category' ? <Folder className="w-4 h-4 text-slate-500" /> : <Tag className="w-4 h-4 text-slate-500" />}
                                  </div>
                                  <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi group-hover:text-[#ea580c] transition-colors">
                                      <Highlight text={tax.title} />
                                    </h4>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-hindi mb-2">
                      कोई परिणाम नहीं मिला।
                    </h3>
                    <p className="text-slate-500 font-hindi">
                      हम '{query}' के लिए कुछ नहीं ढूँढ पाए। <br/> कृपया किसी अन्य शब्द के साथ प्रयास करें।
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Empty State - Column 1 */}
                    <div className="space-y-8">
                      {recentSearches.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
                              <Clock className="w-4 h-4" /> हाल की खोजें
                            </h3>
                            <button onClick={clearRecent} className="text-xs text-[#ea580c] hover:underline font-hindi">
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
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 focus:bg-slate-200 focus:outline-none dark:hover:bg-slate-700 dark:focus:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-hindi transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-hindi">
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
                              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:border-[#ea580c] focus:border-[#ea580c] focus:outline-none focus:text-[#ea580c] hover:text-[#ea580c] text-slate-700 dark:text-slate-300 rounded-full text-sm font-hindi transition-colors"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Empty State - Column 2 */}
                    <div className="space-y-8">
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
                              className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#ea580c] focus:bg-[#ea580c] focus:text-white focus:outline-none hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-center font-hindi transition-all border border-transparent hover:border-[#ea580c]"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

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
                                onClick={() => handleSelectResult(getCanonicalProfileUrl(author))}
                                className="w-full text-left group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 transition-colors"
                              >
                                {author.avatar_url ? (
                                  <img src={author.avatar_url} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                    {author.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi group-hover:text-[#ea580c] transition-colors">
                                    {author.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 font-hindi line-clamp-1">
                                     {(() => {
                                       if (author.bio) return author.bio;
                                       const s = author.slug || author.username;
                                       if (s && s !== "undefined" && s !== "null") return `@${s}`;
                                       return null;
                                     })()}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Empty State - Column 3 */}
                    <div className="space-y-8">
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
                                className="w-full text-left group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-slate-900 dark:text-slate-100 font-medium font-hindi text-base line-clamp-2 group-hover:text-[#ea580c] transition-colors">
                                    {article.title}
                                  </h4>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            {query.trim().length >= 2 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 text-center shrink-0">
                <button
                  data-search-item="true"
                  onKeyDown={handleKeyboardNav}
                  onClick={() => handleSelectResult(`/search?q=${encodeURIComponent(query.trim())}`, query.trim())}
                  className="text-[#ea580c] font-bold hover:underline focus:underline focus:outline-none font-hindi flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg"
                >
                  "{query}" के लिए सभी परिणाम देखें <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { ArrowRight } from "lucide-react";
