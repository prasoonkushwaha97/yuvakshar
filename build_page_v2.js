const fs = require("fs");
const path = require("path");

const HINDI = {
  SAMACHAR: "\u0938\u092E\u093E\u091A\u093E\u0930",
  LIVE_UPDATES: "\u0924\u093E\u091C\u093E \u0905\u092A\u0921\u0947\u091F\u094D\u0938",
  VISHLESHAN: "\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923",
  VISHESH_LEKH: "\u0935\u093F\u0936\u0947\u0937 \u0932\u0947\u0916",
  SAHITYA: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F",
  VIDEO: "\u0935\u0940\u0921\u093F\u092F\u094B",
  PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E",
  CHAUPAL: "\u091A\u094C\u092A\u093E\u0932",
  LEKHAK: "\u0932\u0947\u0916\u0915",
  AI_COMPANION: "AI \u0905\u0927\u094D\u092F\u092F\u0928 \u0938\u093E\u0925\u0940",
  NEWSLETTER: "\u0928\u094D\u092F\u0942\u091C\u093C\u0932\u0947\u091F\u0930",
  EMPTY_LEKH: "\u0932\u0947\u0916 \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0915\u093F\u090F \u091C\u093E\u090F\u0902\u0917\u0947",
  EMPTY_PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0915\u0940 \u091C\u093E\u090F\u0917\u0940",
  EMPTY_CHAUPAL: "\u091A\u094C\u092A\u093E\u0932 \u092E\u0947\u0902 \u091A\u0930\u094D\u091A\u093E \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D \u0939\u094B\u0917\u0940",
  EMPTY_LEKHAK: "\u0932\u0947\u0916\u0915 \u0938\u0942\u091A\u0940 \u0936\u0940\u0918\u094D\u0930 \u0905\u092A\u0921\u0947\u091F \u0915\u0940 \u091C\u093E\u090F\u0917\u0940",
  SEE_ALL: "\u0938\u092D\u0940 \u0926\u0947\u0916\u0947\u0902",
  READ_MORE: "\u0914\u0930 \u092A\u0922\u093C\u0947\u0902",
  LATEST_ISSUE: "\u0928\u0935\u0940\u0928\u0924\u092E \u0905\u0902\u0915",
  READ_PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u092A\u0922\u093C\u0947\u0902",
  JOIN_CHAUPAL: "\u091A\u094C\u092A\u093E\u0932 \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902",
  VIEW_PROFILE: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0926\u0947\u0916\u0947\u0902",
  SUBSCRIBE: "\u0938\u092C\u094D\u0938\u094D\u0915\u094D\u0930\u093E\u0907\u092C \u0915\u0930\u0947\u0902",
  ALL_VIDEOS: "\u0938\u092D\u0940 \u0935\u0940\u0921\u093F\u092F\u094B \u0926\u0947\u0916\u0947\u0902",
  USE_AI: "AI \u0905\u0927\u094D\u092F\u092F\u0928 \u0938\u093E\u0925\u0940 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902",
  MIN_READ: "\u092E\u093F\u0928\u091F",
};

