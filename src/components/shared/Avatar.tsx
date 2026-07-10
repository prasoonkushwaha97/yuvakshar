import React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";

interface AvatarProps {
  url?: string | null;
  alt?: string | null;
  className?: string; // Container className (e.g. for sizing and rounding)
}

export default function Avatar({ url, alt, className = "" }: AvatarProps) {
  let finalUrl = url;

  // Resolve raw Supabase storage paths into fully qualified public URLs
  if (
    finalUrl && 
    !finalUrl.startsWith("http") && 
    !finalUrl.startsWith("/") && 
    !finalUrl.startsWith("data:")
  ) {
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(finalUrl);
    finalUrl = data?.publicUrl;
  }

  // Fallback if url is empty, null, undefined, or somehow invalid
  const imageSrc = finalUrl || "/images/default-avatar.png";

  return (
    <div className={`relative overflow-hidden shrink-0 ${className}`}>
      <Image
        src={imageSrc}
        alt={alt || "Avatar"}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
