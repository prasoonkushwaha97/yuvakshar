"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  Search,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { BannerGalleryItem } from "@/store/types";
import {
  getBannerGallery,
  saveBannerGalleryItem,
  deleteBannerGalleryItem,
  reorderBannerGalleryItems,
  BANNER_CATEGORIES,
} from "@/lib/bannerGalleryService";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE_CONFIG } from "@/config/storage.config";

export default function AdminBannerGallery() {
  const [banners, setBanners] = useState<BannerGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerGalleryItem> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setIsLoading(true);
    const data = await getBannerGallery(true);
    setBanners(data);
    setIsLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingBanner({
      id: `bg-${Date.now()}`,
      title: "",
      category: BANNER_CATEGORIES[0],
      image_url: "",
      status: "active",
      sort_order: banners.length + 1,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerGalleryItem) => {
    setEditingBanner({ ...banner });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप निश्चित रूप से इस बैनर को हटाना चाहते हैं?")) return;
    const updated = await deleteBannerGalleryItem(id);
    setBanners(updated);
  };

  const handleToggleStatus = async (banner: BannerGalleryItem) => {
    const updatedBanner: BannerGalleryItem = {
      ...banner,
      status: banner.status === "active" ? "disabled" : "active",
    };
    const updated = await saveBannerGalleryItem(updatedBanner);
    setBanners(updated);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const reordered = await reorderBannerGalleryItems(newBanners);
    setBanners(reordered);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title || !editingBanner?.image_url) {
      alert("कृपया शीर्षक और छवि URL प्रदान करें।");
      return;
    }

    const updated = await saveBannerGalleryItem(editingBanner as BannerGalleryItem);
    setBanners(updated);
    setIsEditModalOpen(false);
    setEditingBanner(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `gallery/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(data.path);

      setEditingBanner((prev) => ({
        ...prev,
        image_url: publicUrlData.publicUrl,
      }));
    } catch (err: any) {
      alert("अपलोड विफल: " + (err.message || "त्रुटि"));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      b.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F97316]" />
            <span>बैनर गैलरी प्रबंधन (Banner Gallery Management)</span>
          </h1>
          <p className="text-sm text-slate-500 font-hindi mt-1">
            उपयोगकर्ताओं के लिए उपलब्ध क्यूरेटेड प्रोफाइल बैनर प्रबंधित करें।
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नया बैनर जोड़ें</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="बैनर खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#F97316] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[#F97316] text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            सभी श्रेणी ({banners.length})
          </button>
          {BANNER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#F97316] text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBanners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white dark:bg-[#0F172A] border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
                banner.status === "disabled"
                  ? "border-red-200 dark:border-red-950 opacity-60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-[3/1] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider bg-[#F97316] text-white px-2.5 py-1 rounded-full shadow">
                  {banner.category}
                </span>

                <span
                  className={`absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow ${
                    banner.status === "active"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {banner.status === "active" ? "सक्रिय (Active)" : "निष्क्रिय (Disabled)"}
                </span>
              </div>

              {/* Details & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 truncate">
                    ID: {banner.id} • क्रम: {banner.sort_order}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Move Up/Down Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      title="ऊपर ले जाएं"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredBanners.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      title="नीचे ले जाएं"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle / Edit / Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(banner)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        banner.status === "active"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                      }`}
                    >
                      {banner.status === "active" ? "बंद करें" : "सक्रिय करें"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="संपादित करें"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
            कोई बैनर नहीं मिला
          </h3>
          <p className="text-slate-500 text-sm font-hindi mt-1">
            "नया बैनर जोड़ें" पर क्लिक करके नया गैलरी बैनर जोड़ें।
          </p>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isEditModalOpen && editingBanner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                {banners.some((b) => b.id === editingBanner.id)
                  ? "बैनर संपादित करें"
                  : "नया गैलरी बैनर जोड़ें"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">
                  बैनर शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="उदा. विद्वत पुस्तकालय"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#F97316] text-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">
                  श्रेणी (Category) *
                </label>
                <select
                  value={editingBanner.category || BANNER_CATEGORIES[0]}
                  onChange={(e) => setEditingBanner({ ...editingBanner, category: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#F97316] text-slate-900 dark:text-white"
                >
                  {BANNER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">
                  छवि फ़ाइल या URL (Image URL / File) *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={editingBanner.image_url || ""}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, image_url: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#F97316] text-slate-900 dark:text-white"
                    required
                  />
                  <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700">
                    <Upload className="w-4 h-4 text-[#F97316]" />
                    <span>{isUploading ? "अपलोड..." : "अपलोड"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {editingBanner.image_url && (
                  <div className="aspect-[3/1] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                    <img
                      src={editingBanner.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 block">
                  स्थिति (Status)
                </label>
                <select
                  value={editingBanner.status || "active"}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      status: e.target.value as "active" | "disabled",
                    })
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-[#F97316] text-slate-900 dark:text-white"
                >
                  <option value="active">सक्रिय (Active)</option>
                  <option value="disabled">निष्क्रिय (Disabled)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-sm hover:bg-[#EA580C] shadow-md"
                >
                  सहेजें (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
