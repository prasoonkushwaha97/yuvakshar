"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Smile, FileText, ListTodo, Link as LinkIcon, X } from "lucide-react";
import ChaupalAvatar from "../shared/ChaupalAvatar";
import { CH_CLASS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";

import { createPost } from "@/lib/actions/chaupalFeedActions";

interface PostComposerProps {
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  placeholder?: string;
  onPostCreated?: (post: any) => void;
}

export default function PostComposer({ currentUser, placeholder = "चौपाल पर क्या चल रहा है?", onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // For now, no media upload wired up, just text
      const newPost = await createPost(content);
      
      // We need to shape it like FeedCard expects
      const formattedPost = {
        id: newPost.id,
        content: newPost.content,
        timestamp: newPost.created_at,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.name, // Fallback
          avatarUrl: currentUser.avatarUrl,
        },
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isSaved: false,
      };

      if (onPostCreated) {
        onPostCreated(formattedPost);
      }
      
      setContent("");
      setIsFocused(false);
    } catch (err) {
      console.error("Failed to post:", err);
      alert("पोस्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${CH_CLASS.card} p-4 sm:p-5 mb-6`}>
      <div className="flex gap-4">
        <ChaupalAvatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-lg font-sans text-slate-900 dark:text-white placeholder:text-slate-500 resize-none outline-none min-h-[50px] overflow-hidden"
            rows={isFocused || content.trim() ? 3 : 1}
          />
          
          {(isFocused || content.trim()) && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[#F97316]">
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="तस्वीर जोड़ें">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="पोल बनाएँ">
                  <ListTodo className="w-5 h-5" />
                </button>
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="इमोजी">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition} hidden sm:block`} title="लेख जोड़ें">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!content.trim()}
                className={`${CH_CLASS.buttonPrimary} px-6 ${!content.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                पोस्ट करें
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
