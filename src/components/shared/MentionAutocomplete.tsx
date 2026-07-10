"use client";

import React, { useEffect, useRef } from 'react';
import { useMentionEngine, MentionUser } from '@/hooks/useMentionEngine';
import UserIdentity from '@/components/shared/UserIdentity';
import { Loader2, Hash } from 'lucide-react';

interface MentionAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onMentionAdded?: (user: MentionUser) => void;
}

export default function MentionAutocomplete({ 
  textareaRef, 
  content, 
  setContent,
  onMentionAdded 
}: MentionAutocompleteProps) {
  const engine = useMentionEngine();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Attach event listeners to the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      engine.handleInput(textarea);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.type === 'none') return;

      const listLength = engine.type === 'mention' ? engine.users.length : engine.hashtags.length;
      if (listLength === 0 && !engine.isLoading) {
        if (e.key === 'Escape') {
          engine.closeAutocomplete();
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        engine.setSelectedIndex((prev) => (prev + 1) % listLength);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        engine.setSelectedIndex((prev) => (prev - 1 + listLength) % listLength);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSelection(engine.selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        engine.closeAutocomplete();
      }
    };

    // Use native event listeners to ensure they run before React synthetic events
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('click', handleInput);
    textarea.addEventListener('keyup', handleInput); // to catch arrow key cursor movements

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('click', handleInput);
      textarea.removeEventListener('keyup', handleInput);
    };
  }, [engine, content, setContent]);

  const insertSelection = (index: number) => {
    let replacement = '';
    
    if (engine.type === 'mention' && engine.users[index]) {
      const user = engine.users[index];
      replacement = `@${user.username} `;
      if (onMentionAdded) onMentionAdded(user);
    } else if (engine.type === 'hashtag' && engine.hashtags[index]) {
      replacement = `#${engine.hashtags[index]} `;
    }

    if (!replacement) return;

    const before = content.slice(0, engine.cursorIndex);
    const textAfterCursorStart = content.slice(engine.cursorIndex);
    const endOfWordMatch = textAfterCursorStart.match(/\s/);
    const endOfWordIndex = endOfWordMatch ? endOfWordMatch.index : textAfterCursorStart.length;
    
    const after = textAfterCursorStart.slice(endOfWordIndex!);
    
    setContent(before + replacement + after);
    engine.closeAutocomplete();

    // Refocus and set cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = before.length + replacement.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current && 
        !textareaRef.current.contains(event.target as Node)
      ) {
        engine.closeAutocomplete();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [engine]);

  if (engine.type === 'none' || !engine.coords) return null;

  // Calculate dynamic top/left based on textarea's offset parent
  const dropdownStyle: React.CSSProperties = {
    top: `${engine.coords.top + 24}px`, // slightly below the cursor
    left: `${Math.min(engine.coords.left, 200)}px`, // prevent it from going off-screen to the right
  };

  return (
    <div 
      ref={dropdownRef}
      style={dropdownStyle}
      className="absolute z-[100] w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="py-2 max-h-64 overflow-y-auto">
        <div className="px-3 pb-2 pt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {engine.type === 'mention' ? 'लोग खोजें' : 'हैशटैग खोजें'}
        </div>

        {engine.isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mb-2" />
            <span className="text-xs font-medium">खोजा जा रहा है...</span>
          </div>
        ) : engine.type === 'mention' ? (
          engine.users.length > 0 ? (
            engine.users.map((u, i) => (
              <button
                key={u.id}
                onClick={() => insertSelection(i)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 transition-colors ${
                  i === engine.selectedIndex ? 'bg-orange-50 dark:bg-orange-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <UserIdentity 
                  user={{ name: u.name, username: u.username, avatar_url: u.avatar_url, verified: u.is_verified, role: u.role as any }} 
                  variant="inline" 
                  avatarSize={28} 
                  clickable={false} 
                />
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              कोई उपयोगकर्ता नहीं मिला
            </div>
          )
        ) : engine.type === 'hashtag' ? (
          engine.hashtags.map((h, i) => (
            <button
              key={h}
              onClick={() => insertSelection(i)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors ${
                i === engine.selectedIndex ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{h}</span>
            </button>
          ))
        ) : null}
      </div>
    </div>
  );
}
