"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useLanguage } from "@/store/LanguageContext";
import { useCms } from "@/store/CmsContext";
import { primaryLinks, profileActions } from "@/config/navigation.config";
import { getCanonicalProfileUrl } from "@/utils/username";
import { designTokens } from "@/config/designTokens";

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "navigation" | "profile";
  onLogout?: () => void;
}

export default function AppDrawer({ isOpen, onClose, mode, onLogout }: AppDrawerProps) {
  const { locale } = useLanguage();
  const { currentUser } = useCms();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap & Escape close listeners
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer content frame */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-[320px] h-full bg-[#FDFCF7] dark:bg-[#0B0F19] border-l border-gray-150 dark:border-gray-850 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300"
        style={{ transition: designTokens.animations.transitionDefault }}
      >
        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-2 scrollbar-none">
          {/* Header row */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850 mb-6">
            {mode === "navigation" ? (
              <Link href="/" onClick={onClose} className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 cursor-pointer">
                <Image
                  src="/yuvakshar_logo_official.png"
                  alt="युवाक्षर"
                  width={120}
                  height={30}
                  className="h-[32px] w-auto object-contain"
                  priority
                />
              </Link>
            ) : (
              <h3 className="font-serif font-black text-sm uppercase tracking-wider text-gray-500">
                {locale === "hi" ? "यूज़र अकाउंट" : "User Account"}
              </h3>
            )}
            <button 
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-650"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account info inside Profile Drawer */}
          {mode === "profile" && currentUser && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-xl mb-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-150">{currentUser.name || currentUser.email}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{currentUser.email}</p>
            </div>
          )}

          {/* Links feed */}
          <nav className="space-y-5">
            {mode === "navigation" ? (
              primaryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center space-x-3.5 px-4 py-3 rounded-lg hover:bg-[#f97316]/10 text-gray-700 hover:text-[#f97316] dark:text-gray-300 dark:hover:text-[#f97316] text-sm font-bold font-sans transition-all duration-200 min-h-[44px]"
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={2.2} />
                    <span>{locale === "hi" ? link.labelHi : link.labelEn}</span>
                  </Link>
                );
              })
            ) : (
              profileActions.map((action) => {
                const Icon = action.icon;
                if (action.href === "#logout") {
                  return (
                    <button
                      key={action.href}
                      onClick={() => { onClose(); onLogout?.(); }}
                      className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-300 text-sm font-bold font-sans transition-all duration-200 min-h-[44px] text-left cursor-pointer"
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={2.2} />
                      <span>{locale === "hi" ? action.labelHi : action.labelEn}</span>
                    </button>
                  );
                }
                let finalHref = action.href;
                if (action.href === "/u") {
                  if (currentUser) {
                    finalHref = getCanonicalProfileUrl(currentUser) ?? `/u/${currentUser.id}`;
                  } else {
                    finalHref = "/u";
                  }
                }
                
                return (
                  <Link 
                    key={action.href}
                    href={finalHref}
                    onClick={onClose}
                    className="flex items-center space-x-3.5 px-4 py-3 rounded-lg hover:bg-[#f97316]/10 text-gray-700 hover:text-[#f97316] dark:text-gray-300 dark:hover:text-[#f97316] text-sm font-bold font-sans transition-all duration-200 min-h-[44px]"
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={2.2} />
                    <span>{locale === "hi" ? action.labelHi : action.labelEn}</span>
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        {/* Footer info branding block - fixed at bottom */}
        <div className="pt-4 border-t border-gray-150 dark:border-gray-850 mt-4 text-center shrink-0">
          <p className="text-[10px] text-gray-400 font-sans tracking-widest uppercase">
            © 2026 युवाक्षर
          </p>
        </div>
      </div>
    </div>
  );
}
