"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import type { Profile } from "@/store/types";
import GlassCard from "./GlassCard";

interface ProfilePreviewWrapperProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProfilePreviewWrapper({
  userId,
  children,
  className = ""
}: ProfilePreviewWrapperProps) {
  const { users, articles, currentUser, followAuthor } = useCms();
  const [showCard, setShowCard] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  // Helper to slugify a name if needed
  const slugify = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0900-\u097F-]/g, '')
      .replace(/-+/g, '-');
  };

  // Find user details
  const targetUser = users.find(u => 
    u.id === userId || 
    u.slug === userId || 
    u.name === userId ||
    (u.name && slugify(u.name) === slugify(userId)) ||
    (u.slug && slugify(u.slug) === slugify(userId))
  );
  if (!targetUser) {
    return <span className={className}>{children}</span>;
  }

  const articlesCount = articles.filter(a => a.author === targetUser.name && a.status === "Published").length;
  const followersCount = targetUser.followers?.length || 0;
  const isFollowing = currentUser && targetUser.followers?.includes(currentUser.id);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Calculate trigger bounding box for exact card positioning
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8
    });
    
    setShowCard(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setShowCard(false);
    }, 400); // Small delay so users can move mouse to the card
  };

  // Mobile support: Long Press (simulated by touch timers)
  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8
    });

    touchTimerRef.current = setTimeout(() => {
      e.preventDefault();
      setShowCard(true);
    }, 600); // 600ms long press duration
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("फॉलो करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      await followAuthor(targetUser.id, currentUser.id);
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const startChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("संदेश भेजने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    router.push(`/community/messages?to=${targetUser.id}`);
    setShowCard(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Trigger element */}
      <span className="cursor-pointer hover:text-primary transition-colors">
        {children}
      </span>

      {/* Floating Bounding Box */}
      {showCard && (
        <div
          className="fixed z-[999] w-72 transition-all duration-200 animate-in fade-in zoom-in-95"
          style={{
            left: `${Math.min(coords.x, typeof window !== "undefined" ? window.innerWidth - 300 : coords.x)}px`,
            top: `${coords.y}px`
          }}
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/60 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
            {/* Header info */}
            <div className="flex items-start gap-3">
              {/* DP */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm uppercase">
                  {targetUser.avatar_url ? (
                    <img
                      src={targetUser.avatar_url}
                      alt={targetUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    targetUser.name[0]
                  )}
                </div>
              </div>

              {/* Names & Role */}
              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-1">
                  <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-white truncate font-hindi">
                    {targetUser.name}
                  </h4>
                  {targetUser.role && targetUser.role !== "सदस्य" && (
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  @{targetUser.slug || targetUser.id}
                </p>
                {targetUser.role && (
                  <span className="inline-block mt-1 bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded font-hindi">
                    {targetUser.role}
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {targetUser.bio && (
              <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-serif">
                {targetUser.bio}
              </p>
            )}

            {/* Badges List */}
            {targetUser.badges && targetUser.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-850">
                {targetUser.badges.map(badge => (
                  <span
                    key={badge}
                    className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded font-hindi ${
                      badge === "सत्यापित साहित्यकार"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/40"
                        : badge === "सत्यापित लेखक"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/40"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Stats count */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-center text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-white font-mono">{articlesCount}</p>
                <span className="text-[9px] text-slate-400 font-hindi">आलेख संख्या</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white font-mono">{followersCount}</p>
                <span className="text-[9px] text-slate-400 font-hindi">फॉलोवर्स</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
              <Link
                href={`/authors/${targetUser.slug || targetUser.id}`}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 font-hindi text-slate-700 dark:text-slate-350 cursor-pointer"
                onClick={() => setShowCard(false)}
              >
                <ExternalLink className="w-3 h-3" />
                <span>प्रोफ़ाइल</span>
              </Link>
              
              {currentUser && currentUser.id !== targetUser.id && (
                <>
                  <button
                    onClick={toggleFollow}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 font-hindi cursor-pointer ${
                      isFollowing
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        : "bg-primary text-white hover:bg-primary/95"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-3 h-3" />
                        <span>अनफ़ॉलो</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>फॉलो</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={startChat}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 flex items-center justify-center text-slate-700 dark:text-slate-350 cursor-pointer"
                    aria-label="संदेश भेजें"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
