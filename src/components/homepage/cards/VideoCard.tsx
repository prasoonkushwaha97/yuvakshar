"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface VideoCardProps {
  video: any;
}

export default function VideoCard({ video }: VideoCardProps) {
  if (!video) return null;

  const thumbnailUrl = video.thumbnailUrl || "/images/placeholder-news.jpg";
  const duration = video.duration || "05:12";
  const cleanDate = video.publishDate ? video.publishDate.split("T")[0] : "";

  return (
    <Link
      href={`/video?id=${video.id}`}
      className="group flex flex-col bg-[#161616] rounded-lg overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-850"
    >
      {/* Video Thumbnail */}
      <div className="aspect-video w-full relative overflow-hidden bg-gray-900 shrink-0">
        <Image src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-80 group-hover:opacity-100" loading="lazy" fill />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/40 transition-colors">
          <PlayCircle className="w-12 h-12 text-white opacity-85 group-hover:opacity-100 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-300" />
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-sm tracking-wider">
          {duration}
        </div>
      </div>

      {/* Title */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h4 className="font-serif font-black text-sm md:text-base leading-snug group-hover:text-[#f97316] text-white line-clamp-2 transition-colors mb-2">
          {video.title}
        </h4>
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-gray-500 font-sans mt-auto">
          <span>{video.category || "वीडियो"}</span>
          <span>{cleanDate}</span>
        </div>
      </div>
    </Link>
  );
}
