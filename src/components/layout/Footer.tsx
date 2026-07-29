"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { ROUTES } from "@/utils/routes";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useCms();

  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/workspace"))) {
    return null;
  }

  return (
    <footer className="w-full bg-[#FAF8F3] dark:bg-[#040711] text-[#1E1E1E] dark:text-slate-300 border-t border-[#E7E2D8] dark:border-slate-800/80 pt-8 pb-6 lg:pt-12 lg:pb-8 relative z-30">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Mobile & Tablet Layout (< 1024px) */}
        <div className="flex flex-col lg:hidden text-center -mt-2">
          {/* Brand Block */}
          <div className="flex flex-col items-center space-y-1 mb-3">
            <Image 
              src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
              alt="युवाक्षर लोगो" 
              className="h-[36px] w-auto object-contain dark:brightness-110 dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] transition-all" 
              style={{ width: 'auto' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png";
              }} 
              width={144} 
              height={36} 
            />
            <p className="text-slate-500 font-serif text-[11px]">
              लेखन, चिंतन और परिवर्तन
            </p>
          </div>

          <hr className="border-[#E7E2D8] dark:border-slate-800 w-12 mx-auto mb-3" />

          {/* Vertical Links */}
          <nav className="flex flex-col space-y-2 mb-3 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            <Link href="/about" className="hover:text-primary transition-colors">हमारे बारे में</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">गोपनीयता नीति</Link>
            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">नियम एवं शर्तें</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">संपर्क करें</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6 mb-3">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-[#1877F2] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-[#E4405F] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px] mt-0.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-400 hover:text-[#FF0000] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>

          <hr className="border-[#E7E2D8] dark:border-slate-800 w-12 mx-auto mb-3" />

          {/* Copyright */}
          <div className="text-slate-400 text-[11px] font-medium">
            <p>© 2026 युवाक्षर। भारत के युवाओं के लिए समर्पित।</p>
          </div>
        </div>

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:flex flex-col">
          <div className="grid grid-cols-4 gap-12">
            
            {/* Column 1: Brand */}
            <div className="flex flex-col items-start col-span-1">
              <Image 
                src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
                alt="युवाक्षर लोगो" 
                className="h-[48px] w-auto object-contain mb-3 dark:brightness-110 dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] transition-all" 
                style={{ width: 'auto' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png";
                }} 
                width={192} 
                height={48} 
              />
              <p className="text-slate-600 dark:text-slate-400 font-serif text-sm">
                लेखन, चिंतन और परिवर्तन
              </p>
            </div>

            {/* Column 2: About / Policies */}
            <div className="flex flex-col col-span-1">
              <nav className="flex flex-col space-y-3 text-[14px] text-slate-500 dark:text-slate-400 font-medium pt-2">
                <Link href="/about" className="hover:text-primary transition-colors w-fit">हमारे बारे में</Link>
                <Link href="/editorial-policy" className="hover:text-primary transition-colors w-fit">संपादकीय नीति</Link>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors w-fit">गोपनीयता नीति</Link>
                <Link href="/terms-and-conditions" className="hover:text-primary transition-colors w-fit">नियम एवं शर्तें</Link>
              </nav>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col col-span-1">
              <nav className="flex flex-col space-y-3 text-[14px] text-slate-500 dark:text-slate-400 font-medium pt-2">
                <Link href="/" className="hover:text-primary transition-colors w-fit">समाचार</Link>
                <Link href="/" className="hover:text-primary transition-colors w-fit">लेख</Link>
                <Link href="/magazine" className="hover:text-primary transition-colors w-fit">पत्रिका</Link>
                <Link href="/community" className="hover:text-primary transition-colors w-fit">चौपाल</Link>
              </nav>
            </div>

            {/* Column 4: Contact & Socials */}
            <div className="flex flex-col col-span-1">
              <nav className="flex flex-col space-y-3 text-[14px] text-slate-500 dark:text-slate-400 font-medium pt-2">
                <Link href="/contact" className="hover:text-primary transition-colors w-fit">संपर्क करें</Link>
                
                {/* Social Media Links */}
                <div className="flex space-x-4 pt-1">
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-[#1877F2] transition-colors hover:scale-110 transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-[#E4405F] transition-colors hover:scale-110 transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors hover:scale-110 transform">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-400 hover:text-[#FF0000] transition-colors hover:scale-110 transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>
              </nav>
            </div>
          </div>

          {/* Desktop Copyright */}
          <div className="mt-8 pt-6 border-t border-[#E7E2D8] dark:border-slate-800 text-center text-slate-500 text-[13px] font-medium">
            <p>© 2026 युवाक्षर। भारत के युवाओं के लिए समर्पित।</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
