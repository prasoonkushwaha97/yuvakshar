"use client";

import React, { useState } from "react";
import { PlayCircle, Film, Clock } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import VideoCard from "../cards/VideoCard";

export default function Videos() {
  const { locale } = useLanguage();
  const { videos } = useCms();

  const publishedVideos = (videos ?? []).filter((v: any) => v.status === "Published" || !v.status);
  const [activeVideo, setActiveVideo] = useState<any>(publishedVideos[0] || null);

  if (publishedVideos.length === 0) return null;

  // The sidebar has the rest of the videos
  const playlist = publishedVideos.filter((v: any) => v.id !== activeVideo?.id);

  // Helper to extract YouTube video ID
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1] || "");
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
  };

  const hasValidVideo = activeVideo && activeVideo.youtubeUrl;

  return (
    <div className="w-full py-4 text-white">
      {/* Title */}
      <SectionTitle 
        title={locale === "hi" ? "वीडियो डेस्क" : "Video Desk"} 
        link="/category/वीडियो" 
        className="border-b-gray-800"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111] p-6 rounded-lg border border-gray-850 shadow-2xl">
        {/* Left Column: Featured Video Player (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="aspect-video w-full relative overflow-hidden bg-black rounded-lg border border-gray-800 shadow-md">
            {hasValidVideo ? (
              <iframe
                src={getEmbedUrl(activeVideo.youtubeUrl)}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <PlayCircle className="w-16 h-16 text-gray-700 mb-2" />
                <span className="text-sm font-serif">वीडियो उपलब्ध नहीं है।</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <span className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-widest font-sans inline-block">
              {activeVideo?.category || "विशेष वीडियो रिपोर्ट"}
            </span>
            <h3 className="font-serif font-black text-lg md:text-xl text-white leading-snug">
              {activeVideo?.title}
            </h3>
            <p className="text-gray-400 text-xs md:text-sm font-sans leading-relaxed">
              {activeVideo?.description}
            </p>
          </div>
        </div>

        {/* Right Column: Playlist Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="flex items-center space-x-1.5 border-b border-gray-800 pb-3 mb-4">
            <Film className="w-4 h-4 text-[#f97316]" />
            <h4 className="font-serif font-black text-xs uppercase tracking-widest text-gray-400">
              {locale === "hi" ? "वीडियो प्लेलिस्ट" : "Video Playlist"}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-1 scrollbar-none">
            {playlist.length > 0 ? (
              playlist.map((video: any) => (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="flex gap-3 bg-[#1A1A1A] hover:bg-[#222] border border-gray-850 p-2.5 rounded hover:border-[#f97316]/50 transition-all duration-200 cursor-pointer group"
                >
                  {/* Small video thumbnail */}
                  <div className="w-24 aspect-video bg-black relative rounded-sm overflow-hidden shrink-0">
                    <img
                      src={video.thumbnailUrl || "/images/placeholder-news.jpg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40">
                      <PlayCircle className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  {/* Text details */}
                  <div className="flex flex-col justify-center min-w-0">
                    <h5 className="font-serif font-bold text-xs text-white line-clamp-2 leading-snug group-hover:text-[#f97316] transition-colors">
                      {video.title}
                    </h5>
                    <div className="flex items-center space-x-2 mt-1.5 text-[9px] text-gray-500 font-sans uppercase">
                      <span className="flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {video.duration || "05:00"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 font-serif border border-gray-850 bg-[#161616] rounded">
                कोई अन्य वीडियो उपलब्ध नहीं है।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
