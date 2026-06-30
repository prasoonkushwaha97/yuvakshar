"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { supabase } from "@/lib/supabaseClient";
import { useCms } from "@/store/CmsContext";
import { Camera, UploadCloud, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import getCroppedImg from "@/lib/cropImage";
import { toast } from "sonner";

interface AvatarUploaderProps {
  currentAvatarUrl: string;
}

export default function AvatarUploader({ currentAvatarUrl }: AvatarUploaderProps) {
  const { currentUser, updateUserProfile } = useCms();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validation
      if (!file.type.startsWith("image/")) {
        toast.error("कृपया केवल इमेज फ़ाइल (JPG/PNG) चुनें।");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("फ़ाइल का आकार 5MB से कम होना चाहिए।");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!currentUser || !imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      toast.info("प्रोफ़ाइल फ़ोटो अपलोड हो रही है...");

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) {
        throw new Error("क्रॉपिंग में त्रुटि।");
      }

      const fileExt = "jpg";
      // Use timestamp for cache busting
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      await updateUserProfile({ avatar_url: avatarUrl });
      
      toast.success("प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई।");
      setIsCropping(false);
      setImageSrc(null);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "अपलोड विफल रहा। कृपया पुनः प्रयास करें।");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar Display */}
        <div 
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm shrink-0 group cursor-pointer"
          onClick={triggerFileSelect}
        >
          {currentAvatarUrl ? (
            <img 
              src={currentAvatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="space-y-3">
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 text-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Local Device से अपलोड करें</span>
          </button>
          
          <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
            अनुमत फ़ॉर्मेट: JPG, PNG. अधिकतम आकार: 5MB.
          </p>
        </div>
      </div>

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white font-serif">फ़ोटो क्रॉप करें</h3>
              <button 
                onClick={handleCancel}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative w-full h-[300px] sm:h-[400px] bg-slate-100 dark:bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 text-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सेव हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>सेव करें</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
