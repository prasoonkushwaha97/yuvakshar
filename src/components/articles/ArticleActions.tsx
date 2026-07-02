"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { toast } from "sonner";
import { getArticleUrl, SITE_URL } from "@/utils/routes";
import ShareModal from "./ShareModal"; // Import ShareModal component statically

interface ArticleActionsProps {
  articleId: string;
  slug: string;
  title: string;
}

// Brand SVG Icons complying with official guidelines (scaled to w-5 h-5)
const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24">
    <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.764.46 3.483 1.332 5.002L2 22l5.132-1.346c1.47.8 3.11 1.222 4.88 1.222 5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.537 2 12.012 2zm6.076 14.225c-.25.703-1.455 1.284-2.008 1.34-.497.05-1.147.087-1.83-.133-.427-.138-.97-.333-1.63-.6-2.766-1.12-4.553-3.922-4.693-4.108-.138-.184-1.12-1.488-1.12-2.836 0-1.348.704-2.012.955-2.28.25-.268.547-.333.73-.333h.52c.164 0 .385-.015.59.444.208.502.715 1.737.777 1.86.06.12.1.264.02.424-.08.163-.122.264-.243.407-.123.14-.256.315-.366.42-.12.115-.248.24-.107.48.14.24.624 1.026 1.336 1.66.918.816 1.69 1.07 1.93 1.19.244.12.388.1.53-.064.144-.164.624-.724.79-.97.168-.246.335-.205.564-.12.23.085 1.453.684 1.704.81.25.123.417.184.478.29.06.104.06.602-.19 1.305z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 fill-current text-black dark:text-white" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function ArticleActions({ articleId, slug, title }: ArticleActionsProps) {
  const { currentUser, toggleBookmark, openAuthModal } = useCms();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state with Context/DB
  useEffect(() => {
    if (currentUser && currentUser.bookmarks) {
      const isSaved = currentUser.bookmarks.some((b: any) => b.article_id === articleId);
      setIsBookmarked(isSaved);
    } else {
      setIsBookmarked(false);
    }
  }, [currentUser, articleId]);

  // Analytics Event Dispatcher
  const dispatchAnalyticsEvent = (action: string, metadata: Record<string, any>) => {
    if (typeof window !== "undefined") {
      // Reusable event trigger hook for future analytics integrations (e.g. GA4, Mixpanel)
      const customEvent = new CustomEvent("yuvakshar_analytics", {
        detail: { action, ...metadata }
      });
      window.dispatchEvent(customEvent);

      if ((window as any).gtag) {
        (window as any).gtag("event", action, metadata);
      }
    }
  };

  const handleBookmark = async () => {
    if (isProcessing) return;

    if (!currentUser) {
      openAuthModal(
        undefined, 
        "बुकमार्क सहेजने के लिए कृपया लॉगिन करें।"
      );
      return;
    }

    setIsProcessing(true);
    
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    // Track bookmark click
    dispatchAnalyticsEvent("bookmark_click", {
      article_id: articleId,
      title,
      state: !previousState ? "saved" : "removed"
    });

    try {
      await toggleBookmark(articleId);
      toast.success(previousState ? "बुकमार्क हटाया गया।" : "बुकमार्क सहेज लिया गया है।");
    } catch (error) {
      setIsBookmarked(previousState);
      console.error("Bookmark toggle failed:", error);
      toast.error("बुकमार्क सहेजा नहीं जा सका।");
    } finally {
      setIsProcessing(false);
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : SITE_URL;
  const shareUrl = `${baseUrl}${getArticleUrl({ slug })}`;
  const shareTitle = `${title} | युवाक्षर`;

  const handleShareClick = (platform: string) => {
    dispatchAnalyticsEvent("share_click", {
      article_id: articleId,
      title,
      platform
    });
  };

  const handleMoreShare = async () => {
    handleShareClick("More Options");

    const shareData = {
      title: shareTitle,
      text: shareTitle,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Native share failed:", error);
          toast.error("साझा करने में विफल");
        }
        return;
      }
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Bookmark Tooltip Wrapper */}
        <div className="relative group flex justify-center">
          <button 
            onClick={handleBookmark}
            disabled={isProcessing}
            aria-label={isBookmarked ? "बुकमार्क हटाएँ" : "बुकमार्क करें"}
            className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full hover:text-[#f97316] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f97316]"
          >
            <Bookmark 
              className="w-5 h-5 transition-colors" 
              fill={isBookmarked ? "currentColor" : "none"} 
              stroke={isBookmarked ? "currentColor" : "currentColor"}
            />
          </button>
          {/* Tooltip */}
          <span className="absolute bottom-full mb-2.5 hidden md:group-hover:block md:group-focus-within:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 z-20 font-sans font-medium">
            {isBookmarked ? "बुकमार्क हटाएँ" : "बुकमार्क करें"}
          </span>
        </div>
        
        {/* WhatsApp Tooltip Wrapper */}
        <div className="relative group flex justify-center">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShareClick("WhatsApp")}
            aria-label="WhatsApp पर साझा करें"
            className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
          >
            <WhatsAppIcon />
          </a>
          <span className="absolute bottom-full mb-2.5 hidden md:group-hover:block md:group-focus-within:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 z-20 font-sans font-medium">
            WhatsApp पर साझा करें
          </span>
        </div>

        {/* Facebook Tooltip Wrapper */}
        <div className="relative group flex justify-center">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShareClick("Facebook")}
            aria-label="Facebook पर साझा करें"
            className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1877F2]"
          >
            <FacebookIcon />
          </a>
          <span className="absolute bottom-full mb-2.5 hidden md:group-hover:block md:group-focus-within:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 z-20 font-sans font-medium">
            Facebook पर साझा करें
          </span>
        </div>

        {/* X Tooltip Wrapper */}
        <div className="relative group flex justify-center">
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShareClick("X")}
            aria-label="X पर साझा करें"
            className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <XIcon />
          </a>
          <span className="absolute bottom-full mb-2.5 hidden md:group-hover:block md:group-focus-within:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 z-20 font-sans font-medium">
            X पर साझा करें
          </span>
        </div>

        {/* More Options Tooltip Wrapper */}
        <div className="relative group flex justify-center">
          <button 
            onClick={handleMoreShare}
            aria-label="अन्य साझा विकल्प"
            className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <span className="absolute bottom-full mb-2.5 hidden md:group-hover:block md:group-focus-within:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 z-20 font-sans font-medium">
            अन्य साझा विकल्प
          </span>
        </div>
      </div>

      {isModalOpen && (
        <ShareModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          shareUrl={shareUrl}
          title={shareTitle}
        />
      )}
    </>
  );
}
