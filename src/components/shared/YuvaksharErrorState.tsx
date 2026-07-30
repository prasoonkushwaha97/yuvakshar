"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, Home, ArrowLeft, AlertCircle } from "lucide-react";

export interface YuvaksharErrorStateProps {
  /** Title text in Hindi or custom title */
  title?: string;
  /** Subtitle description in Hindi */
  description?: string;
  /** Type of error scenario */
  type?: "404" | "500" | "runtime" | "network" | "loading";
  /** Optional reset / retry handler function */
  onRetry?: () => void;
  /** Show back to homepage button */
  showHomeButton?: boolean;
  /** Show go back button */
  showBackButton?: boolean;
  /** Fullscreen viewport height container */
  fullScreen?: boolean;
}

export default function YuvaksharErrorState({
  title,
  description,
  type = "runtime",
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  fullScreen = true,
}: YuvaksharErrorStateProps) {
  // Scenario default strings
  const getScenarioContent = () => {
    switch (type) {
      case "404":
        return {
          code: "404",
          badge: "पृष्ठ नहीं मिला",
          defaultTitle: "यह पृष्ठ मौजूद नहीं है",
          defaultDesc: "आप जिस पृष्ठ की तलाश कर रहे हैं, वह स्थानांतरित कर दिया गया है या हटा दिया गया है।",
        };
      case "500":
        return {
          code: "500",
          badge: "सर्वर त्रुटि",
          defaultTitle: "सर्वर पर कुछ गड़बड़ हुई",
          defaultDesc: "हमारी तकनीकी टीम इस समस्या का समाधान कर रही है। कृपया कुछ समय पश्चात पुनः प्रयास करें।",
        };
      case "network":
        return {
          code: "OFFLINE",
          badge: "नेटवर्क विफलता",
          defaultTitle: "इंटरनेट कनेक्शन की समस्या",
          defaultDesc: "कृपया अपने इंटरनेट कनेक्शन की जांच करें और पुनः प्रयास करें।",
        };
      case "loading":
        return {
          code: "LOAD_ERR",
          badge: "लोडिंग विफलता",
          defaultTitle: "डेटा लोड करने में असमर्थ",
          defaultDesc: "सामग्री लोड करते समय एक समस्या हुई। कृपया पुनः प्रयास करें।",
        };
      case "runtime":
      default:
        return {
          code: "ERROR",
          badge: "त्रुटि",
          defaultTitle: "कुछ गड़बड़ हो गई",
          defaultDesc:
            "जिस पृष्ठ को आप खोलना चाहते हैं उसे अभी प्रदर्शित नहीं किया जा सका। कृपया कुछ समय बाद पुनः प्रयास करें।",
        };
    }
  };

  const scenario = getScenarioContent();
  const displayTitle = title || scenario.defaultTitle;
  const displayDesc = description || scenario.defaultDesc;

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div
      className={`w-full flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-[#0c0f17] text-slate-900 dark:text-slate-100 transition-colors ${
        fullScreen ? "min-h-[85vh]" : "min-h-[450px]"
      }`}
    >
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <Image
            src="/yuvakshar_logo_official.png"
            alt="युवाक्षर"
            width={160}
            height={45}
            className="w-[120px] sm:w-[150px] md:w-[160px] h-auto object-contain drop-shadow-sm dark:brightness-110"
            priority
            unoptimized
          />

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100/80 dark:bg-orange-950/60 text-[#ea580c] border border-orange-200/60 dark:border-orange-900/50 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              {scenario.badge}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 px-2">
          <h1 className="font-serif font-black text-2xl md:text-4xl text-slate-900 dark:text-white tracking-tight leading-snug">
            {displayTitle}
          </h1>
          <p className="font-sans text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {displayDesc}
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>पुनः प्रयास करें</span>
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-sans font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4 text-[#ea580c]" />
              <span>मुखपृष्ठ पर जाएँ</span>
            </Link>
          )}

          {showBackButton && (
            <button
              onClick={handleGoBack}
              type="button"
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-sans font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>पिछले पृष्ठ पर जाएँ</span>
            </button>
          )}
        </div>

        {/* Brand Footer */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-2 opacity-80">
          <Image
            src="/yuvakshar_logo_official.png"
            alt="युवाक्षर"
            width={120}
            height={30}
            className="h-6 w-auto object-contain dark:brightness-110"
          />
        </div>
      </div>
    </div>
  );
}
