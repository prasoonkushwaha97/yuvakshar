import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, Quote } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";

interface ProfileCoverProps {
  coverUrl: string | undefined;
  isOwner: boolean;
  onCoverUpload?: () => void;
}

export default function ProfileCover({ coverUrl, isOwner, onCoverUpload }: ProfileCoverProps) {
  let finalCoverUrl = coverUrl;
  if (finalCoverUrl && !finalCoverUrl.startsWith('http') && !finalCoverUrl.startsWith('/') && !finalCoverUrl.startsWith('data:')) {
    finalCoverUrl = supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).getPublicUrl(finalCoverUrl).data.publicUrl;
  }

  return (
    <div className="relative h-[220px] sm:h-[280px] lg:h-[380px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 group">
      {finalCoverUrl ? (
        <Image 
          src={finalCoverUrl} 
          alt="Profile Cover" 
          className="w-full h-full object-cover" 
          fill 
          priority
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-[#F97316]/10 via-slate-100 to-[#F97316]/5 dark:from-[#F97316]/10 dark:via-[#0F172A] dark:to-[#1E293B]" />
      )}

      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-6 left-4 sm:left-8 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-md hover:bg-white dark:hover:bg-[#0F172A] border border-white/20 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-full text-xs font-bold font-serif flex items-center gap-2 transition-all shadow-sm z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>मुख्य पृष्ठ</span>
      </Link>

      {/* Top Right Quote Card (Glassmorphism) */}
      <div className="absolute top-6 right-4 sm:right-8 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 p-4 rounded-2xl hidden md:flex items-start gap-3 shadow-lg max-w-xs transition-transform hover:scale-[1.02]">
        <Quote className="w-6 h-6 text-white/80 shrink-0 fill-white/20" />
        <p className="text-white font-serif text-sm font-medium leading-relaxed drop-shadow-md">
          "ज्ञान से ही विचारों को नई उड़ान मिलती है, और विचारों से राष्ट्र का निर्माण होता है।"
        </p>
      </div>

      {/* Change Cover Button Overlay */}
      {isOwner && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
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
