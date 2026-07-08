"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { BookOpen, ChevronRight, Star, ArrowRight, PlayCircle } from "lucide-react";
import { MagazineSkeleton } from "@/components/homepage/shared/Skeleton";
import type { MagazineIssue } from "@/store/types";

export default function MagazineLibraryPage() {
  const { magazines, authLoading, cmsDataLoading } = useCms();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = authLoading || cmsDataLoading || !mounted;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <MagazineSkeleton />
        </div>
      </div>
    );
  }

  // Ensure we have an array, fallback to empty
  const safeMagazines = Array.isArray(magazines) ? magazines : [];
  const publishedMags = safeMagazines.filter(m => m?.status === "Published" || !m?.status);
  
  const featuredIssue = publishedMags.find(m => m?.isFeatured) || publishedMags[0];
  const recommendedIssues = publishedMags.filter(m => m?.isRecommended);
  
  const latestIssues = [...publishedMags].sort((a, b) => new Date(b.publishDate || "").getTime() - new Date(a.publishDate || "").getTime());
  
  const categories = Array.from(new Set(publishedMags.map(m => m.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 overflow-hidden">
      
      {/* PREMIUM HERO SECTION */}
      {featuredIssue ? (
        <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-20">
          {/* Immersive Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image 
              src={featuredIssue.coverImage || "/placeholder-cover.jpg"} 
              alt="Background" 
              fill 
              className="object-cover opacity-30 dark:opacity-20 blur-3xl scale-125 transform-gpu"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/80 to-[#FAFAFA] dark:via-[#050505]/80 dark:to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA] via-transparent to-[#FAFAFA] dark:from-[#050505] dark:via-transparent dark:to-[#050505]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-fit backdrop-blur-md border border-primary/20">
                <Star className="w-3 h-3 fill-primary" />
                <span>विशेषांक (Featured Issue)</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black font-serif text-slate-900 dark:text-white leading-[1.1] mb-4 tracking-tight drop-shadow-sm">
                {featuredIssue.issue}
                {featuredIssue.edition && (
                  <span className="block text-primary text-3xl md:text-4xl mt-2 font-bold font-sans tracking-normal opacity-90">{featuredIssue.edition}</span>
                )}
              </h1>
              
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-6 flex items-center gap-3">
                <span>{featuredIssue.month} {featuredIssue.year}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>{featuredIssue.category || 'साहित्य'}</span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg font-serif">
                {featuredIssue.description || 'साहित्य, विचार और संवाद का प्रीमियम डिजिटल मंच। इस अंक में पढ़ें विशेष लेख और कहानियाँ।'}
              </p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <Link 
                  href={`/magazine/read/${featuredIssue.id}`} 
                  className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-3 group-hover:text-white">
                    <PlayCircle className="w-5 h-5" />
                    अभी पढ़ें (Read Now)
                  </span>
                </Link>
                
                <Link 
                  href={`/magazine/${featuredIssue.id}`} 
                  className="group px-8 py-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 rounded-full font-bold flex items-center gap-2 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                >
                  विवरण देखें
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
            
            {/* Right Cover Art - 3D Perspective */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: -10 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="lg:col-span-7 flex items-center justify-center relative perspective-1000 order-1 lg:order-2"
            >
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 z-0" />
              
              <motion.div 
                whileHover={{ scale: 1.05, rotateY: 0, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10 w-full max-w-[320px] md:max-w-[400px] aspect-[1/1.4] rounded-sm overflow-hidden shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.8)] border-r border-y border-white/20 dark:border-white/10"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Image 
                  src={featuredIssue.coverImage || "/placeholder-cover.jpg"} 
                  alt={featuredIssue.issue} 
                  className="w-full h-full object-cover" 
                  fill 
                  priority
                  sizes="(max-width: 768px) 320px, 400px"
                />
                
                {/* Magazine Spine Lighting Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/40 via-white/40 to-transparent z-20 mix-blend-overlay" />
                {/* Glass Glare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 z-20 pointer-events-none transform -translate-x-full hover:translate-x-full" />
              </motion.div>
            </motion.div>
            
          </div>
        </section>
      ) : (
        <div className="pt-40 pb-24 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2">पत्रिकाएँ जल्द आ रही हैं</h2>
          <p className="text-slate-500 dark:text-slate-400">हमारी टीम नए संस्करणों पर काम कर रही है। कृपया कुछ समय बाद पुनः जाँचें।</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-24">
        
        {/* LATEST ISSUES SHELF */}
        {latestIssues.length > 0 && (
          <MagazineShelf title="नवीनतम संस्करण (Latest Issues)" issues={latestIssues.slice(0, 4)} viewAllHref="/magazine/archive" />
        )}

        {/* RECOMMENDED ISSUES SHELF */}
        {recommendedIssues.length > 0 && (
          <MagazineShelf title="संपादक की पसंद (Editor's Picks)" issues={recommendedIssues.slice(0, 4)} />
        )}

        {/* DYNAMIC CATEGORY COLLECTIONS */}
        {categories.map(category => {
          if (!category) return null;
          const categoryMags = publishedMags.filter(m => m.category === category);
          if (categoryMags.length === 0) return null;
          
          return (
            <MagazineShelf key={category} title={`${category} संग्रह`} issues={categoryMags} />
          );
        })}

      </main>
    </div>
  );
}

function MagazineShelf({ title, issues, viewAllHref }: { title: string, issues: MagazineIssue[], viewAllHref?: string }) {
  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-3xl font-black font-serif text-slate-900 dark:text-white flex items-center gap-3">
          {title}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary flex items-center gap-1 transition-colors">
            सभी देखें <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      
      {/* Scrollable Container with snapping */}
      <div className="flex overflow-x-auto gap-8 pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
        {issues.map((mag, idx) => (
          <div key={mag.id} className="snap-start shrink-0 w-[240px] md:w-[280px]">
            <MagazineCoverCard mag={mag} index={idx} />
          </div>
        ))}
      </div>
    </section>
  );
}

function MagazineCoverCard({ mag, index }: { mag: MagazineIssue, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/magazine/${mag.id}`} className="block">
        <div className="relative rounded-sm overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-[1/1.4] mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)] perspective-1000">
          
          <motion.div 
            className="w-full h-full relative"
            whileHover={{ rotateY: -8, rotateX: 2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
          >
            <Image 
              src={mag.coverImage || "/placeholder-cover.jpg"} 
              alt={mag.issue} 
              className="w-full h-full object-cover" 
              loading="lazy" 
              fill 
              sizes="(max-width: 768px) 240px, 280px"
            />
            
            {/* Spine lighting */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-white/70 via-white/20 to-transparent z-10 mix-blend-overlay" />
            
            {/* Glassmorphic Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
               <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                 <BookOpen className="w-4 h-4 text-primary" /> विवरण (Details)
               </div>
            </div>
          </motion.div>
        </div>
        
        <div className="px-1">
          <div className="text-[11px] font-bold text-primary tracking-widest uppercase mb-2 flex items-center gap-2">
            <span>{mag.month} {mag.year}</span>
            {mag.category && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-500 dark:text-slate-400">{mag.category}</span>
              </>
            )}
          </div>
          <h3 className="font-black font-serif text-xl text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {mag.issue}
          </h3>
          {mag.edition && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{mag.edition}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
