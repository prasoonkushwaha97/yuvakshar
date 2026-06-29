"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Search, Bell, User, Menu, X, ChevronDown, ChevronRight, LogOut, 
  Settings, Crown, Shield, FileEdit, CheckSquare, Bookmark, Award, CloudSun
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";

const WEATHER_DATA = [
  { city: "दिल्ली", temp: "34°C", text: "सनी" },
  { city: "लखनऊ", temp: "32°C", text: "आंशिक बादल" },
  { city: "पटना", temp: "33°C", text: "हल्की धूप" },
  { city: "भोपाल", temp: "31°C", text: "सुहावना" },
  { city: "जयपुर", temp: "36°C", text: "गर्म" }
];

export default function NewspaperHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const { settings, logoutUser, currentUser, magazines, openAuthModal, getDisplayRole, hasRole } = useCms();

  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchVal, setSearchVal] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWeatherIdx, setActiveWeatherIdx] = useState(0);
  const [formattedDate, setFormattedDate] = useState("");

  const isFounder = hasRole("Founder") || hasRole("founder");
  const isCoFounder = hasRole("Co-Founder") || hasRole("co_founder");
  const isSuperAdmin = hasRole("Super Admin") || hasRole("super_admin");
  const isAdmin = hasRole("Admin") || hasRole("admin");
  const isEditorInChief = hasRole("Editor-in-Chief") || hasRole("editor_in_chief");
  const isModerator = hasRole("Moderator") || hasRole("moderator");

  const showFounderWorkspace = isFounder;
  const showAdminWorkspace = isFounder || isCoFounder || isSuperAdmin || isAdmin;
  const showModeratorWorkspace = isFounder || isCoFounder || isSuperAdmin || isAdmin || isEditorInChief || isModerator;

  // Clock / Date Sync
  useEffect(() => {
    const updateDateTime = () => {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const now = new Date();
      setFormattedDate(now.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, [locale]);

  // Weather Rotation Loop
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      setActiveWeatherIdx((prev) => (prev + 1) % WEATHER_DATA.length);
    }, 8000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Theme Sync
  useEffect(() => {
    const savedTheme = localStorage.getItem("yuvakshar_theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("yuvakshar_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const currentLatestMag = magazines[0] || { 
    issue: "अंक 15", 
    month: "जून 2025", 
    coverImage: "/images/placeholder-news.jpg" 
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
    { name: locale === "hi" ? "विशेष लेख" : "Special", href: "/category/विशेष लेख" },
  ];

  return (
    <header className="w-full bg-white dark:bg-[#0A0A0A] text-[#111] dark:text-[#F5F5F5] border-b border-[#E6DED1] dark:border-[#262626] transition-colors duration-300">
      {/* 1. TOP UTILITY BAR */}
      <div className="w-full bg-[#FAFAFA] dark:bg-[#121212] border-b border-[#E6DED1] dark:border-[#262626] py-1.5 px-4 text-xs font-sans">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Left: Date & Weather */}
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-500 dark:text-gray-400">{formattedDate}</span>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <CloudSun className="w-3.5 h-3.5 mr-1 text-[#f97316]" />
              <span>
                {WEATHER_DATA[activeWeatherIdx].city}: {WEATHER_DATA[activeWeatherIdx].temp} ({WEATHER_DATA[activeWeatherIdx].text})
              </span>
            </div>
          </div>

          {/* Center Quote */}
          <div className="hidden lg:block text-gray-550 dark:text-gray-400 italic text-[11px] max-w-lg truncate font-serif">
            " शब्द केवल अभिव्यक्ति का माध्यम नहीं, विचारों और राष्ट्र निर्माण का आधार भी हैं। "
          </div>

          {/* Right: Language switch & Socials */}
          <div className="flex items-center space-x-4">
            {/* Lang switch */}
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
              <button 
                onClick={() => setLocale("hi")}
                className={`px-2 py-0.5 font-bold text-[10px] ${locale === "hi" ? "bg-[#f97316] text-white" : "bg-transparent text-gray-500 hover:text-gray-850"}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => setLocale("en")}
                className={`px-2 py-0.5 font-bold text-[10px] ${locale === "en" ? "bg-[#f97316] text-white" : "bg-transparent text-gray-500 hover:text-gray-850"}`}
              >
                EN
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Twitter/X">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="hover:text-[#f97316] transition-colors" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Mag Widget, Actions) */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Magazine Widget */}
        <div className="hidden lg:flex items-center space-x-3.5 bg-[#FAF8F5] dark:bg-[#151515] p-2 border border-gray-200/60 dark:border-gray-850 rounded-lg">
          <img 
            src={currentLatestMag.coverImage} 
            alt="Current Cover" 
            className="w-10 h-14 object-cover rounded shadow"
            onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
          />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">डिजिटल पत्रिका</span>
            <span className="text-xs font-serif font-black">{currentLatestMag.issue} ({currentLatestMag.month})</span>
            <Link href="/magazine" className="mt-1 text-[10px] text-[#f97316] font-bold hover:underline flex items-center">
              ऑनलाइन पढ़ें <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex flex-col items-center">
          <img 
            src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
            alt="युवाक्षर" 
            className="h-12 md:h-16 w-auto object-contain dark:invert transition-all"
            onError={(e) => { e.currentTarget.src = "/yuvakshar_logo_official.png"; }}
          />
          <span className="text-[11px] font-sans font-black tracking-[0.25em] text-[#f97316] uppercase mt-1">
            युवा शक्ति, ज्ञान और राष्ट्र निर्माण
          </span>
        </Link>

        {/* Right: Search, Theme, Profile */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-end">
          {/* Search box */}
          <div className="relative max-w-[200px] w-full">
            <input 
              type="text" 
              placeholder="खोजें..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchVal.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchVal)}`);
                }
              }}
              className="w-full bg-[#FAF8F5] dark:bg-[#151515] border border-gray-250 dark:border-gray-800 rounded-full py-1.5 pl-4 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#f97316] text-[#111] dark:text-[#F5F5F5]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 border border-gray-200 dark:border-gray-850 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            aria-label="Theme toggle"
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-gray-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* User Account Menu */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 border border-gray-200 dark:border-gray-850 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-[1.5px] overflow-hidden flex items-center justify-center text-xs font-bold text-white uppercase">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    currentUser.name ? currentUser.name[0] : "U"
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 pr-1" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-2 text-sm text-[#111] dark:text-gray-200"
                    >
                      <div className="px-4 py-2 border-b border-gray-150 dark:border-gray-800/80 mb-1">
                        <p className="font-bold truncate">{currentUser.name || "पाठक"}</p>
                        <p className="text-[10px] text-gray-400 font-sans tracking-wide mt-0.5">{getDisplayRole()}</p>
                      </div>

                      {[
                        { href: "/profile", icon: User, label: "मेरा प्रोफ़ाइल" },
                        { href: "/bookmarks", icon: Bookmark, label: "बुकमार्क" },
                        { href: "/certificates", icon: Award, label: "प्रमाणपत्र" },
                        { href: "/settings", icon: Settings, label: "सेटिंग्स" },
                      ].map((item) => (
                        <Link 
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span>{item.label}</span>
                        </Link>
                      ))}

                      {(showFounderWorkspace || showAdminWorkspace || showModeratorWorkspace) && (
                        <>
                          <div className="border-t border-gray-150 dark:border-gray-800 my-1" />
                          {showFounderWorkspace && (
                            <Link href="/founder" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-amber-600 dark:text-amber-500 font-bold">
                              <Crown className="w-4 h-4" />
                              <span>संस्थापक डैशबोर्ड</span>
                            </Link>
                          )}
                          {showAdminWorkspace && (
                            <Link href="/admin?tab=dashboard" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-[#f97316]">
                              <Shield className="w-4 h-4" />
                              <span>प्रशासन पैनल</span>
                            </Link>
                          )}
                          {showModeratorWorkspace && (
                            <Link href="/admin" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-2.5 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                              <FileEdit className="w-4 h-4" />
                              <span>संपादकीय डेस्क</span>
                            </Link>
                          )}
                        </>
                      )}

                      <div className="border-t border-gray-150 dark:border-gray-800 my-1" />
                      <button 
                        onClick={async () => {
                          await logoutUser();
                          setProfileDropdownOpen(false);
                          router.refresh();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-left font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>लॉगआउट</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => openAuthModal()}
              className="bg-[#f97316] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2 rounded-full shadow transition-all duration-300"
            >
              लॉगिन करें
            </button>
          )}

          {/* Mobile Menu Burger */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 border border-gray-200 dark:border-gray-850 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. STICKY CATEGORIES NAVIGATION BAR */}
      <nav className={`w-full bg-[#FAF8F5] dark:bg-[#111111] border-t border-b border-[#E6DED1] dark:border-[#262626] transition-all duration-300 ${
        scrolled ? "fixed top-0 left-0 right-0 z-[50] shadow-md border-t-0" : "relative"
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <Link 
                key={cat.href} 
                href={cat.href}
                className="px-4 py-3 text-xs font-serif font-bold text-gray-700 dark:text-gray-300 hover:text-[#f97316] hover:bg-gray-100/50 dark:hover:bg-gray-900/50 rounded-md transition-all whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link 
            href="/submit-article"
            className="hidden sm:flex items-center space-x-1 text-xs font-bold text-[#f97316] border border-[#f97316]/30 px-3.5 py-1.5 rounded-full bg-white dark:bg-black hover:bg-[#f97316] hover:text-white transition-all whitespace-nowrap"
          >
            <span>✍️ लेख भेजें</span>
          </Link>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-[99]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[80%] max-w-[300px] bg-white dark:bg-[#0A0A0A] border-r border-[#E6DED1] dark:border-[#262626] z-[100] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
                  <span className="font-serif font-black text-lg text-[#f97316]">युवाक्षर</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col space-y-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">नेविगेशन</span>
                  {categories.map((cat) => (
                    <Link 
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-bold font-serif hover:text-[#f97316]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-800 my-4" />
                  <Link 
                    href="/submit-article"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-[#f97316] text-white py-2 rounded-lg text-xs font-bold"
                  >
                    ✍️ लेख सबमिट करें
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-250 dark:border-gray-850 pt-4 text-center text-[10px] text-gray-400">
                युवा शक्ति, ज्ञान और राष्ट्र निर्माण
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
