"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Smile, FileText, ListTodo, X, Loader2, Save } from "lucide-react";
import UserIdentity from "@/components/shared/UserIdentity";
import { CH_CLASS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";
import { createPost } from "@/lib/actions/chaupalFeedActions";
import { supabase } from "@/lib/supabaseClient";

interface PostComposerProps {
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  placeholder?: string;
  onPostCreated?: (post: any) => void;
  groupId?: string;
}

export default function PostComposer({ currentUser, placeholder = "चौपाल पर क्या चल रहा है?", onPostCreated, groupId }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsFocused(true);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chaupal-media')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('chaupal-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let mediaUrl = undefined;
      
      if (imageFile) {
        setIsUploading(true);
        mediaUrl = await uploadImage(imageFile);
        setIsUploading(false);
      }

      const newPost = await createPost({
        content,
        mediaUrl,
        isDraft,
        groupId: groupId || null
      });
      
      const formattedPost = {
        id: newPost.id,
        content: newPost.content,
        timestamp: newPost.created_at,
        mediaUrl: newPost.media_url,
        isPinned: newPost.is_pinned,
        isLocked: newPost.is_locked,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.name, 
          avatarUrl: currentUser.avatarUrl,
        },
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isSaved: false,
      };

      if (onPostCreated && !isDraft) {
        onPostCreated(formattedPost);
      }
      
      if (isDraft) {
        alert("ड्राफ्ट सुरक्षित कर लिया गया है।");
      }
      
      setContent("");
      removeImage();
      setIsFocused(false);
    } catch (err) {
      console.error("Failed to post:", err);
      alert("पोस्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className={`${CH_CLASS.card} p-4 sm:p-5 mb-6`}>
      <div className="flex gap-4">
        <UserIdentity user={{ name: currentUser.name, avatar_url: currentUser.avatarUrl }} variant="inline" avatarSize={40} showUsername={false} clickable={false} />
        <div className="flex-1 flex flex-col pt-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-lg font-sans text-slate-900 dark:text-white placeholder:text-slate-500 resize-none outline-none min-h-[50px] overflow-hidden"
            rows={isFocused || content.trim() || imagePreview ? 3 : 1}
          />
          
          {imagePreview && (
            <div className="relative mt-3 w-full max-w-md aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
              <button 
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {(isFocused || content.trim() || imagePreview) && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[#F97316]">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="तस्वीर जोड़ें">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="पोल बनाएँ">
                  <ListTodo className="w-5 h-5" />
                </button>
                <button type="button" className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="इमोजी">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={(!content.trim() && !imageFile) || isSubmitting}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  ड्राफ्ट
                </button>
                
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={(!content.trim() && !imageFile) || isSubmitting}
                  className={`${CH_CLASS.buttonPrimary} px-6 ${(!content.trim() && !imageFile) ? 'opacity-50 cursor-not-allowed' : ''} flex items-center gap-2`}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  पोस्ट करें
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