const fileContent = `\uFEFF"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, PenTool, Newspaper, PlayCircle, Bot, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { stripMarkdown } from "@/lib/markdown";

const SafeImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  return (
    <img 
      src={src || "/images/placeholder-news.jpg"} 
      alt={alt} 
      className={className} 
      onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }} 
    />
  );
};

const HomepageSkeleton = () => (
  <div className="w-full flex flex-col gap-12 pt-8 animate-pulse bg-white min-h-screen">
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-9 h-[500px] bg-gray-200 rounded-lg"></div>
         <div className="lg:col-span-3 flex flex-col gap-4">
           {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
         </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { articles, magazines, videos } = useCms();
  const [isClient, setIsClient] = useState(false);
  const [visibleNewsCount, setVisibleNewsCount] = useState(6);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <HomepageSkeleton />;

  const publishedArticles = (articles ?? []).filter(
    (a: any) => a.status === "Published" || a.status === "Approved" || !a.status
  );

  const heroMain = publishedArticles[0];
  const heroSecondary = publishedArticles.slice(1, 6);

  const liveNews = publishedArticles.slice(0, visibleNewsCount);

  const newsArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.SAMACHAR}").slice(0, 8);
  const analysisArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.VISHLESHAN}").slice(0, 4);
  const featureArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.VISHESH_LEKH}").slice(0, 5);
  const literatureArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.SAHITYA}").slice(0, 4);

  const featuredVideos = (videos ?? []).slice(0, 3);
  const latestMag = (magazines ?? [])[0];
  
  const allAuthors = Array.from(new Set(publishedArticles.map((a: any) => a.author).filter(Boolean)));
  const featuredAuthors = allAuthors.slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-white text-black pb-16 font-sans">
      <div className="w-full flex flex-col gap-12 pt-8">
        
        {/* SECTION 1 — HERO */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          {publishedArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT SIDE (75%) - Featured Article */}
              <div className="lg:col-span-9 flex flex-col group">
                {heroMain && (
                  <Link href={\`/editorial?id=\${heroMain.id}\`} className="flex flex-col gap-4">
                    <div className="aspect-[21/9] w-full overflow-hidden relative rounded-sm">
                      <SafeImage src={heroMain.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={stripMarkdown(heroMain.title)} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#EA580C] font-bold uppercase text-xs tracking-widest mb-2 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#EA580C] mr-2"></span>
                        {heroMain.category || "${HINDI.SAMACHAR}"}
                      </span>
                      <h1 className="text-4xl md:text-6xl font-black font-serif leading-[1.1] text-black group-hover:text-gray-700 transition-colors mb-4">
                        {stripMarkdown(heroMain.title)}
                      </h1>
                      <p className="text-gray-700 text-xl leading-relaxed mb-4 max-w-4xl">
                        {stripMarkdown(heroMain.summary || heroMain.content || "").substring(0, 200)}...
                      </p>
                      <div className="flex items-center text-sm text-gray-500 font-medium uppercase tracking-wider gap-4 border-t border-gray-200 pt-4">
                        <span>{heroMain.author}</span>
                        <span>{heroMain.date}</span>
                        <span>5 ${HINDI.MIN_READ}</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
              
              {/* RIGHT SIDE (25%) - Latest Stories */}
              <div className="lg:col-span-3 flex flex-col border-l border-gray-200 pl-0 lg:pl-8">
                <h3 className="font-bold text-sm tracking-widest uppercase mb-4 border-b-2 border-black pb-2">${HINDI.LIVE_UPDATES}</h3>
                <div className="flex flex-col gap-5">
                  {heroSecondary.map((article: any) => (
                    <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex gap-4 items-start">
                      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                         <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-sm group-hover:text-[#EA580C] leading-snug line-clamp-3 font-serif">{stripMarkdown(article.title)}</h4>
                        <span className="text-xs text-gray-500 mt-1">{article.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center bg-gray-50 border border-gray-200 rounded-sm">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_LEKH}</h2>
            </div>
          )}
        </section>

        {/* SECTION 2 — LIVE UPDATES (Stream) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
           <div className="bg-[#FAF8F3] p-6 md:p-8 rounded-sm border border-[#E7E2D8]">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black font-serif text-black flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse mr-3"></span>
                  ${HINDI.LIVE_UPDATES}
                </h2>
             </div>
             <div className="flex flex-col gap-4">
               {liveNews.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-[#EA580C] w-16 shrink-0">{article.date?.split(',')[0] || "12:00"}</span>
                    <h3 className="font-serif text-lg group-hover:text-[#EA580C] leading-snug flex-1">{stripMarkdown(article.title)}</h3>
                    <span className="hidden md:inline-block text-xs uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{article.category}</span>
                 </Link>
               ))}
             </div>
             {publishedArticles.length > visibleNewsCount && (
               <div className="mt-8 text-center">
                 <button 
                   onClick={() => setVisibleNewsCount(prev => prev + 6)}
                   className="border border-black text-black hover:bg-black hover:text-white px-8 py-2.5 font-bold uppercase tracking-wider text-sm transition-colors rounded-sm"
                 >
                   ${HINDI.READ_MORE}
                 </button>
               </div>
             )}
           </div>
        </section>

        {/* SECTION 3 — MUKHYA SAMACHAR */}
        {(newsArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
              <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.SAMACHAR}</h2>
              <Link href={\`/category/${HINDI.SAMACHAR}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {newsArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col">
                  <div className="aspect-[4/3] rounded-sm overflow-hidden mb-3 bg-gray-100">
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <h3 className="font-serif font-bold text-xl leading-snug group-hover:text-[#EA580C] line-clamp-3">{stripMarkdown(article.title)}</h3>
                  <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">{article.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4 — VISHLESHAN */}
        {(analysisArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full bg-[#111] text-white py-16">
            <div className="border-t border-gray-700 pt-4 mb-10 flex justify-between items-end">
              <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-white">${HINDI.VISHLESHAN}</h2>
              <Link href={\`/category/${HINDI.VISHLESHAN}\`} className="text-sm font-bold text-[#EA580C] hover:text-white transition-colors flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analysisArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col sm:flex-row gap-6 border border-gray-800 bg-[#1A1A1A] hover:bg-[#222] transition-colors p-4 rounded-sm">
                  <div className="w-full sm:w-2/5 aspect-[4/5] overflow-hidden shrink-0 rounded-sm">
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" alt={stripMarkdown(article.title)} />
                  </div>
                  <div className="flex flex-col justify-center py-4 pr-4">
                    <span className="text-[#EA580C] font-bold text-xs uppercase tracking-widest mb-3">Long Read</span>
                    <h3 className="font-serif font-bold text-2xl leading-snug text-white group-hover:text-[#EA580C] mb-4">{stripMarkdown(article.title)}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">{stripMarkdown(article.summary || "")}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase border-t border-gray-800 pt-3 mt-auto">{article.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5 — VISHESH LEKH (Bento) */}
        {(featureArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-8">
            <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
              <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.VISHESH_LEKH}</h2>
              <Link href={\`/category/${HINDI.VISHESH_LEKH}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
              {featureArticles.map((article: any, index: number) => {
                let classes = "group relative overflow-hidden rounded-sm bg-gray-900 block";
                if (index === 0) classes += " md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                else if (index === 1 || index === 2) classes += " md:col-span-1 md:row-span-1 h-[250px] md:h-full";
                else classes += " md:col-span-2 md:row-span-1 h-[250px] md:h-full";

                return (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className={classes}>
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={stripMarkdown(article.title)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                       <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider mb-2 inline-block rounded-sm">Featured</span>
                       <h3 className={\`font-serif font-bold text-white leading-tight group-hover:text-gray-200 \${index === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}\`}>{stripMarkdown(article.title)}</h3>
                       {index === 0 && <p className="text-gray-300 text-sm mt-3 line-clamp-2">{stripMarkdown(article.summary || "")}</p>}
                    </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 6 — SAHITYA */}
        {(literatureArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
              <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.SAHITYA}</h2>
              <Link href={\`/category/${HINDI.SAHITYA}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {literatureArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group bg-[#FAF8F3] p-8 border border-[#E7E2D8] hover:border-[#EA580C] transition-colors rounded-sm text-center flex flex-col items-center">
                  <div className="w-12 h-12 text-[#EA580C] mb-6 border-b-2 border-[#EA580C] pb-2">
                    <PenTool className="w-8 h-8 mx-auto" />
                  </div>
                  <h3 className="font-serif font-bold text-xl leading-tight text-black group-hover:text-[#EA580C] line-clamp-2 mb-4">{stripMarkdown(article.title)}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 font-serif italic leading-relaxed">"{stripMarkdown(article.summary || article.content?.substring(0, 100) || "")}..."</p>
                  <p className="text-xs text-black font-bold uppercase tracking-wider mt-auto">— {article.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7 — VIDEO */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full bg-black py-16 text-white">
          <div className="border-t border-gray-700 pt-4 mb-8 flex justify-between items-end">
            <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-white">${HINDI.VIDEO}</h2>
            <Link href="/category/video" className="text-sm font-bold text-[#EA580C] hover:text-white transition-colors flex items-center">
              ${HINDI.ALL_VIDEOS} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {featuredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {featuredVideos.map((video: any) => (
                 <Link href={\`/video?id=\${video.id}\`} key={video.id} className="group flex flex-col">
                   <div className="aspect-video w-full relative overflow-hidden rounded-sm bg-gray-900 mb-4">
                     <SafeImage src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt={video.title} />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-[#EA580C] transition-colors" />
                     </div>
                     <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-sm">
                       {video.duration || "00:00"}
                     </div>
                   </div>
                   <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-[#EA580C] text-white line-clamp-2">{video.title}</h3>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-gray-800 rounded-sm">
              <PlayCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-serif">वीडियो शीघ्र उपलब्ध होंगे</p>
            </div>
          )}
        </section>

        {/* SECTION 8 — PATRIKA */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
            <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.PATRIKA}</h2>
          </div>
          {latestMag ? (
            <div className="bg-[#FAF8F3] border border-[#E7E2D8] p-8 md:p-16 rounded-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative group">
                    <SafeImage src={latestMag.coverImage} alt={latestMag.issue} className="w-64 h-auto shadow-2xl border border-gray-300 transform transition-transform group-hover:scale-105 duration-500" />
                  </div>
                </div>
                <div className="w-full md:w-2/3 space-y-6 text-center md:text-left">
                  <span className="bg-[#EA580C] text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider inline-block">${HINDI.LATEST_ISSUE}</span>
                  <h2 className="text-5xl md:text-6xl font-black font-serif text-black">{latestMag.issue}</h2>
                  <p className="text-gray-700 text-xl max-w-xl font-serif">
                    विषय: {latestMag.month || "नवीनतम विमर्श"}
                  </p>
                  <p className="text-gray-600 text-lg">
                    राष्ट्रीय विमर्श, साहित्य और विशेष रिपोर्ट पढ़ें। पत्रिका का नवीनतम अंक अब उपलब्ध है।
                  </p>
                  <div className="pt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                    <Link href={\`/magazine\`} className="bg-black text-white px-8 py-3 rounded-sm font-bold hover:bg-[#EA580C] transition-colors uppercase tracking-wider text-sm">
                      ${HINDI.READ_PATRIKA}
                    </Link>
                    <Link href={\`/magazine/archive\`} className="border border-black text-black px-8 py-3 rounded-sm font-bold hover:bg-gray-100 transition-colors uppercase tracking-wider text-sm">
                      ${HINDI.SEE_ALL}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-gray-50 border border-gray-200 rounded-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_PATRIKA}</h3>
            </div>
          )}
        </section>

        {/* SECTION 9 — CHAUPAL */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
            <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.CHAUPAL}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-gray-200 p-8 rounded-sm">
               <h3 className="font-bold text-lg mb-6 flex items-center border-b pb-2"><TrendingUp className="w-5 h-5 mr-2 text-[#EA580C]" /> Trending Discussions</h3>
               <div className="py-12 text-center text-gray-500 font-serif border border-dashed border-gray-300">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  ${HINDI.EMPTY_CHAUPAL}
               </div>
            </div>
            <div className="lg:col-span-1 bg-orange-50 border border-orange-100 p-8 rounded-sm text-center flex flex-col justify-center items-center">
               <Users className="w-16 h-16 text-[#EA580C] mb-4" />
               <h3 className="text-2xl font-serif font-bold mb-4">समुदाय से जुड़ें</h3>
               <p className="text-gray-600 mb-8">अपने विचार साझा करें और अन्य पाठकों के साथ चर्चा करें।</p>
               <Link href="/community" className="bg-[#EA580C] text-white px-8 py-3 rounded-sm font-bold hover:bg-[#c24100] transition-colors uppercase tracking-wider text-sm w-full">
                 ${HINDI.JOIN_CHAUPAL}
               </Link>
            </div>
          </div>
        </section>

        {/* SECTION 10 — LEKHAK */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="border-t-4 border-black pt-2 mb-6 flex justify-between items-end">
            <h2 className="text-3xl font-black font-serif uppercase tracking-wider text-black">${HINDI.LEKHAK}</h2>
            <Link href={\`/authors\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
              ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {featuredAuthors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredAuthors.map((author: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 text-center hover:border-black transition-colors group rounded-sm">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md">
                    <PenTool className="w-10 h-10 text-gray-400 group-hover:text-[#EA580C] transition-colors" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-black mb-1">{author}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Author</p>
                  <Link href={\`/author?name=\${encodeURIComponent(author)}\`} className="inline-block border border-gray-300 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-colors rounded-sm">
                    ${HINDI.VIEW_PROFILE}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 border border-gray-200 rounded-sm">
               <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_LEKHAK}</h3>
            </div>
          )}
        </section>

        {/* SECTION 11 — AI STUDY COMPANION */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-8">
           <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-sm p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
             <div className="flex-1 mb-8 md:mb-0">
               <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider inline-block mb-4 border border-blue-400/30">New Feature</span>
               <h2 className="text-3xl md:text-4xl font-black font-serif mb-4 flex items-center">
                 <Bot className="w-8 h-8 mr-3 text-blue-300" />
                 ${HINDI.AI_COMPANION}
               </h2>
               <div className="flex flex-wrap gap-4 text-sm font-bold text-blue-100 uppercase tracking-wider mb-8">
                 <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>AI सारांश</span>
                 <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>AI Quiz</span>
                 <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>मुख्य बिंदु</span>
               </div>
               <p className="text-blue-100/80 max-w-xl text-lg mb-8 leading-relaxed font-serif">
                 लेखों को गहराई से समझने के लिए हमारे नए AI अध्ययन साथी का लाभ उठाएं। यह फीचर आपको महत्वपूर्ण तथ्यों को याद रखने में मदद करता है।
               </p>
               <button className="bg-white text-indigo-900 px-8 py-3 rounded-sm font-bold hover:bg-blue-50 transition-colors uppercase tracking-wider text-sm shadow-lg">
                 ${HINDI.USE_AI}
               </button>
             </div>
             <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-48 h-48 bg-blue-800/50 rounded-full flex items-center justify-center border-8 border-blue-700/30">
                  <Bot className="w-24 h-24 text-white opacity-80" />
                </div>
             </div>
           </div>
        </section>

        {/* SECTION 12 — NEWSLETTER */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-8 border-t-4 border-black pt-16">
          <div className="bg-black text-white p-8 md:p-16 rounded-sm text-center">
            <Mail className="w-12 h-12 text-[#EA580C] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-black font-serif mb-6">${HINDI.NEWSLETTER}</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto font-serif">
              साप्ताहिक संक्षेप, नई पत्रिका की सूचना और चौपाल की प्रमुख चर्चाएं सीधे अपने इनबॉक्स में प्राप्त करें।
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="ईमेल एड्रेस" 
                className="flex-1 px-4 py-3 text-black rounded-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
              />
              <button className="bg-[#EA580C] text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-[#c24100] transition-colors rounded-sm">
                ${HINDI.SUBSCRIBE}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), "src/app/(public)/page.tsx"), fileContent, "utf8");
console.log("Ultimate page.tsx built successfully.");
