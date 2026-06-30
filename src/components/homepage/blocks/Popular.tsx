"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, Eye, Share2, MessageSquare, TrendingUp } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { stripMarkdown } from "@/lib/markdown";
import SectionTitle from "../shared/SectionTitle";

type TabType = "views" | "shares" | "comments" | "trending";

export default function Popular() {
  const { locale } = useLanguage();
  const { articles } = useCms();
  const [activeTab, setActiveTab] = useState<TabType>("views");

  const published = articles.filter(
    (art: any) => art.status === "Published" || art.status === "Approved" || !art.status
  );

  if (published.length === 0) return null;

  // Filter list by different criteria
  const getTabArticles = () => {
    switch (activeTab) {
      case "views":
        return [...published]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
      case "shares":
        // Simulated shares sorting (odd ids get higher ranking)
        return [...published]
          .sort((a, b) => (parseInt(b.id) || 0) % 7 - (parseInt(a.id) || 0) % 7)
          .slice(0, 5);
      case "comments":
        // Sort by length of content as a proxy for comments, or fallback counts
        return [...published]
          .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))
          .slice(0, 5);
      case "trending":
        return [...published]
          .sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
          .slice(0, 5);
      default:
        return published.slice(0, 5);
    }
  };

  const activeArticles = getTabArticles();

  const tabs = [
    { id: "views", label: locale === "hi" ? "सर्वाधिक लोकप्रिय" : "Most Viewed", icon: Eye },
    { id: "shares", label: locale === "hi" ? "सर्वाधिक साझा" : "Most Shared", icon: Share2 },
    { id: "comments", label: locale === "hi" ? "सर्वाधिक चर्चित" : "Most Discussed", icon: MessageSquare },
    { id: "trending", label: locale === "hi" ? "ट्रेंडिंग आज" : "Trending Today", icon: TrendingUp }
  ];

  return (
    <div className="w-full py-0.5 font-sans">
      <SectionTitle title={locale === "hi" ? "चर्चित रैंकिंग सूचियां" : "Popular Rankings"} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? "border-[#f97316] text-[#f97316] font-black"
                  : "border-transparent text-gray-400 hover:text-gray-650 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Rank Table list */}
      <div className="bg-[#FAFAF9] dark:bg-[#0E0E0E] rounded-lg border border-gray-150 dark:border-gray-850 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              <th className="py-2.5 px-4 text-center w-14">#</th>
              <th className="py-2.5 px-4">{locale === "hi" ? "लेख शीर्षक" : "Article Title"}</th>
              <th className="py-2.5 px-4 hidden sm:table-cell w-36">{locale === "hi" ? "श्रेणी" : "Category"}</th>
              <th className="py-2.5 px-4 hidden md:table-cell w-40">{locale === "hi" ? "लेखक" : "Author"}</th>
              <th className="py-2.5 px-4 text-center w-28">{locale === "hi" ? "स्कोर" : "Stats"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-xs">
            {activeArticles.map((art: any, index: number) => {
              const cleanTitle = stripMarkdown(art.title);
              const cleanDate = art.date ? art.date.split(",")[0] : "";
              
              // Dynamic stats display based on active tab
              const statVal = (() => {
                if (activeTab === "views") return `${art.views || 0} views`;
                if (activeTab === "comments") return `${Math.floor((art.content?.length || 1000) / 180)} comments`;
                if (activeTab === "shares") return `${Math.floor((parseInt(art.id) || 1) * 8) % 40 + 12} shares`;
                return `Trending`;
              })();

              return (
                <tr key={art.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-bold text-gray-400 font-sans">
                    {index === 0 ? (
                      <Award className="w-4 h-4 text-amber-500 mx-auto" />
                    ) : (
                      index + 1
                    )}
                  </td>
                  {/* Title */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/articles/${art.slug || art.id}`}
                      className="font-serif font-bold text-gray-850 dark:text-gray-200 hover:text-[#f97316] transition-colors leading-relaxed block line-clamp-1"
                    >
                      {cleanTitle}
                    </Link>
                  </td>
                  {/* Category */}
                  <td className="py-3 px-4 hidden sm:table-cell text-gray-500 font-medium">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-[10px]">
                      {art.category}
                    </span>
                  </td>
                  {/* Author */}
                  <td className="py-3 px-4 hidden md:table-cell text-gray-500 font-medium font-sans">
                    {art.author}
                  </td>
                  {/* Stats */}
                  <td className="py-3 px-4 text-center font-bold font-sans text-gray-600 dark:text-gray-450">
                    {statVal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
