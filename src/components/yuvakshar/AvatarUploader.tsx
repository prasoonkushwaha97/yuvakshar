"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCms } from "@/store/CmsContext";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import MediaUploadModal from "../media/MediaUploadModal";

interface AvatarUploaderProps {
  currentAvatarUrl: string;
}

export default function AvatarUploader({ currentAvatarUrl }: AvatarUploaderProps) {
  const { currentUser, updateUserProfile } = useCms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaSelect = async (url: string) => {
    if (!currentUser) return;
    try {
      setIsUploading(true);
      await updateUserProfile({ avatar_url: url });
      toast.success("प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई।");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "अपडेट विफल रहा। कृपया पुनः प्रयास करें।");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
          {currentAvatarUrl ? (
            <Image
              src={currentAvatarUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
        </div>
        
        {/* Upload Overlay Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
          title="प्रोफ़ाइल फ़ोटो बदलें"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-bold font-hindi">बदलें</span>
            </>
          )}
        </button>
      </div>

      <MediaUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMediaSelect}
        requireAltText={false}
      />
    </>
  );
}
