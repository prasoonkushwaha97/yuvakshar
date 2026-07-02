"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vote, ArrowRight, Quote, Flame } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import { getArticleUrl } from "@/utils/routes";

export default function HomepageSidebar() {
  const { locale } = useLanguage();
  const { articles, magazines } = useCms();

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
    ? [...articles].filter((a: any) => a.status === "Published" || a.status === "Approved" || !a.status).slice(0, 5)
    : [];

  const sidebarMag = magazines && magazines.length > 0 ? magazines[0] : {
    issue: "अंक 15",
    month: "जून 2025",
    coverImage: "/images/placeholder-news.jpg"
  };

  return (
    <aside className="w-full space-y-8 font-sans">
      
      {/* 1. RECOMMENDED READING */}
      <div className="space-y-4 border-b border-stone-200 dark:border-stone-800 p-5 rounded-none bg-transparent shadow-none">
        <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <Flame className="w-4 h-4 text-stone-500" />
          <h3 className="font-serif font-medium text-sm uppercase tracking-widest text-stone-900 dark:text-stone-100">
            {locale === "hi" ? "अनुशंसित पठन" : "Recommended Reading"}
          </h3>
        </div>
        <div className="divide-y divide-gray-100/70 dark:divide-gray-850/70">
          {popularArticles.map((art: any, idx: number) => (
            <Link
              key={art.id}
              href={getArticleUrl(art)}
              className="flex gap-3.5 py-3 items-start group first:pt-0 last:pb-0"
            >
              <span className="text-base font-semibold text-stone-300 dark:text-stone-700 font-sans w-5 text-right shrink-0 select-none">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-medium text-sm md:text-base text-stone-800 dark:text-stone-200 leading-snug group-hover:text-stone-500 transition-colors line-clamp-2">
                  {stripMarkdown(art.title || art.title_hi || "")}
                </h4>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block tracking-wide uppercase">
                  {art.author}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. INTERACTIVE OPINION POLL */}
      <div className="space-y-4 border-b border-stone-200 dark:border-stone-800 p-5 rounded-none bg-transparent shadow-none">
        <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <Vote className="w-4 h-4 text-stone-500" />
          <h3 className="font-serif font-medium text-sm uppercase tracking-widest text-stone-900 dark:text-stone-100">
            {locale === "hi" ? "युवा मत (सर्वे)" : "Opinion Poll"}
          </h3>
        </div>
        <div className="space-y-3.5">
          <p className="text-xs md:text-sm font-serif leading-relaxed text-gray-700 dark:text-gray-350">
            {locale === "hi"
              ? "क्या राष्ट्रीय शिक्षा नीति (NEP) भारतीय युवाओं के लिए रोज़गार के अधिक अवसर सृजित करने में सफल रहेगी?"
              : "Will the National Education Policy (NEP) succeed in creating more employment opportunities for Indian youth?"
            }
          </p>

          {!pollVoted ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleVote("yes")}
                className="w-full text-center py-2.5 border border-gray-200 dark:border-gray-800 hover:border-[#f97316] dark:hover:border-[#f97316] text-xs font-bold rounded-xl hover:bg-[#f97316]/5 transition-colors cursor-pointer"
              >
                {locale === "hi" ? "हाँ, अवश्य" : "Yes, absolutely"}
              </button>
              <button
                onClick={() => handleVote("no")}
                className="w-full text-center py-2.5 border border-gray-200 dark:border-gray-800 hover:border-[#f97316] dark:hover:border-[#f97316] text-xs font-bold rounded-xl hover:bg-[#f97316]/5 transition-colors cursor-pointer"
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
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#f97316] h-full rounded-full transition-all duration-700"
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
                <div className="w-full bg-gray-100 dark:bg-gray-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gray-300 dark:bg-gray-650 h-full rounded-full transition-all duration-700"
                    style={{ width: `${noPct}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-450 dark:text-gray-400 text-center select-none pt-1">
                {locale === "hi" ? "धन्यवाद! आपका मत दर्ज कर लिया गया है।" : "Thank you! Your vote has been recorded."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. DIGITAL MAGAZINE WIDGET */}
      <div className="border border-stone-200 dark:border-stone-800 p-5 rounded-none bg-stone-50 dark:bg-stone-900 flex gap-4 items-center shadow-none">
        <Image src={sidebarMag.coverImage} alt="Mag cover" className="w-16 h-22 object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-800" width={64} height={88} />
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-[9px] text-[#f97316] font-bold uppercase tracking-widest block mb-0.5">मासिक पत्रिका</span>
          <h4 className="font-serif font-black text-sm text-gray-855 dark:text-gray-250 mb-2 leading-tight">
            {sidebarMag.issue}
          </h4>
          <Link
            href="/magazine"
            className="text-[10px] font-extrabold text-[#f97316] hover:text-[#EA580C] hover:underline flex items-center"
          >
            <span>अभी ऑनलाइन पढ़ें</span>
            <ArrowRight className="w-3 h-3 ml-0.5 animate-pulse" />
          </Link>
        </div>
      </div>

      {/* 4. DAILY WISDOM QUOTE */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-5 rounded-none bg-transparent relative overflow-hidden shadow-none">
        <Quote className="w-16 h-16 text-stone-100 dark:text-stone-900 absolute -right-2 -bottom-2 z-0" />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-medium">संपादकीय विचार</span>
          <p className="font-serif text-sm md:text-base text-stone-700 dark:text-stone-300 leading-relaxed italic">
            "विचारों का आदान-प्रदान ही किसी भी सशक्त लोकतांत्रिक राष्ट्र की नींव होता है। अपनी कलम को एक रचनात्मक हथियार बनाएं।"
          </p>
          <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider text-right">— युवाक्षर संपादकीय</p>
        </div>
      </div>

    </aside>
  );
}
