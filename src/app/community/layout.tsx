"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Trophy, 
  BookOpen, 
  Search,
  Bookmark,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Plus,
  Compass,
  FileText,
  Heart,
  Share2,
  X,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Settings
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { getLiteraryIdentities } from "@/lib/repositoryService";
import { 
  initializeCommunityData, 
  fetchChallenges, 
  fetchPosts, 
  CommunityChallenge, 
  CommunityPost 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import confetti from "canvas-confetti";
function getEventCountdown(eventDate: string) {
  const target = new Date(eventDate).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  if (diff <= 0) return "समाप्त / जारी";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 65));
  
  if (days > 0) return `${days} दिन, ${hours} घंटे`;
  return `${hours} घंटे शेष`;
}

// Sidebar Links - Redesigned to fit user specifications
const sidebarLinks = [
  { name: "🏛️ चौपाल", href: "/community", icon: Home },
  { name: "👥 समूह एवं क्लब", href: "/community/groups", icon: Users },
  { name: "💬 चर्चा मंच", href: "/community/discussion", icon: MessageSquare },
  { name: "📨 निजी संदेश", href: "/community/messages", icon: MessageCircle },
  { name: "🏆 साहित्यिक चुनौतियाँ", href: "/community/challenges", icon: Trophy },
  { name: "📅 साहित्यिक कार्यक्रम", href: "/community/events", icon: Calendar },
  { name: "📚 ज्ञान केंद्र", href: "/community/knowledge-hub", icon: BookOpen },
  { name: "🔖 मेरी लाइब्रेरी", href: "/community/bookmarks", icon: Bookmark },
  { name: "⚙️ सेटिंग्स", href: "/community/settings", icon: Settings }
];

