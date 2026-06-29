const fs = require("fs");
const path = require("path");

const HINDI = {
  SAMACHAR: "\u0938\u092E\u093E\u091A\u093E\u0930",
  VISHLESHAN: "\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923",
  VISHESH_LEKH: "\u0935\u093F\u0936\u0947\u0937 \u0932\u0947\u0916",
  SAHITYA: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F",
  PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E",
  CHAUPAL: "\u091A\u094C\u092A\u093E\u0932",
  LEKHAK: "\u0932\u0947\u0916\u0915",
  EMPTY_LEKH: "\u0932\u0947\u0916 \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0915\u093F\u090F \u091C\u093E\u090F\u0902\u0917\u0947",
  EMPTY_PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0915\u0940 \u091C\u093E\u090F\u0917\u0940",
  EMPTY_CHAUPAL: "\u091A\u094C\u092A\u093E\u0932 \u092E\u0947\u0902 \u091A\u0930\u094D\u091A\u093E \u0936\u0940\u0918\u094D\u0930 \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D \u0939\u094B\u0917\u0940",
  EMPTY_LEKHAK: "\u0932\u0947\u0916\u0915 \u0938\u0942\u091A\u0940 \u0936\u0940\u0918\u094D\u0930 \u0905\u092A\u0921\u0947\u091F \u0915\u0940 \u091C\u093E\u090F\u0917\u0940",
  SEE_ALL: "\u0938\u092D\u0940 \u0926\u0947\u0916\u0947\u0902",
  LATEST_ISSUE: "\u0928\u0935\u0940\u0928\u0924\u092E \u0905\u0902\u0915",
  READ_PATRIKA: "\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u092A\u0922\u093C\u0947\u0902",
  START_DISCUSSION: "\u091A\u0930\u094D\u091A\u093E \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D \u0915\u0930\u0947\u0902",
  VIEW_PROFILE: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0926\u0947\u0916\u0947\u0902",
  YOUTH_FORUM: "\u092F\u0941\u0935\u093E\u0913\u0902 \u0915\u093E \u0916\u0941\u0932\u093E \u092E\u0902\u091A",
  PATRIKA_DESC: "\u092F\u0941\u0935\u093E\u0915\u094D\u0937\u0930 \u092A\u0924\u094D\u0930\u093F\u0915\u093E \u0915\u093E \u0928\u0935\u0940\u0928\u0924\u092E \u0905\u0902\u0915 \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0939\u094B \u091A\u0941\u0915\u093E \u0939\u0948\u0964 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0935\u093F\u092E\u0930\u094D\u0936, \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0914\u0930 \u0935\u093F\u0936\u0947\u0937 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u092A\u0922\u093C\u0947\u0902\u0964",
  CHAUPAL_DESC: "\u092F\u0941\u0935\u093E\u0915\u094D\u0937\u0930 \u091A\u094C\u092A\u093E\u0932 \u092E\u0947\u0902 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u092E\u0939\u0924\u094D\u0935 \u0915\u0947 \u0935\u093F\u0937\u092F\u094B\u0902 \u092A\u0930 \u0905\u092A\u0928\u0940 \u0930\u093E\u092F \u0930\u0916\u0947\u0902, \u0938\u093E\u0925\u0940 \u092A\u093E\u0920\u0915\u094B\u0902 \u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902 \u0914\u0930 \u0938\u093E\u0930\u094D\u0925\u0915 \u0935\u093F\u092E\u0930\u094D\u0936 \u0915\u093E \u0939\u093F\u0938\u094D\u0938\u093E \u092C\u0928\u0947\u0902\u0964",
  READ_MORE: "\u0914\u0930 \u092A\u0922\u093C\u0947\u0902"
};

