"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImagePlus, X, RefreshCw } from "lucide-react";
import MediaUploadModal from "./MediaUploadModal";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string, altText?: string) => void;
  label?: string;
  aspectRatio?: string;
  className?: string;
  requireAltText?: boolean;
}

export default function MediaUploader({
  value,
  onChange,
  label = "छवि अपलोड करें (Upload Image)",
  aspectRatio = "aspect-video",
  className = "",
  requireAltText = true,
}: MediaUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (url: string, altText: string) => {
    onChange(url, altText);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-hindi">{label}</label>}
      
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden border-2 cursor-pointer transition-colors group ${
          value ? "border-slate-200 dark:border-slate-700" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-[#ea580c] hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        {value ? (
          <>
            <Image 
              src={value} 
              alt="Uploaded Preview" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-slate-100"
              >
                <RefreshCw className="w-4 h-4" /> बदलें
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-red-600"
              >
                <X className="w-4 h-4" /> हटाएँ
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:text-[#ea580c] transition-colors">
              <ImagePlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold font-hindi group-hover:text-[#ea580c] transition-colors">
              चित्र चुनें या मीडिया लाइब्रेरी खोलें
            </span>
          </div>
        )}
      </div>

      <MediaUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        requireAltText={requireAltText}
      />
    </div>
  );
}
