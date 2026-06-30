"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { useCms } from "@/store/CmsContext";

export default function Footer() {
  const pathname = usePathname();
  const { settings, subscribeNewsletter, currentUser, openAuthModal } = useCms();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  React.useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/admin") || pathname.startsWith("/admin") || pathname.startsWith("/workspace"))) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal(undefined, "न्यूज़लेटर सदस्यता के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    if (!email.trim()) return;
    const res = await subscribeNewsletter(email);
    setMsg(res);
    // Do not clear the email if logged in to maintain autofill, or clear it.
    setEmail("");
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <footer className="w-full bg-[#FAF8F3] dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-300 border-t border-[#E7E2D8] dark:border-slate-800 py-3 lg:py-4 mt-4 lg:mt-6 text-[11px] relative z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Area: Brand & Tagline */}
        <div className="md:col-span-3 space-y-1.5 md:space-y-2">
          <div className="flex items-center">
            <img 
              src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
              alt="युवाक्षर लोगो" 
              className="h-[36px] w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png";
              }}
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
            {settings.general.tagline} — लेखन, चिंतन और परिवर्तन।
          </p>
        </div>

        {/* Link Columns: Side-by-side on mobile, separate on desktop */}
        <div className="grid grid-cols-2 gap-4 md:contents md:col-span-6">
          {/* Column 2: हमारे बारे में & नीतियां */}
          <div className="space-y-1.5 md:col-span-3">
            <h4 className="font-serif text-[11px] md:text-xs font-bold text-[#1E1E1E] dark:text-white border-l-2 border-[#EA580C] pl-2 uppercase tracking-wider">
              हमारे बारे में व नीतियां
            </h4>
            <div className="flex flex-col space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Link href="/about" className="hover:text-primary transition-colors">हमारे बारे में</Link>
              <Link href="/editorial-policy" className="hover:text-primary transition-colors">संपादकीय नीति</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">गोपनीयता नीति</Link>
              <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">नियम और शर्तें</Link>
            </div>
          </div>

          {/* Column 3: संपर्क व विमर्श */}
          <div className="space-y-1.5 md:col-span-3">
            <h4 className="font-serif text-[11px] md:text-xs font-bold text-[#1E1E1E] dark:text-white border-l-2 border-[#EA580C] pl-2 uppercase tracking-wider">
              संपर्क व विमर्श
            </h4>
            <div className="flex flex-col space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Link href="/contact" className="hover:text-primary transition-colors">संपर्क करें</Link>
              <Link href="/submit-article" className="hover:text-primary transition-colors">रचना भेजें</Link>
              <Link href="/magazine" className="hover:text-primary transition-colors">पत्रिका संग्रह</Link>
              
              {/* Social Media Links */}
              <div className="flex space-x-2.5 text-slate-500 dark:text-slate-400 pt-1">
                <a href="#" className="hover:text-[#EA580C] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-[#EA580C] transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#EA580C] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="hover:text-[#EA580C] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Newsletter Signup Card */}
        <div className="md:col-span-3 space-y-1.5">
          <h4 className="font-serif text-[11px] md:text-xs font-bold text-[#1E1E1E] dark:text-white border-l-2 border-[#EA580C] pl-2 uppercase tracking-wider">
            न्यूज़लेटर सदस्यता
          </h4>
          <div className="p-2.5 bg-white dark:bg-[#0F172A]/50 rounded-xl border border-[#E7E2D8] dark:border-slate-800 shadow-sm space-y-1.5">
            <p className="text-slate-600 dark:text-slate-400 leading-normal text-[10px]">
              विमर्श और नए संस्करणों की सूचना ईमेल पर पाएं।
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <input 
                type="email" 
                placeholder="आपका ईमेल..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-[#F5F2EB] dark:bg-slate-900 border border-[#E7E2D8] dark:border-slate-800 text-[10px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                required
              />
              <button 
                type="submit" 
                className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white p-2 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
            {msg && <p className="text-[9px] text-primary font-medium animate-pulse">{msg}</p>}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-[#E7E2D8] dark:border-slate-800 text-center text-slate-500 font-mono">
        <p>{settings.footer.copyright_text}</p>
      </div>
    </footer>
  );
}
