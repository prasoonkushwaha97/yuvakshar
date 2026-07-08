import React from "react";
import Link from "next/link";
import { Edit3, Settings, Share2, Users, UserCheck, MessageSquare, PenTool, BookCopy } from "lucide-react";

interface ProfileActionsProps {
  isOwner: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onMessageClick: () => void;
  onShareClick: () => void;
}

export default function ProfileActions({ 
  isOwner, 
  isFollowing, 
  onFollowToggle, 
  onMessageClick, 
  onShareClick,
}: ProfileActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isOwner ? (
        <>
          <Link 
            href="/workspace/articles/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#F97316]/95 text-white px-6 py-2.5 rounded-full text-sm font-bold font-serif shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <PenTool className="w-4 h-4" />
            <span>नया लेख</span>
          </Link>

          <Link 
            href="/workspace/articles"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-full text-sm font-bold font-serif shadow-sm transition-all active:scale-95"
          >
            <BookCopy className="w-4 h-4" />
            <span>मेरे लेख</span>
          </Link>
          
          <Link 
            href="/settings"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-full text-sm font-bold font-serif shadow-sm transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">प्रोफ़ाइल संपादित करें</span>
            <span className="sm:hidden">संपादित करें</span>
          </Link>
          
          <Link 
            href="/settings"
            className="w-10 h-10 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold font-serif shadow-sm transition-all active:scale-95 shrink-0"
            title="सेटिंग्स"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">सेटिंग्स</span>
          </Link>
        </>
      ) : (
        <>
          <button 
            onClick={onFollowToggle}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold font-serif shadow-sm hover:shadow-md transition-all active:scale-95 ${
              isFollowing
                ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700" 
                : "bg-[#F97316] hover:bg-[#F97316]/95 text-white border border-[#F97316]"
            }`}
          >
            {isFollowing ? <UserCheck className="w-4 h-4 text-green-500" /> : <Users className="w-4 h-4" />}
            <span>{isFollowing ? "फ़ॉलोइंग" : "फ़ॉलो करें"}</span>
          </button>

          <button 
            onClick={onMessageClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-full text-sm font-bold font-serif shadow-sm transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-[#F97316]" />
            <span>संदेश भेजें</span>
          </button>
        </>
      )}

      {/* Share Button (Always visible) */}
      <button 
        onClick={onShareClick}
        className="w-10 h-10 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold font-serif shadow-sm transition-all active:scale-95 shrink-0"
        title="प्रोफ़ाइल साझा करें"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">साझा करें</span>
      </button>
    </div>
  );
}
