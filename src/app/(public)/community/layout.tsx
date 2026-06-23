"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Home, Users, MessageSquare, Calendar, Bell, Trophy, BookOpen, 
  Search, Bookmark, Plus, MessageCircle, Clock, Settings, ArrowLeft,
  TrendingUp, FileText, ChevronRight, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import { 
  initializeCommunityData, fetchChallenges, fetchPosts, CommunityChallenge, CommunityPost, fetchGroups, createPost
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import confetti from "canvas-confetti";

// Sidebar Links - Redesigned to fit user specifications
const sidebarLinks = [
  { name: "चौपाल होम", href: "/community", icon: Home },
  { name: "चर्चा मंच", href: "/community/discussion", icon: MessageSquare },
  { name: "समूह एवं क्लब", href: "/community/groups", icon: Users },
  { name: "कार्यक्रम", href: "/community/events", icon: Calendar },
  { name: "लेखक", href: "/community/authors", icon: FileText },
  { name: "निजी संदेश", href: "/community/messages", icon: MessageCircle },
  { name: "सूचनाएं", href: "/community/notifications", icon: Bell },
  { name: "मेरी लाइब्रेरी", href: "/community/bookmarks", icon: Bookmark },
  { name: "सेटिंग्स", href: "/community/settings", icon: Settings }
];

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D16] text-slate-500 font-serif text-sm">
        चौपाल संसार लोड हो रहा है...
      </div>
    }>
      <CommunityLayoutContent>{children}</CommunityLayoutContent>
    </Suspense>
  );
}

function CommunityLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, users, followAuthor } = useCms();

  // Route specific overrides
  const activeThreadId = searchParams.get("thread");
  const isChatOpen = pathname === "/community/messages" && !!activeThreadId;

  // Search input state
  const [searchVal, setSearchVal] = useState("");

  // Create Post Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPostType, setCreatePostType] = useState<"text" | "poetry" | "thought" | "poll" | "image" | "event" | "challenge">("text");

  // Form states for Create Post Modal
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formGroupId, setFormGroupId] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formPollQuestion, setFormPollQuestion] = useState("");
  const [formPollOptions, setFormPollOptions] = useState(["", ""]);
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formForumCategory, setFormForumCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsList = await fetchGroups();
        setAvailableGroups(groupsList);
      } catch (err) {
        console.error(err);
      }
    };
    loadGroups();
  }, []);

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("पोस्ट करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    if (!formContent.trim()) {
      alert("कृपया सामग्री लिखें।");
      return;
    }

    setIsSubmitting(true);
    try {
      const extra: any = {};
      if (formGroupId) extra.group_id = formGroupId;
      if (formTitle.trim()) extra.title = formTitle;
      if (formMediaUrl.trim()) extra.media_url = formMediaUrl;
      if (formLinkUrl.trim()) extra.link_url = formLinkUrl;
      
      if (createPostType === "poll") {
        extra.poll_question = formPollQuestion;
        extra.poll_options = formPollOptions.filter(opt => opt.trim() !== "");
        extra.poll_votes = {};
      }
      
      extra.forum_category = formForumCategory;

      const newPost = await createPost(
        currentUser.id,
        currentUser.name || "लेखक",
        formContent,
        createPostType as any,
        extra
      );

      // Trigger feed refresh by dispatching the custom event
      window.dispatchEvent(new CustomEvent("yuvakshar:postCreated", { detail: newPost }));

      // Reset form
      setFormTitle("");
      setFormContent("");
      setFormGroupId("");
      setFormMediaUrl("");
      setFormPollQuestion("");
      setFormPollOptions(["", ""]);
      setFormLinkUrl("");
      setCreateModalOpen(false);

      alert("आपकी पोस्ट चौपाल पर प्रकाशित कर दी गई है!");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("पोस्ट बनाने में त्रुटि हुई।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic show/hide bottom nav on scroll
  const [showBottomNav, setShowBottomNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    initializeCommunityData();

    // Scroll listener for mobile bottom nav
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 0) { ticking = false; return; }

          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            setShowBottomNav(false);
          } else if (currentScrollY < lastScrollY.current) {
            setShowBottomNav(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Listen for custom post creation triggers
    const handleOpenCreate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.type) {
        setCreatePostType(customEvent.detail.type);
      }
      setCreateModalOpen(true);
    };

    window.addEventListener("yuvakshar:openCreateModal", handleOpenCreate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("yuvakshar:openCreateModal", handleOpenCreate);
    };
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/community?search=${encodeURIComponent(searchVal.trim())}`);
  };

  // Profile completion helper
  const calculateProfileCompletion = () => {
    if (!currentUser) return 0;
    let score = 0;
    if (currentUser.avatar_url) score += 25;
    if (currentUser.bio) score += 25;
    if (currentUser.interests && currentUser.interests.length > 0) score += 25;
    if (currentUser.location) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050A15] text-slate-800 dark:text-slate-200 font-sans pb-16 lg:pb-0">
      
      {/* ─── MOBILE TOP BAR (Hidden on Desktop) ─── */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 h-[56px] flex items-center justify-between transition-all">
        <Link href="/" className="flex items-center space-x-1.5 text-xs font-hindi font-bold text-slate-500 hover:text-primary bg-slate-100 dark:bg-slate-900 px-2 py-1.5 rounded-full transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य युवाक्षर</span>
        </Link>
        
        <Link href="/community" className="text-lg font-serif font-black tracking-wide text-primary flex items-center gap-1.5 font-hindi absolute left-1/2 -translate-x-1/2">
          <span>🏛️ चौपाल</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button className="text-slate-500 dark:text-slate-400 p-1">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/community/messages" className="relative text-slate-500 dark:text-slate-400 p-1">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-[#0A0F1D] rounded-full"></span>
          </Link>
        </div>
      </div>

      {/* ─── DEDICATED DESKTOP HEADER (Hidden on Mobile) ─── */}
      <header className="hidden lg:flex sticky top-0 z-50 h-[64px] bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 items-center px-6 transition-all w-full">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          
          <div className="flex items-center space-x-8">
            <Link href="/community" className="text-2xl font-serif font-black tracking-wide text-primary flex items-center gap-2 font-hindi hover:opacity-90 transition-opacity">
              <span>🏛️ युवाक्षर चौपाल</span>
            </Link>
            
            {/* Desktop Exit Chaupal Button */}
            <Link href="/" className="flex items-center space-x-2 text-sm font-hindi font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-2 rounded-full">
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य युवाक्षर पर वापस जाएँ</span>
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-lg hidden xl:block">
            <input 
              type="text" 
              placeholder="चौपाल पर खोजें..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#111827] border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:bg-white dark:focus:bg-[#0A0F1D] focus:outline-none rounded-full px-5 py-2.5 pl-11 text-sm transition-all font-hindi"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-2.5" />
          </form>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <Link href={`/community/authors/${currentUser.slug || currentUser.id}`} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 uppercase shrink-0 overflow-hidden hover:scale-105 transition-all">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name[0]
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN 3-COLUMN ARCHITECTURE ─── */}
      <div className="max-w-[1440px] mx-auto px-0 lg:px-6 py-0 lg:py-6 w-full flex justify-center">
        <div className={`w-full flex ${isChatOpen ? "max-w-full" : "max-w-[1200px]"} gap-6`}>
          
          {/* ─── LEFT SIDEBAR (Desktop Fixed) ─── */}
          {!isChatOpen && (
            <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] pb-6 overflow-y-auto scrollbar-none space-y-6">
              
              <nav className="flex flex-col space-y-1">
                {sidebarLinks?.map((link) => {
                  const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/community");
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-[15px] font-hindi transition-all ${
                        isActive
                          ? "font-black text-slate-900 dark:text-white bg-slate-150/50 dark:bg-slate-800/40"
                          : "font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      <Icon className={`w-[26px] h-[26px] ${isActive ? "text-primary stroke-[2.5px]" : "stroke-[2px]"}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <button 
                onClick={() => { setCreatePostType("text"); setCreateModalOpen(true); }}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold font-hindi rounded-full py-4 shadow-lg hover:shadow-primary/25 transition-all text-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 stroke-[3px]" />
                नई चौपाल पोस्ट
              </button>

              {currentUser && (
                <div className="mt-auto pt-6">
                  <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/40 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A2234] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden flex justify-center items-center font-bold text-primary">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : currentUser.name[0]}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-white truncate font-hindi">{currentUser.name}</span>
                      <span className="text-[11px] text-slate-500 truncate font-mono">@{currentUser.id}</span>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}

          {/* ─── CENTER CONTENT AREA (Dynamic width) ─── */}
          <main className="flex-1 w-full min-w-0 relative pb-20 lg:pb-0">
            {children}
          </main>

          {/* ─── RIGHT CONTEXT PANEL (Desktop Extra) ─── */}
          {!isChatOpen && (
            <aside className="hidden xl:flex flex-col w-[320px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] pb-6 overflow-y-auto scrollbar-none space-y-6">
              
              <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-200/50 dark:border-slate-800/40 p-4">
                <h3 className="text-lg font-black font-hindi text-slate-800 dark:text-white mb-4">ट्रेंडिंग विषय</h3>
                <div className="space-y-4">
                  {[
                    { topic: "हिंदी साहित्य", posts: "4.2k" },
                    { topic: "लेखक की चुनौतियां", posts: "2.1k" },
                    { topic: "डिजिटल प्रकाशन", posts: "1.5k" },
                    { topic: "आधुनिक कविता", posts: "984" },
                  ]?.map((t, idx) => (
                    <div key={idx} className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="text-[11px] text-slate-500 font-hindi">#Trending {idx+1}</div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 font-hindi">{t.topic}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{t.posts} posts</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl border border-slate-200/50 dark:border-slate-800/40 p-4">
                <h3 className="text-lg font-black font-hindi text-slate-800 dark:text-white mb-4">सुझाए गए सदस्य</h3>
                <div className="space-y-4">
                  {[
                    { id: "ramesh-chandra", name: "डॉ. रमेश चंद्र", role: "प्रख्यात साहित्यकार" },
                    { id: "kavita-tiwari", name: "कविता तिवारी", role: "युवा कवयित्री" },
                    { id: "sumit-sharma", name: "सुमित शर्मा", role: "समीक्षक" },
                  ]?.map((author, idx) => (
                    <Link key={idx} href={`/community/u/${author.id}`} className="flex items-center gap-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-primary">
                        {author.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 font-hindi truncate hover:text-primary transition-colors">{author.name}</div>
                        <div className="text-[11px] text-slate-500 font-hindi truncate">{author.role}</div>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert("फ़ॉलो किया गया!"); }}
                        className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold font-hindi hover:opacity-90"
                      >
                        Follow
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>
          )}
        </div>
      </div>

      {/* ─── DEDICATED CHAUPAL MOBILE BOTTOM NAV ─── */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          showBottomNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-around h-14 pb-safe">
          <Link href="/community" className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/community" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            <Home className={`w-6 h-6 ${pathname === "/community" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          </Link>
          <Link href="/community/search" className={`flex flex-col items-center justify-center w-full h-full ${pathname === "/community/search" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            <Search className={`w-6 h-6 ${pathname === "/community/search" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
          </Link>
          
          <button 
            onClick={() => { setCreatePostType("text"); setCreateModalOpen(true); }}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg -mt-4 shadow-primary/30 active:scale-95 transition-transform">
              <Plus className="w-5 h-5 text-white stroke-[3px]" />
            </div>
          </button>

          <Link href="/community/notifications" className={`flex flex-col items-center justify-center w-full h-full relative ${pathname === "/community/notifications" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            <Bell className={`w-6 h-6 ${pathname === "/community/notifications" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
            <span className="absolute top-2 right-[calc(50%-12px)] w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#0A0F1D]"></span>
          </Link>
          <Link href={currentUser ? `/community/authors/${currentUser.id}` : "/community"} className={`flex flex-col items-center justify-center w-full h-full ${pathname?.includes("/authors/") ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" className="w-6 h-6 rounded-full border-2 border-transparent" />
            ) : (
              <Users className={`w-6 h-6 ${pathname?.includes("/authors/") ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
            )}
          </Link>
        </div>
      </div>

      {/* ─── CREATE POST MODAL ─── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-200 font-hindi"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-serif font-black text-base md:text-lg text-primary flex items-center gap-2">
                  <span>🏛️</span>
                  <span>नई चौपाल प्रविष्टि ({createPostType === 'poetry' ? 'कविता' : createPostType === 'thought' ? 'विचार' : createPostType === 'poll' ? 'मतदान' : 'लेख'})</span>
                </span>
                <button 
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreatePostSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Select Group / Channel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">चौपाल समूह चुनें</label>
                  <select 
                    value={formGroupId}
                    onChange={(e) => setFormGroupId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-xs"
                  >
                    <option value="">सार्वजनिक चौपाल (Public Feed)</option>
                    {availableGroups?.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Post Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">प्रकार</label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    {[
                      { id: "text", name: "📝 लेख" },
                      { id: "poetry", name: "✍️ कविता" },
                      { id: "thought", name: "💭 विचार" },
                      { id: "poll", name: "❓ मतदान" },
                      { id: "image", name: "🖼️ चित्र" }
                    ]?.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCreatePostType(t.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          createPostType === t.id
                            ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
                            : "text-slate-450 hover:text-slate-500"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                {createPostType !== "thought" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">शीर्षक (वैकल्पिक)</label>
                    <input
                      type="text"
                      placeholder="पोस्ट का शीर्षक..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-xs"
                    />
                  </div>
                )}

                {/* Media URL for Image Attachment */}
                {createPostType === "image" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">चित्र यूआरएल (Image URL)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-xs font-mono"
                    />
                  </div>
                )}

                {/* Poll Inputs */}
                {createPostType === "poll" && (
                  <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">मतदान का सवाल</label>
                      <input
                        type="text"
                        placeholder="जैसे: आपकी पसंदीदा विधा क्या है?"
                        value={formPollQuestion}
                        onChange={(e) => setFormPollQuestion(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>विकल्प (Options)</span>
                        <button
                          type="button"
                          onClick={() => setFormPollOptions([...formPollOptions, ""])}
                          className="text-primary hover:underline font-bold text-[10px] bg-transparent border-none cursor-pointer"
                        >
                          + नया विकल्प
                        </button>
                      </label>
                      {formPollOptions?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`विकल्प ${idx + 1}...`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...formPollOptions];
                              updated[idx] = e.target.value;
                              setFormPollOptions(updated);
                            }}
                            className="flex-grow bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary text-xs"
                          />
                          {formPollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setFormPollOptions(formPollOptions.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-600 font-bold text-xs bg-transparent border-none cursor-pointer"
                            >
                              X
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">विचार/सामग्री</label>
                  <textarea
                    rows={6}
                    placeholder="विचारों को आवाज़ दीजिए..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary text-xs leading-relaxed"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-855 transition-colors text-xs cursor-pointer font-bold bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formContent.trim()}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all text-xs cursor-pointer font-bold disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? "प्रकाशित हो रहा है..." : <><Check className="w-3.5 h-3.5" /> प्रकाशित करें</>}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
