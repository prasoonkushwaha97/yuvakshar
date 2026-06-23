"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";

import { useCms } from "@/store/CmsContext";

interface TickerItem {
  id: string;
  category: string;
  headline: string;
  href: string;
  isImportant?: boolean;
}

export default function LiveNewsTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const { articles } = useCms();

  const tickerItems: TickerItem[] = articles.slice(0, 5)?.map(art => ({
    id: art.id,
    category: art.category,
    headline: art.title,
    href: `/category/${art.category}`,
    isImportant: true,
  }));

  // Fallback if no articles
  if (tickerItems.length === 0) {
    tickerItems.push({
      id: "placeholder",
      category: "News",
      headline: "Welcome to Yuvakshar",
      href: "/",
      isImportant: true
    });
  }

  // Duplicate items for seamless infinite scrolling
  const items = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-[#111827]/40 border-y border-yuvakshar-gold/15 py-3 overflow-hidden select-none flex items-center">
      {/* Label */}
      <div className="flex items-center space-x-2 px-4 md:px-8 border-r border-yuvakshar-gold/20 shrink-0 bg-yuvakshar-bg/90 relative z-10 shadow-[5px_0_15px_rgba(11,15,25,0.8)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yuvakshar-saffron opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yuvakshar-saffron"></span>
        </span>
        <span className="text-xs uppercase tracking-widest text-yuvakshar-gold font-bold flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 fill-yuvakshar-gold/20" />
          <span>BREAKING ANALYSIS</span>
        </span>
      </div>

      {/* Marquee Wrapper */}
      <div 
        className="relative w-full overflow-hidden flex"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`flex space-x-8 shrink-0 min-w-full ${isPaused ? "animate-none" : "animate-marquee"}`}
          style={{
            animation: "marquee 40s linear infinite",
            animationPlayState: isPaused ? "paused" : "running"
          }}
        >
          {items?.map((item, index) => (
            <Link 
              key={`${item.id}-${index}`} 
              href={item.href}
              className="flex items-center space-x-3 hover:text-yuvakshar-gold transition-colors shrink-0 max-w-lg cursor-pointer"
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                item.isImportant 
                  ? "bg-yuvakshar-saffron/20 text-yuvakshar-saffron border border-yuvakshar-saffron/30" 
                  : "bg-युवाक्षर-blue/15 text-युवाक्षर-blue border border-युवाक्षर-blue/30"
              }`}>
                {item.category}
              </span>
              <span className="text-xs md:text-sm font-medium text-yuvakshar-text/90 line-clamp-1">
                {item.headline}
              </span>
              <ChevronRight className="w-3 h-3 text-yuvakshar-gray shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
