"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { Clock, Eye, Calendar, ArrowRight, Play } from "lucide-react";

export default function Hero() {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [activeIndex, setActiveIndex] = useState(0);

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  useEffect(() => {
    if (published.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(3, published.length));
    }, 6000);
    return () => clearInterval(interval);
  }, [published]);

  if (published.length === 0) return null;

  // 1. Slider Articles (Up to 3 cover stories)
  const sliderArticles = published.slice(0, 3);
  const currentArticle = sliderArticles[activeIndex] || sliderArticles[0];

  // 2. Sidebar Editorial Stack: Politics, Economy, Tech (to display on the right)
  const remaining = published.filter(a => !sliderArticles.map(sa => sa.id).includes(a.id));
  
  const getArticleByCategory = (catKeywords: string[], fallbackIdx: number) => {
    const matched = remaining.find(a => 
      catKeywords.some(keyword => 
        (a.category || "").toLowerCase().includes(keyword) || 
        (a.category_hi || "").toLowerCase().includes(keyword)
      )
    );
    return matched || remaining[fallbackIdx] || published[fallbackIdx] || null;
  };

  const politicsArticle = getArticleByCategory(["राजनीति", "politics"], 0);
  const economyArticle = getArticleByCategory(["अर्थव्यवस्था", "economy", "business", "व्यवसाय"], 1);
  const techArticle = getArticleByCategory(["तकनीक", "tech", "science", "विज्ञान"], 2);

  const editorialStack = [
    { title: locale === "hi" ? "राजनीति" : "Politics", article: politicsArticle },
    { title: locale === "hi" ? "अर्थव्यवस्था" : "Economy", article: economyArticle },
    { title: locale === "hi" ? "तकनीक" : "Technology", article: techArticle }
  ].filter(item => item.article);

  const handleVideoScroll = () => {
    document.getElementById("videos-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      
      {/* Premium Apple-like blurred bubble backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#f97316]/6 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 dark:bg-orange-500/3 blur-[140px] pointer-events-none" />

      {/* Floating Bubble particles */}
      <div 
        className="absolute w-14 h-14 rounded-full bg-[#f97316]/8 blur-xl pointer-events-none"
        style={{
          animation: "floatSlow 18s ease-in-out infinite",
          top: "15%",
          left: "8%"
        }}
      />
      <div 
        className="absolute w-20 h-20 rounded-full bg-white/8 dark:bg-orange-600/5 blur-2xl pointer-events-none"
        style={{
          animation: "floatSlow 24s ease-in-out infinite",
          bottom: "20%",
          right: "12%"
        }}
      />

      <style jsx global>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-25px) translateX(15px) scale(1.05); }
        }
      `}</style>

      {/* Main Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[460px] lg:h-[calc(100vh-160px)] max-h-[620px] w-full">
        
        {/* LEFT COLUMN: HERO SLIDER (70% width -> 8 cols) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-gray-150/80 dark:border-gray-850/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)] bg-[#faf8f5] dark:bg-[#0E1322] flex flex-col justify-end min-h-[350px]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentArticle.id}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentArticle.coverImage || currentArticle.cover_image || currentArticle.image || "/images/placeholder-news.jpg"}
                alt={currentArticle.title}
                className="w-full h-full object-cover brightness-[0.82] contrast-[1.02] hover:scale-[1.015] transition-transform duration-[8000ms] ease-out"
                loading="eager"
              />
              {/* Glassmorphic Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            </motion.div>
          </AnimatePresence>

          {/* Saffron Category Badge Overlay */}
          <div className="absolute top-5 left-5 z-20">
            <span className="backdrop-blur-md bg-black/30 border border-white/10 text-[#f97316] text-[10px] font-sans font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
              {currentArticle.category || "समाचार"}
            </span>
          </div>

          {/* Full Card Click Overlay */}
          <Link 
            href={`/articles/${currentArticle.slug || currentArticle.id}`}
            className="absolute inset-0 z-10"
            aria-label={stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
          />

          {/* Bottom Left Content Area */}
          <div className="relative z-20 p-6 md:p-8 lg:p-10 text-white w-full max-w-3xl pointer-events-none">
            {/* Slide Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-sans font-bold text-gray-300 uppercase tracking-widest mb-4">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {currentArticle.published_at 
                    ? new Date(currentArticle.published_at).toLocaleDateString("hi-IN", { year: "numeric", month: "short", day: "numeric" })
                    : currentArticle.created_at
                      ? new Date(currentArticle.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "short", day: "numeric" })
                      : ""
                  }
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {currentArticle.content
                    ? `${Math.max(1, Math.ceil(currentArticle.content.split(/\s+/).length / 150))} मिनट पठन`
                    : "3 मिनट पठन"
                  }
                </span>
              </span>
              {currentArticle.view_count !== undefined && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{currentArticle.view_count} व्यूज</span>
                  </span>
                </>
              )}
            </div>

            {/* Slider Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-black leading-tight text-white transition-colors duration-300 tracking-tight mb-5 drop-shadow-md">
              {stripMarkdown(currentArticle.title || currentArticle.title_hi || "")}
            </h1>

            {/* Slider Summary */}
            <p className="text-gray-200 text-sm md:text-base leading-relaxed font-serif line-clamp-3 opacity-95 max-w-2xl drop-shadow-sm">
              {stripMarkdown(currentArticle.summary || currentArticle.summary_hi || currentArticle.content || "")}
            </p>

            {/* Slider Indicators */}
            {sliderArticles.length > 1 && (
              <div className="flex items-center space-x-2.5 mt-10 border-t border-white/15 pt-5 pointer-events-auto">
                {sliderArticles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-350 ${
                      idx === activeIndex 
                        ? "w-8 bg-[#f97316] shadow-[0_0_8px_#f97316]" 
                        : "w-2.5 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: EDITORIAL STACK (30% width -> 4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
          {editorialStack.map(({ title: sectionTitle, article }) => {
            const title = stripMarkdown(article.title || article.title_hi || "");
            const imageUrl = article.coverImage || article.cover_image || article.image || "/images/placeholder-news.jpg";
            
            const readTimeVal = article.content
              ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 150))
              : 2;

            return (
              <div 
                key={article.id}
                className="group/card flex items-center gap-4 bg-white dark:bg-[#0E1322] p-4 rounded-3xl border border-gray-150/80 dark:border-gray-850/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-[#f97316]/30 transition-all duration-300 flex-1 min-h-[120px]"
              >
                {/* Thumbnail */}
                <Link 
                  href={`/articles/${article.slug || article.id}`}
                  className="block relative w-20 h-20 shrink-0 overflow-hidden bg-gray-55 dark:bg-gray-900 rounded-2xl border border-gray-150/60 dark:border-gray-850/60"
                >
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-1.5 text-[9px] uppercase tracking-wider font-black text-[#f97316] mb-1">
                    <span>{sectionTitle}</span>
                    <span>•</span>
                    <span className="text-gray-400 dark:text-gray-500">{readTimeVal} मिनट पठन</span>
                  </div>

                  <Link 
                    href={`/articles/${article.slug || article.id}`}
                    className="block group-hover/card:text-[#f97316] transition-colors duration-250"
                  >
                    <h4 className="font-bold font-serif text-[13.5px] leading-snug text-gray-900 dark:text-gray-200 line-clamp-2">
                      {title}
                    </h4>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
