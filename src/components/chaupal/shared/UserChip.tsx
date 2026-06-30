import React from "react";
import Link from "next/link";
import ChaupalAvatar from "./ChaupalAvatar";
import ChaupalBadge from "./ChaupalBadge";

interface UserChipProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  username?: string;
  isVerified?: boolean;
  role?: string;
  timestamp?: string;
  size?: "sm" | "md";
}

export default function UserChip({
  id,
  name,
  avatarUrl,
  username,
  isVerified,
  role,
  timestamp,
  size = "md"
}: UserChipProps) {
  const isSmall = size === "sm";

  return (
    <div className="flex items-center gap-2.5">
      <Link href={`/profile/${username || id}`} className="shrink-0 hover:opacity-80 transition-opacity">
        <ChaupalAvatar src={avatarUrl} name={name} size={size} />
      </Link>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link 
            href={`/profile/${username || id}`} 
            className={`font-serif font-bold text-slate-900 dark:text-white hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors ${isSmall ? 'text-sm' : 'text-base'}`}
          >
            {name}
          </Link>
          {isVerified && <ChaupalBadge type="verified" />}
          {role && <ChaupalBadge type="role" label={role} />}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-sans text-xs">
          {username && <span>@{username}</span>}
          {username && timestamp && <span>·</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
    </div>
  );
}
