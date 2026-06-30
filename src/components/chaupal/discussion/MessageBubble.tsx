import React from "react";
import { MessageCircle, Smile } from "lucide-react";
import ChaupalAvatar from "../shared/ChaupalAvatar";
import ChaupalBadge from "../shared/ChaupalBadge";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      role?: string;
      isVerified?: boolean;
    };
    timestamp: string;
    replyCount?: number;
    reactions?: Array<{ emoji: string; count: number; active?: boolean }>;
    isOwnMessage?: boolean;
  };
  onReplyClick?: (msgId: string) => void;
}

export default function MessageBubble({ message, onReplyClick }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 px-4 py-2 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${message.isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <ChaupalAvatar name={message.sender.name} size="sm" />
      
      <div className={`flex flex-col max-w-[85%] ${message.isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-baseline gap-2 mb-1 ${message.isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold text-[13px] text-slate-900 dark:text-white font-sans">
            {message.sender.name}
          </span>
          {message.sender.isVerified && <ChaupalBadge type="verified" />}
          {message.sender.role && <ChaupalBadge type="role" label={message.sender.role} />}
          <span className="text-[11px] text-slate-400 font-sans ml-1">
            {message.timestamp}
          </span>
        </div>
        
        <div className={`text-[15px] font-sans text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-wrap ${message.isOwnMessage ? 'bg-[#F97316] text-white rounded-2xl rounded-tr-sm px-4 py-2' : 'bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm'}`}>
          {message.content}
        </div>

        {/* Reactions & Thread Replies */}
        <div className={`flex items-center gap-2 mt-1.5 ${message.isOwnMessage ? 'flex-row-reverse' : ''}`}>
          {message.reactions && message.reactions.map((reaction, i) => (
            <button 
              key={i} 
              className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border ${
                reaction.active 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{reaction.emoji}</span>
              <span className="font-bold">{reaction.count}</span>
            </button>
          ))}
          
          {message.replyCount && message.replyCount > 0 && (
            <button 
              onClick={() => onReplyClick?.(message.id)}
              className="flex items-center gap-1 text-[12px] font-bold text-[#F97316] hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {message.replyCount} {message.replyCount === 1 ? 'Reply' : 'Replies'}
            </button>
          )}

          {/* Quick Actions (visible on hover) */}
          <div className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ${message.isOwnMessage ? 'mr-2' : 'ml-2'}`}>
            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
              <Smile className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onReplyClick?.(message.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
