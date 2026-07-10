"use client";

import React, { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, Mic } from "lucide-react";
import { CH_ANIMATIONS } from "../shared/design";
import { EmojiClickData } from "emoji-picker-react";
import EmojiDropdown from "@/components/shared/EmojiDropdown";

interface ChatInputAreaProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}

export default function ChatInputArea({ onSendMessage, placeholder = "संदेश लिखें..." }: ChatInputAreaProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const cursor = inputRef.current?.selectionStart || message.length;
    const text = message.slice(0, cursor) + emojiData.emoji + message.slice(cursor);
    setMessage(text);
    
    // Set cursor position back
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursor + emojiData.emoji.length;
        inputRef.current.selectionEnd = cursor + emojiData.emoji.length;
        inputRef.current.focus();
      }
    }, 10);
  };

  return (
    <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
        
        <button type="button" className={`p-2.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 ${CH_ANIMATIONS.transition}`}>
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-end min-h-[44px] overflow-hidden border border-transparent focus-within:border-[#F97316] transition-colors relative">
          <EmojiDropdown
            onEmojiSelect={onEmojiClick}
            direction="up"
            buttonClassName={`p-2.5 text-slate-400 hover:text-[#F97316] shrink-0 ${CH_ANIMATIONS.transition}`}
          />
          
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-1 text-[15px] font-sans text-slate-900 dark:text-white placeholder:text-slate-500 max-h-32"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        {message.trim() ? (
          <button 
            type="submit" 
            className={`p-3 rounded-full bg-[#F97316] text-white shadow-md shadow-orange-500/20 hover:bg-[#EA580C] hover:scale-105 active:scale-95 shrink-0 ${CH_ANIMATIONS.transition}`}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        ) : (
          <button 
            type="button"
            className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 ${CH_ANIMATIONS.transition}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}
