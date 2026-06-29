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
  SEE_ALL: "\u0938\u092D\u0940 \u0926\u0947\u0916\u0947\u0902",
  READ_MORE: "\u0914\u0930 \u092A\u0922\u093C\u0947\u0902",
  LATEST_ISSUE: "\u0928\u0935\u0940\u0928\u0924\u092E \u0905\u0902\u0915",
  READ_PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u092A\u0922\u093C\u0947\u0902",
  ARCHIVE: "\u0905\u0930\u094D\u0915\u093E\u0907\u0935 \u0926\u0947\u0916\u0947\u0902",
  JOIN_CHAUPAL: "\u091A\u094C\u092A\u093E\u0932 \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902",
  VIEW_PROFILE: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932",
  SUBSCRIBE: "\u0938\u092C\u094D\u0938\u094D\u0915\u094D\u0930\u093E\u0907\u092C \u0915\u0930\u0947\u0902",
  ALL_VIDEOS: "\u0938\u092D\u0940 \u0935\u0940\u0921\u093F\u092F\u094B",
  USE_AI: "AI \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902",
  MIN_READ: "\u092E\u093F\u0928\u091F",
  BY: "\u0926\u094D\u0935\u093E\u0930\u093E",
  TRENDING_TOPICS: "\u091F\u094D\u0930\u0947\u0902\u0921\u093F\u0902\u0917 \u091A\u0930\u094D\u091A\u093E\u090F\u0902"
};

