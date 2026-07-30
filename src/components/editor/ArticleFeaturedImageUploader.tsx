"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ImagePlus, X, RefreshCw, Loader2 } from "lucide-react";
import { uploadImage } from "@/utils/storageHelper";
import { STORAGE_CONFIG } from "@/config/storage.config";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import { getArticleImage, handleImageError } from "@/utils/imageHelper";

interface ArticleFeaturedImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  articleId?: string;
  className?: string;
}

export default function ArticleFeaturedImageUploader({
  value,
  onChange,
  articleId,
  className = "",
}: ArticleFeaturedImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deletePreviousImage = async (oldUrl: string) => {
    try {
      if (!oldUrl.includes('/articles/')) return;
      
      const urlParts = oldUrl.split('/articles/');
      if (urlParts.length >= 2) {
        const filePath = urlParts.slice(1).join('/articles/');
        await supabase.storage.from('articles').remove([filePath]);
      }
    } catch (e) {
      console.error("Failed to delete previous image", e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please login to upload.");

        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        
        const fileExt = compressedFile.name.split(".").pop()?.toLowerCase() || "webp";
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const fileName = `${uniqueId}_${sanitizedName}`;
        const path = articleId ? `${articleId}/${fileName}` : `temp_${Date.now()}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("articles")
          .upload(path, compressedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressedFile.type
          });

        if (uploadError) {
          throw new Error("Failed to upload image. " + uploadError.message);
        }

        const { data } = supabase.storage.from("articles").getPublicUrl(path);
        const publicUrl = data.publicUrl;
        console.log("Uploaded coverImage URL:", publicUrl);

        if (value) {
           await deletePreviousImage(value);
        }
        
        onChange(publicUrl);
        toast.success("Image uploaded successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload image");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      await deletePreviousImage(value);
      onChange("");
    }
  };

  console.log("FeaturedImageUploader rendering with value prop:", value);

  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`relative w-full aspect-video rounded-xl overflow-hidden border-2 transition-colors group ${
          value ? "border-slate-200 dark:border-slate-700" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-[#ea580c] hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        }`}
        onClick={() => {
          if (!value && !isUploading) fileInputRef.current?.click();
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
             <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin mb-2" />
             <span className="text-sm font-medium text-slate-500">Uploading...</span>
          </div>
        ) : value ? (
          <>
            <Image src={getArticleImage(value)} alt="Featured Image" fill onError={handleImageError} className="object-cover" sizes="(max-width: 768px) 100vw, 800px" unoptimized />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-slate-100">
                <RefreshCw className="w-4 h-4" /> Replace
              </button>
              <button type="button" onClick={handleRemove} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-red-600">
                <X className="w-4 h-4" /> Remove
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:text-[#ea580c] transition-colors">
              <ImagePlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold font-hindi group-hover:text-[#ea580c] transition-colors">
              Click to upload featured image
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
