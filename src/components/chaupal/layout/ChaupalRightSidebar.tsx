import React from "react";
import Link from "next/link";
import { Hash, TrendingUp, Users } from "lucide-react";
import { CH_CLASS, CH_COLORS } from "../shared/design";
import UserChip from "../shared/UserChip";

export default function ChaupalRightSidebar() {
  const trendingTopics = [
    { id: "1", title: "साहित्य मंथन", count: "124" },
    { id: "2", title: "समसामयिक मुद्दे", count: "89" },
    { id: "3", title: "कवि सम्मेलन", count: "56" },
  ];

  return (
    <div className="hidden xl:flex flex-col w-[320px] shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-8 pl-4 gap-6">
      
      {/* Active Discussions Widget */}
      <div className={`${CH_CLASS.card} p-5 flex flex-col gap-4`}>
        <h3 className="font-serif font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <TrendingUp className="w-5 h-5 text-[#F97316]" />
          सक्रिय चर्चाएं
        </h3>
        <div className="flex flex-col gap-3">
          {trendingTopics.map(topic => (
            <Link key={topic.id} href={`/community/discussion/${topic.id}`} className="group flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#F97316] transition-colors">
                <Hash className="w-4 h-4 text-slate-400" />
                {topic.title}
              </div>
              <span className="text-xs font-sans text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {topic.count} संदेश
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Suggested Users Widget */}
      <div className={`${CH_CLASS.card} p-5 flex flex-col gap-4`}>
        <h3 className="font-serif font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <Users className="w-5 h-5 text-[#F97316]" />
          अनुशंसित लोग
        </h3>
        <div className="flex flex-col gap-4">
          <UserChip id="u1" name="रवि कुमार" username="ravi_k" role="Editor" isVerified />
          <UserChip id="u2" name="अदिति शर्मा" username="aditi_s" />
          <UserChip id="u3" name="विकास त्रिपाठी" username="vikast" role="Author" />
        </div>
      </div>
      
    </div>
  );
}
