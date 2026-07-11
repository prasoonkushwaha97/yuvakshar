"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PenTool, MessageSquare, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { designTokens } from "@/config/designTokens";
import { useCms } from "@/store/CmsContext";

interface CreateBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBottomSheet({ isOpen, onClose }: CreateBottomSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useCms();
  
  const isCommunity = pathname?.startsWith("/community");
  const isAdmin = currentUser?.role === "Founder" || 
                  currentUser?.role === "Admin" || 
                  currentUser?.role === "Editor";

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-[#0F172A] rounded-t-3xl shadow-2xl border-t border-gray-150 dark:border-gray-800 flex flex-col"
            style={{ paddingBottom: Math.max(16, parseInt(designTokens.spacing.safeAreaBottom) || 0) }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-sheet-title"
          >
            {/* Handle/Indicator */}
            <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose} aria-hidden="true">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="px-6 pt-2 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 id="create-sheet-title" className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  क्या प्रकाशित करना चाहते हैं?
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {isCommunity ? (
                  <>
                    <button
                      onClick={() => { onClose(); router.push("/community?compose=true&type=discussion"); }}
                      className="flex items-center w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-[#f97316]/30 dark:border-slate-800/80 dark:hover:border-[#f97316]/30 bg-slate-50 hover:bg-[#f97316]/5 dark:bg-[#1E293B]/50 dark:hover:bg-[#f97316]/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] shadow-sm text-[#f97316] group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white group-hover:text-[#f97316] transition-colors">
                          नई चर्चा
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          अपने विचार या छोटी अपडेट साझा करें
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => { onClose(); router.push("/community?compose=true&type=question"); }}
                      className="flex items-center w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-500/30 dark:border-slate-800/80 dark:hover:border-blue-500/30 bg-slate-50 hover:bg-blue-500/5 dark:bg-[#1E293B]/50 dark:hover:bg-blue-500/10 transition-all duration-300 group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                          प्रश्न पूछें
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          चौपाल समुदाय से कोई सवाल पूछें
                        </p>
                      </div>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/workspace/articles/new"
                    onClick={onClose}
                    className="flex items-center p-4 rounded-2xl border border-slate-100 hover:border-[#f97316]/30 dark:border-slate-800/80 dark:hover:border-[#f97316]/30 bg-slate-50 hover:bg-[#f97316]/5 dark:bg-[#1E293B]/50 dark:hover:bg-[#f97316]/10 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#0F172A] shadow-sm text-[#f97316] group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white group-hover:text-[#f97316] transition-colors">
                        {isAdmin ? "नया लेख" : "नया लेख भेजें"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {isAdmin ? "विस्तृत लेख, रिपोर्ट या कहानी लिखें" : "(एडमिन रिव्यू के लिए भेजें)"}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