const fileContent = `\uFEFF"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, PenTool, Newspaper } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import LiveNewsTicker from "@/components/yuvakshar/LiveNewsTicker";
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
         <div className="lg:col-span-8 h-[400px] bg-gray-200 rounded-2xl"></div>
         <div className="lg:col-span-4 flex flex-col gap-4">
           {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
         </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { articles, magazines } = useCms();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <HomepageSkeleton />;

  const publishedArticles = (articles ?? []).filter(
    (a: any) => a.status === "Published" || a.status === "Approved" || !a.status
  );

  const featuredArticles = publishedArticles.slice(0, 5);
  const heroMain = featuredArticles[0];
  const heroSecondary = featuredArticles.slice(1, 5);

  const newsArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.SAMACHAR}").slice(0, 6);
  const analysisArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.VISHLESHAN}").slice(0, 4);
  const featureArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.VISHESH_LEKH}").slice(0, 4);
  const literatureArticles = publishedArticles.filter((a: any) => a.category === "${HINDI.SAHITYA}").slice(0, 4);

  const latestMag = (magazines ?? [])[0];
  
  const allAuthors = Array.from(new Set(publishedArticles.map((a: any) => a.author).filter(Boolean)));
  const featuredAuthors = allAuthors.slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-white text-black pb-16">
      <LiveNewsTicker />
      <div className="w-full flex flex-col gap-12 pt-8">
        
        {/* SECTION 1 — HERO */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          {featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT SIDE - Featured Article */}
              {heroMain && (
                <div className="lg:col-span-8 bg-gray-50 rounded-2xl overflow-hidden relative group border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
                  <Link href={\`/editorial?id=\${heroMain.id}\`} className="flex-grow flex flex-col">
                    <div className="aspect-[16/9] w-full overflow-hidden relative">
                      <SafeImage src={heroMain.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={stripMarkdown(heroMain.title)} />
                      <div className="absolute top-4 left-4 bg-[#EA580C] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded">
                        {heroMain.category || "${HINDI.SAMACHAR}"}
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight group-hover:text-[#EA580C] transition-colors mb-3">
                          {stripMarkdown(heroMain.title)}
                        </h2>
                        <p className="text-gray-600 text-lg line-clamp-3 mb-4">
                          {stripMarkdown(heroMain.summary || heroMain.content || "")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                        <span>{heroMain.author}</span>
                        <span className="flex items-center text-[#EA580C] group-hover:underline">
                          ${HINDI.READ_MORE} <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              
              {/* RIGHT SIDE - Secondary Articles */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {heroSecondary.map((article: any) => (
                  <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="flex gap-4 group bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
                    <div className="w-28 h-24 shrink-0 overflow-hidden rounded-lg">
                       <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs text-[#EA580C] font-bold uppercase mb-1">{article.category || "${HINDI.SAMACHAR}"}</span>
                      <h3 className="font-serif font-bold text-sm group-hover:text-[#EA580C] leading-snug line-clamp-3">{stripMarkdown(article.title)}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-gray-50 rounded-2xl border border-gray-200">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_LEKH}</h2>
            </div>
          )}
        </section>

        {/* SECTION 2 — MUKHYA SAMACHAR */}
        {(newsArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.SAMACHAR}</h2>
              <Link href={\`/category/${HINDI.SAMACHAR}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-gray-200">
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-[#EA580C] line-clamp-2">{stripMarkdown(article.title)}</h3>
                  <p className="text-sm text-gray-500 mt-2 font-medium">{article.author} • {article.date}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3 — VISHLESHAN */}
        {(analysisArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full bg-gray-50 py-12 rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-8">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.VISHLESHAN}</h2>
              <Link href={\`/category/${HINDI.VISHLESHAN}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analysisArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-2/5 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0">
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-serif font-bold text-xl leading-snug group-hover:text-[#EA580C] mb-2">{stripMarkdown(article.title)}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{stripMarkdown(article.summary || "")}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase">{article.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4 — VISHESH LEKH */}
        {(featureArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.VISHESH_LEKH}</h2>
              <Link href={\`/category/${HINDI.VISHESH_LEKH}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featureArticles.map((article: any, index: number) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className={\`group \${index === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'}\`}>
                  <div className={\`rounded-xl overflow-hidden mb-3 border border-gray-200 relative \${index === 0 ? 'aspect-square md:aspect-auto md:h-[400px]' : 'aspect-video md:h-48'}\`}>
                    <SafeImage src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                       <h3 className="font-serif font-bold text-white text-lg md:text-2xl leading-tight group-hover:text-gray-200 line-clamp-2">{stripMarkdown(article.title)}</h3>
                       <p className="text-gray-300 text-sm mt-2 font-medium">{article.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5 — SAHITYA */}
        {(literatureArticles.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.SAHITYA}</h2>
              <Link href={\`/category/${HINDI.SAHITYA}\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
                ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {literatureArticles.map((article: any) => (
                 <Link href={\`/editorial?id=\${article.id}\`} key={article.id} className="group bg-orange-50/50 p-5 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 bg-[#EA580C]/10 text-[#EA580C] rounded-full flex items-center justify-center mb-4">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-[#EA580C] line-clamp-2 mb-2">{stripMarkdown(article.title)}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 font-serif italic">"{stripMarkdown(article.summary || article.content?.substring(0, 100) || "")}..."</p>
                  <p className="text-xs text-gray-500 font-bold">— {article.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 6 — PATRIKA */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
            <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.PATRIKA}</h2>
          </div>
          {latestMag ? (
            <div className="bg-[#0F172A] text-white rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA580C] rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative group perspective">
                    <SafeImage src={latestMag.coverImage} alt={latestMag.issue} className="w-56 h-auto shadow-2xl rounded border border-gray-700 transform transition-transform group-hover:scale-105 duration-500" />
                  </div>
                </div>
                <div className="w-full md:w-2/3 space-y-5 text-center md:text-left">
                  <span className="bg-[#EA580C] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">${HINDI.LATEST_ISSUE}</span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">{latestMag.issue}</h2>
                  <p className="text-gray-300 text-lg max-w-xl">${HINDI.PATRIKA_DESC}</p>
                  <div className="pt-4">
                    <Link href={\`/magazine\`} className="inline-block bg-white text-[#0F172A] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                      ${HINDI.READ_PATRIKA}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_PATRIKA}</h3>
            </div>
          )}
        </section>

        {/* SECTION 7 — CHAUPAL */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
            <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.CHAUPAL}</h2>
          </div>
          <div className="bg-orange-50 rounded-3xl p-8 md:p-12 border border-orange-200 text-center relative overflow-hidden">
            <Users className="w-32 h-32 absolute -right-8 -top-8 text-[#EA580C]/5 transform -rotate-12" />
            <h2 className="text-3xl font-serif font-bold text-black mb-4 relative z-10">${HINDI.YOUTH_FORUM}</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto relative z-10 text-lg">
              ${HINDI.CHAUPAL_DESC}
            </p>
            <p className="text-[#EA580C] font-bold mb-6 relative z-10 text-xl font-serif">${HINDI.EMPTY_CHAUPAL}</p>
            <Link href="/community" className="inline-block bg-[#EA580C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#c24100] transition-colors shadow-lg relative z-10">
              ${HINDI.START_DISCUSSION}
            </Link>
          </div>
        </section>

        {/* SECTION 8 — AUTHORS */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mb-12">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
            <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-black">${HINDI.LEKHAK}</h2>
            <Link href={\`/authors\`} className="text-sm font-bold text-[#EA580C] hover:underline flex items-center">
              ${HINDI.SEE_ALL} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {featuredAuthors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredAuthors.map((author: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-[#EA580C]/30 hover:shadow-lg transition-all group">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4 overflow-hidden border-2 border-transparent group-hover:border-[#EA580C] transition-colors">
                    <PenTool className="w-10 h-10 text-gray-400 group-hover:text-[#EA580C] transition-colors" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-black">{author}</h3>
                  <Link href={\`/author?name=\${encodeURIComponent(author)}\`} className="text-sm text-[#EA580C] font-medium hover:underline mt-2 inline-block">
                    ${HINDI.VIEW_PROFILE}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-200">
               <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <h3 className="text-xl font-serif text-gray-500 font-medium">${HINDI.EMPTY_LEKHAK}</h3>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), "src/app/(public)/page.tsx"), fileContent, "utf8");
console.log("Written successfully");
