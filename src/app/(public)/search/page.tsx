"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, ArrowRight, User, BookOpen, Newspaper, MessageSquare, Clock, Filter, AlertCircle, Folder, Tag, Users, Mic } from "lucide-react";
import { globalSearch, SearchResult } from "@/lib/actions/searchActions";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <GlassCard key={i} glow="none" className="p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
            <div className="space-y-3 w-full">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-5/6 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"all" | "article" | "magazine" | "chaupal" | "author" | "taxonomies">("all");

  const { isListening, speechError, startVoiceSearch, stopVoiceSearch, isSupported } = useVoiceSearch((text) => {
    setQuery(text);
  });

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
        // Ensure current tab has results, if not switch to all
        let hasResults = false;
        if (activeTab === "all") hasResults = res.length > 0;
        else if (activeTab === "chaupal") hasResults = res.some(r => r.type.startsWith("chaupal_"));
        else if (activeTab === "taxonomies") hasResults = res.some(r => r.type === "category" || r.type === "tag");
        else hasResults = res.some(r => r.type === activeTab);

        if (!hasResults && res.length > 0) {
          setActiveTab("all");
        }
      }).catch((err) => {
        console.error(err);
        setIsSearching(false);
      });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const filteredResults = activeTab === "all" ? results : results.filter(r => {
    if (activeTab === "chaupal") return r.type.startsWith("chaupal_");
    if (activeTab === "taxonomies") return r.type === "category" || r.type === "tag";
    return r.type === activeTab;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'article': return <Newspaper className="w-5 h-5 text-emerald-500" />;
      case 'magazine': return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'chaupal_post': return <MessageSquare className="w-5 h-5 text-pink-500" />;
      case 'chaupal_discussion': return <MessageSquare className="w-5 h-5 text-pink-500" />;
      case 'chaupal_group': return <Users className="w-5 h-5 text-indigo-500" />;
      case 'author': return <User className="w-5 h-5 text-amber-500" />;
      case 'category': return <Folder className="w-5 h-5 text-blue-500" />;
      case 'tag': return <Tag className="w-5 h-5 text-teal-500" />;
      case 'qna_question': return <MessageSquare className="w-5 h-5 text-orange-500" />;
      default: return <SearchIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case 'article': return 'लेख';
      case 'magazine': return 'पत्रिका';
      case 'chaupal_post': return 'चौपाल पोस्ट';
      case 'chaupal_discussion': return 'चौपाल चर्चा';
      case 'chaupal_group': return 'चौपाल समूह';
      case 'author': return 'लेखक';
      case 'category': return 'श्रेणी';
      case 'tag': return 'टैग';
      case 'qna_question': return 'प्रश्नोत्तर';
      default: return 'अन्य';
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all': return 'सभी परिणाम';
      case 'article': return 'लेख';
      case 'magazine': return 'पत्रिका';
      case 'chaupal': return 'चौपाल';
      case 'author': return 'लेखक';
      case 'taxonomies': return 'श्रेणियां / टैग';
      default: return '';
    }
  };

  const tabCounts = {
    all: results.length,
    article: results.filter(r => r.type === 'article').length,
    magazine: results.filter(r => r.type === 'magazine').length,
    chaupal: results.filter(r => r.type.startsWith('chaupal_')).length,
    author: results.filter(r => r.type === 'author').length,
    taxonomies: results.filter(r => r.type === 'category' || r.type === 'tag').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-screen space-y-8 text-[#0F172A] dark:text-slate-200">
      
      {/* Header */}
      <div className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black font-hindi text-slate-900 dark:text-white">खोज विमर्श</h1>
        <p className="text-sm text-slate-500 font-hindi">
          युवाक्षर के पूरे प्लेटफॉर्म पर खोजें
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          placeholder="खोजने के लिए शब्द लिखें..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0E1322] border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-lg font-hindi text-slate-800 dark:text-slate-200 pl-14 pr-24 focus:outline-none focus:border-[#ea580c] shadow-sm transition-all"
        />
        <SearchIcon className="w-6 h-6 text-slate-400 absolute left-5 top-5" />
        
        <div className="absolute right-4 top-3.5 flex items-center gap-2">
          {isSearching && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block mr-2">
              <SearchIcon className="w-5 h-5 text-[#ea580c]" />
            </motion.div>
          )}

          {isSupported && (
            <button
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center relative group ${
                isListening 
                  ? 'bg-red-50 text-red-500 dark:bg-red-500/10' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
              title={isListening ? "सुनना बंद करें" : "बोलकर खोजें"}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-xl bg-red-400 opacity-30 animate-ping" />
              )}
              <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {speechError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-500 font-hindi px-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{speechError}</span>
        </motion.div>
      )}

      {/* Filters & Results Area */}
      {query.trim().length >= 2 && (
        <div className="space-y-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'article', 'magazine', 'chaupal', 'author', 'taxonomies'] as const).map(tab => {
              if (tab !== 'all' && tabCounts[tab] === 0) return null;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-hindi text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-[#ea580c] text-white font-bold shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {getTabLabel(tab)}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {isSearching && results.length === 0 ? (
              <SearchSkeleton />
            ) : filteredResults.length > 0 ? (
              filteredResults.map((res) => (
                <GlassCard key={res.id} glow="none" className="p-4 md:p-5 hover:border-[#ea580c] transition-colors group">
                  <Link href={res.url} className="flex items-start gap-4 md:gap-5">
                    {/* Icon/Thumbnail */}
                    <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {res.thumbnail ? (
                        <img src={res.thumbnail} className="w-full h-full object-cover" />
                      ) : (
                        getIconForType(res.type)
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-hindi border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800">
                          {getLabelForType(res.type)}
                        </span>
                        {res.meta?.categorySlug && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full font-hindi">
                            {res.meta.categorySlug}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#ea580c] transition-colors">
                        {res.title}
                      </h3>
                      
                      {res.subtitle && (
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-hindi line-clamp-2 mt-1">
                          {res.subtitle}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-500 font-hindi">
                        {res.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {res.author}
                          </span>
                        )}
                        {res.date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(res.date).toLocaleDateString("hi-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              ))
            ) : (
              <div className="text-center py-20 px-4">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-hindi mb-2">
                  कोई परिणाम नहीं मिला।
                </h3>
                <p className="text-slate-500 font-hindi">
                  हम आपकी खोज के लिए कुछ नहीं ढूँढ पाए। कृपया किसी अन्य शब्द के साथ प्रयास करें।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {query.trim().length < 2 && (
        <div className="text-center py-20 text-slate-400 text-sm font-hindi">
          खोज परिणाम देखने के लिए कम से कम 2 अक्षर लिखें।
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-hindi">खोज विमर्श लोड हो रहा है...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
