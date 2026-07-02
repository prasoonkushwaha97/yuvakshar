"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { toast } from "sonner";
import { getArticleUrl, SITE_URL } from "@/utils/routes";

interface ArticleActionsProps {
  articleId: string;
  slug: string;
  title: string;
}

export default function ArticleActions({ articleId, slug, title }: ArticleActionsProps) {
  const { currentUser, toggleBookmark, openAuthModal } = useCms();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state with Context/DB
  useEffect(() => {
    if (currentUser && currentUser.bookmarks) {
      const isSaved = currentUser.bookmarks.some((b: any) => b.article_id === articleId);
      setIsBookmarked(isSaved);
    } else {
      setIsBookmarked(false);
    }
  }, [currentUser, articleId]);

  const handleBookmark = async () => {
    if (isProcessing) return;

    if (!currentUser) {
      // Must login to bookmark
      openAuthModal(
        undefined, 
        "बुकमार्क सहेजने के लिए कृपया लॉगिन करें।"
      );
      return;
    }

    setIsProcessing(true);
    
    // Optimistic UI update
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      await toggleBookmark(articleId);
      toast.success(previousState ? "बुकमार्क हटाया गया।" : "बुकमार्क सहेज लिया गया है।");
    } catch (error) {
      // Revert optimistic update on failure
      setIsBookmarked(previousState);
      console.error("Bookmark toggle failed:", error);
      toast.error("बुकमार्क सहेजा नहीं जा सका।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    // Generate canonical share URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : SITE_URL;
    const shareUrl = `${baseUrl}${getArticleUrl({ slug })}`;
    const shareData = {
      title: `${title} | युवाक्षर`,
      url: shareUrl,
    };

    try {
      // 1. Native Mobile Share Sheet
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
      
      // 2. Desktop Clipboard Fallback
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("लिंक कॉपी हो गया।");
        return;
      }
      
      // 3. Last Resort Fallback (If Clipboard API is completely blocked)
      prompt("लिंक कॉपी करने के लिए CTRL+C दबाएं:", shareUrl);
    } catch (error: any) {
      // AbortError is triggered if the user simply closes the native share sheet without sharing. Do not show as error.
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
        toast.error("लिंक साझा नहीं किया जा सका।");
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={handleBookmark}
        disabled={isProcessing}
        aria-label={isBookmarked ? "बुकमार्क हटाएँ" : "बुकमार्क करें"}
        title={isBookmarked ? "बुकमार्क हटाएँ" : "बुकमार्क करें"}
        className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full hover:text-[#f97316] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
      >
        <Bookmark 
          className="w-4 h-4 transition-colors" 
          fill={isBookmarked ? "currentColor" : "none"} 
          stroke={isBookmarked ? "currentColor" : "currentColor"}
        />
      </button>
      
      <button 
        onClick={handleShare}
        aria-label="साझा करें"
        title="साझा करें"
        className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full hover:text-[#f97316] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
