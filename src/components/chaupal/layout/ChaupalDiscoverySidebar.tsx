import React from "react";
import Link from "next/link";
import { TrendingUp, Users, Flame } from "lucide-react";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";

export default function ChaupalDiscoverySidebar() {
  const trendingTopics = [
    { id: 1, topic: "Union Budget 2026", posts: 1240 },
    { id: 2, topic: "AI in Education", posts: 843 },
    { id: 3, topic: "Literature Festival", posts: 651 },
    { id: 4, topic: "Climate Change", posts: 432 },
  ];

  const suggestedGroups = [
    { id: 1, name: "UPSC Aspirants", members: "12k" },
    { id: 2, name: "हिंदी साहित्य", members: "8.5k" },
    { id: 3, name: "Tech Enthusiasts", members: "5.2k" },
  ];

  return (
    <div className="hidden lg:flex flex-col w-[300px] shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-8 pl-4 gap-6 no-scrollbar">
      
      {/* Trending Topics */}
      <div className={`${CH_CLASS.card} p-5 ${CH_RADIUS.card} border border-slate-200 dark:border-slate-800 shadow-sm`}>
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#f97316]" />
          ट्रेंडिंग विषय
        </h3>
        <div className="flex flex-col gap-4">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="group cursor-pointer">
              <p className="font-sans font-bold text-[15px] text-slate-800 dark:text-slate-200 group-hover:text-[#f97316] transition-colors">
                #{topic.topic}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{topic.posts} चर्चाएं</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Groups */}
      <div className={`${CH_CLASS.card} p-5 ${CH_RADIUS.card} border border-slate-200 dark:border-slate-800 shadow-sm`}>
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          सुझाए गए समूह
        </h3>
        <div className="flex flex-col gap-4">
          {suggestedGroups.map((group) => (
            <div key={group.id} className="flex items-center justify-between group">
              <div>
                <p className="font-sans font-bold text-[15px] text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors cursor-pointer">
                  {group.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{group.members} सदस्य</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-bold rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
                जुड़ें
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Users */}
      <div className={`${CH_CLASS.card} p-5 ${CH_RADIUS.card} border border-slate-200 dark:border-slate-800 shadow-sm`}>
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-pink-500" />
          लोकप्रिय लेखक
        </h3>
        <p className="text-sm text-slate-500">
          जल्द आ रहा है...
        </p>
      </div>

    </div>
  );
}
