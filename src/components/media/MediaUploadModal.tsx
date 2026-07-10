"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Image as ImageIcon, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadImage } from "@/utils/storageHelper";
import { STORAGE_CONFIG, StorageFolder } from "@/config/storage.config";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  metadata: any;
  created_at: string;
  uploaded_by: string;
}

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText: string) => void;
  requireAltText?: boolean;
  folder?: StorageFolder;
}

export default function MediaUploadModal({ isOpen, onClose, onSelect, requireAltText = true, folder = STORAGE_CONFIG.FOLDERS.MISC }: MediaUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library State
  const [libraryImages, setLibraryImages] = useState<MediaAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedLibraryImage, setSelectedLibraryImage] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "library" && isMounted) {
      fetchLibraryImages();
    }
  }, [isOpen, activeTab, isMounted]);

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoadingLibrary(false);
      return;
    }

    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("uploaded_by", user.id)
      .eq("type", "image")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching library:", error.message || error.code || JSON.stringify(error));
      setError(`Error fetching library: ${error.message || JSON.stringify(error)}`);
    } else {
      setLibraryImages(data || []);
    }
    setIsLoadingLibrary(false);
  };

  if (!isMounted) return null;

  const handleFile = async (file: File) => {
    if (requireAltText && !altText.trim()) {
      setError("कृपया चित्र के लिए ऑल्ट टेक्स्ट (Alt Text) दर्ज करें। (Please enter Alt Text)");
      return;
    }
    setError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Compress Image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      setUploadProgress(30);
      const compressedFile = await imageCompression(file, options);
      
      // 2. Upload to Supabase Storage
      setUploadProgress(60);
      const publicUrl = await uploadImage(compressedFile, folder);
      
      // 3. Save to media_assets table
      setUploadProgress(90);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: dbError } = await supabase.from("media_assets").insert({
          filename: file.name,
          url: publicUrl,
          type: "image",
          metadata: {
            altText,
            caption,
            sizeBytes: compressedFile.size,
            mimeType: compressedFile.type,
            extension: file.name.split('.').pop(),
          },
          uploaded_by: user.id
        });
        
        if (dbError) {
          throw new Error("डेटाबेस में चित्र सुरक्षित करने में विफल। " + dbError.message);
        }
      }

      setUploadProgress(100);
      setIsUploading(false);
      onSelect(publicUrl, altText);
      onClose();
      // Reset form
      setAltText("");
      setCaption("");
    } catch (err: any) {
      setError(err.message || "अपलोड करने में त्रुटि हुई।");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleLibrarySelect = () => {
    if (selectedLibraryImage) {
      onSelect(selectedLibraryImage.url, selectedLibraryImage.metadata?.altText || "");
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredLibrary = libraryImages.filter(img => 
    img.metadata?.altText?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    img.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#0E1322] w-full max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold font-hindi dark:text-white">मीडिया जोड़ें (Add Media)</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-3 text-sm font-bold font-hindi border-b-2 transition-colors ${activeTab === "upload" ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              फाइल अपलोड करें
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-3 text-sm font-bold font-hindi border-b-2 transition-colors ${activeTab === "library" ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              मीडिया लाइब्रेरी
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {activeTab === "upload" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                      dragActive ? "border-[#ea580c] bg-[#ea580c]/5" : "border-slate-200 dark:border-slate-700 hover:border-[#ea580c] hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-[#ea580c] animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">अपलोड हो रहा है... {uploadProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 text-[#ea580c] rounded-full flex items-center justify-center mb-4">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white font-hindi mb-1">
                          छवि यहाँ खींचें या चुनें
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 font-hindi">
                          अधिकतम फाइल साइज: 10MB (JPG, PNG, WEBP)
                        </p>
                        <button type="button" className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90">
                          फाइल चुनें
                        </button>
                      </>
                    )}
                  </div>

                  {/* Metadata Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 font-hindi">
                        ऑल्ट टेक्स्ट (Alt Text) {requireAltText && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="छवि का वर्णन करें (SEO के लिए महत्वपूर्ण)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ea580c]"
                      />
                      <p className="text-xs text-slate-500 mt-1">दृष्टिबाधित लोगों और सर्च इंजन के लिए आवश्यक।</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 font-hindi">
                        कैप्शन (Caption)
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="छवि के नीचे प्रदर्शित करने के लिए (वैकल्पिक)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="लाइब्रेरी में खोजें..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto">
                  {isLoadingLibrary ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
                    </div>
                  ) : filteredLibrary.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>कोई चित्र नहीं मिला।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredLibrary.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedLibraryImage(img)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedLibraryImage?.id === img.id ? "border-[#ea580c] shadow-md ring-2 ring-[#ea580c]/20" : "border-transparent hover:border-slate-300"}`}
                        >
                          <Image
                            src={img.url}
                            alt={img.metadata?.altText || "Library image"}
                            fill
                            className="object-cover"
                          />
                          {selectedLibraryImage?.id === img.id && (
                            <div className="absolute top-2 right-2 bg-[#ea580c] text-white rounded-full p-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Library Footer */}
                {selectedLibraryImage && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedLibraryImage(null)}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={handleLibrarySelect}
                      className="px-6 py-2 bg-[#ea580c] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#c2410c]"
                    >
                      चित्र चुनें
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
