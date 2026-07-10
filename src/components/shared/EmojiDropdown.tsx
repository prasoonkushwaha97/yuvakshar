"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { CH_ANIMATIONS } from "@/components/chaupal/shared/design";

interface EmojiDropdownProps {
  onEmojiSelect: (emojiData: EmojiClickData) => void;
  direction?: "up" | "down";
  className?: string;
  buttonClassName?: string;
}

export default function EmojiDropdown({ 
  onEmojiSelect, 
  direction = "down",
  className = "",
  buttonClassName
}: EmojiDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [actualDirection, setActualDirection] = useState(direction);
  const [pickerStyles, setPickerStyles] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect touch devices to disable hover logic
    if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
    }
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let newDir = direction;
      // Auto flip if there is not enough space below/above
      if (direction === 'down' && viewportHeight - rect.bottom < 420 && rect.top > 420) {
        newDir = 'up';
      } else if (direction === 'up' && rect.top < 420 && viewportHeight - rect.bottom > 420) {
        newDir = 'down';
      }
      setActualDirection(newDir);
      
      // Horizontal overflow prevention
      if (pickerRef.current) {
        const pickerRect = pickerRef.current.getBoundingClientRect();
        const styles: React.CSSProperties = {};
        
        // If overflowing right
        if (rect.left + 320 > viewportWidth) {
          styles.right = 0;
          styles.left = 'auto';
          styles.transformOrigin = newDir === 'up' ? 'bottom right' : 'top right';
        } else {
          styles.left = 0;
          styles.right = 'auto';
          styles.transformOrigin = newDir === 'up' ? 'bottom left' : 'top left';
        }
        setPickerStyles(styles);
      }
    }
  }, [isOpen, direction]);

  const handleMouseEnter = () => {
    if (isTouchDevice || isPinned) return;
    
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || isPinned) return;
    
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    if (isTouchDevice) {
      setIsOpen(!isOpen);
      setIsPinned(!isOpen);
    } else {
      // Desktop: clicking toggles the pin state
      if (isOpen && !isPinned) {
        setIsPinned(true);
      } else if (isOpen && isPinned) {
        setIsOpen(false);
        setIsPinned(false);
      } else {
        setIsOpen(true);
        setIsPinned(true);
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData, e: MouseEvent) => {
    onEmojiSelect(emojiData);
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  const positionClass = actualDirection === "up" ? "bottom-full pb-2" : "top-full pt-2";
  
  const defaultButtonClass = `p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition} ${isOpen || isPinned ? 'bg-orange-500/10 text-[#F97316]' : 'text-slate-400 hover:text-[#F97316]'}`;
  const finalButtonClass = buttonClassName !== undefined ? buttonClassName : defaultButtonClass;

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        type="button" 
        onClick={handleClick} 
        className={finalButtonClass} 
        title="इमोजी"
      >
        <Smile className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div 
          ref={pickerRef}
          className={`absolute ${positionClass} z-[60] animate-in fade-in zoom-in-95 duration-200`}
          style={pickerStyles}
        >
          <div className="relative shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0F172A]">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              theme={Theme.AUTO} 
              searchPlaceHolder="इमोजी खोजें..." 
              width={320} 
              height={400} 
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
