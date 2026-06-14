"use client";

import React, { useMemo } from "react";
import { useCms } from "@/store/CmsContext";
import { Activity, Flame, BookOpen, Star, Lock } from "lucide-react";
import Link from "next/link";

export default function LiteraryJourneyPage() {
  const { currentUser, quizAttempts, articles } = useCms();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">लॉगिन आवश्यक है</h2>
          <p className="text-sm text-slate-500 mb-6">अपनी साहित्यिक यात्रा और पठन अंतर्दृष्टि देखने के लिए कृपया लॉगिन करें।</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  const userAttempts = useMemo(() => quizAttempts.filter(att => att.userId === currentUser.id), [quizAttempts, currentUser.id]);

  // Calculate literary metrics (simulated from quiz attempts/article views for now)
  const totalReadArticles = new Set(userAttempts.map(att => att.articleId)).size;
  const categoriesExplored = useMemo(() => {
    const cats = new Set<string>();
    userAttempts.forEach(att => {
      const art = articles.find(a => a.id === att.articleId);
      if (art && art.category) cats.add(art.category);
    });
    return Array.from(cats);
  }, [userAttempts, articles]);

  const readWords = totalReadArticles * 1250; // Approximating 1250 words per article
  const totalMinutes = userAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-hindi pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black font-serif text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            साहित्यिक यात्रा
          </h1>
          <p className="text-slate-500 mt-2">युवाक्षर पर आपका पठन इतिहास, रुचियां और साहित्यिक अंतर्दृष्टि।</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Insights Panel */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Core Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">पढ़े गए लेख</span>
                <p className="text-2xl font-black font-serif text-slate-800 dark:text-white">{totalReadArticles}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2 opacity-80" />
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">रीडिंग स्ट्रीक</span>
                <p className="text-2xl font-black font-serif text-slate-800 dark:text-white">{Math.min(userAttempts.length, 12)} <span className="text-sm font-normal text-slate-400">दिन</span></p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <Star className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-80" />
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">शब्द पढ़े (अनुमानित)</span>
                <p className="text-2xl font-black font-serif text-slate-800 dark:text-white">{readWords > 1000 ? (readWords/1000).toFixed(1) + 'k' : readWords}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2 opacity-80" />
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">कुल समय</span>
                <p className="text-2xl font-black font-serif text-slate-800 dark:text-white">{Math.round(totalMinutes)} <span className="text-sm font-normal text-slate-400">मिनट</span></p>
              </div>
            </div>

            {/* Reading Timeline / History */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold font-serif mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full block"></span>
                हालिया पठन इतिहास
              </h3>
              
              {userAttempts.length > 0 ? (
                <div className="space-y-6">
                  {userAttempts.slice(0, 5).map((att, idx) => {
                    const art = articles.find(a => a.id === att.articleId);
                    if (!art) return null;
                    return (
                      <div key={idx} className="relative pl-6 pb-6 border-l-2 border-slate-100 dark:border-slate-800 last:pb-0 last:border-0">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900" />
                        <span className="text-[10px] text-slate-400 font-mono block mb-1">
                          {new Date(att.timestamp).toLocaleDateString("hi-IN")}
                        </span>
                        <Link href={`/articles/${art.slug}`} className="font-bold font-serif text-slate-800 dark:text-white hover:text-primary transition-colors block">
                          {art.title}
                        </Link>
                        {art.category && (
                          <span className="text-[10px] text-primary mt-1 block uppercase tracking-wider">{art.category}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">अभी तक कोई पठन इतिहास दर्ज नहीं है।</p>
              )}
            </div>

          </div>

          {/* Side Panel */}
          <div className="md:col-span-4 space-y-6">
            
            <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 font-serif">पठन प्रोफ़ाइल</h3>
              <p className="text-2xl font-black font-serif text-white mb-4">
                {totalReadArticles > 20 ? "साहित्यिक विश्लेषक" : totalReadArticles > 5 ? "जिज्ञासु पाठक" : "नव-पाठक"}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                आपका पठन व्यवहार दर्शाता है कि आप विभिन्न विषयों और शैलियों को खोजना पसंद करते हैं।
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full block"></span>
                रुचिकर श्रेणियां
              </h3>
              {categoriesExplored.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categoriesExplored.map(cat => (
                    <span key={cat} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">अधिक लेख पढ़कर अपनी रुचियां विकसित करें।</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
