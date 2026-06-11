"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Sparkles, ArrowRight, Crown, Gem, LogIn } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "./GlassCard";

interface PaywallGateProps {
  accessLevel?: "Free" | "Premium" | "Patron";
  children: React.ReactNode;
}

export default function PaywallGate({ accessLevel = "Free", children }: PaywallGateProps) {
  const router = useRouter();
  const { currentUser, openAuthModal } = useCms();

  // 1. Free articles are accessible to all
  if (accessLevel === "Free") {
    return <>{children}</>;
  }

  // 2. Editorial team bypasses all gates
  const editorialRoles = [
    "Owner",
    "Admin",
    "Editor-in-Chief",
    "Managing Editor",
    "Editor",
    "Fact Check Reviewer",
    "Author",
    "Contributor"
  ];
  if (currentUser && editorialRoles.includes(currentUser.role || "")) {
    return (
      <div className="relative">
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg mb-4 flex items-center gap-1.5 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>संपादकीय बोर्ड बाईपास: आप इस लेख को भूमिका <strong>{currentUser.role}</strong> के कारण पढ़ पा रहे हैं।</span>
        </div>
        {children}
      </div>
    );
  }

  const userMembership = currentUser?.membership || "Free";

  // 3. Check access
  const hasAccess = 
    (accessLevel === "Premium" && (userMembership === "Premium" || userMembership === "Patron")) ||
    (accessLevel === "Patron" && userMembership === "Patron");

  if (hasAccess) {
    return <>{children}</>;
  }

  // 4. Render Lock Screen
  const isPremiumLocked = accessLevel === "Premium";
  const isPatronLocked = accessLevel === "Patron";

  const handleLoginClick = () => {
    openAuthModal(
      undefined,
      isPremiumLocked 
        ? "कृपया प्रीमियम लेख पढ़ने के लिए अपने युवाक्षर खाते में प्रवेश करें।" 
        : "कृपया संरक्षक-विशिष्ट लेख पढ़ने के लिए अपने युवाक्षर खाते में प्रवेश करें।"
    );
  };

  const handleSubscribeClick = () => {
    router.push("/membership");
  };

  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-border">
      {/* Blurred background preview of the content */}
      <div className="absolute inset-0 select-none pointer-events-none filter blur-[12px] opacity-15 overflow-hidden">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-400 rounded w-3/4"></div>
          <div className="h-4 bg-slate-400 rounded w-full"></div>
          <div className="h-4 bg-slate-400 rounded w-5/6"></div>
          <div className="h-4 bg-slate-400 rounded w-full"></div>
          <div className="h-4 bg-slate-400 rounded w-2/3"></div>
          <div className="h-6 bg-slate-400 rounded w-1/2 pt-6"></div>
          <div className="h-4 bg-slate-400 rounded w-full"></div>
          <div className="h-4 bg-slate-400 rounded w-full"></div>
        </div>
      </div>

      {/* Lock Overlay */}
      <div className="relative z-10 bg-slate-950/80 dark:bg-[#060913]/90 backdrop-blur-[2px] p-6 md:p-10 text-center flex flex-col items-center justify-center min-h-[450px]">
        {isPremiumLocked ? (
          // Premium Lock Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 animate-pulse">
              <Crown className="w-8 h-8" />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
              युवाक्षर प्रीमियम लेख
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto mb-6">
              यह लेख केवल युवाक्षर प्रीमियम सदस्यों के लिए उपलब्ध है। साहित्य, संस्कृति और गंभीर पत्रकारिता के सर्वोत्तम रूप का अनुभव करें।
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8 bg-white/5 border border-white/10 p-4 rounded-xl">
              {[
                "सभी प्रीमियम लेखों तक असीमित पहुंच",
                "विशिष्ट डिजिटल मासिक पत्रिका",
                "लेखकों से सीधा बौद्धिक संवाद",
                "विज्ञापन-मुक्त शांत पठन अनुभव",
                "विशेष ऑडियो पॉडकास्ट और विश्लेषण",
                "अध्ययन नोट्स और स्वाध्याय उपकरण"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!currentUser ? (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center justify-center space-x-2 bg-white text-slate-950 hover:bg-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-all w-full sm:w-auto cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>लॉगिन करें</span>
                  </button>
                  <button
                    onClick={handleSubscribeClick}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all w-full sm:w-auto shadow-lg shadow-orange-500/10 cursor-pointer"
                  >
                    <span>प्रीमियम सदस्य बनें (₹49 से शुरू)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubscribeClick}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium text-base transition-all w-full sm:w-auto shadow-lg shadow-orange-500/15 cursor-pointer animate-bounce"
                >
                  <span>प्रीमियम में अपग्रेड करें (₹49 से शुरू)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          // Patron Lock Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="inline-flex p-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-4 animate-pulse">
              <Gem className="w-8 h-8" />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
              युवाक्षर संरक्षक (Patron) विशिष्ट लेख
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto mb-6">
              यह लेख युवाक्षर संरक्षक सदस्यों के लिए विशिष्ट बौद्धिक सामग्री का हिस्सा है। एक संरक्षक के रूप में, आप स्वतंत्र हिंदी पत्रकारिता की रीढ़ हैं।
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto mb-8 bg-white/5 border border-white/10 p-4 rounded-xl">
              {[
                "प्रीमियम की सभी सुविधाएं",
                "त्रैमासिक मुद्रित पत्रिका आपके घर पर",
                "लेखक कार्यशालाएं और वेबिनार पहुंच",
                "संपादकीय बोर्ड चर्चा में भागीदारी",
                "प्रोफ़ाइल पर विशिष्ट संरक्षक बैज",
                "मुद्रित संस्करण में नाम का उल्लेख"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!currentUser ? (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center justify-center space-x-2 bg-white text-slate-950 hover:bg-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-all w-full sm:w-auto cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>लॉगिन करें</span>
                  </button>
                  <button
                    onClick={handleSubscribeClick}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all w-full sm:w-auto shadow-lg shadow-rose-500/10 cursor-pointer"
                  >
                    <span>संरक्षक बनें (₹199/माह)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubscribeClick}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-medium text-base transition-all w-full sm:w-auto shadow-lg shadow-rose-500/15 cursor-pointer"
                >
                  <span>संरक्षक (Patron) में अपग्रेड करें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
