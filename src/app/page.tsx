"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Clock, 
  ArrowRight, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Volume2,
  BookOpen,
  Brain,
  Sparkles,
  PenTool,
  Users,
  Eye,
  MessageSquare
} from "lucide-react";

import { useCms } from "@/store/CmsContext";
import LiveNewsTicker from "@/components/yuvakshar/LiveNewsTicker";
import { stripMarkdown } from "@/lib/markdown";
import { mockAuthorProfiles } from "@/lib/mockData";

// Helper to generate author profile URL slugs safely
const slugifyAuthor = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0900-\u097F-]/g, '') // keep Devanagari + alphanumeric + hyphens
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function Home() {
  const { articles, magazines, settings, incrementArticleView, layouts, comments } = useCms();
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);

  // Load published articles
  const publishedArticles = articles.filter(a => a.status === "Published" || a.status === "Approved" || !a.status);
  const latestMag = magazines[0] || { issue: "मई २०२५", month: "मई २०२५", coverImage: "/yuvakshar_logo.jpg", description: "" };

  // Slider Featured Stories (Left Hero)
  const sliderStories = publishedArticles.filter(a => a.isFeatured).slice(0, 3).map(a => ({
    id: a.id,
    title: stripMarkdown(a.title),
    summary: stripMarkdown(a.summary),
    author: a.author,
    date: a.date,
    coverImage: a.coverImage,
    category: a.category,
    accessLevel: a.accessLevel,
    views: a.views || 0,
    readTime: a.readTime || "5 मिनट"
  }));
  if (sliderStories.length === 0 && publishedArticles.length > 0) {
    sliderStories.push(...publishedArticles.slice(0, 3).map(a => ({
      id: a.id,
      title: stripMarkdown(a.title),
      summary: stripMarkdown(a.summary),
      author: a.author,
      date: a.date,
      coverImage: a.coverImage,
      category: a.category,
      accessLevel: a.accessLevel,
      views: a.views || 0,
      readTime: a.readTime || "5 मिनट"
    })));
  }

  // ताजा समाचार items (Middle Hero)
  const freshNews = publishedArticles
    .filter(a => a.category === "समाचार")
    .slice(0, 4)
    .map(a => ({
      id: a.id,
      title: stripMarkdown(a.title),
      date: a.date,
      thumbnail: a.coverImage,
      accessLevel: a.accessLevel
    }));

  // विशेष लेख (Middle row left, grid of 4 cards)
  const specialArticles = publishedArticles
    .filter(a => a.category === "विशेष लेख")
    .slice(0, 4)
    .map(a => ({
      id: a.id,
      title: stripMarkdown(a.title),
      author: a.author,
      date: a.date,
      image: a.coverImage,
      accessLevel: a.accessLevel
    }));

  // विचार items (Middle row center, 2 rows)
  const opinionArticles = publishedArticles
    .filter(a => a.category === "विचार")
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      title: stripMarkdown(a.title),
      author: a.author,
      date: a.date,
      avatar: a.coverImage,
      accessLevel: a.accessLevel
    }));

  // editor choice articles mapping
  const editorChoiceArticles = publishedArticles
    .filter(a => a.category === "विशेष लेख" || a.category === "विचार")
    .slice(1, 4)
    .map(a => ({
      id: a.id,
      title: stripMarkdown(a.title),
      summary: stripMarkdown(a.summary),
      author: a.author,
      date: a.date,
      image: a.coverImage,
      accessLevel: a.accessLevel,
      readTime: a.readTime || "5 मिनट",
      views: a.views || 0
    }));

  // Archives (Bottom row)
  const archives = magazines.slice(1).slice(0, 5).map(m => ({
    id: m.id,
    issue: m.issue,
    number: m.issue.split(" — ")[0],
    cover: m.coverImage
  }));

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliderStories.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + sliderStories.length) % sliderStories.length);
  };

  // Video Time simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (videoPlaying) {
      interval = setInterval(() => {
        setVideoTime((prev) => {
          if (prev >= 325) {
            setVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoPlaying]);

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSlide = sliderStories[activeSlide] || { id: "", title: "", summary: "", author: "", date: "", coverImage: "", category: "", views: 0, readTime: "5 मिनट" };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0A0F1D] text-[#0F172A] dark:text-slate-200 pb-20">
      
      {/* 1. HERO SECTION (THREE COLUMNS GRID) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column A (Left: Main Featured Slider - width 8/12) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {currentSlide.id ? (
              <div className="relative h-[220px] sm:h-[380px] rounded-2xl overflow-hidden border border-border shadow-lg group">
                <img 
                  src={currentSlide.coverImage} 
                  alt={currentSlide.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
                
                {/* Featured Category and Access Level labels */}
                <div className="absolute top-4 left-4 flex space-x-2 z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-primary text-white px-3 py-1 rounded shadow-md">
                    {currentSlide.category}
                  </span>
                  {currentSlide.accessLevel && currentSlide.accessLevel !== "Free" && (
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded shadow-md text-white font-sans ${
                      currentSlide.accessLevel === "Patron" ? "bg-amber-500" : "bg-[#3B82F6]"
                    }`}>
                      {currentSlide.accessLevel}
                    </span>
                  )}
                </div>

                {/* Slider Next/Prev Arrows */}
                <button 
                  onClick={handlePrevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-primary text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-primary text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Slide text contents */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                  <div className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                    <span>🔥 आज की प्रमुख कहानी</span>
                  </div>
                  <Link 
                    href={`/editorial?id=${currentSlide.id}`} 
                    onClick={() => incrementArticleView(currentSlide.id)}
                    className="hover:text-primary transition-colors block"
                  >
                    <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-tight font-hindi">
                      {currentSlide.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-300 line-clamp-2 font-light hidden lg:block">
                    {currentSlide.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400 gap-2">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <div className="hidden lg:flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-primary shrink-0" />
                        <Link href={`/authors/${slugifyAuthor(currentSlide.author)}`} className="hover:text-primary hover:underline transition-colors">{currentSlide.author}</Link>
                      </div>
                      <span className="hidden lg:inline">•</span>
                      <span>{currentSlide.date}</span>
                      <span className="hidden lg:inline">•</span>
                      <div className="hidden lg:flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{currentSlide.readTime}</span>
                      </div>
                      <span className="hidden lg:inline">•</span>
                      <div className="hidden lg:flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{currentSlide.views} पठन</span>
                      </div>
                      <span className="hidden lg:inline">•</span>
                      <div className="hidden lg:flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{comments.filter(c => c.article_id === currentSlide.id).length} टिप्पणियाँ</span>
                      </div>
                    </div>
                    
                    {/* Indicators dot */}
                    <div className="flex space-x-1">
                      {sliderStories.map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            idx === activeSlide ? "bg-primary w-3" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[380px] bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-border">
                <span className="text-xs text-slate-400">कोई फीचर लेख उपलब्ध नहीं है</span>
              </div>
            )}
          </div>

          {/* Column B (Right: ताजा समाचार - width 4/12) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
                  <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">ताजा समाचार</h3>
                </div>
                <Link href="/current-affairs?category=समाचार" className="text-xs text-primary hover:underline font-bold">सभी देखें →</Link>
              </div>

              <div className="space-y-4">
                {freshNews.length > 0 ? (
                  freshNews.map((news) => (
                    <div key={news.id} className="flex space-x-3 items-start border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                      <img 
                        src={news.thumbnail} 
                        alt={news.title}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <Link href={`/editorial?id=${news.id}`} className="hover:text-primary transition-colors line-clamp-2 text-xs font-serif font-bold leading-snug">
                            {news.title}
                          </Link>
                          {news.accessLevel && news.accessLevel !== "Free" && (
                            <span className={`hidden lg:inline-block text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider font-sans border ${
                              news.accessLevel === "Patron" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                            }`}>
                              {news.accessLevel}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">{news.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">कोई समाचार उपलब्ध नहीं है</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NEW: CURRENT ISSUE & AI STUDY COMPANION GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: वर्तमान अंक (Current Issue) - width 7/12 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                वर्तमान अंक
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 bg-slate-50 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
              <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                <img 
                  src={latestMag.coverImage} 
                  alt="Current Issue Cover" 
                  className="w-40 h-56 object-cover rounded-xl shadow-md border border-slate-250 dark:border-slate-750 transform hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
                  }}
                />
              </div>
              <div className="flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs text-primary font-bold tracking-wider font-mono">नवीनतम अंक: {latestMag.issue}</span>
                  <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight font-hindi">
                    विषय: राष्ट्र निर्माण, डिजिटल संप्रभुता और भारतीय भाषाएं
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    इस अंक में भारत की तकनीकी नीति, स्वदेशी तकनीकी पारिस्थितिकी तंत्र, सुपरकंप्यूटिंग मिशन और राष्ट्रीय अस्मिता से संबंधित प्रमुख आलेख संकलित हैं।
                  </p>
                  
                  {/* Topics Bullet list */}
                  <div className="pt-2 space-y-1">
                    {[
                      "१. तकनीकी संप्रभुता और AI का भविष्य",
                      "२. भारतीय भाषाओं में ज्ञान-विज्ञान का प्रसार",
                      "३. नई शिक्षा नीति 2020: क्रियान्वयन की राहें"
                    ].map((topic, index) => (
                      <div key={index} className="text-xs text-slate-700 dark:text-slate-350 flex items-center gap-1.5 font-hindi">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link 
                    href="/magazine" 
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 inline-flex items-center gap-1.5"
                  >
                    <span>पूरा अंक ऑनलाइन पढ़ें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/magazine" 
                    className="border border-slate-300 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200 hover:text-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all bg-white dark:bg-slate-800"
                  >
                    पिछले अंक देखें
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI अध्ययन साथी (AI Study Companion) - width 5/12 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI अध्ययन साथी
              </h3>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-indigo-900/50 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between h-[282px]">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-650 text-white px-2 py-0.5 rounded shadow-sm font-sans">
                    AI POWERED
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">स्वाध्याय उपकरण</span>
                </div>
                <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white leading-tight font-hindi">
                  अपनी पठन यात्रा को सुगम व बौद्धिक बनाएं
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  युवाक्षर AI आपके पठन अनुभव को डिजिटल नोट्स, त्वरित सारांश और लेख-आधारित ज्ञानवर्धक क्विज़ के साथ समृद्ध करता है।
                </p>
              </div>

              {/* Quick features badges */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "📝 व्याख्या व शब्दकोश", href: "/dashboard" },
                  { label: "📊 ३० सेकंड सारांश", href: "/dashboard" },
                  { label: "🎯 ज्ञानवर्धक क्विज़", href: "/dashboard" },
                  { label: "💬 अध्ययन साथी चैट", href: "/dashboard" }
                ].map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.href}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 hover:border-primary transition-all text-[11px] font-bold font-hindi"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </Link>
                ))}
              </div>

              <Link 
                href="/dashboard"
                className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10"
              >
                <span>AI अध्ययन साथी का उपयोग करें</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE ROW SECTIONS (THREE COLUMNS GRID) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column A: विशेष लेख (Left 2/3 Area - 4 cards grid) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
                <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">विशेष लेख</h3>
              </div>
              <Link href="/current-affairs?category=विशेष लेख" className="text-xs text-primary hover:underline font-bold">सभी देखें →</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {specialArticles.length > 0 ? (
                specialArticles.map((art) => (
                  <div key={art.id} className="group flex flex-col justify-between border border-slate-100 dark:border-slate-800/40 p-3 rounded-2xl bg-white dark:bg-slate-900/30 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="relative h-[110px] w-full rounded-xl overflow-hidden">
                        <img 
                          src={art.image} 
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {art.accessLevel && art.accessLevel !== "Free" && (
                          <div className="absolute top-2 left-2 hidden lg:block">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider text-white font-sans ${
                              art.accessLevel === "Patron" ? "bg-amber-500" : "bg-[#3B82F6]"
                            }`}>
                              {art.accessLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link href={`/editorial?id=${art.id}`} className="block hover:text-primary transition-colors">
                        <h4 className="font-serif text-xs font-bold leading-snug line-clamp-2 font-hindi">
                          {art.title}
                        </h4>
                      </Link>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/40 mt-4 text-[9px] text-slate-400">
                      <Link href={`/authors/${slugifyAuthor(art.author)}`} className="font-medium text-slate-500 dark:text-slate-400 hidden lg:inline hover:text-primary hover:underline transition-colors">{art.author}</Link>
                      <span className="font-mono">{art.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 col-span-full">कोई विशेष लेख उपलब्ध नहीं है</div>
              )}
            </div>
          </div>

          {/* Column B: विचार (Middle area - 2 vertical cards) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
                <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">विचार</h3>
              </div>
              <Link href="/current-affairs?category=विचार" className="text-xs text-primary hover:underline font-bold">सभी देखें →</Link>
            </div>

            <div className="space-y-4">
              {opinionArticles.length > 0 ? (
                opinionArticles.map((op) => (
                  <div key={op.id} className="flex items-start space-x-3 border border-slate-100 dark:border-slate-800/40 p-4 rounded-2xl bg-white dark:bg-slate-900/30">
                    <img 
                      src={op.avatar} 
                      alt={op.author}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <Link href={`/editorial?id=${op.id}`} className="hover:text-primary transition-colors text-xs font-serif font-bold leading-snug line-clamp-2">
                          {op.title}
                        </Link>
                        {op.accessLevel && op.accessLevel !== "Free" && (
                          <span className={`hidden lg:inline-block text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider font-sans border ${
                            op.accessLevel === "Patron" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
                          }`}>
                            {op.accessLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-400">
                        <Link href={`/authors/${slugifyAuthor(op.author)}`} className="text-slate-500 dark:text-slate-400 hidden lg:inline hover:text-primary hover:underline transition-colors">{op.author}</Link>
                        <span className="hidden lg:inline">•</span>
                        <span className="font-mono">{op.date}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">कोई विचार आलेख उपलब्ध नहीं है</div>
              )}
            </div>
          </div>

          {/* Column C: वीडियो रिपोर्ट (Right area - play interface) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
                <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">वीडियो रिपोर्ट</h3>
              </div>
              <Link href="/current-affairs?category=वीडियो" className="text-xs text-primary hover:underline font-bold">सभी देखें →</Link>
            </div>

            {/* Video Player Display */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group bg-[#0F172A]">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80" 
                alt="Video Cover"
                className={`w-full h-[180px] object-cover transition-all ${videoPlaying ? "opacity-30 blur-sm" : "group-hover:scale-105 duration-500 brightness-75"}`}
              />

              {/* Play overlays */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 text-white">
                <div className="flex justify-end">
                  <span className="text-[8px] tracking-wider uppercase font-bold bg-primary text-white px-2 py-0.5 rounded">
                    LIVE REPORT
                  </span>
                </div>

                <div className="flex items-center justify-center flex-grow">
                  <button 
                    onClick={() => setVideoPlaying(!videoPlaying)}
                    className="p-4 rounded-full bg-primary hover:bg-primary/95 hover:scale-110 text-white shadow-xl transition-all cursor-pointer"
                  >
                    {videoPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-xs font-bold leading-snug">
                    शिक्षा व्यवस्था में सुधार की जरूरत
                  </h4>
                  {/* Mock Seek bar playhead controls */}
                  <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mt-1">
                    <span>{formatVideoTime(videoTime)}</span>
                    <div className="flex-grow mx-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(videoTime / 325) * 100}%` }} />
                    </div>
                    <span>5:25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VIDEO REPORT AND YOUTUBE SHORTS GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">युवाक्षर वीडियो गैलरी और शॉर्ट्स</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">YouTube & Shorts Integration</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Video Card (Col Span 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-black">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Featured Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-sans">Featured Report</span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-snug">
                  विशेष चर्चा: भारत में डिजिटल संप्रभुता और सुपरकंप्यूटिंग क्रांति का भविष्य
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  इस विशेष रिपोर्ट में देखिए कि कैसे राष्ट्रीय सुपरकंप्यूटिंग मिशन (NSM) भारत को तकनीक के क्षेत्र में आत्मनिर्भर बनाने की दिशा में नए मार्ग प्रशस्त कर रहा है।
                </p>
              </div>
            </div>

            {/* Shorts Vertical Gallery (Col Span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="font-serif font-bold text-sm text-primary border-l-2 border-primary pl-2">ताजा यूट्यूब शॉर्ट्स (Shorts Grid)</h4>
              
              <div className="flex lg:grid lg:grid-cols-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none gap-4">
                {/* Short 1 */}
                <div className="space-y-2 w-[180px] sm:w-[220px] lg:w-auto shrink-0 lg:shrink-1">
                  <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow bg-black">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Short 1"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <p className="text-[10px] font-serif font-bold text-center line-clamp-1">डिजिटल इंडिया शॉर्ट्स</p>
                </div>

                {/* Short 2 */}
                <div className="space-y-2 w-[180px] sm:w-[220px] lg:w-auto shrink-0 lg:shrink-1">
                  <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow bg-black">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Short 2"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <p className="text-[10px] font-serif font-bold text-center line-clamp-1">सुपरकंप्यूटर क्या है?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. संपादक की पसंद (Editor's Choice) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                संपादक की पसंद
              </h3>
            </div>
            <Link href="/current-affairs?category=विशेष लेख" className="text-xs text-primary hover:underline font-bold">सभी देखें →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editorChoiceArticles.length > 0 ? (
              editorChoiceArticles.map((art) => (
                <div key={art.id} className="group flex flex-col justify-between border border-slate-200 dark:border-slate-800/50 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="relative h-[160px] w-full rounded-xl overflow-hidden shadow-sm">
                      <img 
                        src={art.image} 
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      {art.accessLevel && art.accessLevel !== "Free" && (
                        <div className="absolute top-2.5 left-2.5 hidden lg:block">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider text-white font-sans ${
                            art.accessLevel === "Patron" ? "bg-rose-500" : "bg-[#3B82F6]"
                          }`}>
                            {art.accessLevel}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/editorial?id=${art.id}`} className="block hover:text-primary transition-colors">
                      <h4 className="font-serif text-sm font-bold leading-snug line-clamp-2 font-hindi text-slate-800 dark:text-white">
                        {art.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-light hidden lg:block">
                      {art.summary}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-150 dark:border-slate-800/60 mt-4 text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Link href={`/authors/${slugifyAuthor(art.author)}`} className="font-medium text-slate-600 dark:text-slate-350 hidden lg:inline hover:text-primary hover:underline transition-colors">{art.author}</Link>
                      <span className="font-mono lg:hidden">{art.date}</span>
                    </div>
                    <div className="hidden lg:flex items-center space-x-2 font-mono">
                      <span>{art.readTime}</span>
                      <span>•</span>
                      <span>{art.views} पठन</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 col-span-full font-hindi">कोई आलेख उपलब्ध नहीं है</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. हमारे लेखक (Our Authors) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                हमारे लेखक
              </h3>
            </div>
            <Link href="/submit-article" className="text-xs text-primary hover:underline font-bold">लेखक मंडल से जुड़ें →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockAuthorProfiles.slice(0, 3).map((author, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 bg-slate-50/50 dark:bg-[#0F172A]/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-shadow">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow p-1 bg-white dark:bg-slate-900 mb-3">
                  <img 
                    src={author.avatarUrl} 
                    alt={author.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
                    }}
                  />
                </div>
                <Link href={`/authors/${slugifyAuthor(author.name)}`} className="hover:text-primary transition-colors">
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white font-hindi">{author.name}</h4>
                </Link>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider font-mono mt-0.5">{author.role}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 font-light leading-relaxed">
                  {author.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BOTTOM ROW (पत्रिका के पुराने अंक - 5 older issues) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-slate-100 dark:border-slate-800/80">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2 border-l-2 border-primary pl-2">
              <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">पत्रिका के पुराने अंक</h3>
            </div>
            <Link href="/magazine" className="text-xs text-primary hover:underline font-bold">सभी अंक देखें →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {archives.length > 0 ? (
              archives.map((arc) => (
                <div key={arc.id} className="flex flex-col items-center bg-slate-50/50 dark:bg-[#0F172A]/10 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl text-center space-y-3 group hover:shadow-md transition-shadow">
                  <img 
                    src={arc.cover} 
                    alt={arc.issue}
                    className="w-20 h-28 object-cover rounded-lg shadow border border-slate-200 dark:border-slate-800 group-hover:scale-102 transition-transform"
                  />
                  <div>
                    <h4 className="font-serif text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight">
                      {arc.issue}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{arc.number}</span>
                  </div>
                  <Link 
                    href="/magazine"
                    className="w-full text-center border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-500 dark:text-slate-300 hover:text-primary py-1 rounded-md text-[9px] font-bold transition-all bg-white dark:bg-slate-800 cursor-pointer block"
                  >
                    ऑनलाइन पढ़ें
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 col-span-full">कोई पुराना अंक उपलब्ध नहीं है</div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}