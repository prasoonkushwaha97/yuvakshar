"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Smile, X, Loader2, Save, Link as LinkIcon, Hash } from "lucide-react";
import UserIdentity from "@/components/shared/UserIdentity";
import Avatar from "@/components/shared/Avatar";
import { CH_CLASS, CH_ANIMATIONS } from "@/components/chaupal/shared/design";
import { EmojiClickData } from 'emoji-picker-react';
import EmojiDropdown from "@/components/shared/EmojiDropdown";
import MentionAutocomplete from "@/components/shared/MentionAutocomplete";
import { MentionUser } from "@/hooks/useMentionEngine";
import { Modal } from "@/components/ui/Modal";

interface DiscussionComposerProps {
  currentUser: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (content: string, imageFile: File | null) => Promise<void>;
  showDraftButton?: boolean;
  onDraft?: (content: string, imageFile: File | null) => Promise<void>;
  maxLength?: number;
  replyTo?: { name: string } | null;
  onCancelReply?: () => void;
  className?: string;
}

export default function DiscussionComposer({ 
  currentUser, 
  placeholder = "विचार साझा करें...", 
  submitLabel = "पोस्ट करें",
  onSubmit,
  showDraftButton = false,
  onDraft,
  maxLength = 1000,
  replyTo,
  onCancelReply,
  className = ""
}: DiscussionComposerProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Link Dialog State
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<MentionUser[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (imageFile) {
        setIsUploading(true);
      }

      if (isDraft && onDraft) {
        await onDraft(content, imageFile);
      } else {
        await onSubmit(content, imageFile);
      }
      
      setContent("");
      setMentionedUsers([]);
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const onMentionAdded = (user: MentionUser) => {
    setMentionedUsers(prev => {
      if (!prev.find(u => u.id === user.id)) return [...prev, user];
      return prev;
    });
  };
  
  const onEmojiClick = (emojiData: EmojiClickData) => {
    const cursor = textareaRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.slice(0, cursor);
    const textAfterCursor = content.slice(cursor);
    setContent(textBeforeCursor + emojiData.emoji + textAfterCursor);
    
    // Set cursor position back
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursor + emojiData.emoji.length;
        textareaRef.current.selectionEnd = cursor + emojiData.emoji.length;
        textareaRef.current.focus();
      }
    }, 10);
  };

  const insertLink = () => {
    if (!linkUrl) return;
    const linkMd = linkText ? `[${linkText}](${linkUrl}) ` : `${linkUrl} `;
    
    const cursor = textareaRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.slice(0, cursor);
    const textAfterCursor = content.slice(cursor);
    setContent(textBeforeCursor + linkMd + textAfterCursor);
    
    setLinkDialogOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  return (
    <div className={`${className || `${CH_CLASS.card} p-4 sm:p-5 mb-6`} relative overflow-visible flex flex-col`}>
      {replyTo && (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4">
          <span><span className="font-semibold">{replyTo.name}</span> को जवाब दे रहे हैं...</span>
          <button onClick={onCancelReply} className="hover:text-slate-800 dark:hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="flex gap-3 md:gap-4 relative">
        <div className="shrink-0 hidden sm:block pt-1">
          <Avatar url={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="flex-1 flex flex-col pt-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onFocus={() => setIsFocused(true)}
            maxLength={maxLength}
            placeholder={placeholder}
            className="w-full bg-transparent text-lg font-sans text-slate-900 dark:text-white placeholder:text-slate-500 resize-none outline-none min-h-[50px] overflow-hidden"
            rows={isFocused || content.trim() || imagePreview ? 3 : 1}
          />
          
          <MentionAutocomplete 
            textareaRef={textareaRef} 
            content={content} 
            setContent={setContent} 
            onMentionAdded={onMentionAdded} 
          />
          
          {imagePreview && (
            <div className="relative mt-3 w-full max-w-md aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={imagePreview} alt="Preview" className={`object-cover w-full h-full ${isUploading ? 'opacity-50 blur-sm' : ''}`} />
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white font-medium text-sm drop-shadow-md">अपलोड हो रहा है...</span>
                </div>
              )}
              {!isUploading && (
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {(isFocused || content.trim() || imagePreview) && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-[#F97316] relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSubmitting} className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition} disabled:opacity-50`} title="तस्वीर जोड़ें">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => {
                  const cursor = textareaRef.current?.selectionStart || content.length;
                  setContent(content.slice(0, cursor) + '@' + content.slice(cursor));
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }} className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition} font-bold text-lg leading-none`} title="मेंशन">
                  @
                </button>
                <button type="button" onClick={() => {
                  const cursor = textareaRef.current?.selectionStart || content.length;
                  setContent(content.slice(0, cursor) + '#' + content.slice(cursor));
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }} className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="हैशटैग">
                  <Hash className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setLinkDialogOpen(true)} className={`p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition}`} title="लिंक जोड़ें">
                  <LinkIcon className="w-5 h-5" />
                </button>
                <EmojiDropdown onEmojiSelect={onEmojiClick} direction="down" />
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-xs font-medium ${content.length > maxLength * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                  {content.length}/{maxLength}
                </div>
                
                <div className="flex gap-2">
                  {showDraftButton && (
                    <button 
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={(!content.trim() && !imageFile) || isSubmitting || isUploading}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      ड्राफ्ट
                    </button>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={(e) => handleSubmit(e, false)}
                    disabled={(!content.trim() && !imageFile) || isSubmitting || isUploading}
                    className={`${CH_CLASS.buttonPrimary} px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {(isSubmitting || isUploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {submitLabel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link Dialog */}
      <Modal 
        open={linkDialogOpen} 
        onOpenChange={setLinkDialogOpen}
        title="लिंक जोड़ें"
        description="अपने पोस्ट में जोड़ने के लिए URL दर्ज करें।"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">प्रदर्शन पाठ (वैकल्पिक)</label>
            <input 
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="उदा. मेरी वेबसाइट"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
            <input 
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setLinkDialogOpen(false)}
              className="px-5 py-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              रद्द करें
            </button>
            <button 
              onClick={insertLink}
              disabled={!linkUrl}
              className={`${CH_CLASS.buttonPrimary} px-6 disabled:opacity-50`}
            >
              जोड़ें
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
