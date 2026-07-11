"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  alt?: string | null;
  className?: string; // Container className (e.g. for sizing)
}

export default function Avatar({ url, name, alt, className = "" }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  useEffect(() => {
    setHasError(false);
    let resolvedUrl = url;

    // Resolve raw Supabase storage paths into fully qualified public URLs
    if (
      resolvedUrl &&
      !resolvedUrl.startsWith("http") &&
      !resolvedUrl.startsWith("/") &&
      !resolvedUrl.startsWith("data:")
    ) {
      const { data } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(resolvedUrl);
      resolvedUrl = data?.publicUrl;
    }
    
    setFinalUrl(resolvedUrl || null);
  }, [url]);

  const cleanName = (name || "").trim();
  
  // Extract multilingual initial using Intl.Segmenter to support complex graphemes (Devanagari, Emoji, etc.)
  let initial = "";
  if (cleanName) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      const segments = segmenter.segment(cleanName);
      const iterator = segments[Symbol.iterator]();
      const firstSegment = iterator.next().value;
      if (firstSegment) {
        initial = firstSegment.segment.toUpperCase();
      }
    } else {
      // Fallback for extremely old browsers
      initial = cleanName.charAt(0).toUpperCase();
    }
  }
  
  const altText = alt || (cleanName ? cleanName : "User Avatar");
  const showInitial = !finalUrl || hasError;

  return (
    <div 
      className={`relative overflow-hidden shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary font-semibold border border-primary/20 ${className}`}
    >
      {showInitial ? (
        initial ? (
          <span className="w-full h-full flex items-center justify-center leading-none">
            {initial}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-primary/50" />
        )
      ) : (
        <Image
          src={finalUrl!}
          alt={altText}
          fill
          className="object-cover"
          unoptimized
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
