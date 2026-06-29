"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, Award } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";

export default function NewspaperFooter() {
  const { locale } = useLanguage();
  const { settings, subscribeNewsletter, currentUser, openAuthModal } = useCms();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  React.useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

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

  const categories = [
    { name: locale === "hi" ? "समाचार" : "News", href: "/category/समाचार" },
    { name: locale === "hi" ? "साहित्य" : "Literature", href: "/category/साहित्य" },
    { name: locale === "hi" ? "इतिहास" : "History", href: "/category/इतिहास" },
    { name: locale === "hi" ? "राजनीति" : "Politics", href: "/category/राजनीति" },
    { name: locale === "hi" ? "पर्यावरण" : "Environment", href: "/category/पर्यावरण" },
    { name: locale === "hi" ? "विज्ञान" : "Science", href: "/category/विज्ञान" },
    { name: locale === "hi" ? "तकनीक" : "Technology", href: "/category/तकनीक" },
    { name: locale === "hi" ? "संस्कृति" : "Culture", href: "/category/संस्कृति" },
  ];

  return (
    <footer className="w-full bg-[#FAFAF9] dark:bg-[#0E0E0E] text-[#111] dark:text-[#E0E0E0] border-t border-[#E6DED1] dark:border-[#262626] py-12 px-4 md:px-8 mt-12 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Col 1: Brand details */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="inline-block">
            <img
              src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"}
              alt="युवाक्षर"
              className="h-10 md:h-12 w-auto object-contain dark:invert"
              onError={(e) => { e.currentTarget.src = "/yuvakshar_logo_official.png"; }}
            />
          </Link>
          <p className="text-gray-550 dark:text-gray-400 text-xs font-serif leading-relaxed max-w-sm">
            युवाक्षर युवाओं, लेखकों और विचारकों का एक स्वतंत्र हिन्दी डिजिटल मंच है, जो राष्ट्र निर्माण, ज्ञान अर्जन और रचनात्मक अभिव्यक्ति को प्रोत्साहित करता है।
          </p>
          <div className="flex space-x-3 text-gray-400 dark:text-gray-500">
            <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Twitter/X">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        {/* Col 2: Categories index */}
        <div className="md:col-span-2 space-y-3.5">
          <h4 className="font-serif text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-200 border-l-2 border-[#f97316] pl-2.5">
            {locale === "hi" ? "विषय श्रेणियाँ" : "Categories"}
          </h4>
          <div className="flex flex-col space-y-2 text-xs text-gray-650 dark:text-gray-400 font-sans">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href} className="hover:text-[#f97316] transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: Editorial & Org Policies */}
        <div className="md:col-span-3 space-y-3.5">
          <h4 className="font-serif text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-200 border-l-2 border-[#f97316] pl-2.5">
            {locale === "hi" ? "नीतियां व नीतियां" : "Policies & Info"}
          </h4>
          <div className="flex flex-col space-y-2 text-xs text-gray-650 dark:text-gray-400 font-sans">
            <Link href="/about" className="hover:text-[#f97316] transition-colors">{locale === "hi" ? "हमारे बारे में" : "About Us"}</Link>
            <Link href="/editorial-policy" className="hover:text-[#f97316] transition-colors">{locale === "hi" ? "संपादकीय नीति" : "Editorial Policy"}</Link>
            <Link href="/contact" className="hover:text-[#f97316] transition-colors">{locale === "hi" ? "सम्पर्क करें" : "Contact Us"}</Link>
            <Link href="/privacy-policy" className="hover:text-[#f97316] transition-colors">{locale === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}</Link>
            <Link href="/terms-and-conditions" className="hover:text-[#f97316] transition-colors">{locale === "hi" ? "नियम और शर्तें" : "Terms & Conditions"}</Link>
          </div>
        </div>

        {/* Col 4: Newsletter */}
        <div className="md:col-span-3 space-y-3.5">
          <h4 className="font-serif text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-200 border-l-2 border-[#f97316] pl-2.5">
            {locale === "hi" ? "न्यूज़लेटर सदस्यता" : "Newsletter"}
          </h4>
          <p className="text-gray-550 dark:text-gray-400 text-xs font-serif leading-relaxed">
            साप्ताहिक विमर्श और डिजिटल पत्रिका के नवीनतम अंकों की सूचना सीधे ईमेल पर प्राप्त करें।
          </p>
          <form onSubmit={handleSubscribe} className="flex space-x-2 pt-1.5">
            <input
              type="email"
              placeholder={locale === "hi" ? "ईमेल पता..." : "Email address..."}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white dark:bg-[#151515] border border-gray-250 dark:border-gray-800 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#f97316] text-[#111] dark:text-[#F5F5F5]"
              required
            />
            <button
              type="submit"
              className="bg-[#f97316] hover:bg-[#EA580C] text-white p-2 rounded transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
              title="सब्सक्राइब करें"
              aria-label="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          {msg && <p className="text-[10px] text-[#f97316] font-bold mt-1.5 animate-pulse">{msg}</p>}
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1400px] mx-auto mt-10 pt-6 border-t border-[#E6DED1] dark:border-[#262626] text-center text-[10px] text-gray-450 dark:text-gray-500 font-sans tracking-wide">
        <p>{settings.footer.copyright_text || `© ${new Date().getFullYear()} Yuvakshar. Designed for India's youth vanguard.`}</p>
      </div>
    </footer>
  );
}
