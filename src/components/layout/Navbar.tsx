"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Search, 
  Menu, 
  X, 
  Sun,
  Moon,
  ChevronDown,
  Lock,
  ChevronRight
} from "lucide-react";

import { useCms } from "@/store/CmsContext";


const translateRole = (role?: string | null) => {
  if (role === null) return "सदस्य";
  if (!role) return "अतिथि";
  switch (role) {
    case "Owner": return "स्वामी";
    case "Admin": return "प्रशासक";
    case "Editor-in-Chief": return "प्रधान संपादक";
    case "Managing Editor": return "प्रबंध संपादक";
    case "Editor": return "संपादक";
    case "Fact Check Reviewer": return "सत्यता समीक्षक";
    case "Author": return "लेखक";
    case "Contributor": return "योगदानकर्ता";
    default: return role;
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const { settings, logoutUser, currentUser, magazines, articles, openAuthModal } = useCms();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [subLiteratureOpen, setSubLiteratureOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Live Date Formatting in Hindi
  const [hindiDate, setHindiDate] = useState("");

  useEffect(() => {
    const formatHindiDate = () => {
      const days = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
      const months = [
        "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", 
        "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
      ];
      const date = new Date();
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${dayName}, ${dayNum} ${monthName} ${year}`;
    };

    setHindiDate(formatHindiDate());

    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);

    const savedTheme = localStorage.getItem("युवाक्षर_theme") as "light" | "dark";
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
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

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const latestMag = magazines[0] || { issue: "वर्तमान अंक", month: "मई २०२५", coverImage: "/yuvakshar_logo.jpg" };
  const breakingNews = articles.slice(0, 3).map(a => a.title).join(" • ") || "विशेष: नई शिक्षा नीति 2020 पर विशेष श्रृंखला का दूसरा भाग प्रकाशित";

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
  ];

  return (
    <div className="w-full">
      {/* 1. TOP INFORMATION BAR (Black Background) */}
      <div className="w-full bg-[#0F172A] text-white py-2 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-xs border-b border-slate-800 relative z-50">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-slate-300 shrink-0">{hindiDate}</span>
          <div className="flex items-center space-x-2 overflow-hidden max-w-[200px] sm:max-w-lg">
            <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px] uppercase shrink-0">विशेष:</span>
            <div className="animate-marquee whitespace-nowrap scrollbar-none text-slate-300 font-light truncate text-[10px]">
              {breakingNews}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-1.5 md:mt-0">
          <div className="flex space-x-4 text-slate-300">
            <Link href="/submit-article" className="hover:text-primary transition-colors">लेखक बनें</Link>
            <span>|</span>
            <Link href="/submit-article" className="hover:text-primary transition-colors">अपनी रचना भेजें</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-primary transition-colors">संपर्क करें</Link>
          </div>

          <div className="flex space-x-3 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mt-0.5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. LOGO AREA (White Background) */}
      <div className="w-full bg-white dark:bg-[#0A0F1D] py-3.5 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800">
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

          {/* Center Blockquote quote text */}
          <div className="hidden xl:flex max-w-md text-center flex-col items-center">
            <p className="font-serif text-[13px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
              “ शब्द केवल अभिव्यक्ति का माध्यम नहीं, <br />
              समाज और विचारों के निर्माण का आधार भी हैं। ”
            </p>
          </div>

          {/* Current Issue highlight box */}
          <div className="flex items-center space-x-4 bg-slate-50 dark:bg-[#0F172A]/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">वर्तमान अंक</span>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white font-serif">{latestMag.issue}</span>
              <div className="flex space-x-2 mt-2">
                <Link href="/magazine" className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-[10px] font-bold transition-all shadow-sm">
                  अंक पढ़ें
                </Link>
                <button 
                  onClick={() => alert("PDF downloading initiated...")}
                  className="border border-slate-300 dark:border-slate-700 hover:border-primary text-[10px] font-bold px-2 py-1 rounded dark:text-slate-200 hover:text-primary transition-all bg-white dark:bg-slate-800"
                >
                  PDF डाउनलोड करें
                </button>
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

      {/* 3. NAVIGATION MENU BAR (Black Background / Sticky) */}
      <header className={`w-full bg-[#0F172A] text-white border-b border-slate-800 transition-all duration-300 z-40 ${
        scrolled ? "fixed top-0 left-0 right-0 shadow-lg py-1.5" : "relative py-0"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center">
            {/* Home Icon button */}
            <Link href="/" className="bg-primary p-3 flex items-center justify-center text-white shrink-0">
              <Home className="w-4 h-4" />
            </Link>

            {/* Desktop Navbar menu links */}
            <nav className="hidden lg:flex items-center font-serif text-sm">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group">
                  <Link 
                    href={link.href}
                    className={`px-4 py-3.5 inline-flex items-center space-x-1 hover:text-primary hover:bg-slate-900/50 transition-all ${
                      pathname === link.href ? "text-primary font-bold" : "text-slate-200"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />}
                  </Link>

                  {/* Lit Sub-Categories Dropdown items */}
                  {link.hasDropdown && (
                    <div className="absolute top-full left-0 bg-[#0F172A] border border-slate-800 py-2 w-44 rounded-b-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <Link href="/category/literature/poetry" className="block px-4 py-2 text-xs hover:text-primary hover:bg-slate-900 transition-colors">कविता</Link>
                      <Link href="/category/literature/story" className="block px-4 py-2 text-xs hover:text-primary hover:bg-slate-900 transition-colors">कहानी</Link>
                      <Link href="/category/literature/memoir" className="block px-4 py-2 text-xs hover:text-primary hover:bg-slate-900 transition-colors">संस्मरण</Link>
                      <Link href="/category/literature/review" className="block px-4 py-2 text-xs hover:text-primary hover:bg-slate-900 transition-colors">पुस्तक समीक्षा</Link>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4 py-2 lg:py-0">
            {/* Search Pill */}
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
                className="bg-slate-900 border border-slate-800 text-xs px-4 py-1.5 rounded-full pr-8 w-40 focus:w-52 focus:outline-none focus:border-primary transition-all text-slate-200"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
            </div>

            {/* Dark mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-primary hover:bg-slate-900 rounded-full transition-colors cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Session / Profile Dropdown / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-primary transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name ? currentUser.name[0] : "U"
                    )}
                  </div>
                  <span className="hidden sm:inline text-[10px] font-bold tracking-wider font-serif max-w-[80px] truncate">
                    {currentUser.name || "पाठक"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-slate-800 py-2 rounded-xl shadow-2xl z-50 text-xs font-serif leading-normal">
                      <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                        <p className="font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{translateRole(currentUser.role)}</p>
                      </div>
                      <Link 
                        href="/admin?tab=profile" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        मेरा प्रोफ़ाइल
                      </Link>
                      <Link 
                        href="/admin?tab=study-progress" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        मेरी अध्ययन प्रगति
                      </Link>
                      <Link 
                        href="/admin?tab=articles" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        मेरे लेख
                      </Link>
                      <Link 
                        href="/admin?tab=study-progress" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        सहेजे गए लेख
                      </Link>
                      <Link 
                        href="/admin?tab=study-progress" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        प्रमाणपत्र
                      </Link>
                      <Link 
                        href="/admin?tab=settings" 
                        onClick={() => { setProfileDropdownOpen(false); }}
                        className="block px-4 py-2 text-slate-300 hover:text-primary hover:bg-slate-900 transition-all"
                      >
                        सेटिंग्स
                      </Link>
                      <div className="border-t border-slate-800/60 my-1" />
                      <button
                        onClick={() => {
                          logoutUser();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        लॉगआउट
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-full text-[10px] font-serif font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
              >
                <span>लॉगिन करें</span>
              </button>
            )}

            {/* Mobile Drawer Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-primary hover:bg-slate-900 rounded-lg border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] z-50 bg-[#0A0F1D] backdrop-blur-md pt-6 px-4 flex flex-col justify-between lg:hidden border-r border-slate-800 text-white shadow-2xl overflow-y-auto"
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <span className="font-serif font-bold text-primary text-lg">युवाक्षर मेनु</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 border border-slate-800 rounded-lg text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Area */}
              <div className="flex items-center space-x-3 bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-2xl mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-white font-serif">{currentUser?.name || "अतिथि पाठक"}</p>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider block mt-0.5">{currentUser?.role ? translateRole(currentUser.role) : "संपादकीय टीम प्रवेश"}</span>
                </div>
              </div>

              {/* Navigation links with category icons */}
              <div className="flex flex-col space-y-1 pr-1">
                {navLinks.map((link) => {
                  const linkIcons: { [key: string]: string } = {
                    "समाचार": "📰",
                    "विशेष लेख": "⭐",
                    "विचार": "💬",
                    "साहित्य": "✍️",
                    "साक्षात्कार": "🎙️",
                    "शिक्षा": "🎓",
                    "पर्यावरण": "🌿",
                    "इतिहास": "📜",
                    "वीडियो": "🎥",
                    "पत्रिका": "📖"
                  };

                  return (
                    <div key={link.href} className="w-full">
                      {link.hasDropdown ? (
                        <div className="w-full">
                          <button 
                            onClick={() => setSubLiteratureOpen(!subLiteratureOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-transparent font-serif hover:bg-slate-900 hover:text-primary text-slate-300 text-left text-xs transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-base">{linkIcons[link.name] || "🔗"}</span>
                              <span>{link.name}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${subLiteratureOpen ? "rotate-180" : ""}`} />
                          </button>
                          
                          <AnimatePresence>
                            {subLiteratureOpen && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-10 pr-4 py-1 flex flex-col space-y-1"
                              >
                                <Link href="/category/literature/poetry" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-slate-400 hover:text-primary py-1 block">कविता</Link>
                                <Link href="/category/literature/story" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-slate-400 hover:text-primary py-1 block">कहानी</Link>
                                <Link href="/category/literature/memoir" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-slate-400 hover:text-primary py-1 block">संस्मरण</Link>
                                <Link href="/category/literature/review" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-slate-400 hover:text-primary py-1 block">पुस्तक समीक्षा</Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link 
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-xl border border-transparent font-serif hover:bg-slate-900 hover:text-primary text-xs transition-colors ${
                            pathname === link.href ? "bg-primary/10 border-primary/20 text-primary font-bold" : "text-slate-300"
                          }`}
                        >
                          <span className="text-base">{linkIcons[link.name] || "🔗"}</span>
                          <span>{link.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom quick actions block */}
            <div className="pb-8 border-t border-slate-800 pt-4">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-3 text-center">त्वरित शॉर्टकट</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <Link href="/magazine" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center space-x-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-primary text-slate-200 transition-all">
                  <span>📖</span>
                  <span>पत्रिका</span>
                </Link>
                <Link href="/submit-article" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center space-x-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-primary text-slate-200 transition-all">
                  <span>✍️</span>
                  <span>रचना भेजें</span>
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center space-x-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-primary text-slate-200 transition-all">
                  <span>📞</span>
                  <span>संपर्क करें</span>
                </Link>
                <Link href="/submit-article" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center space-x-1.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-primary text-slate-200 transition-all">
                  <span>✉️</span>
                  <span>न्यूज़लेटर</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
