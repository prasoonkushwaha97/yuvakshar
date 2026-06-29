"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Vote, ArrowRight, Quote, Flame, BookOpen } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";

export default function Sidebar() {
  const { locale } = useLanguage();
  const { articles, magazines, ads } = useCms();

  // Poll state simulator
  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({ yes: 74, no: 26 });

  const handleVote = (option: "yes" | "no") => {
    if (pollVoted) return;
    setPollVotes((prev) => {
      const next = { ...prev };
      if (option === "yes") next.yes += 1;
      else next.no += 1;
      return next;
    });
    setPollVoted(true);
  };

  const totalVotes = pollVotes.yes + pollVotes.no;
  const yesPct = Math.round((pollVotes.yes / totalVotes) * 100);
  const noPct = 100 - yesPct;

  const popularArticles = articles
    .filter((a: any) => a.status === "Published" || a.status === "Approved" || !a.status)
    .slice(0, 5);

  const sidebarMag = magazines[0] || {
    issue: "अंक 15",
    month: "जून 2025",
    coverImage: "/images/placeholder-news.jpg"
  };

  return (
    <aside className="w-full space-y-8 font-sans">
      {/* 1. MOST READ ARTICLES */}
      <div className="space-y-4 border border-gray-150 dark:border-gray-850 p-5 rounded-lg bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2.5">
          <Flame className="w-4 h-4 text-[#f97316]" />
          <h3 className="font-serif font-black text-sm md:text-base uppercase tracking-tight text-gray-900 dark:text-gray-200">
            {locale === "hi" ? "चर्चित लेख" : "Most Read"}
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-850">
          {popularArticles.map((art: any, idx: number) => (
            <Link
              key={art.id}
              href={`/articles/${art.slug || art.id}`}
              className="flex gap-3 py-3 items-start group first:pt-0 last:pb-0"
            >
              <span className="text-xl font-bold text-gray-300 dark:text-gray-700 font-sans w-5 text-right shrink-0 select-none">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-xs md:text-sm text-gray-800 dark:text-gray-250 leading-snug group-hover:text-[#f97316] transition-colors line-clamp-2">
                  {stripMarkdown(art.title)}
                </h4>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                  {art.author}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. INTERACTIVE OPINION POLL */}
      <div className="space-y-4 border border-gray-150 dark:border-gray-850 p-5 rounded-lg bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-2.5">
          <Vote className="w-4 h-4 text-[#f97316]" />
          <h3 className="font-serif font-black text-sm md:text-base uppercase tracking-tight text-gray-900 dark:text-gray-200">
            {locale === "hi" ? "युवा मत (सर्वे)" : "Opinion Poll"}
          </h3>
        </div>
        <div className="space-y-3">
          <p className="text-xs md:text-sm font-serif leading-relaxed text-gray-750 dark:text-gray-300">
            {locale === "hi"
              ? "क्या राष्ट्रीय शिक्षा नीति (NEP) भारतीय युवाओं के लिए रोज़गार के अधिक अवसर सृजित करने में सफल रहेगी?"
              : "Will the National Education Policy (NEP) succeed in creating more employment opportunities for Indian youth?"
            }
          </p>

          {!pollVoted ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleVote("yes")}
                className="w-full text-center py-2 border border-gray-200 dark:border-gray-800 hover:border-[#f97316] dark:hover:border-[#f97316] text-xs font-bold rounded hover:bg-[#f97316]/5 transition-colors cursor-pointer"
              >
                {locale === "hi" ? "हाँ, अवश्य" : "Yes, absolutely"}
              </button>
              <button
                onClick={() => handleVote("no")}
                className="w-full text-center py-2 border border-gray-200 dark:border-gray-800 hover:border-[#f97316] dark:hover:border-[#f97316] text-xs font-bold rounded hover:bg-[#f97316]/5 transition-colors cursor-pointer"
              >
                {locale === "hi" ? "नहीं, संशय है" : "No, doubtful"}
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {/* Yes Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>{locale === "hi" ? "हाँ" : "Yes"}</span>
                  <span className="text-[#f97316]">{yesPct}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-2 rounded overflow-hidden">
                  <div
                    className="bg-[#f97316] h-full rounded transition-all duration-700"
                    style={{ width: `${yesPct}%` }}
                  />
                </div>
              </div>

              {/* No Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>{locale === "hi" ? "नहीं" : "No"}</span>
                  <span className="text-gray-400">{noPct}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-2 rounded overflow-hidden">
                  <div
                    className="bg-gray-300 dark:bg-gray-650 h-full rounded transition-all duration-700"
                    style={{ width: `${noPct}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center select-none pt-1">
                {locale === "hi" ? "धन्यवाद! आपका मत दर्ज कर लिया गया है।" : "Thank you! Your vote has been recorded."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. DIGITAL MAGAZINE WIDGET */}
      <div className="border border-gray-150 dark:border-gray-850 p-5 rounded-lg bg-gradient-to-br from-[#FAFAF9] to-[#FAF8F5] dark:from-[#111] dark:to-[#0A0A0A] flex gap-4 items-center">
        <img
          src={sidebarMag.coverImage}
          alt="Mag cover"
          className="w-16 h-22 object-cover rounded shadow border border-gray-200 dark:border-gray-800"
          onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
        />
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-[9px] text-[#f97316] font-bold uppercase tracking-widest block mb-0.5">मासिक पत्रिका</span>
          <h4 className="font-serif font-black text-sm text-gray-855 dark:text-gray-200 mb-2 leading-tight">
            {sidebarMag.issue}
          </h4>
          <Link
            href="/magazine"
            className="text-[10px] font-extrabold text-[#f97316] hover:text-[#EA580C] hover:underline flex items-center"
          >
            <span>अभी ऑनलाइन पढ़ें</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 4. DAILY WISDOM QUOTE */}
      <div className="border border-gray-150 dark:border-gray-850 p-5 rounded-lg bg-white dark:bg-[#0A0A0A] relative overflow-hidden">
        <Quote className="w-16 h-16 text-gray-50 dark:text-gray-900 absolute -right-2 -bottom-2 z-0" />
        <div className="relative z-10 space-y-2">
          <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">संपादकीय विचार</span>
          <p className="font-serif text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed italic">
            "विचारों का आदान-प्रदान ही किसी भी सशक्त लोकतांत्रिक राष्ट्र की नींव होता है। अपनी कलम को एक रचनात्मक हथियार बनाएं।"
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase text-right">— युवाक्षर संपादकीय</p>
        </div>
      </div>

      {/* 5. ADVERTISEMENT OR PREMIUM PROMO */}
      {(() => {
        const activeAd = (ads ?? []).find((ad: any) => ad.active);
        if (activeAd) {
          return (
            <div className="border border-gray-150 dark:border-gray-850 rounded-lg p-4 bg-white dark:bg-[#0A0A0A] overflow-hidden">
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold block mb-2 text-center">विज्ञापन</span>
              {activeAd.type === "custom_html" && activeAd.code ? (
                <div dangerouslySetInnerHTML={{ __html: activeAd.code }} />
              ) : activeAd.image_url ? (
                <a href={activeAd.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={activeAd.image_url} alt={activeAd.name} className="w-full h-auto rounded border border-gray-200 dark:border-gray-800" />
                </a>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-[#121212] rounded text-center text-xs text-gray-500">
                  {activeAd.name}
                </div>
              )}
            </div>
          );
        }

        // Beautiful, production-ready fallback contribution banner (No dummy text!)
        return (
          <div className="border border-gray-150 dark:border-gray-850 rounded-lg p-5 bg-[#FAF9F6] dark:bg-[#121212] space-y-4">
            <span className="text-[9px] text-[#f97316] uppercase tracking-widest font-bold block">विचार अभिव्यक्ति</span>
            <div className="space-y-1.5">
              <h4 className="font-serif font-black text-sm text-gray-900 dark:text-gray-200">
                {locale === "hi" ? "युवाक्षर लेखक बनें" : "Become a Yuvakshar Author"}
              </h4>
              <p className="text-gray-650 dark:text-gray-400 text-xs font-serif leading-relaxed">
                {locale === "hi" 
                  ? "अपनी कविता, कहानी, या बौद्धिक विचार लेख को समीक्षा के लिए संपादकीय डेस्क पर भेजें।"
                  : "Submit your poetry, stories, or intellectual opinion pieces for review by the editorial team."
                }
              </p>
            </div>
            <Link
              href="/submit-article"
              className="w-full text-center bg-[#f97316] hover:bg-[#EA580C] text-white py-2 rounded font-sans font-bold text-xs shadow-sm flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <span>✍️ {locale === "hi" ? "लेखन शुरू करें" : "Start Writing"}</span>
            </Link>
          </div>
        );
      })()}
    </aside>
  );
}
