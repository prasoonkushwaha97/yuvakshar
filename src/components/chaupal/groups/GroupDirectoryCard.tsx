import React from "react";
import Link from "next/link";
import { Users, Lock, Globe } from "lucide-react";
import { CH_CLASS, CH_ANIMATIONS } from "../shared/design";
import ChaupalAvatar from "../shared/ChaupalAvatar";

interface GroupDirectoryCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    avatarUrl?: string;
    isPrivate?: boolean;
    tags?: string[];
  };
}

export default function GroupDirectoryCard({ group }: GroupDirectoryCardProps) {
  return (
    <Link href={`/community/groups/${group.id}`} className={`block ${CH_CLASS.card} p-5 ${CH_ANIMATIONS.hoverLift}`}>
      <div className="flex items-start gap-4">
        <ChaupalAvatar name={group.name} src={group.avatarUrl} size="lg" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
              {group.name}
            </h3>
            {group.isPrivate ? (
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-1 line-clamp-2">
            {group.description}
          </p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-sans bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Users className="w-3.5 h-3.5" />
              {group.membersCount.toLocaleString()} सदस्य
            </div>
            
            {group.tags && group.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                {group.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-[#F97316] bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
