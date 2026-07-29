"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Smile, X } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
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
  buttonClassName,
}: EmojiDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    transformOrigin?: string;
  }>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current || isMobile) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const pickerHeight = 400;
    const pickerWidth = 320;

    let pos: { top?: number; bottom?: number; left?: number; right?: number; transformOrigin?: string } = {};

    // Determine vertical direction (up vs down)
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let showAbove = direction === "up";
    if (direction === "down" && spaceBelow < pickerHeight + 20 && spaceAbove > spaceBelow) {
      showAbove = true;
    } else if (direction === "up" && spaceAbove < pickerHeight + 20 && spaceBelow > spaceAbove) {
      showAbove = false;
    }

    if (showAbove) {
      pos.bottom = viewportHeight - rect.top + 8;
      pos.transformOrigin = "bottom left";
    } else {
      pos.top = rect.bottom + 8;
      pos.transformOrigin = "top left";
    }

    // Determine horizontal alignment (left vs right)
    if (rect.left + pickerWidth > viewportWidth - 16) {
      pos.right = viewportWidth - rect.right;
      pos.left = undefined;
      pos.transformOrigin = showAbove ? "bottom right" : "top right";
    } else {
      pos.left = Math.max(16, rect.left);
      pos.right = undefined;
    }

    setPickerPosition(pos);
  };

  useLayoutEffect(() => {
    if (isOpen && !isMobile) {
      updatePosition();
    }
  }, [isOpen, direction, isMobile]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen && !isMobile) {
        updatePosition();
      }
    };

    // Lock body scroll on mobile bottom sheet
    if (isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, isMobile]);

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEmojiClick = (emojiData: EmojiClickData, e: MouseEvent) => {
    onEmojiSelect(emojiData);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const defaultButtonClass = `p-2 rounded-full hover:bg-orange-500/10 ${CH_ANIMATIONS.transition} ${
    isOpen ? "bg-orange-500/10 text-[#F97316]" : "text-slate-400 hover:text-[#F97316]"
  }`;
  const finalButtonClass = buttonClassName !== undefined ? buttonClassName : defaultButtonClass;

  const renderPickerContent = () => {
    if (!isOpen) return null;

    if (isMobile) {
      return (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={pickerRef}
            className="relative z-10 w-full bg-white dark:bg-[#0F172A] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-250 max-h-[75vh]"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
              <span className="text-sm font-bold font-hindi text-slate-800 dark:text-slate-200">
                इमोजी चुनें
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="बंद करें"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Picker Container */}
            <div className="w-full flex-1 overflow-y-auto flex justify-center p-2">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.AUTO}
                searchPlaceHolder="इमोजी खोजें..."
                width="100%"
                height={350}
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Desktop Overlay
    return (
      <div
        ref={pickerRef}
        className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-150"
        style={{
          top: pickerPosition.top !== undefined ? `${pickerPosition.top}px` : undefined,
          bottom: pickerPosition.bottom !== undefined ? `${pickerPosition.bottom}px` : undefined,
          left: pickerPosition.left !== undefined ? `${pickerPosition.left}px` : undefined,
          right: pickerPosition.right !== undefined ? `${pickerPosition.right}px` : undefined,
          transformOrigin: pickerPosition.transformOrigin || "top left",
        }}
      >
        <div className="relative shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0F172A]">
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
    );
  };

  return (
    <div className={`inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        className={finalButtonClass}
        title="इमोजी"
        aria-label="इमोजी"
      >
        <Smile className="w-5 h-5" />
      </button>

      {mounted && isOpen && createPortal(renderPickerContent(), document.body)}
    </div>
  );
}
