"use client";

import React, { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";

export default function Newsletter() {
  const { locale } = useLanguage();
  const { subscribeNewsletter, currentUser, openAuthModal } = useCms();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(undefined, "न्यूज़लेटर सदस्यता के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    if (!email.trim()) return;
    const res = await subscribeNewsletter(email);
    setMsg(res);
    setEmail("");
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div className="w-full py-4">
      <div className="bg-[#111] dark:bg-[#1A1A1A] text-white p-8 rounded-lg relative overflow-hidden shadow-lg border border-gray-850 group">
        {/* Absolute Mail icon decor */}
        <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-105 transition-transform duration-700 pointer-events-none">
          <Mail className="w-56 h-56" />
        </div>

        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-sm text-[9px] font-sans font-bold uppercase tracking-widest inline-block">
            {locale === "hi" ? "न्यूज़लेटर" : "Newsletter"}
          </span>
          <h3 className="text-2xl md:text-3xl font-black font-serif text-white">
            {locale === "hi" ? "बौद्धिक संवाद से जुड़ें" : "Connect with Intellectual Dialogues"}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm font-serif leading-relaxed">
            {locale === "hi"
              ? "राष्ट्र निर्माण, विचार मंथन और साहित्यिक परिचर्चा के नए संस्करणों की जानकारी सीधे अपने इनबॉक्स में पाएं।"
              : "Receive updates on nation building, thought sharing, and new literary issues directly in your inbox."
            }
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md">
            <input
              type="email"
              placeholder={locale === "hi" ? "अपना ईमेल पता दर्ज करें" : "Enter your email address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-2.5 text-sm text-[#111] bg-white rounded focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              required
            />
            <button
              type="submit"
              className="bg-[#f97316] hover:bg-[#EA580C] text-white px-6 py-2.5 font-bold uppercase font-sans tracking-widest text-[10px] rounded transition-colors shadow flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{locale === "hi" ? "सब्स्क्राइब करें" : "Subscribe"}</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
          {msg && <p className="text-xs text-[#f97316] font-bold mt-1.5 animate-pulse">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
