"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import LiveNewsTicker from "@/components/yuvakshar/LiveNewsTicker";
import { stripMarkdown } from "@/lib/markdown";

export default function Home() {
  const { articles, magazines, ads, homepageSections } = useCms();

  const publishedArticles = (articles || []).filter(
    (a: any) => a.status === "Published" || a.status === "Approved" || !a.status
  );

  const renderFallback = () => {
    const featured = publishedArticles.slice(0, 5);
    const latest = publishedArticles.slice(5, 11);
    const categoriesToMap = ["समाचार", "विश्लेषण", "विशेष लेख"];
    const latestMag = magazines?.[0];

    return (
      <div className="w-full flex flex-col gap-12 pt-8">
        {/* SECTION A: Featured Articles */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <h2 className="text-xl font-bold font-serif mb-4 border-b-2 border-primary inline-block pb-1">मुख्य समाचार</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {featured.slice(0, 1)?.map((article: any) => (
                <div key={article.id} className="lg:col-span-8 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-slate-200 dark:border-slate-800">
                  <Link href={`/editorial?id=${article.id}`}>
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={article.coverImage || "/placeholder-news.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={stripMarkdown(article.title)} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl md:text-3xl font-bold font-serif leading-tight group-hover:text-primary transition-colors">{stripMarkdown(article.title)}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{stripMarkdown(article.summary || "")}</p>
                    </div>
                  </Link>
                </div>
              ))}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {featured.slice(1)?.map((article: any) => (
                  <Link href={`/editorial?id=${article.id}`} key={article.id} className="flex gap-4 group">
                    <img src={article.coverImage || "/placeholder-news.jpg"} className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800" alt={stripMarkdown(article.title)} />
                    <div>
                      <h4 className="font-serif font-bold text-sm group-hover:text-primary line-clamp-3">{stripMarkdown(article.title)}</h4>
                      <p className="text-xs text-slate-500 mt-1">{article.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION B: Latest Articles */}
        {latest.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
             <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-6">
              <h2 className="text-2xl font-bold font-serif">ताजा लेख</h2>
              <Link href={`/categories`} className="text-sm font-bold text-primary hover:underline flex items-center">
                सभी देखें <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest?.map((article: any) => (
                 <Link href={`/editorial?id=${article.id}`} key={article.id} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                    <img src={article.coverImage || "/placeholder-news.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <h3 className="font-serif font-bold leading-tight group-hover:text-primary line-clamp-2">{stripMarkdown(article.title)}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{article.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION C: Category Blocks */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          {categoriesToMap?.map(cat => {
            const catArticles = publishedArticles.filter((a: any) => a.category === cat).slice(0, 4);
            if (catArticles.length === 0) return null;
            return (
              <div key={cat} className="mb-12">
                <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-6">
                  <h2 className="text-2xl font-bold font-serif">{cat}</h2>
                  <Link href={`/category/${cat}`} className="text-sm font-bold text-primary hover:underline flex items-center">
                    सभी देखें <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catArticles?.map((article: any) => (
                    <Link href={`/editorial?id=${article.id}`} key={article.id} className="group">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                        <img src={article.coverImage || "/placeholder-news.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                      </div>
                      <h3 className="font-serif font-bold leading-tight group-hover:text-primary line-clamp-2">{stripMarkdown(article.title)}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION D: Current Magazine (PATRIKA) */}
        {latestMag && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3 flex justify-center">
                  <img src={latestMag.coverImage || "/placeholder-news.jpg"} alt={latestMag.issue} className="w-48 h-auto shadow-xl rounded-md border-4 border-white dark:border-slate-800" />
                </div>
                <div className="w-full md:w-2/3 space-y-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">पत्रिका (Patrika)</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold">{latestMag.issue}</h2>
                  <p className="text-slate-600 dark:text-slate-400">नवीनतम अंक पढ़ें और ज्ञानवर्धन करें।</p>
                  <div className="flex gap-4 pt-4">
                    <Link href="/magazine" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                      पत्रिका पढ़ें
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION E: Chaupal Highlights */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full mb-12">
          <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-8 border border-primary/20 text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">चौपाल (Chaupal)</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              युवाक्षर चौपाल समुदाय से जुड़ें। अपने विचार साझा करें, समूहों में शामिल हों और चर्चा का हिस्सा बनें।
            </p>
            <Link href="/community" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg">
              चौपाल में जाएँ
            </Link>
          </div>
        </section>
      </div>
    );
  };

  const activeSections = (homepageSections || []).filter((s: any) => s.is_active).sort((a: any, b: any) => a.sort_order - b.sort_order);

  // Original CMS rendering logic for compatibility if configured
  const renderCmsSection = (section: any) => {
    const config = section.configuration || {};
    const category = config.category || "समाचार";
    const sectionArticles = publishedArticles.filter((a: any) => a.category === category);

    switch (section.section_type) {
      case "hero":
        if (sectionArticles.length === 0) return null;
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <h2 className="text-xl font-bold font-serif mb-4">{section.title || "मुख्य समाचार"}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {sectionArticles.slice(0, 1)?.map((article: any) => (
                <div key={article.id} className="lg:col-span-8 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-slate-200 dark:border-slate-800">
                  <Link href={`/editorial?id=${article.id}`}>
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={article.coverImage || "/placeholder-news.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={stripMarkdown(article.title)} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold font-serif leading-tight group-hover:text-primary transition-colors">{stripMarkdown(article.title)}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{stripMarkdown(article.summary || "")}</p>
                    </div>
                  </Link>
                </div>
              ))}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {sectionArticles.slice(1, 4)?.map((article: any) => (
                  <Link href={`/editorial?id=${article.id}`} key={article.id} className="flex gap-4 group">
                    <img src={article.coverImage || "/placeholder-news.jpg"} className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800" alt={stripMarkdown(article.title)} />
                    <div>
                      <h4 className="font-serif font-bold text-sm group-hover:text-primary line-clamp-3">{stripMarkdown(article.title)}</h4>
                      <p className="text-xs text-slate-500 mt-1">{article.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case "featured_articles":
        if (sectionArticles.length === 0) return null;
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-6">
              <h2 className="text-2xl font-bold font-serif">{section.title || "विशेष लेख"}</h2>
              <Link href={`/category/${category}`} className="text-sm font-bold text-primary hover:underline flex items-center">
                सभी देखें <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectionArticles.slice(0, 4)?.map((article: any) => (
                <Link href={`/editorial?id=${article.id}`} key={article.id} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                    <img src={article.coverImage || "/placeholder-news.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={stripMarkdown(article.title)} />
                  </div>
                  <h3 className="font-serif font-bold leading-tight group-hover:text-primary line-clamp-2">{stripMarkdown(article.title)}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{article.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );

      case "ad":
        const activeAds = (ads || []).filter((a: any) => a.active === true);
        const adToDisplay = activeAds[0];
        if (!adToDisplay) return null;
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-center">
             <a href={adToDisplay.link_url} target="_blank" rel="noopener noreferrer" className="block w-full max-w-4xl bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 relative group">
                <span className="absolute top-0 right-0 bg-black/50 text-white text-[9px] px-2 py-0.5 uppercase tracking-wider z-10 backdrop-blur-sm rounded-bl">विज्ञापन</span>
                <img src={adToDisplay.image_url} alt={adToDisplay.name} className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
             </a>
          </section>
        );
      
      case "magazine":
        const latestMagConfig = magazines?.[0];
        if (!latestMagConfig) return null;
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 md:px-8 py-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl my-8 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 flex justify-center">
                <img src={latestMagConfig.coverImage || "/placeholder-news.jpg"} alt={latestMagConfig.issue} className="w-48 h-auto shadow-xl rounded-md border-4 border-white dark:border-slate-800" />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{section.title || "वर्तमान अंक"}</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold">{latestMagConfig.issue}</h2>
                <p className="text-slate-600 dark:text-slate-400">{section.subtitle || "इस महीने की पत्रिका पढ़ें"}</p>
                <div className="flex gap-4 pt-4">
                  <Link href="/magazine" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    पत्रिका पढ़ें
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0A0F1D] pb-16">
      <LiveNewsTicker />
      
      {activeSections.length > 0 ? (
        activeSections?.map(renderCmsSection)
      ) : (
        renderFallback()
      )}
    </div>
  );
}