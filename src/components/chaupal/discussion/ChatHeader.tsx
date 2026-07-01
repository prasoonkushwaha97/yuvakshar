import React from "react";
import { Info, MoreVertical, Hash, Users, MessageSquare } from "lucide-react";
import UserIdentity from "@/components/shared/UserIdentity";
import { CH_ANIMATIONS } from "../shared/design";

interface ChatHeaderProps {
  room: {
    id: string;
    title: string;
    type: string;
    participantsCount: number;
    description?: string;
  };
}

export default function ChatHeader({ room }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 h-16 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <UserIdentity user={{ name: room.title }} variant="inline" avatarSize={40} showUsername={false} clickable={false} />
        <div className="flex flex-col">
          <h2 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight">
            {room.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {room.participantsCount} सदस्य
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {room.type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white ${CH_ANIMATIONS.transition}`}>
          <Info className="w-5 h-5" />
        </button>
        <button className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white ${CH_ANIMATIONS.transition}`}>
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
