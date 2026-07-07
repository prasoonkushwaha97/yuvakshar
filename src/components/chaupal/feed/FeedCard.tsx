import UserIdentity from "@/components/shared/UserIdentity";
import React, { useState } from "react";
import { useCms } from "@/store/CmsContext";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Bookmark, Share } from "lucide-react";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useCms();
  const isOwner = currentUser?.id === post.author.id;

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
        <UserIdentity user={post.author as any} variant="chip" />
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-10 overflow-hidden">
              {isOwner ? (
                <>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                    संपादित करें (Edit)
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                    हटाएं (Delete)
                  </button>
                </>
              ) : (
                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                  रिपोर्ट करें (Report)
                </button>
              )}
            </div>
          )}
        </div>
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
