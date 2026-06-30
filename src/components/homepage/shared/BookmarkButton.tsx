"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useCms } from "@/store/CmsContext";

interface BookmarkButtonProps {
  articleId: string;
  className?: string;
}

export default function BookmarkButton({ articleId, className = "" }: BookmarkButtonProps) {
  const { currentUser, openAuthModal } = useCms();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = () => {
      const stored = null;
      if (stored) {
        try {
          const list = JSON.parse(stored) as string[];
          setIsBookmarked(list.includes(articleId));
        } catch {
          setIsBookmarked(false);
        }
      }
    };
    checkBookmark();

    // Listen to storage events to sync bookmarks across components
    window.addEventListener("storage", checkBookmark);
    return () => window.removeEventListener("storage", checkBookmark);
  }, [articleId]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      openAuthModal(undefined, "बुकमार्क करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }

    const stored = null;
    let list: string[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored) as string[];
      } catch {
        list = [];
      }
    }

    let newList: string[];
    if (list.includes(articleId)) {
      newList = list.filter((id) => id !== articleId);
      setIsBookmarked(false);
    } else {
      newList = [...list, articleId];
      setIsBookmarked(true);
    }

    undefined;
    // Dispatch standard storage event so other components update
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-900 border border-transparent transition-all hover:scale-105 active:scale-95 ${className}`}
      title={isBookmarked ? "बुकमार्क हटाएं" : "बुकमार्क करें"}
      aria-label="Bookmark article"
    >
      <Bookmark
        className={`w-3.5 h-3.5 ${isBookmarked ? "fill-[#f97316] text-[#f97316]" : "text-gray-400 dark:text-gray-500"}`}
      />
    </button>
  );
}