// Horizontal swipe tabs (Excludes Knowledge Hub from primary tabs)
const horizontalTabs = [
  { name: "चौपाल", href: "/community", exact: true, icon: Home },
  { name: "समूह", href: "/community/groups", exact: false, icon: Users },
  { name: "चर्चा", href: "/community/discussion", exact: false, icon: MessageSquare },
  { name: "संदेश", href: "/community/messages", exact: false, icon: MessageCircle },
  { name: "चुनौतियाँ", href: "/community/challenges", exact: false, icon: Trophy },
  { name: "कार्यक्रम", href: "/community/events", exact: false, icon: Calendar }
];

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090D16] text-slate-500 font-serif text-sm">
        चौपाल लोड हो रही है...
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

  // Sidebar widgets states
  const [sidebarChallenges, setSidebarChallenges] = useState<CommunityChallenge[]>([]);
  const [sidebarEvents, setSidebarEvents] = useState<any[]>([]);
  const [postsForRep, setPostsForRep] = useState<CommunityPost[]>([]);

  // Create Post Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPostType, setCreatePostType] = useState<"text" | "poetry" | "thought" | "poll" | "image" | "event" | "challenge">("text");
  const [composerTitle, setComposerTitle] = useState("");
  const [composerContent, setComposerContent] = useState("");
  const [composerLink, setComposerLink] = useState("");
  const [composerGroup, setComposerGroup] = useState("");
  const [composerTags, setComposerTags] = useState("");

  // Auto-saved draft key
  const draftKey = `yuvakshar_draft_${currentUser?.id || "anon"}`;
  const [hasDraftToRecover, setHasDraftToRecover] = useState(false);

  // Dynamic show/hide bottom nav on scroll
  const [showBottomNav, setShowBottomNav] = useState(true);
  const lastScrollY = useRef(0);

  // Universal Share State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  useEffect(() => {
    initializeCommunityData();

    // Scroll listener for mobile bottom nav
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowBottomNav(false);
      } else {
        setShowBottomNav(true);
      }
      lastScrollY.current = currentScrollY;
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

    // Listen for custom share triggers
    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setShareData({
          title: customEvent.detail.title || "युवाक्षर चौपाल",
          url: customEvent.detail.url || window.location.href
        });
        setShareModalOpen(true);
      }
    };

    window.addEventListener("yuvakshar:openCreateModal", handleOpenCreate);
    window.addEventListener("yuvakshar:openShareModal", handleOpenShare);

    // Sidebar widgets dynamic loading
    const loadSidebarData = async () => {
      try {
        const ch = await fetchChallenges();
        setSidebarChallenges(ch.slice(0, 2));

        const pts = await fetchPosts();
        setPostsForRep(pts);

        const savedEvt = localStorage.getItem("yuvakshar_c_events");
        if (savedEvt) {
          const parsed = JSON.parse(savedEvt);
          setSidebarEvents(parsed.filter((e: any) => new Date(e.event_date).getTime() > new Date().getTime()).slice(0, 2));
        } else {
          const defaultEvents = [
            { id: "evt-1", title: "सृजनात्मक कहानी लेखन कार्यशाला", type: "Workshop", event_date: "2026-06-28T15:00:00Z", attendeesCount: 45, rsvp: "none" },
            { id: "evt-2", title: "आधुनिक हिंदी साहित्य: नई दिशाएं", type: "Webinar", event_date: "2026-06-30T17:00:00Z", attendeesCount: 82, rsvp: "interested" }
          ];
          setSidebarEvents(defaultEvents);
          localStorage.setItem("yuvakshar_c_events", JSON.stringify(defaultEvents));
        }
      } catch (err) {
        console.error("Failed to load sidebar metrics:", err);
      }
    };
    loadSidebarData();

    // Listen to event updates
    const handleEventsUpdated = () => {
      const savedEvt = localStorage.getItem("yuvakshar_c_events");
      if (savedEvt) {
        const parsed = JSON.parse(savedEvt);
        setSidebarEvents(parsed.filter((e: any) => new Date(e.event_date).getTime() > new Date().getTime()).slice(0, 2));
      }
    };
    window.addEventListener("yuvakshar:eventsUpdated", handleEventsUpdated);

    // Check for draft recovery on mount
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setHasDraftToRecover(true);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("yuvakshar:openCreateModal", handleOpenCreate);
      window.removeEventListener("yuvakshar:openShareModal", handleOpenShare);
      window.removeEventListener("yuvakshar:eventsUpdated", handleEventsUpdated);
    };
  }, [currentUser, draftKey]);
  // Draft Auto-saving
  useEffect(() => {
    if (!createModalOpen || (!composerTitle && !composerContent)) return;
    
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({
        title: composerTitle,
        content: composerContent,
        type: createPostType,
        link: composerLink,
        group: composerGroup,
        tags: composerTags,
        timestamp: new Date().toISOString()
      }));
    }, 3000); // Auto save every 3s

    return () => clearTimeout(timer);
  }, [composerTitle, composerContent, createModalOpen, createPostType, composerLink, composerGroup, composerTags, draftKey]);

  // Recover Draft
  const recoverDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setComposerTitle(parsed.title || "");
      setComposerContent(parsed.content || "");
      setCreatePostType(parsed.type || "text");
      setComposerLink(parsed.link || "");
      setComposerGroup(parsed.group || "");
      setComposerTags(parsed.tags || "");
      setHasDraftToRecover(false);
      alert("प्रारूप सफलतापूर्वक पुनर्प्राप्त कर लिया गया!");
    }
  };

  // Discard Draft
  const discardDraft = () => {
    localStorage.removeItem(draftKey);
    setHasDraftToRecover(false);
  };

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/community?search=${encodeURIComponent(searchVal.trim())}`);
  };

  // Handle Create Post Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!composerContent.trim() && createPostType !== "poll") return;

    // Dispatch custom event to notify page.tsx to append new post
    const eventDetail = {
      user_id: currentUser.id,
      user_name: currentUser.name,
      content: composerContent,
      post_type: createPostType === "poetry" ? "text" : (createPostType === "thought" ? "text" : createPostType), // Map types
      extra: {
        title: composerTitle || undefined,
        link_url: composerLink || undefined,
        tags: composerTags ? composerTags.split(",").map(t => t.trim()) : undefined,
        group_id: composerGroup || undefined
      }
    };

    window.dispatchEvent(new CustomEvent("yuvakshar:postCreated", { detail: eventDetail }));
    
    // Clear states and close
    setComposerTitle("");
    setComposerContent("");
    setComposerLink("");
    setComposerGroup("");
    setComposerTags("");
    localStorage.removeItem(draftKey);
    setCreateModalOpen(false);

    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Follow utility handler
  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) {
      alert("अनुसरण करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      await followAuthor(userId, currentUser.id);
      confetti({ particleCount: 30, spread: 30 });
    } catch (err) {
      console.error(err);
    }
  };

  // Share action handlers
  const handleShareClick = (platform: string) => {
    const shareUrl = encodeURIComponent(shareData.url);
    const shareText = encodeURIComponent(shareData.title);
    
    let href = "";
    switch (platform) {
      case "whatsapp":
        href = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;
        break;
      case "telegram":
        href = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
        break;
      case "x":
        href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
        break;
      case "facebook":
        href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "linkedin":
        href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case "email":
        href = `mailto:?subject=${shareText}&body=${shareUrl}`;
        break;
      case "native":
        if (navigator.share) {
          navigator.share({
            title: shareData.title,
            url: shareData.url
          }).catch(console.error);
          setShareModalOpen(false);
          return;
        } else {
          platform = "copy";
        }
        break;
    }

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(shareData.url);
      alert("लिंक कॉपी कर लिया गया है!");
    }
    setShareModalOpen(false);
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

  // Sidebar dynamic widgets utility functions
  const getDeadlineProgress = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const nowTime = new Date().getTime();
    if (nowTime >= endTime) return 100;
    if (nowTime <= startTime) return 0;
    const total = endTime - startTime;
    const current = nowTime - startTime;
    return Math.round((current / total) * 100);
  };

  const getDynamicRepScore = () => {
    if (!currentUser) return 100;
    const base = 100;
    const userPosts = postsForRep.filter(p => p.user_id === currentUser.id);
    const postPts = userPosts.length * 15;
    const totalLikes = userPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const likePts = totalLikes * 5;
    const verifPts = currentUser.verification_badge ? 150 : 0;
    const instPts = currentUser.institution ? 50 : 0;
    const followerPts = (currentUser.followers?.length || 0) * 10;
    return base + postPts + likePts + verifPts + instPts + followerPts;
  };
  const repScore = getDynamicRepScore();

  const handleSidebarRsvp = (eventId: string) => {
    if (!currentUser) {
      alert("प्रतिक्रिया दर्ज करने के लिए कृपया लॉगिन करें।");
      return;
    }
    const savedEvt = localStorage.getItem("yuvakshar_c_events");
    if (savedEvt) {
      const parsed = JSON.parse(savedEvt);
      const updated = parsed.map((e: any) => {
        if (e.id === eventId) {
          const isGoing = e.rsvp === "going";
          return {
            ...e,
            rsvp: isGoing ? "none" : "going",
            attendeesCount: isGoing ? Math.max(0, e.attendeesCount - 1) : e.attendeesCount + 1
          };
        }
        return e;
      });
      localStorage.setItem("yuvakshar_c_events", JSON.stringify(updated));
      setSidebarEvents(updated.filter((e: any) => new Date(e.event_date).getTime() > new Date().getTime()).slice(0, 2));
      
      // Dispatch custom event to notify events page
      window.dispatchEvent(new CustomEvent("yuvakshar:eventsUpdated"));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-200 font-sans pb-12 lg:pb-0">
      
      {/* ─── 1. SMART COMMUNITY HEADER (Height: 56px desktop, 52px mobile) ─── */}
      {!isChatOpen && (
        <header className="sticky top-0 z-50 h-[52px] md:h-[56px] bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 max-w-7xl mx-auto w-full transition-all">
          {/* Left: Brand */}
          <div className="flex items-center space-x-2">
            <Link href="/community" className="text-base md:text-lg font-serif font-black tracking-wide text-slate-850 dark:text-white flex items-center gap-1.5 font-hindi hover:text-primary transition-colors">
              <span className="text-lg md:text-xl">🏛️</span>
              <span>चौपाल</span>
            </Link>
          </div>

          {/* Center: Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-72 lg:w-96">
            <input 
              type="text" 
              placeholder="चौपाल पर रचनाएं, समूह या लेखक खोजें..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:outline-none rounded-full px-4 py-1.5 pl-9 text-xs transition-all font-hindi text-slate-750 dark:text-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3.5">
            <button 
              onClick={() => { setCreatePostType("text"); setCreateModalOpen(true); }}
              className="p-1.5 bg-primary/10 hover:bg-primary/15 text-primary rounded-full transition-all cursor-pointer"
              title="पोस्ट बनाएं"
            >
              <Plus className="w-4 h-4" />
            </button>
            <Link href="/community/notifications" className="relative p-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-all">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-[#0A0F1D]" />
            </Link>
            <Link href="/community/messages" className="relative p-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-all">
              <MessageSquare className="w-4.5 h-4.5" />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white font-mono text-[8px] font-bold h-3.5 min-w-3.5 px-0.5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0A0F1D]">3</span>
            </Link>
            {currentUser ? (
              <Link href={`/community/authors/${currentUser.slug || currentUser.id}`} className="w-7 h-7 rounded-full bg-slate-200 border border-slate-350 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 uppercase shrink-0 overflow-hidden hover:opacity-90">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name[0]
                )}
              </Link>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 uppercase"><Home className="w-4 h-4" /></div>
            )}
          </div>
        </header>
      )}

      {/* ─── 2. STICKY SWIPEABLE NAVIGATION TABS (Hides in Chat) ─── */}
      {!isChatOpen && (
        <nav className="sticky top-[52px] md:top-[56px] z-40 bg-white dark:bg-[#0A0F1D] border-b border-slate-200/60 dark:border-slate-800/60 transition-all">
          <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-none py-2 md:py-2.5 px-4 gap-2 whitespace-nowrap">
            {horizontalTabs.map((tab) => {
              const isActive = tab.exact 
                ? pathname === tab.href 
                : pathname?.startsWith(tab.href) && tab.href !== "/community";
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-1.5 rounded-full text-[11px] md:text-xs font-hindi transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-primary/10 text-primary font-black border border-primary/20 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 font-semibold"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── 3. DRAFT RECOVERY ALERT BANNER ─── */}
      {hasDraftToRecover && !createModalOpen && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-3 rounded-xl flex items-center justify-between text-xs font-serif">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>प्रारूप पुनर्प्राप्ति:</strong> आपके पास एक सहेजा हुआ पुराना पोस्ट प्रारूप है।</span>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <button onClick={recoverDraft} className="text-primary hover:underline font-bold font-hindi cursor-pointer">बहाल करें</button>
              <button onClick={discardDraft} className="text-red-500 hover:text-red-600 font-bold font-hindi cursor-pointer">हटाएं</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. MAIN LAYOUT GRID ─── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 transition-all">
        <div className={`grid grid-cols-1 ${isChatOpen ? "" : "lg:grid-cols-[280px_1fr_320px]"} gap-6 items-start`}>
          
          {/* LEFT SIDEBAR (Desktop only, collapsed in active chat) */}
          {!isChatOpen && (
            <aside className="hidden lg:block lg:sticky lg:top-[125px] space-y-5">
              
              {/* User Profile Card */}
              {currentUser && (
                <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-primary/10 to-amber-500/10 border-b border-slate-200/10" />
                  
                  <div className="relative z-10 flex flex-col items-center pt-2">
                    <Link href={`/community/authors/${currentUser.slug || currentUser.id}`} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-900 bg-slate-250 shadow-sm flex items-center justify-center text-lg font-bold text-primary uppercase shrink-0 overflow-hidden hover:scale-105 transition-all">
                      {currentUser.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name[0]
                      )}
                    </Link>
                    
                    <Link href={`/community/authors/${currentUser.slug || currentUser.id}`} className="block text-xs font-bold text-slate-800 dark:text-white mt-2 hover:text-primary transition-colors font-hindi truncate max-w-full">
                      {currentUser.name}
                    </Link>
                    
                    <span className="block text-[9px] text-slate-400 font-hindi truncate max-w-full">
                      {currentUser.designation || currentUser.role || "योगदानकर्ता"}
                    </span>

                    {currentUser.badges && currentUser.badges.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-1.5 max-w-full">
                        {currentUser.badges.slice(0, 2).map((badge) => (
                          <span key={badge} className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/30 dark:border-slate-800/40 px-1.5 py-0.5 rounded font-hindi">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="w-full mt-3.5 space-y-1 text-left">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-450 font-hindi">प्रोफ़ाइल पूर्णता:</span>
                        <span className="font-mono text-primary font-bold">{calculateProfileCompletion()}%</span>
                      </div>
                      <div className="w-full bg-slate-150 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${calculateProfileCompletion()}%` }} />
                      </div>
                    </div>

                    <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[9px] text-slate-400 font-hindi">
                      <span>⭐ साहित्यिक प्रतिष्ठा:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">{repScore} अंक</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Community Navigation Card */}
              <GlassCard className="p-3.5 border-slate-200/60 dark:border-slate-800/40">
                <div className="space-y-0.5">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === "/community" 
                      ? pathname === "/community" 
                      : pathname?.startsWith(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="font-hindi">{link.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? "text-primary" : "text-slate-455"}`} />
                      </Link>
                    );
                  })}
                </div>
              </GlassCard>
              
            </aside>
          )}

          {/* MAIN CONTAINER */}
          <main className="space-y-6 min-w-0 w-full">
            {children}
          </main>

          {/* RIGHT SIDEBAR (Desktop only, collapsed in active chat) */}
          {!isChatOpen && (
            <aside className="hidden lg:block lg:sticky lg:top-[125px] space-y-6">
              
              {/* Widget 1: 🔥 चर्चित विषय (Clickable hashtags) */}
              <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-855 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-xs font-bold font-hindi">🔥 चर्चित विषय (Hashtags)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["काव्य", "कहानी", "हिंदीसाहित्य", "विचार", "युवालेखन", "शोधविमर्श"].map((tag) => (
                    <Link 
                      key={tag} 
                      href={`/community?search=${encodeURIComponent("#" + tag)}`}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 px-2.5 py-1 rounded-xl text-[10px] font-bold font-hindi text-slate-600 dark:text-slate-400 hover:text-primary transition-all border border-slate-200/35 dark:border-slate-800/40"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </GlassCard>

              {/* Widget 2: ✍️ आज के सक्रिय लेखक */}
              <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-855 mb-3">
                  <UserPlus className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-xs font-bold font-hindi">✍️ आज के सक्रिय लेखक</h3>
                </div>
                <div className="space-y-3">
                  {users.slice(1, 4).map((writer) => {
                    const isFollowingWriter = currentUser && (writer.followers || []).includes(currentUser.id);
                    return (
                      <div key={writer.id} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase shrink-0 overflow-hidden">
                            {writer.avatar_url ? (
                              <img src={writer.avatar_url} alt={writer.name} className="w-full h-full object-cover" />
                            ) : (
                              writer.name[0]
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/community/authors/${writer.slug || writer.id}`} className="block text-[11px] font-bold text-slate-800 dark:text-white truncate font-hindi hover:text-primary">
                              {writer.name}
                            </Link>
                            <span className="block text-[8px] text-slate-400 truncate font-hindi">
                              {getLiteraryIdentities(writer, []).slice(0, 1)[0] || "लेखक"}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleFollowToggle(writer.id)}
                          className={`text-[9px] font-bold rounded-lg px-2.5 py-1 cursor-pointer shrink-0 font-hindi border transition-all ${
                            isFollowingWriter
                              ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                              : "text-slate-650 border-slate-300 hover:bg-slate-55 dark:text-slate-350 dark:border-slate-800 dark:hover:bg-slate-900"
                          }`}
                        >
                          {isFollowingWriter ? "फॉलो किया" : "फॉलो"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Widget 3: 🏆 सक्रिय चुनौतियाँ */}
              <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-855 mb-3">
                  <Trophy className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-xs font-bold font-hindi">🏆 सक्रिय चुनौतियाँ</h3>
                </div>
                <div className="space-y-4">
                  {sidebarChallenges.length > 0 ? (
                    sidebarChallenges.map((chal) => {
                      const deadlineProgress = getDeadlineProgress(chal.start_date, chal.end_date);
                      return (
                        <div key={chal.id} className="space-y-1.5 text-xs">
                          <Link href="/community/challenges" className="block font-bold hover:text-primary transition-colors font-hindi line-clamp-1">
                            {chal.title}
                          </Link>
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-serif">
                            <span>अंतिम तिथि: {new Date(chal.end_date).toLocaleDateString("hi-IN")}</span>
                            <span>🪙 {chal.reward_points} अंक</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-905 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all" style={{ width: `${deadlineProgress}%` }} />
                          </div>
                          
                          {/* Participants mock */}
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[9px] text-slate-450 font-hindi">सहभागी:</span>
                            <div className="flex items-center">
                              <div className="flex -space-x-1.5 overflow-hidden">
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-primary font-mono">K</div>
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-amber-500 font-mono">R</div>
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-green-500 font-mono">V</div>
                              </div>
                              <span className="text-[9px] text-slate-400 ml-1.5 font-bold font-mono">+12</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic font-hindi">कोई सक्रिय चुनौतियाँ नहीं हैं।</p>
                  )}
                </div>
              </GlassCard>

              {/* Widget 4: 📅 आगामी कार्यक्रम */}
              <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-150/60 dark:border-slate-855 mb-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-xs font-bold font-hindi">📅 आगामी कार्यक्रम</h3>
                </div>
                <div className="space-y-4">
                  {sidebarEvents.length > 0 ? (
                    sidebarEvents.map((evt) => {
                      const isGoing = evt.rsvp === "going";
                      const countdown = getEventCountdown(evt.event_date);
                      return (
                        <div key={evt.id} className="space-y-2 text-xs">
                          <div>
                            <Link href="/community/events" className="block font-bold hover:text-primary transition-colors font-hindi line-clamp-1">
                              {evt.title}
                            </Link>
                            <span className="text-[9px] text-slate-400 font-hindi">प्रकार: {evt.type === "Workshop" ? "कार्यशाला" : "वेबिनार"}</span>
                          </div>

                          <div className="flex items-center justify-between text-[9px]">
                            {/* Countdown */}
                            <span className="bg-amber-500/10 text-amber-605 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded font-mono">
                              ⏳ {countdown}
                            </span>
                            
                            {/* Participants */}
                            <div className="flex items-center">
                              <div className="flex -space-x-1.5 overflow-hidden">
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-primary font-mono">S</div>
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-amber-500 font-mono">M</div>
                                <div className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white dark:ring-slate-905 bg-slate-200 text-[8px] flex items-center justify-center font-bold text-green-500 font-mono">A</div>
                              </div>
                              <span className="text-[9px] text-slate-400 ml-1.5 font-bold font-mono">+{evt.attendeesCount}</span>
                            </div>
                          </div>

                          {/* RSVP button */}
                          <button
                            onClick={() => handleSidebarRsvp(evt.id)}
                            className={`w-full py-1.5 rounded-xl font-bold font-hindi transition-all text-[10px] cursor-pointer border ${
                              isGoing
                                ? "bg-green-600 text-white border-transparent"
                                : "bg-primary text-white border-transparent hover:bg-primary/95 shadow-sm shadow-primary/10"
                            }`}
                          >
                            {isGoing ? "शामिल हो रहे हैं ✓" : "भाग लें"}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic font-hindi">कोई आगामी कार्यक्रम नहीं है।</p>
                  )}
                </div>
              </GlassCard>

            </aside>
          )}

        </div>
      </div>

      {/* ─── 5. MOBILE COMMUNITY BOTTOM NAV (Hide in Chat) ─── */}
      {!isChatOpen && (
        <nav 
          style={{ transform: showBottomNav ? "translateY(0)" : "translateY(100%)" }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-855 safe-area-pb transition-transform duration-300 ease-in-out flex justify-around items-stretch h-14"
        >
          {[
            { href: "/community", icon: Home, label: "चौपाल" },
            { href: "/community/groups", icon: Users, label: "समूह" },
            { href: "action:create", icon: Plus, label: "पोस्ट", isAction: true },
            { href: "/community/messages", icon: MessageCircle, label: "संदेश" },
            { href: "/community/notifications", icon: Bell, label: "प्रोफ़ाइल", isProfile: true }
          ].map((item, idx) => {
            const isProfileUrl = item.isProfile && currentUser;
            const targetUrl = isProfileUrl ? `/community/authors/${currentUser.slug || currentUser.id}` : item.href;
            const isActive = pathname === targetUrl;

            if (item.isAction) {
              return (
                <button
                  key={idx}
                  onClick={() => { setCreatePostType("text"); setCreateModalOpen(true); }}
                  className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Plus className="w-5 h-5" />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={targetUrl}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${isActive ? "text-primary font-bold" : "text-slate-450 dark:text-slate-500"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-hindi">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* ─── 6. MOBILE/DESKTOP FAB BUTTON (Bottom Right) ─── */}
      {!isChatOpen && (
        <button
          onClick={() => { setCreatePostType("text"); setCreateModalOpen(true); }}
          className="fixed bottom-[4.5rem] right-4 lg:bottom-6 lg:right-6 z-45 bg-primary hover:bg-primary/95 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
          title="नया साझा करें"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* ─── 7. UNIFIED CREATE POST MODAL (FAB & Composer triggers) ─── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-sm font-bold font-serif font-hindi flex items-center gap-1.5">
                <span>➕</span>
                <span>साझा करें</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-500 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              
              {/* Type Select Row */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "text", label: "✍️ लेख" },
                  { id: "poetry", label: "📝 कविता" },
                  { id: "thought", label: "💭 विचार" },
                  { id: "poll", label: "❓ प्रश्न" },
                  { id: "image", label: "🖼️ चित्र" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCreatePostType(t.id as any)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold font-hindi whitespace-nowrap transition-all cursor-pointer border ${
                      createPostType === t.id
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Title Input */}
              {(createPostType === "text" || createPostType === "poetry") && (
                <input 
                  type="text"
                  value={composerTitle}
                  onChange={(e) => setComposerTitle(e.target.value)}
                  placeholder="शीर्षक (यदि उपयुक्त हो)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl px-4 py-2 text-xs font-hindi focus:outline-none focus:border-primary font-bold text-slate-800 dark:text-slate-200"
                />
              )}

              {/* Link Input */}
              {createPostType === "image" && (
                <input 
                  type="text"
                  value={composerLink}
                  onChange={(e) => setComposerLink(e.target.value)}
                  placeholder="अटैचमेंट URL (उदा. Image URL)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                />
              )}

              {/* Rich text inputs area */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Editor toolbar */}
                <div className="flex items-center space-x-2.5 p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-bold font-mono">
                  <span className="hover:text-primary cursor-pointer px-1">B</span>
                  <span className="hover:text-primary cursor-pointer px-1 italic">I</span>
                  <span className="hover:text-primary cursor-pointer px-1 underline">U</span>
                  <span className="text-slate-350 shrink-0">|</span>
                  <span className="hover:text-primary cursor-pointer">Quote</span>
                  <span className="hover:text-primary cursor-pointer">List</span>
                </div>
                <textarea
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  placeholder={
                    createPostType === "poetry" 
                      ? "अपनी काव्य पंक्तियाँ यहाँ लिखें..."
                      : (createPostType === "thought" ? "अपने विचार लिखें..." : "विवरण दर्ज करें...")
                  }
                  rows={4}
                  className="w-full bg-transparent p-4 text-xs focus:outline-none resize-none font-hindi text-slate-750 dark:text-slate-200"
                  required
                />
              </div>

              {/* Tags & Groups Targeting */}
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text"
                  value={composerTags}
                  onChange={(e) => setComposerTags(e.target.value)}
                  placeholder="टैग (अल्पविराम से अलग करें)"
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-855 rounded-xl px-3 py-2 text-[10px] font-hindi focus:outline-none focus:border-primary"
                />
                <select
                  value={composerGroup}
                  onChange={(e) => setComposerGroup(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-855 rounded-xl px-3 py-2 text-[10px] font-hindi focus:outline-none focus:border-primary"
                >
                  <option value="">चौपाल फ़ीड में पोस्ट करें</option>
                  <option value="g-1">काव्य विमर्श</option>
                  <option value="g-2">उपन्यास समीक्षा</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer font-hindi"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/95 px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/15 cursor-pointer font-hindi"
                >
                  साझा करें
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── 8. UNIVERSAL SHARE MODAL ─── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <h3 className="text-xs font-bold font-serif font-hindi flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" />
                <span>साझा करें (Share Content)</span>
              </h3>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-slate-500 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { id: "whatsapp", label: "WhatsApp", icon: "🟢" },
                { id: "telegram", label: "Telegram", icon: "🔵" },
                { id: "x", label: "X", icon: "⚫" },
                { id: "facebook", label: "Facebook", icon: "🔵" },
                { id: "linkedin", label: "LinkedIn", icon: "🔵" },
                { id: "email", label: "Email", icon: "✉️" },
                { id: "native", label: "Native Share", icon: "📱" },
                { id: "copy", label: "Copy Link", icon: "🔖" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleShareClick(p.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
