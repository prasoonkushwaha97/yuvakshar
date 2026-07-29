"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";

const fallback_CHAUPAL_TOPICS = [
  { id: 1, title: "नई शिक्षा नीति 2024 के प्रभाव पर विमर्श", tag: "शिक्षा", comments: 142, activeUsers: ['A', 'R', 'S'] },
  { id: 2, title: "क्या आर्टिफिशियल इंटेलिजेंस साहित्य को खत्म कर देगी?", tag: "तकनीक", comments: 89, activeUsers: ['V', 'P'] },
  { id: 3, title: "वर्तमान राजनीतिक परिदृश्य और युवा भागीदारी", tag: "राजनीति", comments: 215, activeUsers: ['M', 'K', 'J', 'N'] },
  { id: 4, title: "पर्यावरण संरक्षण में स्थानीय समुदाय की भूमिका", tag: "पर्यावरण", comments: 64, activeUsers: ['D', 'L'] },
];

export default function Community() {
  const { locale } = useLanguage();

  return (
    <div className="w-full py-0.5">
      {/* Title */}
      <SectionTitle title={locale === "hi" ? "चौपाल" : "Chaupal"} link="/community" />

      <div className="bg-white dark:bg-[#0A0A0A] border border-gray-150 dark:border-gray-850 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-100 dark:border-gray-855 pb-5">
          <div>
            <h4 className="text-xl font-bold font-serif text-gray-900 dark:text-gray-200">
              {locale === "hi" ? "ट्रेंडिंग चर्चाएं" : "Trending Discussions"}
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-sans mt-0.5">
              {locale === "hi" ? "युवाओं की आवाज़, विचारों का खुला साझा मंच।" : "Youth voices, public exchange of thoughts."}
            </p>
          </div>
          <Link
            href="/community"
            className="bg-black hover:bg-[#f97316] text-white dark:bg-gray-900 dark:hover:bg-[#f97316] px-5 py-2.5 rounded-full font-bold font-sans transition-colors uppercase tracking-widest text-[10px] shadow-sm flex items-center shrink-0 cursor-pointer"
          >
            <span>{locale === "hi" ? "चौपाल में शामिल हों" : "Join Chaupal"}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Link>
        </div>

        {/* Discussion list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fallback_CHAUPAL_TOPICS.map((topic) => (
            <Link
              key={topic.id}
              href="/community"
              className="group bg-[#FAFAF9] dark:bg-[#121212] border border-gray-200/80 dark:border-gray-850 hover:border-[#f97316] p-5 rounded-lg flex flex-col justify-between transition-all duration-300 hover:shadow-md"
            >
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f97316] mb-2.5 inline-block">
                  {topic.tag}
                </span>
                <h5 className="font-serif font-bold text-sm text-gray-800 dark:text-gray-200 leading-[1.5] line-clamp-2 mb-6">
                  {topic.title}
                </h5>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200/80 dark:border-gray-800/80 pt-3">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {topic.activeUsers.map((u, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-250 to-gray-300 dark:from-gray-800 dark:to-gray-700 border-2 border-white dark:border-[#121212] flex items-center justify-center text-[8px] font-bold text-white uppercase shadow-sm z-10 shrink-0"
                    >
                      {u}
                    </div>
                  ))}
                </div>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-sans font-bold">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  <span>{topic.comments}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
