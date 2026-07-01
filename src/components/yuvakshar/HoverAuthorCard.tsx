"use client";
import Image from "next/image";


import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, BookOpen } from "lucide-react";
import { RoleBadgeList } from "@/components/ui/RoleBadge";
import { getCanonicalProfileUrl } from "@/utils/username";

interface AuthorData {
  id: string;
  username?: string;
  slug?: string;
  name: string;
  avatar_url?: string | null;
  role?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

interface HoverAuthorCardProps {
  author: AuthorData;
  children: React.ReactNode;
}

export default function HoverAuthorCard({ author, children }: HoverAuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (window.innerWidth < 1024) return; // Desktop only for hover
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 350); // Small delay to avoid accidental triggering
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  // Mobile long press logic
  const touchStartRef = useRef<number>(0);
  const handleTouchStart = (_e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    touchStartRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      // Vibrate if supported to indicate long press success
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 1024) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isOpen && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const authorLink = getCanonicalProfileUrl(author);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      ref={cardRef}
    >
      {/* The trigger element (usually the author's name or avatar) */}
      <div className={window.innerWidth < 1024 && !isOpen ? "active:opacity-60 transition-opacity" : ""}>
        {children}
      </div>

      {/* The Floating Card */}
      {isOpen && (
        <div className="absolute z-[100] left-1/2 -translate-x-1/2 mt-2 md:mt-0 md:top-full md:left-0 md:translate-x-0 w-[280px] sm:w-[320px] bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex justify-between items-start mb-3">
            <Link href={authorLink} className="w-14 h-14 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shrink-0 overflow-hidden flex items-center justify-center font-bold text-primary text-xl shadow-sm">
              {author.avatar_url ? (
                <Image src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" fill sizes="48px" />
              ) : (
                author.name[0]
              )}
            </Link>
            <button className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold font-hindi hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              Follow
            </button>
          </div>

          <div className="mb-2">
            <Link href={authorLink} className="block text-base font-bold text-slate-800 dark:text-white font-hindi hover:underline decoration-primary">
              {author.name}
            </Link>
            <div className="text-[11px] text-slate-500 font-mono">@{author.slug || author.id}</div>
            {(author as any).roles && <div className="mt-2"><RoleBadgeList roles={(author as any).roles} /></div>}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 font-hindi mb-4 line-clamp-2">
            {author.bio || "युवाक्षर समुदाय के एक महत्वपूर्ण सदस्य और साहित्यिक प्रेमी।"}
          </div>

          <div className="flex items-center gap-4 text-xs font-hindi text-slate-600 dark:text-slate-400 mb-4">
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-800 dark:text-white">{author.followingCount || 42}</span>
              <span>Following</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-800 dark:text-white">{author.followersCount || 108}</span>
              <span>Followers</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={authorLink} className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-bold font-hindi hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              प्रोफ़ाइल
            </Link>
            <Link href={`/community/messages?to=${author.id}`} className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-bold font-hindi hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              संदेश
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
