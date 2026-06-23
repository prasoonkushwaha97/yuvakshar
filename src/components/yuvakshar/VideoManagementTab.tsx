"use client";

import React, { useState } from "react";
import { Plus, Video, Trash2, Edit3, Star } from "lucide-react";
import { useCms, Profile, Video as VideoType } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface VideoManagementTabProps {
  currentUser: Profile;
}

export default function VideoManagementTab({ currentUser }: VideoManagementTabProps) {
  const cms = useCms();

  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidUrl, setVidUrl] = useState("");
  const [vidCategory, setVidCategory] = useState<VideoType["category"]>("समाचार");
  const [vidIsShorts, setVidIsShorts] = useState(false);
  const [vidIsFeatured, setVidIsFeatured] = useState(false);
  const [vidStatus, setVidStatus] = useState<VideoType["status"]>("Published");
  const [vidDuration, setVidDuration] = useState("");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle.trim() || !vidUrl.trim()) {
      alert("शीर्षक और यूआरएल अनिवार्य हैं!");
      return;
    }
    await cms.saveVideo({
      id: editingVideoId || undefined,
      title: vidTitle,
      description: vidDesc,
      youtubeUrl: vidUrl,
      category: vidCategory,
      isShorts: vidIsShorts,
      isFeatured: vidIsFeatured,
      status: vidStatus,
      duration: vidDuration || undefined
    });
    
    // Reset form states
    setVidTitle("");
    setVidDesc("");
    setVidUrl("");
    setVidCategory("समाचार");
    setVidIsShorts(false);
    setVidIsFeatured(false);
    setVidStatus("Published");
    setVidDuration("");
    setEditingVideoId(null);
    setShowVideoForm(false);
    alert("वीडियो सफलतापूर्वक सुरक्षित किया गया!");
  };

  const startEditVideo = (v: VideoType) => {
    setEditingVideoId(v.id);
    setVidTitle(v.title);
    setVidDesc(v.description || "");
    setVidUrl(v.youtubeUrl);
    setVidCategory(v.category);
    setVidIsShorts(v.isShorts);
    setVidIsFeatured(v.isFeatured);
    setVidStatus(v.status);
    setVidDuration(v.duration || "");
    setShowVideoForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">वीडियो डेस्क प्रबंधन (Video Desk)</h2>
          <p className="text-xs text-slate-400">युवाक्षर मीडिया डेस्क के अंतर्गत प्रदर्शित होने वाले यूट्यूब वीडियो, साक्षात्कार और शॉर्ट्स प्रबंधित करें।</p>
        </div>
        
        {!showVideoForm && (
          <button 
            onClick={() => {
              setEditingVideoId(null);
              setVidTitle("");
              setVidDesc("");
              setVidUrl("");
              setVidCategory("समाचार");
              setVidIsShorts(false);
              setVidIsFeatured(false);
              setVidStatus("Published");
              setVidDuration("");
              setShowVideoForm(true);
            }}
            className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5 font-serif"
          >
            <Plus className="w-4 h-4" />
            <span>नया वीडियो जोड़ें</span>
          </button>
        )}
      </div>

      {showVideoForm ? (
        <GlassCard glow="gold" className="p-6">
          <form onSubmit={handleSaveVideo} className="space-y-4 text-xs font-serif">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <span className="font-bold text-slate-800 dark:text-white text-xs">{editingVideoId ? "वीडियो संपादित करें" : "नया वीडियो रिपोर्ट अपलोड करें"}</span>
              <button 
                type="button" 
                onClick={() => setShowVideoForm(false)}
                className="text-slate-450 hover:text-slate-205 cursor-pointer font-bold"
              >
                वापस सूची पर जाएं
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400">वीडियो शीर्षक (Hindi Title)</label>
                <input 
                  type="text" 
                  value={vidTitle}
                  onChange={(e) => setVidTitle(e.target.value)}
                  placeholder="उदा. युवाक्षर संवाद: नई शिक्षा नीति"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif font-semibold"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">यूट्यूब लिंक (YouTube URL)</label>
                <input 
                  type="url" 
                  value={vidUrl}
                  onChange={(e) => setVidUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400">श्रेणी (Category)</label>
                <select 
                  value={vidCategory}
                  onChange={(e) => setVidCategory(e.target.value as VideoType["category"])}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                >
                  {["समाचार", "विशेष रिपोर्ट", "साक्षात्कार", "विचार", "साहित्य", "शिक्षा", "पर्यावरण", "इतिहास", "पत्रिका विशेष", "युवाक्षर संवाद"]?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">अवधि (Duration - mm:ss)</label>
                <input 
                  type="text" 
                  value={vidDuration}
                  onChange={(e) => setVidDuration(e.target.value)}
                  placeholder="उदा. 12:45"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">स्थिति (Status)</label>
                <select 
                  value={vidStatus}
                  onChange={(e) => setVidStatus(e.target.value as VideoType["status"])}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                >
                  <option value="Published">प्रकाशित (Published)</option>
                  <option value="Draft">ड्राफ्ट (Draft)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">विवरण (Description)</label>
              <textarea 
                rows={3} 
                value={vidDesc}
                onChange={(e) => setVidDesc(e.target.value)}
                placeholder="वीडियो रिपोर्ट का संक्षिप्त विवरण यहाँ लिखें..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif leading-relaxed"
              />
            </div>

            <div className="flex gap-6 py-2">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={vidIsShorts}
                  onChange={(e) => setVidIsShorts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                />
                <span className="text-slate-700 dark:text-slate-200 font-bold">यह एक Shorts वीडियो है</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={vidIsFeatured}
                  onChange={(e) => setVidIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                />
                <span className="text-slate-700 dark:text-slate-200 font-bold">इसे मुख्य फीचर वीडियो बनाएँ</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex-grow text-center"
              >
                सुरक्षित करें
              </button>
              <button 
                type="button" 
                onClick={() => setShowVideoForm(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 px-5 py-3 rounded-xl font-bold transition-all cursor-pointer text-center"
              >
                रद्द करें
              </button>
            </div>
          </form>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">वीडियो लाइब्रेरी ({cms.videos.length} वीडियो)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cms.videos?.map(v => (
              <GlassCard key={v.id} glow={v.isFeatured ? "gold" : "none"} className="p-4 flex flex-col justify-between space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-28 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={v.thumbnailUrl || "/yuvakshar_logo.jpg"} 
                      alt={v.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg";
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white px-1 py-0.5 rounded text-[8px] font-mono">{v.duration || "5:00"}</span>
                    {v.isShorts && (
                      <span className="absolute top-1 left-1 bg-red-650 text-white px-1.5 py-0.2 rounded text-[8px] font-bold font-sans uppercase">Shorts</span>
                    )}
                  </div>
                  <div className="space-y-1 font-serif text-xs">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[9px] text-primary font-bold uppercase">{v.category}</span>
                      {v.isFeatured && (
                        <span className="text-[8px] bg-primary text-white font-bold px-1.5 py-0.2 rounded-full font-sans uppercase">FEATURED</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">{v.title}</h4>
                    <p className="text-[10px] text-slate-400 font-serif line-clamp-2">{v.description || "कोई विवरण नहीं है।"}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850 font-serif text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400 font-sans">
                    <span>सत्र: {v.status === "Published" ? "प्रकाशित" : "ड्राफ्ट"}</span>
                    <span>•</span>
                    <span>व्यूज: {v.viewCount || 0}</span>
                  </div>

                  <div className="flex gap-3">
                    {!v.isFeatured && !v.isShorts && (
                      <button 
                        onClick={() => {
                          cms.setFeaturedVideo(v.id);
                          alert("इसे मुख्य फीचर वीडियो बनाया गया!");
                        }}
                        className="text-primary hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <span>फीचर</span>
                      </button>
                    )}
                    <button 
                      onClick={() => startEditVideo(v)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>संपादित</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("क्या आप वाकई इस वीडियो को हटाना चाहते हैं?")) {
                          cms.deleteVideo(v.id);
                          alert("वीडियो हटा दिया गया!");
                        }
                      }}
                      className="text-red-500 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>हटाएँ</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
