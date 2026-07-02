import React from "react";

interface ProfileStatsProps {
  articlesCount: number;
  followersCount: number;
  mediaCount: number;
  draftsCount?: number;
  isOwner: boolean;
  onFollowersClick: () => void;
  onFollowingClick?: () => void;
}

const StatItem = ({ 
  label, 
  value, 
  onClick 
}: { 
  label: string, 
  value: number | string, 
  onClick?: () => void 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={`flex flex-col items-center sm:items-start p-4 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 min-w-[100px] hover:shadow-sm transition-all group text-left ${
      onClick ? "cursor-pointer hover:border-[#F97316]/30" : "cursor-default"
    }`}
  >
    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-550 font-sans group-hover:text-[#F97316] transition-colors">
      {label}
    </span>
    <span className="text-lg font-bold font-serif text-slate-855 dark:text-white mt-1">
      {typeof value === 'number' && value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}
    </span>
  </button>
);

export default function ProfileStats({
  articlesCount,
  followersCount,
  mediaCount,
  draftsCount = 0,
  isOwner,
  onFollowersClick,
}: ProfileStatsProps) {
  return (
    <div className="flex flex-wrap gap-3 w-full">
      <StatItem label="लेख (Articles)" value={articlesCount} />
      <StatItem label="फ़ॉलोअर्स (Followers)" value={followersCount} onClick={onFollowersClick} />
      <StatItem label="मीडिया (Media)" value={mediaCount} />
      {isOwner && (
        <StatItem label="ड्राफ्ट्स (Drafts)" value={draftsCount} />
      )}
    </div>
  );
}
