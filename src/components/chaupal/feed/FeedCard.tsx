import UserIdentity from "@/components/shared/UserIdentity";
import AuthorLink from "@/components/shared/AuthorLink";
import React, { useState } from "react";
import { useCms } from "@/store/CmsContext";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Bookmark, Share, Globe, Users, Trash2, Edit3, ShieldAlert, EyeOff, Pin, Lock } from "lucide-react";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";
import { toggleLikePost, deletePost, toggleBookmarkPost, reportPost, pinPost, lockPost, hidePost } from "@/lib/actions/chaupalFeedActions";
import Avatar from "@/components/shared/Avatar";


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
      publicIdentity?: string;
      role?: string;
    };
    timestamp: string;
    mediaUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
    visibility?: "public" | "group";
    groupName?: string;
    isPinned?: boolean;
    isLocked?: boolean;
  };
  onDelete?: (id: string) => void;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "अभी";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} मिनट पहले`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} घंटे पहले`;
  if (diffInSeconds < 172800) return "कल";
  return `${Math.floor(diffInSeconds / 86400)} दिन पहले`;
}

const VerifiedBadge = () => (
  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const RichText = ({ content }: { content: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;
  const mentionRegex = /@(\w+)/g;
  
  // Basic tokenization
  const tokens = content.split(/(\s+)/);
  
  return (
    <>
      {tokens.map((token, i) => {
        if (token.match(urlRegex)) {
          return <a key={i} href={token} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{token}</a>;
        } else if (token.match(hashtagRegex)) {
          return <Link key={i} href={`/community/search?q=${encodeURIComponent(token)}`} className="text-[#f97316] hover:underline">{token}</Link>;
        } else if (token.match(mentionRegex)) {
          const username = token.substring(1);
          return <AuthorLink key={i} author={{ username }} className="text-[#f97316] hover:underline font-medium">{token}</AuthorLink>;
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
};

export default function FeedCard({ post, onDelete }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isPinned, setIsPinned] = useState(post.isPinned);
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { currentUser } = useCms();
  const isOwner = currentUser?.id === post.author.id;
  const isAdmin = currentUser?.role === 'Founder' || currentUser?.role === 'Admin';

  if (isHidden) return null;

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    try {
      await toggleLikePost(post.id);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleBookmark = async () => {
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    try {
      await toggleBookmarkPost(post.id);
    } catch (err) {
      setIsSaved(prevSaved);
    }
  };

  const handleDelete = async () => {
    if (confirm("क्या आप वाकई इस चर्चा को हटाना चाहते हैं?")) {
      try {
        await deletePost(post.id);
        if (onDelete) onDelete(post.id);
      } catch (err) {
        alert("Delete failed");
      }
    }
    setMenuOpen(false);
  };

  const handleReport = async () => {
    try {
      await reportPost(post.id, "Inappropriate content");
      alert("रिपोर्ट दर्ज कर ली गई है।");
    } catch (err) {
      alert("Report failed");
    }
    setMenuOpen(false);
  };

  const handlePin = async () => {
    try {
      await pinPost(post.id, !isPinned);
      setIsPinned(!isPinned);
    } catch (err) {
      alert("Pin action failed");
    }
    setMenuOpen(false);
  };

  const handleHide = async () => {
    setIsHidden(true);
    setMenuOpen(false);
  };

  const identity = post.author.publicIdentity || post.author.role || "सदस्य";
  const visibilityIcon = post.visibility === "group" ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />;
  const visibilityText = post.visibility === "group" ? "केवल समूह" : "सार्वजनिक";

  return (
    <article className="bg-white dark:bg-[#0F172A] p-4 sm:p-5 flex flex-col gap-4 rounded-none sm:rounded-2xl border-x-0 sm:border-x border-y sm:border-y-0 sm:border border-slate-100 dark:border-slate-800 shadow-none sm:shadow-sm sm:shadow-slate-200/20 dark:shadow-none mb-2 sm:mb-4 w-full">
      {isPinned && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-[-8px]">
          <Pin className="w-3 h-3 fill-current" />
          पिन की गई चर्चा
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Identity Block */}
        <div className="flex items-center gap-3 w-full">
          {/* Avatar */}
          <AuthorLink author={post.author as any} className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity">
            <Avatar url={post.author.avatarUrl} name={post.author.name} className="w-full h-full" />
          </AuthorLink>
          
          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Name & Username */}
            <div className="flex items-center flex-wrap gap-x-1.5">
              <AuthorLink author={post.author as any} className="font-sans font-bold text-[15.5px] sm:text-base text-slate-900 dark:text-white hover:text-[#f97316] transition-colors leading-tight truncate">
                {post.author.name}
              </AuthorLink>
              {post.author.isVerified && <VerifiedBadge />}
              <span className="text-slate-500 dark:text-slate-400 text-[13px] leading-tight truncate">
                @{post.author.username}
              </span>
            </div>
            
            {/* Public Identity */}
            <span className="text-slate-600 dark:text-slate-300 text-[13px] leading-snug mt-0.5 truncate w-full">
              {identity}
            </span>
            
            {/* Timestamp & Visibility */}
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11.5px] mt-0.5">
              <span>{formatRelativeTime(post.timestamp)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {visibilityIcon}
                {visibilityText}
              </span>
              {post.groupName && (
                <>
                  <span>•</span>
                  <span className="font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{post.groupName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Options */}
        <div className="relative shrink-0 ml-2">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-10 overflow-hidden">
              <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                लिंक कॉपी करें
              </button>
              <button onClick={handleBookmark} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {isSaved ? "सुरक्षित से हटाएं" : "सुरक्षित करें (Save)"}
              </button>
              <button onClick={handleHide} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                छिपाएं (Hide)
              </button>
              
              {(isOwner || isAdmin) && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                    हटाएं (Delete)
                  </button>
                </>
              )}
              
              {isAdmin && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button onClick={handlePin} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {isPinned ? "पिन हटाएं" : "पिन करें"}
                  </button>
                </>
              )}
              
              {!isOwner && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                  <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    रिपोर्ट करें (Report)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap">
        <RichText content={post.content} />
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
          <button onClick={handleBookmark} className={`p-2 rounded-full ${CH_ANIMATIONS.transition} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-[#F97316]' : ''}`} />
          </button>
          <button className={`p-2 rounded-full ${CH_ANIMATIONS.transition} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}>
            <Share className="w-5 h-5" />
          </button>
        </div>

      </div>
    </article>
  );
}