const fileContent = `\uFEFF"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, PenTool, Newspaper, PlayCircle, Bot, Mail, MessageSquare, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { stripMarkdown } from "@/lib/markdown";

// Mock Data for Chaupal
const MOCK_CHAUPAL = [
  { id: 1, title: "\u0928\u0908 \u0936\u093F\u0915\u094D\u0937\u093E \u0928\u0940\u0924\u093F 2024 \u0915\u0947 \u092A\u094D\u0930\u092D\u093E\u0935 \u092A\u0930 \u0935\u093F\u092E\u0930\u094D\u0936", tag: "\u0936\u093F\u0915\u094D\u0937\u093E", comments: 142, activeUsers: ['A', 'R', 'S'] },
  { id: 2, title: "\u0915\u094D\u092F\u093E \u0906\u0930\u094D\u091F\u093F\u092B\u093F\u0936\u093F\u092F\u0932 \u0907\u0902\u091F\u0947\u0932\u093F\u091C\u0947\u0902\u0938 \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0915\u094B \u0916\u0924\u094D\u092E \u0915\u0930 \u0926\u0947\u0917\u0940?", tag: "\u0924\u0915\u0928\u0940\u0915", comments: 89, activeUsers: ['V', 'P'] },
  { id: 3, title: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0930\u093E\u091C\u0928\u0940\u0924\u093F\u0915 \u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F \u0914\u0930 \u092F\u0941\u0935\u093E \u092D\u093E\u0917\u0940\u0926\u093E\u0930\u0940", tag: "\u0930\u093E\u091C\u0928\u0940\u0924\u093F", comments: 215, activeUsers: ['M', 'K', 'J', 'N'] },
  { id: 4, title: "\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u092E\u0947\u0902 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0938\u092E\u0941\u0926\u093E\u092F \u0915\u0940 \u092D\u0942\u092E\u093F\u0915\u093E", tag: "\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923", comments: 64, activeUsers: ['D', 'L'] },
];

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
  <div className="w-full flex flex-col gap-8 pt-6 animate-pulse bg-[#FAFAFA] min-h-screen">
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
         <div className="lg:col-span-7 h-[550px] bg-gray-200 rounded-sm"></div>
         <div className="lg:col-span-3 flex flex-col gap-4">
           {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-gray-200 rounded-sm"></div>)}
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
  const latestMag = (magazines ?? [])[0] || { issue: "\u0905\u0902\u0915 15", month: "\u091C\u0942\u0928 2025", coverImage: "/images/placeholder-news.jpg" };
  
  const allAuthors = Array.from(new Set(publishedArticles.map((a: any) => a.author).filter(Boolean)));
  const featuredAuthors = allAuthors.slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111] pb-16 font-sans overflow-x-hidden">
      <div className="w-full flex flex-col gap-10 md:gap-14 pt-6 md:pt-10">
        
        {/* SECTION 1 — HERO (70/30 SPLIT) */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
          {publishedArticles.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 lg:gap-12">
              {/* LEFT SIDE (70%) */}
              <div className="xl:col-span-7 flex flex-col group">
                {heroMain && (
                  <Link href={\`/editorial?id=\${heroMain.id}\`} className="flex flex-col">
                    <div className="aspect-[16/9] w-full overflow-hidden relative rounded-sm shadow-sm mb-6 bg-gray-100">
                      <SafeImage src={heroMain.coverImage} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" alt={stripMarkdown(heroMain.title)} />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#EA580C] text-white font-bold uppercase text-[10px] tracking-widest px-3 py-1.5 shadow-md">
                          {heroMain.category || "${HINDI.SAMACHAR}"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col pr-0 md:pr-12">
                      <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black font-serif leading-[1.1] text-[#111] group-hover:text-[#EA580C] transition-colors duration-300 mb-4 tracking-tight">
                        {stripMarkdown(heroMain.title)}
                      </h1>
                      <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-6 font-serif line-clamp-3">
                        {stripMarkdown(heroMain.summary || heroMain.content || "")}
                      </p>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 font-bold uppercase tracking-wider gap-4 border-t border-gray-200 pt-4">
                        <span className="text-[#111] flex items-center"><UserAvatar name={heroMain.author} /> {heroMain.author}</span>
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> 5 ${HINDI.MIN_READ}</span>
                        <span>{heroMain.date?.split(',')[0]}</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
              
              {/* RIGHT SIDE (30%) */}
              <div className="xl:col-span-3 flex flex-col border-t xl:border-t-0 xl:border-l border-gray-200 pt-8 xl:pt-0 xl:pl-8">
                <div className="flex items-center justify-between mb-5 border-b-2 border-[#111] pb-2">
                  <h3 className="font-bold text-sm tracking-widest uppercase text-[#111]">${HINDI.LIVE_UPDATES}</h3>
                  <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span>
                </div>
                <div className="flex flex-col divide-y divide-gray-100">
                  {heroSecondary.map((article: any, i: number) => (
                    <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group py-4 flex gap-4 items-start first:pt-0">
                      <div className="w-24 h-24 shrink-0 overflow-hidden rounded-sm bg-gray-100 relative shadow-sm">
                         <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                         <div className="absolute bottom-0 left-0 bg-[#111]/80 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">{article.category}</div>
                      </div>
                      <div className="flex flex-col justify-center h-24">
                        <h4 className="font-bold text-[15px] group-hover:text-[#EA580C] leading-snug line-clamp-3 font-serif text-[#222] transition-colors">{stripMarkdown(article.title)}</h4>
                        <span className="text-[11px] text-gray-400 mt-auto font-sans font-medium uppercase tracking-wider">{article.date?.split(',')[0]}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/current-affairs" className="mt-4 w-full text-center border border-gray-300 text-xs font-bold uppercase tracking-wider py-2.5 hover:bg-[#111] hover:text-white transition-colors duration-300 rounded-sm">
                  ${HINDI.SEE_ALL}
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center bg-gray-50 border border-gray-200 rounded-sm">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-gray-500 font-medium">लेख शीघ्र प्रकाशित किए जाएंगे</h2>
            </div>
          )}
        </section>

        {/* SECTION 2 — MUKHYA SAMACHAR (GRID) */}
        {(newsArticles.length > 0) && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
            <SectionHeader title="${HINDI.SAMACHAR}" link={\`/category/\${HINDI.SAMACHAR}\`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {newsArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col h-full bg-white p-3 rounded-sm shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4 bg-gray-100 relative">
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <h3 className="font-serif font-bold text-xl leading-snug text-[#111] group-hover:text-[#EA580C] line-clamp-3 mb-3">{stripMarkdown(article.title)}</h3>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider border-t border-gray-100 pt-3">
                    <span>{article.author}</span>
                    <span>{article.date?.split(',')[0]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3 — VISHLESHAN (PREMIUM CARDS) */}
        {(analysisArticles.length > 0) && (
          <section className="w-full bg-[#111] text-white py-14">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <SectionHeader title="${HINDI.VISHLESHAN}" link={\`/category/\${HINDI.VISHLESHAN}\`} light={true} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysisArticles.map((article: any) => (
                   <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col sm:flex-row gap-6 border border-gray-800 bg-[#161616] hover:bg-[#1A1A1A] hover:border-gray-600 transition-all duration-300 p-4 rounded-sm">
                    <div className="w-full sm:w-[45%] aspect-[4/5] sm:aspect-[3/4] overflow-hidden shrink-0 rounded-sm relative">
                      <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" alt={stripMarkdown(article.title)} />
                      <div className="absolute top-3 left-3 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-md">Long Read</div>
                    </div>
                    <div className="flex flex-col justify-center py-2 pr-2 sm:w-[55%]">
                      <h3 className="font-serif font-bold text-2xl md:text-3xl leading-snug text-white group-hover:text-[#EA580C] mb-4 transition-colors">{stripMarkdown(article.title)}</h3>
                      <p className="text-gray-400 text-[15px] line-clamp-3 mb-6 leading-relaxed font-serif">{stripMarkdown(article.summary || "")}</p>
                      <div className="flex items-center gap-3 mt-auto border-t border-gray-800 pt-4">
                         <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase">{article.author.substring(0,2)}</div>
                         <div className="flex flex-col">
                           <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">{article.author}</span>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{article.date?.split(',')[0]}</span>
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4 — PATRIKA (PREMIUM SHOWCASE) */}
        <section className="w-full bg-[#0A0A0A] py-16 md:py-24 relative overflow-hidden border-y border-gray-900 shadow-2xl my-8">
          {/* Subtle background texture/gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1005] via-[#0A0A0A] to-[#0A0A0A] opacity-80"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.1),transparent_70%)]"></div>
          
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex items-center gap-2 mb-10 border-b border-gray-800 pb-4">
              <BookOpen className="w-6 h-6 text-[#EA580C]" />
              <h2 className="text-2xl font-black font-sans uppercase tracking-[0.2em] text-white">YUVAKSHAR MAG</h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="w-full md:w-5/12 flex justify-center perspective-[1000px]">
                <div className="relative group w-[280px] md:w-[340px]">
                  {/* Pseudo 3D Magazine Cover */}
                  <div className="absolute inset-0 bg-white/10 blur-xl transform translate-y-4 translate-x-4 scale-95 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700"></div>
                  <div className="relative transform rotate-y-[-5deg] rotate-x-[2deg] group-hover:rotate-y-[0deg] group-hover:rotate-x-[0deg] transition-all duration-700 border border-gray-800 shadow-2xl bg-[#111]">
                     <SafeImage src={latestMag.coverImage} alt={latestMag.issue} className="w-full h-auto" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#EA580C] text-white text-xs font-bold px-4 py-2 uppercase tracking-widest shadow-xl transform rotate-3 z-20">
                     New Issue
                  </div>
                </div>
              </div>
              <div className="w-full md:w-7/12 flex flex-col text-center md:text-left">
                <span className="text-[#EA580C] font-bold uppercase tracking-[0.3em] text-sm mb-4 block">${HINDI.LATEST_ISSUE} / {latestMag.month}</span>
                <h2 className="text-5xl md:text-[80px] font-black font-serif text-white leading-[1.05] mb-6 tracking-tight">
                  {latestMag.issue}
                </h2>
                <p className="text-gray-400 text-lg md:text-2xl font-serif max-w-2xl mb-10 leading-relaxed italic">
                  "राष्ट्रीय विमर्श, गहन साहित्य और विशेष रिपोर्ट पढ़ें। पत्रिका का नवीनतम अंक अब उपलब्ध है।"
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link href={\`/magazine\`} className="bg-[#EA580C] text-white px-10 py-4 rounded-sm font-bold hover:bg-white hover:text-[#111] transition-all duration-300 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(234,88,12,0.3)]">
                    ${HINDI.READ_PATRIKA}
                  </Link>
                  <Link href={\`/magazine/archive\`} className="border border-gray-600 text-gray-300 px-10 py-4 rounded-sm font-bold hover:bg-white hover:text-[#111] hover:border-white transition-all duration-300 uppercase tracking-widest text-sm">
                    ${HINDI.ARCHIVE}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — CHAUPAL (COMMUNITY SHOWCASE) */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full mt-4">
          <SectionHeader title="${HINDI.CHAUPAL}" link="/community" />
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-100 pb-6">
               <div>
                 <h3 className="text-2xl font-black font-serif text-[#111]">${HINDI.TRENDING_TOPICS}</h3>
                 <p className="text-sm text-gray-500 font-sans mt-1">युवाओं की आवाज़, युवाओं का मंच।</p>
               </div>
               <Link href="/community" className="bg-[#111] text-white px-6 py-2.5 rounded-sm font-bold hover:bg-[#EA580C] transition-colors uppercase tracking-wider text-xs shadow-sm flex items-center">
                 ${HINDI.JOIN_CHAUPAL} <ArrowRight className="w-3.5 h-3.5 ml-2" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {MOCK_CHAUPAL.map((topic) => (
                 <Link href="/community" key={topic.id} className="group bg-[#FAFAFA] border border-gray-100 hover:border-[#EA580C] p-6 rounded-sm flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] mb-3">{topic.tag}</span>
                    <h4 className="font-serif font-bold text-lg text-[#111] group-hover:text-[#EA580C] leading-snug mb-6 flex-1">{topic.title}</h4>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                       <div className="flex -space-x-2">
                         {topic.activeUsers.map((u, i) => (
                           <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white uppercase shadow-sm z-10">{u}</div>
                         ))}
                       </div>
                       <div className="flex items-center text-xs text-gray-500 font-bold">
                         <MessageSquare className="w-3.5 h-3.5 mr-1" /> {topic.comments}
                       </div>
                    </div>
                 </Link>
               ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 — VISHESH LEKH (BENTO) */}
        {(featureArticles.length > 0) && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full mt-6">
            <SectionHeader title="${HINDI.VISHESH_LEKH}" link={\`/category/\${HINDI.VISHESH_LEKH}\`} />
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
              {featureArticles.map((article: any, index: number) => {
                let classes = "group relative overflow-hidden rounded-sm bg-gray-900 block shadow-sm hover:shadow-xl transition-all duration-300";
                if (index === 0) classes += " md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                else if (index === 1 || index === 2) classes += " md:col-span-1 md:row-span-1 h-[250px] md:h-full";
                else classes += " md:col-span-2 md:row-span-1 h-[250px] md:h-full";

                return (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className={classes}>
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={stripMarkdown(article.title)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111]/90 via-[#111]/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                       {index === 0 && <span className="bg-[#EA580C] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest mb-3 inline-block rounded-sm shadow-sm">Featured Editor's Pick</span>}
                       <h3 className={\`font-serif font-bold text-white leading-snug group-hover:text-orange-100 transition-colors \${index === 0 ? 'text-3xl md:text-[40px]' : 'text-xl md:text-2xl'}\`}>{stripMarkdown(article.title)}</h3>
                       {index === 0 && <p className="text-gray-300 text-[15px] mt-4 line-clamp-2 font-serif">{stripMarkdown(article.summary || "")}</p>}
                    </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 7 — SAHITYA */}
        {(literatureArticles.length > 0) && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full mt-6">
            <SectionHeader title="${HINDI.SAHITYA}" link={\`/category/\${HINDI.SAHITYA}\`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {literatureArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group bg-[#FFF8F3] p-8 border border-[#FADCC8] hover:border-[#EA580C] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-sm text-center flex flex-col items-center">
                  <div className="w-12 h-12 text-[#EA580C] mb-6 border-b border-[#EA580C] pb-2">
                    <PenTool className="w-8 h-8 mx-auto" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl leading-snug text-[#111] group-hover:text-[#EA580C] line-clamp-2 mb-4">{stripMarkdown(article.title)}</h3>
                  <p className="text-gray-600 text-[15px] line-clamp-3 mb-6 font-serif italic leading-relaxed">"{stripMarkdown(article.summary || article.content?.substring(0, 100) || "")}..."</p>
                  <p className="text-[10px] text-[#111] font-bold uppercase tracking-widest mt-auto">— {article.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8 — VIDEO */}
        <section className="w-full bg-[#111] py-16 text-white mt-8">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <SectionHeader title="${HINDI.VIDEO}" link="/category/video" light={true} />
            {featuredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {featuredVideos.map((video: any) => (
                   <Link href={\`/video?id=\${video.id}\`} key={video.id} className="group flex flex-col bg-[#1A1A1A] rounded-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-800">
                     <div className="aspect-video w-full relative overflow-hidden bg-gray-900">
                       <SafeImage src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt={video.title} />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                         <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:text-[#EA580C] group-hover:scale-110 transition-all duration-300" />
                       </div>
                       <div className="absolute bottom-3 right-3 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider">
                         {video.duration || "00:00"}
                       </div>
                     </div>
                     <div className="p-5">
                       <h3 className="font-serif font-bold text-xl leading-snug group-hover:text-[#EA580C] text-white line-clamp-2">{video.title}</h3>
                     </div>
                   </Link>
                 ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-gray-800 rounded-sm bg-[#1A1A1A]">
                <PlayCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-serif">वीडियो शीघ्र उपलब्ध होंगे</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9 — AI & NEWSLETTER (COMBINED FOOTER PROMO) */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 w-full mt-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* AI Promo */}
             <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e1b4b] rounded-sm p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg group">
               <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Bot className="w-64 h-64" />
               </div>
               <div className="relative z-10">
                 <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest mb-4 inline-block border border-blue-400/30">Feature</span>
                 <h2 className="text-3xl font-black font-serif mb-4 flex items-center text-white">
                   ${HINDI.AI_COMPANION}
                 </h2>
                 <p className="text-blue-100/90 text-[15px] mb-8 font-serif leading-relaxed max-w-md">
                   लेखों का त्वरित सारांश पढ़ें और AI क्विज के माध्यम से अपनी समझ का परीक्षण करें।
                 </p>
                 <button className="bg-white text-[#1e1b4b] px-6 py-2.5 rounded-sm font-bold hover:bg-gray-100 transition-colors uppercase tracking-widest text-[11px] shadow-sm w-max">
                   ${HINDI.USE_AI}
                 </button>
               </div>
             </div>

             {/* Newsletter Promo */}
             <div className="bg-[#111] rounded-sm p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg group border border-gray-800">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <Mail className="w-64 h-64" />
               </div>
               <div className="relative z-10">
                 <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest mb-4 inline-block border border-gray-700">Newsletter</span>
                 <h2 className="text-3xl font-black font-serif mb-4 text-white">${HINDI.NEWSLETTER}</h2>
                 <p className="text-gray-400 text-[15px] mb-6 font-serif max-w-md">
                   साप्ताहिक संक्षेप और नए पत्रिका अंकों की सूचना सीधे प्राप्त करें।
                 </p>
                 <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                   <input 
                     type="email" 
                     placeholder="ईमेल एड्रेस" 
                     className="flex-1 px-4 py-2.5 text-sm text-[#111] bg-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                   />
                   <button className="bg-[#EA580C] text-white px-6 py-2.5 font-bold uppercase tracking-widest text-[11px] hover:bg-white hover:text-[#111] transition-colors rounded-sm shadow-sm whitespace-nowrap">
                     ${HINDI.SUBSCRIBE}
                   </button>
                 </div>
               </div>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
}

// Utility Components
const SectionHeader = ({ title, link, light = false }: { title: string; link: string; light?: boolean }) => (
  <div className={\`flex justify-between items-end mb-6 pb-2 \${light ? 'border-b border-gray-800' : 'border-b-2 border-[#111]'}\`}>
    <h2 className={\`text-2xl md:text-3xl font-black font-serif uppercase tracking-wider \${light ? 'text-white' : 'text-[#111]'}\`}>{title}</h2>
    <Link href={link} className={\`text-[11px] font-bold uppercase tracking-widest flex items-center hover:underline \${light ? 'text-[#EA580C]' : 'text-[#EA580C]'}\`}>
      ${HINDI.SEE_ALL} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
    </Link>
  </div>
);

const UserAvatar = ({ name }: { name: string }) => {
  const initial = name ? name.substring(0,1).toUpperCase() : "U";
  return (
    <div className="w-5 h-5 rounded-full bg-gray-200 text-[#111] flex items-center justify-center text-[9px] font-bold mr-2">
      {initial}
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), "src/app/(public)/page.tsx"), fileContent, "utf8");
console.log("Visual Phase 2 page.tsx built successfully.");
