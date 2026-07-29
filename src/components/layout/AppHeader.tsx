"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Sun, Moon, User, ChevronDown } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { primaryLinks, NavigationLink } from "@/config/navigation.config";
import AppDrawer from "./AppDrawer";
import SearchModal from "./SearchModal";
import { ROUTES } from "@/utils/routes";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "@/components/shared/Avatar";

function DesktopNavItem({ link, pathname, locale }: { link: NavigationLink, pathname: string, locale: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // A link is active if its own href matches OR any of its sublinks match
  const isActive = pathname === link.href || (link.subLinks && link.subLinks.some(sub => pathname.startsWith(sub.href) && sub.href !== "/"));

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={link.href}
        className={`flex items-center gap-1 py-1.5 text-xs font-bold uppercase tracking-widest font-sans transition-all duration-300 ${
          isActive 
            ? "text-[#f97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
            : "text-gray-700 dark:text-gray-300 hover:text-[#f97316]"
        }`}
      >
        <span>{locale === "hi" ? link.labelHi : link.labelEn}</span>
        {link.subLinks && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`} />
        )}
        
        {/* Active Underline */}
        {isActive && (
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#f97316] rounded-full shadow-[0_0_8px_#f97316]" />
        )}
        {!isActive && (
          <span className="absolute -bottom-1 left-1/2 right-1/2 h-[2px] bg-[#f97316] rounded-full transition-all duration-300 opacity-0 group-hover:left-0 group-hover:right-0 group-hover:opacity-100" />
        )}
      </Link>

      {/* Dropdown Menu */}
      {link.subLinks && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 mt-4 w-48 bg-white dark:bg-[#151b2b] border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {/* Invisible bridge to prevent hover loss when moving mouse to dropdown */}
              <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
              
              <div className="py-2">
                {link.subLinks.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors"
                  >
                    {locale === "hi" ? sub.labelHi : sub.labelEn}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default function AppHeader({ categories = [] }: { categories?: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const { currentUser, openAuthModal, logoutUser } = useCms();

  // Navigation Drawers/Overlay States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"navigation" | "profile">("navigation");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Scroll collapsing state
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    // Theme initialization
    const savedTheme = "light" as "light" | "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Scroll collapse/expand hooks
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 20);
      
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setVisible(false); // Collapsed on scroll down
      } else {
        setVisible(true); // Expanded on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      openAuthModal();
    } else {
      setDrawerMode("profile");
      setDrawerOpen(true);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.refresh();
  };

  return (
    <>
      {/* 1. Header Layout Frame */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-all duration-300 h-[52px] lg:h-[72px] ${
          isAtTop 
            ? "bg-transparent border-b border-transparent shadow-none" 
            : "bg-[#FDFCF7]/95 dark:bg-[#0B0F19]/95 border-b border-gray-150 dark:border-gray-850 shadow-sm"
        }`}
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)"
        }}
      >
        <div className="max-w-[1400px] mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Logo Group */}
          <div className="flex items-center space-x-3.5">

            <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 cursor-pointer" title="युवाक्षर">
              <Image
                src="/yuvakshar_logo_official.png"
                alt="युवाक्षर"
                width={232}
                height={58}
                className="h-[42px] md:h-[48px] lg:h-[58px] w-auto object-contain dark:brightness-110 dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] transition-all"
                style={{ width: 'auto' }}
                priority
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 240px"
              />
              <span className="sr-only">युवाक्षर</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {(() => {
              // Create a localized copy of primaryLinks to inject categories
              const navLinks = [...primaryLinks];
              const newsLinkIndex = navLinks.findIndex(l => l.href === "/current-affairs");
              
              if (newsLinkIndex !== -1 && categories.length > 0) {
                // Clone the news link to avoid mutating the exported constant
                const newsLink = { ...navLinks[newsLinkIndex] };
                newsLink.subLinks = [
                  ...(newsLink.subLinks || []),
                  ...categories.filter(c => c.is_active && !c.parent_id).map(c => ({
                    labelHi: c.name_hi,
                    labelEn: c.name_en,
                    href: `/category/${c.slug}`
                  }))
                ];
                navLinks[newsLinkIndex] = newsLink;
              }

              return navLinks.slice(0, 6).map((link) => (
                <DesktopNavItem key={link.href} link={link} pathname={pathname} locale={locale} />
              ));
            })()}
          </nav>

          {/* Actions toolbar: Write | Search | Theme | Profile */}
          <div className="flex items-center space-x-2.5">
            {currentUser && (
              <Link
                href={ROUTES.ARTICLE_EDITOR}
                className="hidden lg:flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-colors duration-300"
              >
                <span>✍️ लिखें</span>
              </Link>
            )}

            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 hover:text-[#f97316] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Trigger search overlay"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>

            <button 
              onClick={toggleTheme}
              className="hidden lg:flex p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 hover:text-[#f97316] transition-colors cursor-pointer min-h-[44px] min-w-[44px] items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {theme === "light" 
                ? <Moon className="w-[18px] h-[18px]" strokeWidth={2.2} /> 
                : <Sun className="w-[18px] h-[18px]" strokeWidth={2.2} />
              }
            </button>

            {/* Profile Dropdown/Drawer trigger */}
            <div className="relative">
              <button 
                onClick={handleProfileClick}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 hover:text-[#f97316] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open profile actions"
              >
                <Avatar url={currentUser?.avatar_url} name={currentUser?.name} alt="Profile" className="h-10 w-10 md:h-10 md:w-10 sm:h-9 sm:w-9 flex-shrink-0" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Spacer block under fixed header */}
      <div 
        className="w-full shrink-0 h-[52px] lg:h-[72px]" 
      />

      {/* 2. Unified Navigation Drawer */}
      <AppDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        onLogout={handleLogout}
        categories={categories}
      />

      {/* 3. Universal Search Modal */}
      <SearchModal 
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
