import React from "react";

interface ProfileStatsProps {
  articlesCount: number;
  followersCount: number;
  followingCount: number;
  viewsCount: number;
  likesCount: number;
}

export default function ProfileStats({
  articlesCount,
  followersCount,
  followingCount,
  viewsCount,
  likesCount
}: ProfileStatsProps) {
  
  const StatItem = ({ label, value }: { label: string, value: number | string }) => (
    <div className="flex flex-col items-center sm:items-start p-4 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 min-w-[100px] hover:shadow-sm transition-all group">
      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 font-sans group-hover:text-[#F97316] transition-colors">
        {label}
      </span>
      <span className="text-lg font-bold font-serif text-slate-800 dark:text-white mt-1">
        {typeof value === 'number' && value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}
      </span>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-3 w-full">
      <StatItem label="लेख" value={articlesCount} />
      <StatItem label="फ़ॉलोवर्स" value={followersCount} />
      <StatItem label="फ़ॉलोइंग" value={followingCount} />
      <StatItem label="व्यूज़" value={viewsCount} />
      <StatItem label="लाइक्स" value={likesCount} />
    </div>
  );
}
