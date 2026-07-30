import React, { SyntheticEvent } from "react";
import Image, { ImageProps } from "next/image";
import { STORAGE_CONFIG } from "@/config/storage.config";

export const DEFAULT_ARTICLE_PLACEHOLDER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";

/**
 * Resolves an article's image URL reliably.
 * - Treats `articles.cover_image` as the primary source of truth.
 * - Returns placeholder for null, undefined, empty, or invalid inputs.
 * - Resolves both full HTTP(S) URLs and valid Supabase storage paths.
 * - Pure utility function safely importable in Server Components and Server Actions.
 */
export function getArticleImage(articleOrUrl: any, customFallback?: string): string {
  const fallback = customFallback || DEFAULT_ARTICLE_PLACEHOLDER;

  if (!articleOrUrl) return fallback;

  let rawUrl: string | null = null;

  if (typeof articleOrUrl === "string") {
    rawUrl = articleOrUrl;
  } else if (typeof articleOrUrl === "object") {
    rawUrl =
      articleOrUrl.cover_image ||
      articleOrUrl.coverImage ||
      articleOrUrl.image ||
      articleOrUrl.featured_image ||
      null;
  }

  if (!rawUrl || typeof rawUrl !== "string") {
    return fallback;
  }

  const trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "none" ||
    trimmed === "false" ||
    trimmed === "[object Object]"
  ) {
    if (typeof articleOrUrl === "object") {
      console.log("[Image Pipeline Diagnostic]", {
        title: articleOrUrl.title || articleOrUrl.title_hi || articleOrUrl.slug || "Unknown",
        coverImage: articleOrUrl.coverImage,
        cover_image: articleOrUrl.cover_image,
        rawUrl: trimmed,
        resolvedUrl: fallback
      });
    }
    return fallback;
  }

  // Handle full HTTP / HTTPS URLs or Data URLs or root-relative path
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  ) {
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        new URL(trimmed);
      }
      return trimmed;
    } catch {
      return fallback;
    }
  }

  // Handle Supabase Storage path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fbvffiotmlxypxmtlrsz.supabase.co";
  const bucketName = STORAGE_CONFIG.BUCKET_NAME || "yuvakshar-media";

  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  if (cleanPath.startsWith(bucketName + "/")) {
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;
}

/**
 * Event handler for onError on HTML <img> or Next.js <Image> elements to prevent broken image icons.
 * Automatically switches to fallback image on HTTP 404/403 or network failure.
 */
export function handleImageError(
  event: SyntheticEvent<HTMLImageElement, Event>,
  customFallback?: string
) {
  const target = event.currentTarget;
  const fallback = customFallback || DEFAULT_ARTICLE_PLACEHOLDER;
  target.srcset = "";
  if (target.src !== fallback) {
    console.warn(`[Image Pipeline Error] Failed to load image at "${target.src}". Falling back to default placeholder.`);
    target.src = fallback;
  }
}

export type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: any;
  fallbackSrc?: string;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
};

/**
 * Robust Image component wrapper that auto-resolves article images and falls back seamlessly on error.
 */
export function SafeImage({ src, fallbackSrc, alt, onError, ...rest }: SafeImageProps) {
  const resolvedSrc = getArticleImage(src, fallbackSrc);
  return React.createElement(Image, {
    ...rest,
    src: resolvedSrc,
    alt: alt || "Article Image",
    onError: (e: SyntheticEvent<HTMLImageElement, Event>) => {
      handleImageError(e, fallbackSrc);
      if (onError) onError(e);
    }
  });
}
