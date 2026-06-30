import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Bookmark, Share } from "lucide-react";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";
import UserChip from "../shared/UserChip";

interface FeedCardProps {
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
    timestamp: string;
    mediaUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
  };
}

import { toggleLikePost } from "@/lib/actions/chaupalFeedActions";

export default function FeedCard({ post }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);

    try {
      await toggleLikePost(post.id);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert on failure
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  return (
    <article className={`${CH_CLASS.card} p-4 sm:p-5 flex flex-col gap-4 mb-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <UserChip 
          id={post.author.id}
          name={post.author.name}
          username={post.author.username}
          avatarUrl={post.author.avatarUrl}
          isVerified={post.author.isVerified}
          timestamp={post.timestamp}
        />
        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className={`relative w-full aspect-video ${CH_RADIUS.card} overflow-hidden border border-slate-200 dark:border-slate-800`}>
          <Image src={post.mediaUrl} alt="Post media" fill className="object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-slate-500 dark:text-slate-400">
        
        {/* Reply/Comment */}
        <button className={`group flex items-center gap-2 text-sm ${CH_ANIMATIONS.transition} hover:text-blue-500`}>
          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="font-sans">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
        </button>

        {/* Repost */}
        <button className={`group flex items-center gap-2 text-sm ${CH_ANIMATIONS.transition} hover:text-green-500`}>
          <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
            <Repeat2 className="w-5 h-5" />
          </div>
          <span className="font-sans">{post.sharesCount > 0 ? post.sharesCount : ''}</span>
        </button>

        {/* Like */}
        <button 
          onClick={handleLike}
          className={`group flex items-center gap-2 text-sm ${CH_ANIMATIONS.transition} ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
        >
          <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="font-sans">{likesCount > 0 ? likesCount : ''}</span>
        </button>

        {/* Share & Bookmark */}
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-full ${CH_ANIMATIONS.transition} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}>
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-current text-[#F97316]' : ''}`} />
          </button>
          <button className={`p-2 rounded-full ${CH_ANIMATIONS.transition} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}>
            <Share className="w-5 h-5" />
          </button>
        </div>

      </div>
    </article>
  );
}
