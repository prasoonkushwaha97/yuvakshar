"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Trash2, RefreshCw, Image as ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";
import BannerGalleryModal from "@/components/profile/BannerGalleryModal";
import { BannerGalleryItem } from "@/store/types";
import { DEFAULT_FALLBACK_BANNER } from "@/lib/bannerGalleryService";

interface BannerUploaderProps {
  customBannerUrl?: string;
  selectedGalleryBannerId?: string;
  onChange: (data: { customBannerUrl?: string; selectedGalleryBannerId?: string }) => void;
}

export default function BannerUploader({
  customBannerUrl,
  selectedGalleryBannerId,
  onChange,
}: BannerUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute active preview banner
  const activePreview = customBannerUrl || DEFAULT_FALLBACK_BANNER;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("कृपया एक मान्य चित्र (JPG, PNG, WebP) फ़ाइल चुनें।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("फ़ाइल का आकार 5MB से कम होना चाहिए।");
      return;
    }

    setErrorMsg("");
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(data.path);

      const newUrl = publicUrlData.publicUrl;

      // Update state: clear gallery selection, set custom banner
      onChange({
        customBannerUrl: newUrl,
        selectedGalleryBannerId: undefined,
      });
    } catch (err: any) {
      console.error("Banner upload failed:", err);
      setErrorMsg(err.message || "बैनर अपलोड विफल रहा। कृपया पुन: प्रयास करें।");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectGalleryBanner = (banner: BannerGalleryItem) => {
    onChange({
      customBannerUrl: banner.image_url,
      selectedGalleryBannerId: banner.id,
    });
  };

  const handleRemoveBanner = () => {
    onChange({
      customBannerUrl: "",
      selectedGalleryBannerId: undefined,
    });
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>प्रोफाइल बैनर (Profile Banner)</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            3:1 Ratio (1500×500 px)
          </span>
        </label>
      </div>

      {/* Banner Preview Card */}
      <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group shadow-md">
        <img
          src={activePreview}
          alt="Profile Banner Preview"
          className="w-full h-full object-cover"
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#F97316]" />
            ) : (
              <Upload className="w-4 h-4 text-[#F97316]" />
            )}
            <span>{customBannerUrl ? "बैनर बदलें" : "कस्टम बैनर अपलोड करें"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="px-4 py-2 bg-[#F97316] text-white hover:bg-[#EA580C] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>गैलरी से चुनें</span>
          </button>

          {customBannerUrl && (
            <button
              type="button"
              onClick={handleRemoveBanner}
              className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105"
              title="बैनर हटाएं"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons Below Banner */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-[#F97316]" />
          <span>अपलोड करें</span>
        </button>

        <button
          type="button"
          onClick={() => setIsGalleryOpen(true)}
          className="px-3.5 py-1.5 bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#F97316]/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>गैलरी से चुनें (Yuvakshar Banner Gallery)</span>
        </button>

        {customBannerUrl && (
          <button
            type="button"
            onClick={handleRemoveBanner}
            className="px-3.5 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>हटाएं</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-red-500 font-medium font-hindi">{errorMsg}</p>
      )}

      {/* Banner Gallery Selector Modal */}
      <BannerGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedBannerId={selectedGalleryBannerId}
        onSelectBanner={handleSelectGalleryBanner}
      />
    </div>
  );
}
