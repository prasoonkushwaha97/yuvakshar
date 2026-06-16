"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Search, 
  Menu, 
  X, 
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  Bookmark,
  Award,
  Activity,
  Crown,
  Settings,
  LogOut,
  Shield,
  FileEdit,
  CheckSquare,
  Compass,
  Bell
} from "lucide-react";

import { useCms } from "@/store/CmsContext";
import MobileSearchOverlay from "@/components/layout/MobileSearchOverlay";





export interface NavbarProps {
  showFounderWorkspace?: boolean;
  showAdminWorkspace?: boolean;
  showModeratorWorkspace?: boolean;
}

export default function Navbar({ 
  showFounderWorkspace: propsShowFounderWorkspace, 
  showAdminWorkspace: propsShowAdminWorkspace, 
  showModeratorWorkspace: propsShowModeratorWorkspace 
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, logoutUser, currentUser, magazines, articles, openAuthModal, getDisplayRole, hasRole } = useCms();

  const isFounder = hasRole("Founder") || hasRole("founder");
  const isCoFounder = hasRole("Co-Founder") || hasRole("co_founder");
  const isSuperAdmin = hasRole("Super Admin") || hasRole("super_admin");
  const isAdmin = hasRole("Admin") || hasRole("admin");
  const isEditorInChief = hasRole("Editor-in-Chief") || hasRole("editor_in_chief");
  const isModerator = hasRole("Moderator") || hasRole("moderator");

  const showFounderWorkspace = propsShowFounderWorkspace !== undefined ? propsShowFounderWorkspace : isFounder;
  const showAdminWorkspace = propsShowAdminWorkspace !== undefined ? propsShowAdminWorkspace : (isFounder || isCoFounder || isSuperAdmin || isAdmin);
  const showModeratorWorkspace = propsShowModeratorWorkspace !== undefined ? propsShowModeratorWorkspace : (isFounder || isCoFounder || isSuperAdmin || isAdmin || isEditorInChief || isModerator);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleMobileMenuToggle = (open: boolean) => {
    setMobileMenuOpen(open);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yuvakshar:mobileMenuToggle", { detail: { open } })
      );
    }
  };

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [subLiteratureOpen, setSubLiteratureOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);

    const savedTheme = localStorage.getItem("yuvashar_theme") as "light" | "dark" || 
                       localStorage.getItem("yuvakshar_theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

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

  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/community"))) {
    return null;
  }

  const latestMag = magazines[0] || { issue: "वर्तमान अंक", month: "मई २०२५", coverImage: "/yuvakshar_logo.jpg" };

  const navLinks = [
    { name: "समाचार", href: "/category/news" },
    { name: "विशेष लेख", href: "/category/special" },
    { name: "विचार", href: "/category/opinion" },
    { name: "साहित्य", href: "/category/literature", hasDropdown: true },
    { name: "साक्षात्कार", href: "/category/interviews" },
    { name: "शिक्षा", href: "/category/education" },
    { name: "पर्यावरण", href: "/category/environment" },
    { name: "इतिहास", href: "/category/history" },
    { name: "वीडियो", href: "/category/video" },
    { name: "पत्रिका", href: "/magazine" },
    { name: "लेखक", href: "/authors" },
    { name: "कम्युनिटी", href: "/community" },
  ];

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════════════════
          MOBILE HEADER — Compact 60px single row (lg:hidden)
          Shows: Logo | Search | Theme | Profile/Login | Menu
      ═══════════════════════════════════════════════════ */}
      <div className="lg:hidden sticky top-0 z-50 w-full h-[60px] bg-white dark:bg-[#1E1E1E] border-b border-slate-200 dark:border-[#3A3A3A] flex items-center justify-between px-4 shadow-sm">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {!pathname?.startsWith("/community") && (
            <button
              onClick={() => handleMobileMenuToggle(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center" onClick={() => handleMobileMenuToggle(false)}>
            <img
              src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"}
              alt="युवाक्षर"
              className="logo h-8 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png"; }}
            />
          </Link>
        </div>

        {/* Right: Search | Theme | Profile */}
        <div className="flex items-center gap-1">
          {/* Search button → opens full-screen overlay */}
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>

          {/* Profile / Login */}
          {currentUser ? (
            <button
              onClick={() => setProfileDropdownOpen(true)}
              className="ml-1 w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[2px] flex items-center justify-center overflow-hidden"
              aria-label="Profile"
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0F1D] flex items-center justify-center text-xs font-bold uppercase overflow-hidden text-primary">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name ? currentUser.name[0] : "U"
                )}
              </div>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="ml-1 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
            >
              लॉगिन
            </button>
          )}
        </div>
      </div>

      {/* Full-screen Mobile Search Overlay */}
      <MobileSearchOverlay open={showSearch} onClose={() => setShowSearch(false)} />


      {/* ═══════════════════════════════════════════════════
          DESKTOP HEADER (hidden on mobile)
      ═══════════════════════════════════════════════════ */}

      {/* DESKTOP: Logo + Tagline + Current Issue */}
      <div className="hidden lg:block w-full bg-white dark:bg-[#0A0F1D] py-3.5 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <Link href="/" className="flex flex-col items-center lg:items-start group text-center lg:text-left">
            <img 
              src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
              alt="युवाक्षर"
              className="h-[55px] md:h-[75px] w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png";
              }}
            />
            <div className="w-full flex items-center justify-center lg:justify-start mt-2">
              <span className="text-xs font-serif font-bold tracking-widest text-slate-800 dark:text-slate-100">
                {settings.general.tagline}
              </span>
            </div>
          </Link>

          {/* Center Quote */}
          <div className="hidden xl:flex max-w-md text-center flex-col items-center">
            <p className="font-serif text-[13px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
              " शब्द केवल अभिव्यक्ति का माध्यम नहीं, <br />
              समाज और विचारों के निर्माण का आधार भी हैं। "
            </p>
          </div>

          {/* Current Issue */}
          <div className="flex items-center space-x-4 bg-slate-50 dark:bg-[#0F172A]/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">वर्तमान अंक</span>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white font-serif">{latestMag.issue}</span>
              <div className="flex space-x-2 mt-2">
                <Link href="/magazine" className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-[10px] font-bold transition-all shadow-sm">
                  अंक पढ़ें
                </Link>
                <Link 
                  href="/magazine"
                  className="border border-slate-300 dark:border-slate-700 hover:border-primary text-[10px] font-bold px-2 py-1 rounded dark:text-slate-200 hover:text-primary transition-all bg-white dark:bg-slate-800"
                >
                  ऑनलाइन पढ़ें
                </Link>
              </div>
            </div>
            <img 
              src={latestMag.coverImage} 
              alt="Issue Cover" 
              className="w-12 h-16 object-cover rounded shadow border border-slate-200 dark:border-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80";
              }}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP: Navigation Menu Bar */}
      <header className={`hidden lg:block w-full bg-[#F8F6F2] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-b border-slate-250 dark:border-slate-800 transition-all duration-300 z-40 ${
        scrolled ? "fixed top-0 left-0 right-0 shadow-lg py-1.5" : "relative py-0"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="bg-primary p-3 flex items-center justify-center text-white shrink-0">
              <Home className="w-4 h-4" />
            </Link>

            <nav className="flex items-center font-serif text-sm">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group">
                  <Link 
                    href={link.href}
                    className={`px-4 py-3.5 inline-flex items-center space-x-1 hover:text-primary transition-all ${
                      pathname === link.href ? "text-primary font-bold border-b-2 border-primary" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />}
                  </Link>

                  {link.hasDropdown && (
                    <div className="absolute top-full left-0 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 py-2 w-44 rounded-b-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <Link href="/category/literature?sub=poetry" className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">कविता</Link>
                      <Link href="/category/literature?sub=story" className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">कहानी</Link>
                      <Link href="/category/literature?sub=memoir" className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">संस्मरण</Link>
                      <Link href="/category/literature?sub=review" className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">पुस्तक समीक्षा</Link>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4 py-2 lg:py-0">
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="खोजें..." 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchVal.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchVal)}`;
                  }
                }}
                className="bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-850 text-xs px-4 py-1.5 rounded-full pr-8 w-40 focus:w-52 focus:outline-none focus:border-primary transition-all text-slate-800 dark:text-slate-200"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full transition-colors cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 px-3.5 rounded-xl border border-slate-250 dark:border-slate-850 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-primary transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] overflow-hidden shrink-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0F1D] flex items-center justify-center text-xs font-bold uppercase overflow-hidden text-primary">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name ? currentUser.name[0] : "U"
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                    <span className="text-xs font-bold font-serif text-slate-850 dark:text-white">
                      {currentUser.name || "पाठक"}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-sans tracking-wide mt-0.5">
                      {getDisplayRole()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 py-3 rounded-2xl shadow-2xl z-50 text-[13px] font-serif leading-normal text-slate-800 dark:text-slate-200">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] overflow-hidden shrink-0 flex items-center justify-center">
                              <div className="w-full h-full rounded-full bg-white dark:bg-[#0F172A] flex items-center justify-center text-sm font-bold uppercase overflow-hidden text-primary">
                                {currentUser.avatar_url ? (
                                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                                ) : (
                                  currentUser.name ? currentUser.name[0] : "U"
                                )}
                              </div>
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate text-sm leading-tight">
                                {currentUser.name || "पाठक"}
                              </p>
                              {getDisplayRole() && (
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans tracking-wide">
                                    {getDisplayRole()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-0.5 px-1">
                          {[
                            { href: "/profile", icon: User, label: "मेरा प्रोफ़ाइल" },
                            { href: "/bookmarks", icon: Bookmark, label: "बुकमार्क" },
                            { href: "/certificates", icon: Award, label: "प्रमाणपत्र" },
                            { href: "/literary-journey", icon: Activity, label: "साहित्यिक यात्रा" },
                            { href: "/settings", icon: Settings, label: "सेटिंग्स" },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setProfileDropdownOpen(false)}
                              className="group flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-350 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all font-hindi font-medium"
                            >
                              <Icon className="w-4 h-4 text-slate-450 group-hover:text-primary transition-colors shrink-0" />
                              <span>{label}</span>
                            </Link>
                          ))}
                        </div>

                        {(showFounderWorkspace || showAdminWorkspace || showModeratorWorkspace) && (
                          <>
                            <div className="border-t border-slate-100 dark:border-slate-800/80 my-2" />
                            <div className="px-4 py-1 text-[9px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              संपादकीय एवं प्रबंधन
                            </div>
                            <div className="space-y-0.5 px-1 mt-1">
                              {showFounderWorkspace && (
                                <Link href="/founder" onClick={() => setProfileDropdownOpen(false)} className="group flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-350 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all font-hindi font-medium">
                                  <Crown className="w-4 h-4 text-amber-500 group-hover:text-primary transition-colors shrink-0" />
                                  <span>संस्थापक डैशबोर्ड</span>
                                </Link>
                              )}
                              {showAdminWorkspace && (
                                <Link href="/admin?tab=dashboard" onClick={() => setProfileDropdownOpen(false)} className="group flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-350 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all font-hindi font-medium">
                                  <Shield className="w-4 h-4 text-slate-450 group-hover:text-primary transition-colors shrink-0" />
                                  <span>प्रशासन पैनल</span>
                                </Link>
                              )}
                              {showModeratorWorkspace && (
                                <Link href="/admin" onClick={() => setProfileDropdownOpen(false)} className="group flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-350 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all font-hindi font-medium">
                                  <FileEdit className="w-4 h-4 text-slate-450 group-hover:text-primary transition-colors shrink-0" />
                                  <span>संपादकीय डेस्क</span>
                                </Link>
                              )}
                              <Link href="/submit-article" onClick={() => setProfileDropdownOpen(false)} className="group flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-355 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all font-hindi font-medium">
                                <CheckSquare className="w-4 h-4 text-slate-450 group-hover:text-primary transition-colors shrink-0" />
                                <span>लेखक डैशबोर्ड</span>
                              </Link>
                            </div>
                          </>
                        )}

                        {}

                        <div className="border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-1.5">
                          <button
                            onClick={async () => { await logoutUser(); setProfileDropdownOpen(false); router.refresh(); }}
                            className="w-full text-left px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer font-hindi font-bold flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>लॉगआउट</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-full text-[10px] font-serif font-bold transition-all shadow-md cursor-pointer"
              >
                लॉगिन करें
              </button>
            )}
          </div>
        </div>
      </header>


      {/* ═══════════════════════════════════════════════════
          MOBILE FULL-SCREEN SLIDE-IN DRAWER MENU
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleMobileMenuToggle(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[49]"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[82%] max-w-[320px] z-[50] bg-white dark:bg-[#0A0F1D] flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <Link href="/" onClick={() => handleMobileMenuToggle(false)}>
                  <img
                    src={settings.appearance.logo_url || "/yuvakshar_logo_official.png"}
                    alt="युवाक्षर"
                    className="h-8 w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png"; }}
                  />
                </Link>
                <button
                  onClick={() => handleMobileMenuToggle(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card */}
              {currentUser ? (
                <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-900/30 flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[2px] flex items-center justify-center overflow-hidden shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0F1D] flex items-center justify-center text-sm font-bold uppercase overflow-hidden text-primary">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name ? currentUser.name[0] : "U"
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{currentUser.name || "पाठक"}</p>
                    {getDisplayRole() && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mt-0.5">
                        {getDisplayRole()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mx-4 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">युवाक्षर में लॉगिन करें</p>
                  <button
                    onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                    className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    लॉगिन
                  </button>
                </div>
              )}

              {/* Nav Categories */}
              <div className="flex-grow px-3 py-4 space-y-0.5">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-3 mb-2">श्रेणियाँ</p>
                {navLinks.map((link) => {
                  const linkIcons: { [key: string]: string } = {
                    "समाचार": "📰", "विशेष लेख": "⭐", "विचार": "💬",
                    "साहित्य": "✍️", "साक्षात्कार": "🎙️", "शिक्षा": "🎓",
                    "पर्यावरण": "🌿", "इतिहास": "📜", "वीडियो": "🎬", "पत्रिका": "📖"
                  };
                  const isActive = pathname === link.href;
                  return (
                    <div key={link.href} className="w-full">
                      {link.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setSubLiteratureOpen(!subLiteratureOpen)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-serif transition-colors ${
                              isActive ? "bg-primary/10 text-primary font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base">{linkIcons[link.name] || "🔗"}</span>
                              <span>{link.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${subLiteratureOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {subLiteratureOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-12 pr-4 py-1 space-y-0.5"
                              >
                                {[
                                  { href: "/category/literature?sub=poetry", label: "कविता" },
                                  { href: "/category/literature?sub=story", label: "कहानी" },
                                  { href: "/category/literature?sub=memoir", label: "संस्मरण" },
                                  { href: "/category/literature?sub=review", label: "पुस्तक समीक्षा" },
                                ].map(sub => (
                                  <Link key={sub.href} href={sub.href} onClick={() => handleMobileMenuToggle(false)} className="block px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary rounded-lg">
                                    {sub.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => handleMobileMenuToggle(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-serif transition-colors ${
                            isActive ? "bg-primary/10 text-primary font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <span className="text-base">{linkIcons[link.name] || "🔗"}</span>
                          <span>{link.name}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary ml-auto" />}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
                <div>
                  <Link href="/submit-article" onClick={() => handleMobileMenuToggle(false)} className="flex items-center justify-center gap-1.5 py-3 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary w-full">
                    <span>✍️</span><span>रचना भेजें</span>
                  </Link>
                </div>

                {currentUser && (
                  <button
                    onClick={async () => { await logoutUser(); handleMobileMenuToggle(false); router.refresh(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-xl text-sm text-red-500 dark:text-red-400 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ═══════════════════════════════════════════════════
          MOBILE PROFILE BOTTOM SHEET
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {profileDropdownOpen && currentUser && (
          <div className="lg:hidden fixed inset-0 z-[99] flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setProfileDropdownOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-h-[88vh] bg-white dark:bg-[#0F172A] rounded-t-3xl shadow-2xl z-[100] overflow-y-auto flex flex-col border-t border-slate-200 dark:border-slate-800"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-4 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <span className="font-serif font-bold text-base text-slate-800 dark:text-white">युवाक्षर प्रोफ़ाइल</span>
                <button onClick={() => setProfileDropdownOpen(false)} className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-900/30 flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[2px] flex items-center justify-center overflow-hidden shrink-0">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#0F172A] flex items-center justify-center text-sm font-bold uppercase overflow-hidden text-primary">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name ? currentUser.name[0] : "U"
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="font-bold text-base text-slate-800 dark:text-white truncate">{currentUser.name || "पाठक"}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-semibold">
                      {getDisplayRole()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-grow px-3 py-4 space-y-0.5">
                {[
                  { href: "/profile", icon: User, label: "मेरा प्रोफ़ाइल" },
                  { href: "/dashboard?tab=study", icon: BookOpen, label: "मेरी पुस्तकालय" },
                  { href: "/bookmarks", icon: Bookmark, label: "बुकमार्क" },
                  { href: "/certificates", icon: Award, label: "प्रमाणपत्र" },
                  { href: "/literary-journey", icon: Activity, label: "साहित्यिक यात्रा" },
                  { href: "/settings", icon: Settings, label: "सेटिंग्स" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="group flex items-center space-x-3 px-4 py-3.5 min-h-[52px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-orange-50/50 dark:hover:bg-orange-950/10 rounded-xl transition-all font-hindi font-semibold text-sm"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                    <span>{label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary ml-auto" />
                  </Link>
                ))}

                {(showFounderWorkspace || showAdminWorkspace || showModeratorWorkspace) && (
                  <>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-4 mb-1">संपादकीय डेस्क</p>
                    {showFounderWorkspace && (
                      <Link href="/founder" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3.5 min-h-[52px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-orange-50/50 rounded-xl transition-all font-hindi font-semibold text-sm">
                        <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>संस्थापक डैशबोर्ड</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                      </Link>
                    )}
                    {showAdminWorkspace && (
                      <Link href="/admin?tab=dashboard" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3.5 min-h-[52px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-orange-50/50 rounded-xl transition-all font-hindi font-semibold text-sm">
                        <Shield className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>प्रशासन पैनल</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                      </Link>
                    )}
                    {showModeratorWorkspace && (
                      <Link href="/admin" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3.5 min-h-[52px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-orange-50/50 rounded-xl transition-all font-hindi font-semibold text-sm">
                        <FileEdit className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>संपादकीय पैनल</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Logout */}
              <div className="px-4 pb-8 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  onClick={async () => { await logoutUser(); setProfileDropdownOpen(false); router.refresh(); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-xl text-sm text-red-500 dark:text-red-400 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
