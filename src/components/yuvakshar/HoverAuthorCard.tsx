"use client";
import Image from "next/image";


import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { RoleBadgeList } from "@/components/ui/RoleBadge";
import AuthorLink from "@/components/shared/AuthorLink";
import Avatar from "@/components/shared/Avatar";

interface AuthorData {
  id: string;
  username?: string;
  slug?: string;
  name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  role?: string;
  bio?: string;
}

interface HoverAuthorCardProps {
  author: AuthorData;
  children: React.ReactNode;
}

export default function HoverAuthorCard({ author, children }: HoverAuthorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const cardContent = (
    <>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} className="md:hidden absolute top-3 right-3 z-20 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors">
        <X className="w-4 h-4" />
      </button>

      {/* Cover Banner */}
      <div className="h-[80px] bg-gradient-to-r from-primary/80 to-blue-600/80 w-full relative shrink-0">
        {author.cover_url && (
          <Image src={author.cover_url} alt="Cover" className="w-full h-full object-cover" fill sizes="320px" unoptimized />
        )}
      </div>

      <div className="px-4 pb-5 relative -mt-8">
        <div className="flex justify-between items-end mb-3">
          <AuthorLink author={author as any} className="w-[64px] h-[64px] rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-[#070B14] shrink-0 overflow-hidden flex items-center justify-center relative z-10 hover:opacity-90 transition-opacity">
            <Avatar url={author.avatar_url} alt={author.name} name={author.name} className="w-full h-full" />
          </AuthorLink>
        </div>

        <div className="mb-2">
          <AuthorLink author={author as any} className="block text-base font-bold text-slate-900 dark:text-white font-hindi hover:underline decoration-primary">
            {author.name}
          </AuthorLink>
          <div className="text-[11px] text-slate-500 font-mono">@{author.slug || author.username || author.id}</div>
          {(author as any).roles && <div className="mt-2"><RoleBadgeList roles={(author as any).roles} /></div>}
        </div>

        <div className="text-xs text-slate-700 dark:text-slate-300 font-hindi leading-relaxed">
          <div className="line-clamp-2">{author.bio || "युवाक्षर समुदाय के एक महत्वपूर्ण सदस्य और साहित्यिक प्रेमी।"}</div>
          {(author.bio?.length || 0) > 80 && (
            <AuthorLink author={author as any} className="text-primary hover:underline mt-1 inline-block font-medium">
              और पढ़ें
            </AuthorLink>
          )}
        </div>
      </div>
    </>
  );

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

      {isOpen && (
        <>
          {/* Desktop View */}
          <div 
            className="hidden md:block absolute z-[100] top-full left-0 mt-2 w-[320px] bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {cardContent}
          </div>

          {/* Mobile View */}
          {mounted && createPortal(
            <div className="md:hidden fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }} 
              />
              <div 
                className="relative w-[calc(100vw-32px)] max-w-[360px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#070B14] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {cardContent}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
