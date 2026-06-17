"use client";

import React, { useState, useMemo } from "react";
import { useCms } from "@/store/CmsContext";
import { Bookmark, Lock, Search, Filter, BookOpen } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { currentUser, articles, toggleBookmark } = useCms();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">लॉगिन आवश्यक है</h2>
          <p className="text-sm text-slate-500 mb-6">अपने सहेजे गए लेख (बुकमार्क) देखने के लिए कृपया लॉगिन करें।</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  const bookmarkedArticles = useMemo(() => {
    // Assuming bookmarks are stored as an array of article IDs in currentUser.bookmarks
    // or through a separate relation. For now, we simulate fetching bookmarked articles.
    // If the schema uses a different property, update accordingly.
    const userBookmarks = currentUser.bookmarks || [];
    return articles.filter(a => userBookmarks.includes(a.id));
  }, [currentUser.bookmarks, articles]);

  const categories = Array.from(new Set(bookmarkedArticles.map(a => a.category).filter(Boolean)));

  const filteredBookmarks = bookmarkedArticles.filter(a => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-hindi pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black font-serif text-slate-900 dark:text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-primary" />
            मेरे बुकमार्क
          </h1>
          <p className="text-slate-500 mt-2">आपके द्वारा सहेजे गए सभी लेखों का व्यक्तिगत संग्रह।</p>
        </div>

        {bookmarkedArticles.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="बुकमार्क खोजें..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="relative w-full sm:w-48">
                <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="all">सभी श्रेणियां</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map(article => (
                <div key={article.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full relative">
                  <button 
                    onClick={() => toggleBookmark && toggleBookmark(article.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-slate-800 text-primary rounded-full flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform"
                    title="बुकमार्क हटाएं"
                  >
                    <Bookmark fill="currentColor" className="w-4 h-4" />
                  </button>

                  <Link href={`/articles/${article.slug}`} className="flex flex-col flex-1">
                    {article.coverImage && (
                      <div className="h-40 w-full overflow-hidden relative">
                        <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {article.category && (
                          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            {article.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-serif font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(article.date || "").toLocaleDateString("hi-IN")}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 group-hover:text-primary transition-colors">
                          पढ़ें <BookOpen className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {filteredBookmarks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                कोई परिणाम नहीं मिला।
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-16 text-center max-w-2xl mx-auto mt-12">
            <Bookmark className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold font-serif mb-2 text-slate-700 dark:text-slate-300">आपका बुकमार्क संग्रह खाली है</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
              पसंदीदा लेखों को बाद में पढ़ने के लिए बुकमार्क करें। वे सभी यहाँ सुरक्षित रूप से दिखाई देंगे।
            </p>
            <Link href="/" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md inline-block">
              लेख पढ़ना शुरू करें
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
