"use client";
import Image from "next/image";


import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, BookOpen } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import type { Profile } from "@/store/types";
import { RoleBadgeList } from "@/components/ui/RoleBadge";
import { getCanonicalProfileUrl } from "@/utils/username";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";
import Avatar from "@/components/shared/Avatar";

interface HoverUserCardProps {
  userId: string;
  children: React.ReactNode;
}

export default function HoverUserCard({ userId, children }: HoverUserCardProps) {
  const { users, currentUser } = useCms();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load user data when hovered/opened to keep it lightweight
  useEffect(() => {
    if (isOpen && !user) {
      const match = users.find((u: Profile) => u.username === userId || u.slug === userId || u.id === userId);
      if (match) {
        setUser(match);
      }
    }
  }, [isOpen, userId, users, currentUser, user]);

  const handleMouseEnter = () => {
    if (window.innerWidth < 1024) return; // Desktop only for hover
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 350); // Small delay
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
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 1024) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Click outside to close
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


  const userLink = getCanonicalProfileUrl(user || { id: userId }) || "#";
  
  let finalCoverUrl = user?.cover_url;
  if (finalCoverUrl && !finalCoverUrl.startsWith('http') && !finalCoverUrl.startsWith('/') && !finalCoverUrl.startsWith('data:')) {
    finalCoverUrl = supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).getPublicUrl(finalCoverUrl).data.publicUrl;
  }

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
      <div className={window.innerWidth < 1024 && !isOpen ? "active:opacity-60 transition-opacity" : ""}>
        {children}
      </div>

      {isOpen && user && (
        <div className="absolute z-[100] left-1/2 -translate-x-1/2 mt-2 md:mt-0 md:top-full md:left-0 md:translate-x-0 w-[300px] sm:w-[340px] bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Cover Banner */}
          <div className="h-20 bg-gradient-to-r from-primary/80 to-blue-600/80 w-full relative">
            {finalCoverUrl && (
              <Image src={finalCoverUrl} alt="Cover" className="w-full h-full object-cover" fill unoptimized />
            )}
          </div>

          <div className="px-4 pb-4 relative -mt-10">
            <div className="flex justify-between items-end mb-3">
              <Link href={userLink} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-[#070B14] shrink-0 overflow-hidden flex items-center justify-center relative z-10 hover:opacity-90 transition-opacity">
                <Avatar url={user.avatar_url} alt={user.name} className="w-full h-full" />
              </Link>
            </div>

            <div className="mb-2">
              <Link href={userLink} className="block text-base font-bold text-slate-900 dark:text-white font-hindi hover:underline decoration-primary">
                {user.name}
              </Link>
              <div className="text-[11px] text-slate-500 font-mono">@{user.username || user.slug || user.id}</div>
              {(user as any).roles && <div className="mt-2"><RoleBadgeList roles={(user as any).roles} /></div>}
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 font-hindi mb-4 line-clamp-2 leading-relaxed">
              {user.bio || "युवाक्षर समुदाय के एक सदस्य।"}
            </div>


            <div className="flex gap-2">
              <Link href={userLink} className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-bold font-hindi hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                <BookOpen className="w-3.5 h-3.5" />
                प्रोफ़ाइल
              </Link>
              <Link href={`/community/messages?to=${user.id}`} className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-bold font-hindi hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                <MessageCircle className="w-3.5 h-3.5" />
                संदेश
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
