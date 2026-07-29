"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Image as ImageIcon } from "lucide-react";
import { BannerGalleryItem } from "@/store/types";
import { getBannerGallery, BANNER_CATEGORIES } from "@/lib/bannerGalleryService";

interface BannerGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBannerId?: string;
  onSelectBanner: (banner: BannerGalleryItem) => void;
}

export default function BannerGalleryModal({
  isOpen,
  onClose,
  selectedBannerId,
  onSelectBanner,
}: BannerGalleryModalProps) {
  const [banners, setBanners] = useState<BannerGalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getBannerGallery(false).then((data) => {
        setBanners(data);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ["all", ...BANNER_CATEGORIES];

  const filteredBanners =
    activeCategory === "all"
      ? banners
      : banners.filter(
          (b) => b.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#F97316]" />
              <span>युवाक्षर बैनर गैलरी (Yuvakshar Banner Gallery)</span>
            </h2>
            <p className="text-xs text-slate-500 font-hindi mt-1">
              अपनी प्रोफाइल के लिए अपनी पसंदीदा बैनर छवि चुनें (3:1 Aspect Ratio)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide bg-slate-50/30 dark:bg-slate-900/30">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[#F97316] text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {cat === "all" ? "सभी बैनर" : cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/1] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredBanners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredBanners.map((banner) => {
                const isSelected = selectedBannerId === banner.id;
                return (
                  <div
                    key={banner.id}
                    onClick={() => {
                      onSelectBanner(banner);
                      onClose();
                    }}
                    className={`group relative aspect-[3/1] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-[#F97316] ring-4 ring-[#F97316]/20 scale-[1.01]"
                        : "border-slate-200 dark:border-slate-800 hover:border-[#F97316]/60 hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Title & Badge */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#F97316] px-2 py-0.5 rounded-full">
                          {banner.category}
                        </span>
                        <h4 className="text-sm font-bold font-serif line-clamp-1 mt-1">
                          {banner.title}
                        </h4>
                      </div>

                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-lg shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 font-hindi">
              इस श्रेणी में कोई बैनर उपलब्ध नहीं है।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
