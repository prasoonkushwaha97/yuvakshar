"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  articleId: string;
  slug?: string;
  title: string;
  className?: string;
}

export default function ShareButton({ articleId, slug, title, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = slug 
      ? `${window.location.origin}/articles/${slug}`
      : `${window.location.origin}/articles/${articleId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "युवाक्षर पर यह लेख पढ़ें:",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className={`p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-gray-900 border border-transparent transition-all hover:scale-105 active:scale-95 ${className}`}
        title="लेख साझा करें"
        aria-label="Share article"
      >
        <Share2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </button>

      {copied && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-white text-[10px] rounded shadow-md whitespace-nowrap animate-fade-in z-50">
          लिंक कॉपी हो गया!
        </span>
      )}
    </div>
  );
}
