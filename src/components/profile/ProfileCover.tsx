import React from "react";
import Image from "next/image";
import { Camera, Quote } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";
import { getProfileBannerUrl, DEFAULT_FALLBACK_BANNER } from "@/lib/bannerGalleryService";
import { Profile } from "@/store/types";

interface ProfileCoverProps {
  user?: Profile | any;
  coverUrl?: string | undefined;
  isOwner?: boolean;
  onCoverUpload?: () => void;
}

export default function ProfileCover({ user, coverUrl, isOwner = false, onCoverUpload }: ProfileCoverProps) {
  let finalCoverUrl = user ? getProfileBannerUrl(user) : coverUrl || DEFAULT_FALLBACK_BANNER;

  if (finalCoverUrl && !finalCoverUrl.startsWith('http') && !finalCoverUrl.startsWith('/') && !finalCoverUrl.startsWith('data:')) {
    finalCoverUrl = supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).getPublicUrl(finalCoverUrl).data.publicUrl;
  }

  return (
    <div className="relative h-[220px] sm:h-[280px] lg:h-[380px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 group">
      <Image 
        src={finalCoverUrl || DEFAULT_FALLBACK_BANNER} 
        alt="Profile Cover Banner" 
        className="w-full h-full object-cover" 
        fill 
        priority
        sizes="100vw"
        unoptimized
      />

      {/* Top Right Quote Card (Glassmorphism) */}
      <div className="absolute top-6 right-4 sm:right-8 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 p-4 rounded-2xl hidden md:flex items-start gap-3 shadow-lg max-w-xs transition-transform hover:scale-[1.02]">
        <Quote className="w-6 h-6 text-white/80 shrink-0 fill-white/20" />
        <p className="text-white font-serif text-sm font-medium leading-relaxed drop-shadow-md">
          "ज्ञान से ही विचारों को नई उड़ान मिलती है, और विचारों से राष्ट्र का निर्माण होता है।"
        </p>
      </div>

      {/* Change Cover Button Overlay */}
      {isOwner && onCoverUpload && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            type="button"
            onClick={onCoverUpload}
            className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-full text-sm font-bold font-serif flex items-center gap-2 shadow-xl transition-transform hover:scale-105 backdrop-blur-sm"
          >
            <Camera className="w-4 h-4" />
            <span>कवर बदलें</span>
          </button>
        </div>
      )}
      
      {/* Bottom fade gradient to blend with the page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#0A0F1D] to-transparent" />
    </div>
  );
}
