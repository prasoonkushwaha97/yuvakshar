"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  FileEdit,
  FileText,
  MoreHorizontal
} from "lucide-react";
import GlassCard from "@/components/yuvakshar/GlassCard";
import HoverAuthorCard from "@/components/yuvakshar/HoverAuthorCard";
import { CommunityPost } from "@/lib/communityService";
import { Profile } from "@/store/CmsContext";

interface PostCardProps {
  post: CommunityPost;
  authorProfile?: Profile;
  currentUser: any;
  isBookmarked: boolean;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (post: CommunityPost) => void;
  onPollVote: (postId: string, optionIdx: number) => void;
  onConvert?: (post: CommunityPost) => void;
  renderContentWithHashtags: (text: string) => React.ReactNode;
}

const getPostTypeBadge = (type: string) => {
  switch (type) {
    case "poetry": return { text: "कविता", class: "bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200" };
    case "thought": return { text: "विचार", class: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200" };
    case "article": return { text: "लघु लेख", class: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200" };
    case "poll": return { text: "मतदान", class: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200" };
    case "image": return { text: "चित्र", class: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200" };
    case "pdf": return { text: "दस्तावेज़", class: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200" };
    case "event": return { text: "कार्यक्रम", class: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200" };
    case "challenge": return { text: "साहित्यिक चुनौती", class: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200" };
    case "share": return { text: "साझा किया", class: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200" };
    default: return { text: "चर्चा", class: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200" };
  }
};

export default function PostCard({
  post,
  authorProfile,
  currentUser,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  onPollVote,
  onConvert,
  renderContentWithHashtags
}: PostCardProps) {
  
  const hasVoted = post.poll_votes && currentUser && currentUser.id in post.poll_votes;
  const voteTotal = post.poll_votes ? Object.keys(post.poll_votes).length : 0;
  const badge = getPostTypeBadge(post.post_type);
  const reputation = authorProfile?.reputation_score || 120;

  // Author Data map for Hover Card
  const hoverAuthorData = {
    id: authorProfile?.id || post.user_id,
    slug: authorProfile?.slug,
    name: post.user_name,
    avatar_url: authorProfile?.avatar_url,
    role: post.user_rank || authorProfile?.role || "सदस्य",
    bio: authorProfile?.bio,
    followersCount: (authorProfile as any)?.followers?.length || 42,
    followingCount: (authorProfile as any)?.following?.length || 12,
  };

  // Optimistic UI States for instant feedback
  const [isLikedOpt, setIsLikedOpt] = useState(false); // In a real app, initialize from user's liked posts list
  const [likesCountOpt, setLikesCountOpt] = useState(post.likesCount || 0);

  const handleLikeOpt = () => {
    setIsLikedOpt(!isLikedOpt);
    setLikesCountOpt(prev => isLikedOpt ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  return (
    <GlassCard className="p-4 sm:p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      
      {/* Thread Indication Header (if it's a part of a thread) */}
      {(post as any).thread_part && (
        <div className="flex items-center text-[11px] font-bold text-primary mb-2 font-hindi border-l-2 border-primary pl-2">
          भाग {(post as any).thread_part} • थ्रेड चर्चा
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          
          <HoverAuthorCard author={hoverAuthorData}>
            <Link href={`/community/authors/${authorProfile?.slug || post.user_id}`} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-500 uppercase shrink-0 overflow-hidden hover:opacity-90 block border border-slate-300 dark:border-slate-700">
              {authorProfile?.avatar_url ? (
                <img src={authorProfile.avatar_url} alt={post.user_name} className="w-full h-full object-cover" />
              ) : (
                post.user_name[0]
              )}
            </Link>
          </HoverAuthorCard>
          
          <div>
            <div className="flex items-center space-x-2">
              <HoverAuthorCard author={hoverAuthorData}>
                <Link href={`/community/authors/${authorProfile?.slug || post.user_id}`} className="text-sm font-bold text-slate-850 dark:text-white hover:text-primary font-hindi leading-tight">
                  {post.user_name}
                </Link>
              </HoverAuthorCard>
              
              {post.user_rank && (
                <span className="hidden sm:inline-block text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold font-serif">
                  {post.user_rank}
                </span>
              )}
              
              <span className="text-[10px] text-amber-500 font-bold font-hindi flex items-center" title="Reputation Score">
                ⭐ {reputation}
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="font-mono">{new Date(post.created_at).toLocaleDateString("hi-IN")}</span>
              {post.group_name && (
                <>
                  <span>•</span>
                  <Link href={`/community/groups/${post.group_id}`} className="text-primary hover:underline font-hindi font-semibold">
                    {post.group_name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Post Type Badge */}
          <span className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.class} font-hindi`}>
            {badge.text}
          </span>
          <button className="p-1 text-slate-400 hover:text-primary transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Title */}
      {post.title && (
        <h3 className="font-serif text-[15px] font-bold text-slate-900 dark:text-white font-hindi leading-snug">
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      <p className="text-[13px] sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-hindi whitespace-pre-wrap">
        {renderContentWithHashtags(post.content)}
      </p>

      {/* Render Poll type */}
      {post.post_type === "poll" && post.poll_question && post.poll_options && (
        <div className="p-4 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-white font-serif font-hindi">{post.poll_question}</p>
          <div className="space-y-2">
            {post.poll_options.map((opt, idx) => {
              const optVotes = post.poll_votes 
                ? Object.values(post.poll_votes).filter(v => v === idx).length 
                : 0;
              const percent = voteTotal > 0 ? Math.round((optVotes / voteTotal) * 100) : 0;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPollVote(post.id, idx)}
                  disabled={!!hasVoted}
                  className="w-full relative flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm transition-all overflow-hidden bg-white dark:bg-[#0A0F1D] cursor-pointer disabled:cursor-default"
                >
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-primary/10 dark:bg-primary/20 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                  <span className="relative z-10 font-hindi text-slate-800 dark:text-slate-200 font-medium">{opt}</span>
                  <span className="relative z-10 font-bold font-mono text-xs text-slate-500">
                    {percent}% ({optVotes})
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 font-mono">कुल मत: {voteTotal}</p>
        </div>
      )}

      {/* Render Image attachment */}
      {post.post_type === "image" && post.media_url && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <img src={post.media_url} alt="Post Attachment" className="w-full h-auto max-h-[500px] object-cover" />
        </div>
      )}

      {/* Render PDF attachment */}
      {post.post_type === "pdf" && post.media_url && (
        <div className="flex items-center space-x-3 p-3 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-200/50 text-xs text-red-500 transition-all cursor-pointer">
          <FileText className="w-6 h-6 shrink-0 text-red-500" />
          <div className="min-w-0">
            <span className="block font-bold font-mono truncate">{post.media_url}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-hindi">PDF दस्तावेज़ पठन</span>
          </div>
        </div>
      )}

      {/* Post Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center space-x-6">
          
          {/* Likes */}
          <button
            onClick={handleLikeOpt}
            className={`flex items-center space-x-2 text-sm transition-all cursor-pointer active:scale-90 ${isLikedOpt ? "text-red-500" : "text-slate-500 hover:text-red-500"}`}
          >
            <Heart className={`w-5 h-5 ${isLikedOpt ? "fill-current" : ""}`} strokeWidth={2} />
            <span className="font-mono font-bold text-xs">{likesCountOpt}</span>
          </button>

          {/* Comments Link */}
          <Link
            href={`/community/discussion/thread/${post.id}`}
            className="flex items-center space-x-2 text-sm text-slate-500 hover:text-primary transition-all active:scale-90"
          >
            <MessageSquare className="w-5 h-5" strokeWidth={2} />
            <span className="font-mono font-bold text-xs">{post.commentsCount}</span>
          </Link>

          {/* Bookmark Toggle */}
          <button 
            onClick={() => onBookmark(post.id)}
            className={`transition-all cursor-pointer active:scale-90 ${isBookmarked ? "text-primary" : "text-slate-500 hover:text-primary"}`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} strokeWidth={2} />
          </button>

          {/* Share Trigger */}
          <button 
            onClick={() => onShare(post)}
            className="text-slate-500 hover:text-primary transition-all cursor-pointer active:scale-90"
          >
            <Share2 className="w-5 h-5" strokeWidth={2} />
          </button>

        </div>

        {/* Convert to Article Draft (Admin/Editor/Author role check) */}
        {onConvert && currentUser && ["Admin", "Owner", "Editor", "Author", "Contributor"].includes(currentUser.role || "") && (
          <button
            onClick={() => onConvert(post)}
            className="hidden sm:flex items-center space-x-1.5 text-[11px] text-primary hover:bg-primary/10 px-2 py-1.5 rounded-lg transition-colors font-bold cursor-pointer font-hindi"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>लेख में बदलें</span>
          </button>
        )}

      </div>

    </GlassCard>
  );
}
