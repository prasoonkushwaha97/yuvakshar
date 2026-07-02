"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { uploadImage } from "@/utils/storageHelper";
import Image from "next/image";

interface DeviceImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
  aspectRatio?: string; // e.g. "aspect-video" or "aspect-square" or "aspect-[3/4]"
  className?: string;
}

export default function DeviceImageUploader({
  value,
  onChange,
  bucket,
  folder = "",
  label = "छवि अपलोड करें (Upload Image)",
  aspectRatio = "aspect-video",
  className = "",
}: DeviceImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null); // For retry functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTaskRef = useRef<boolean>(true);

  const handleFile = async (file: File) => {
    setError(null);
    setLastFile(file);
    setIsUploading(true);
    uploadTaskRef.current = true;

    try {
      const publicUrl = await uploadImage(file, bucket, folder);
      if (uploadTaskRef.current) {
        onChange(publicUrl);
        setIsUploading(false);
      }
    } catch (err: any) {
      if (uploadTaskRef.current) {
        setError(err.message || "अपलोड करने में त्रुटि हुई।");
        setIsUploading(false);
      }
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
    setLastFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    uploadTaskRef.current = false;
    setIsUploading(false);
    setError("अपलोड रद्द किया गया।");
  };

  const handleRetry = () => {
    if (lastFile) {
      handleFile(lastFile);
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {value ? (
        // Preview State
        <div className={`relative ${aspectRatio} rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group`}>
          <Image
            src={value}
            alt="Upload Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-xs font-bold font-sans shadow-md hover:bg-slate-50 transition-colors"
            >
              बदलें (Replace)
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="bg-red-600 text-white p-2 rounded-xl shadow-md hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Upload / Drop State
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              !isUploading && fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={label}
          className={`relative ${aspectRatio} rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all p-6 text-center cursor-pointer ${
            dragActive
              ? "border-[#F97316] bg-orange-500/5"
              : "border-slate-300 dark:border-slate-700 hover:border-[#F97316] hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          {isUploading ? (
            // Uploading state
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">अपलोड हो रहा है...</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="text-xs text-red-500 hover:underline font-bold"
              >
                रद्द करें (Cancel)
              </button>
            </div>
          ) : (
            // Idle State
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-450 dark:text-slate-550 mt-1.5">
                क्लिक करें या छवि खींचकर यहाँ छोड़ें
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                JPG, PNG, WEBP, GIF (अधिकतम 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      />

      {/* Error state & Retry */}
      {error && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs border border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {lastFile && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 font-bold text-[#F97316] hover:underline shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              पुनः प्रयास करें (Retry)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
