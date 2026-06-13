"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { BookOpen, Download, ArrowRight, ChevronRight, Bookmark, PlayCircle } from "lucide-react";
import type { MagazineIssue } from "@/store/types";

export default function MagazineLibraryPage() {
  const { magazines } = useCms();
  const [progress, setProgress] = useState<{ issueId: string; page: number; percentage: number; } | null>(null);

  useEffect(() => {
    // Load local reading progress
    const saved = localStorage.getItem("yuvakshar_mag_progress");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filter out drafts or non-published if we were to enforce it, but we assume magazines are pre-filtered or we just filter here
  const publishedMags = magazines.filter(m => m.status === "Published" || !m.status) as MagazineIssue[];
  
  const featuredIssue = publishedMags.find(m => m.isFeatured) || publishedMags[0];
  const recommendedIssues = publishedMags.filter(m => m.isRecommended);
  
  // Latest issues based on publish date
  const latestIssues = [...publishedMags].sort((a, b) => new Date(b.publishDate || "").getTime() - new Date(a.publishDate || "").getTime());
  
  // Extract dynamic categories
  const categories = Array.from(new Set(publishedMags.map(m => m.category).filter(Boolean)));

  const continueReadingMag = progress ? publishedMags.find(m => m.id === progress.issueId) : null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-hindi selection:bg-primary/20">
      
      {/* HEADER */}
      <header className="pt-24 pb-12 px-6 border-b border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 dark:text-white">युवाक्षर ई-पत्रिका</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-serif">
            साहित्य, विचार और संवाद का प्रीमियम डिजिटल मंच।
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        
        {/* CONTINUE READING WIDGET */}
        {continueReadingMag && progress && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
            <div className="w-24 h-32 md:w-32 md:h-44 shrink-0 rounded-lg shadow-md overflow-hidden relative border border-slate-200 dark:border-slate-700">
               <img src={continueReadingMag.coverImage} alt={continueReadingMag.issue} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
               <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
                 <PlayCircle className="w-3.5 h-3.5" />
                 पढ़ना जारी रखें
               </div>
               <h3 className="text-2xl font-bold font-serif">{continueReadingMag.issue} - {continueReadingMag.edition}</h3>
               <p className="text-slate-500 text-sm">पृष्ठ {progress.page + 1} • {progress.percentage}% पूर्ण</p>
               
               <div className="w-full md:w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress.percentage}%` }} />
               </div>
               
               <div className="pt-2">
                 <Link href={`/magazine/read/${continueReadingMag.id}`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md">
                   पुनः आरंभ करें
                   <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
          </section>
        )}

        {/* HERO / FEATURED ISSUE */}
        {featuredIssue && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
                विशेषांक
              </h2>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 group">
              <div className="p-8 lg:p-16 flex flex-col justify-center relative z-10">
                 <div className="inline-flex text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">
                   {featuredIssue.month} {featuredIssue.year}
                 </div>
                 <h2 className="text-4xl lg:text-5xl font-black font-serif text-slate-900 dark:text-white mb-4 leading-tight">
                   {featuredIssue.issue}
                   <span className="block text-primary mt-2">{featuredIssue.edition}</span>
                 </h2>
                 <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                   {featuredIssue.description}
                 </p>
                 
                 <div className="flex flex-wrap gap-4">
                   <Link href={`/magazine/read/${featuredIssue.id}`} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
                     <BookOpen className="w-5 h-5" />
                     अभी पढ़ें
                   </Link>
                   <Link href={`/magazine/${featuredIssue.id}`} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                     विवरण देखें
                   </Link>
                 </div>
              </div>
              
              <div className="relative h-[400px] lg:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-8">
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 w-24" />
                 <motion.div 
                   whileHover={{ scale: 1.02, rotateY: -5 }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   className="relative z-20 shadow-2xl rounded-sm overflow-hidden border border-slate-200/50 dark:border-slate-700/50 w-2/3 max-w-sm perspective-1000"
                 >
                   <img src={featuredIssue.coverImage} alt={featuredIssue.issue} className="w-full h-auto object-cover" />
                   {/* Magazine Spine Highlight effect */}
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-white/40 to-transparent" />
                 </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* LATEST ISSUES BOOKSHELF */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
              नवीनतम संस्करण
            </h2>
            <Link href="/magazine/archive" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              सभी देखें <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {latestIssues.slice(0, 4).map(mag => (
              <MagazineCoverCard key={mag.id} mag={mag} />
            ))}
          </div>
        </section>

        {/* DYNAMIC CATEGORY COLLECTIONS */}
        {categories.map(category => {
          const categoryMags = publishedMags.filter(m => m.category === category);
          if (categoryMags.length === 0) return null;
          
          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-slate-300 dark:bg-slate-700 rounded-full block"></span>
                  {category} संग्रह
                </h2>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
                {categoryMags.map(mag => (
                  <div key={mag.id} className="snap-start shrink-0 w-[160px] md:w-[200px]">
                    <MagazineCoverCard mag={mag} compact />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

      </main>
    </div>
  );
}

function MagazineCoverCard({ mag, compact = false }: { mag: MagazineIssue, compact?: boolean }) {
  return (
    <Link href={`/magazine/${mag.id}`} className="group block">
      <div className="relative rounded-sm overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 mb-4 bg-slate-100 dark:bg-slate-800 aspect-[3/4]">
        <img src={mag.coverImage} alt={mag.issue} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
           <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
             <BookOpen className="w-4 h-4" /> विवरण
           </span>
        </div>
        {/* Magazine Spine Highlight */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-white/60 to-transparent" />
      </div>
      
      <div>
        <div className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">
          {mag.month} {mag.year}
        </div>
        <h3 className={`font-bold font-serif text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors ${compact ? "text-base" : "text-lg"}`}>
          {mag.issue}
        </h3>
        {!compact && mag.edition && (
          <p className="text-sm text-slate-500 mt-1 truncate">{mag.edition}</p>
        )}
      </div>
    </Link>
  );
}
