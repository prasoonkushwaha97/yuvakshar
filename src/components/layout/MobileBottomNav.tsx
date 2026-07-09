"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { bottomNavLinks } from "@/config/navigation.config";
import { designTokens } from "@/config/designTokens";
import { Plus } from "lucide-react";

import CreateBottomSheet from "./CreateBottomSheet";
import { useRouter } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguage();
  const { currentUser } = useCms();
  
  const [visible, setVisible] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  // Scroll visibility listeners (collapses on scroll down)
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {

      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  // Exclude bottom navigation inside dashboard settings & specific pathways
  if (
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/author") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/workspace/articles/new")
  ) {
    return null;
  }

  // Render a standard nav link
  const renderNavLink = (link: any) => {
    const Icon = link.icon;
    const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
    
    return (
      <Link
        key={link.href}
        href={link.href}
        className="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] group"
        aria-label={locale === "hi" ? link.labelHi : link.labelEn}
      >
        {/* Active Saffron indicator line */}
        <span
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300 ${
            isActive ? "w-8 bg-[#f97316]" : "w-0 bg-transparent"
          }`}
        />

        {/* Icon */}
        <span
          className={`transition-all duration-200 ${
            isActive
              ? "text-[#f97316] scale-110"
              : "text-gray-400 dark:text-gray-500 group-hover:text-[#f97316]"
          }`}
        >
          <Icon
            className="w-[20px] h-[20px]"
            strokeWidth={isActive ? 2.5 : 1.8}
          />
        </span>

        {/* Label */}
        <span
          className={`text-[9.5px] font-bold leading-none tracking-wide transition-colors duration-200 ${
            isActive
              ? "text-[#f97316]"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-650"
          }`}
        >
          {locale === "hi" ? link.labelHi : link.labelEn}
        </span>

        {/* Account notifier dot when logged in */}
        {link.href === "#profile" && currentUser && (
          <span className="absolute top-2.5 right-[calc(50%-12px)] w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFCF7]/95 dark:bg-[#0B0F19]/95 border-t border-gray-150 dark:border-gray-850 backdrop-blur transition-transform duration-300"
        style={{ 
          transform: visible ? "translateY(0)" : "translateY(100%)",
          paddingBottom: designTokens.spacing.safeAreaBottom
        }}
      >
        <div className="flex items-stretch justify-around h-16 relative">
          {/* Left two items */}
          {bottomNavLinks.slice(0, 2).map(renderNavLink)}

          {/* Center FAB */}
          <div className="relative flex-1 flex justify-center h-full">
            <button
              onClick={() => setSheetOpen(true)}
              className="absolute -top-5 flex items-center justify-center w-[56px] h-[56px] bg-[#f97316] text-white rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.4)] active:scale-95 hover:bg-[#ea580c] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#f97316]/30"
              aria-label="Create Action"
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>

          {/* Right two items */}
          {bottomNavLinks.slice(2, 4).map(renderNavLink)}
        </div>
      </nav>
      
      <CreateBottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />

    </>
  );
}
