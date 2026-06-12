"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserPlus
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { initializeCommunityData } from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";

const sidebarLinks = [
  { name: "कम्युनिटी फीड", href: "/community", icon: Home },
  { name: "समूह और क्लब", href: "/community/groups", icon: Users },
  { name: "चर्चा मंच", href: "/community/discussions", icon: MessageSquare },
  { name: "साहित्यिक चुनौतियां", href: "/community/challenges", icon: Trophy },
  { name: "ज्ञान केंद्र", href: "/community/knowledge-hub", icon: BookOpen },
  { name: "साहित्यिक कार्यक्रम", href: "/community/events", icon: Calendar },
  { name: "निजी संदेश", href: "/community/messages", icon: MessageSquare },
  { name: "सूचनाएं", href: "/community/notifications", icon: Bell },
  { name: "मेरी लाइब्रेरी", href: "/community/bookmarks", icon: Bookmark }
];

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { currentUser } = useCms();

  useEffect(() => {
    // Seed and sync mock community entries
    initializeCommunityData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-800 dark:text-slate-200">
      
      {/* Community Header Banner */}
      <div className="relative bg-gradient-to-r from-orange-600 to-amber-500 text-white py-12 px-6 md:px-12 overflow-hidden shadow-sm">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute -bottom-8 left-12 w-48 h-48 bg-black/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wide font-hindi">युवाक्षर चौपाल (Community)</h1>
            <p className="text-xs md:text-sm text-amber-50/90 font-serif font-medium leading-relaxed max-w-xl">
              युवाओं, लेखकों और विचारकों का साहित्यिक सामाजिक नेटवर्क। यहाँ पढ़ें, लिखें, विमर्श करें और अपनी पहचान बनाएं।
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/submit-article" 
              className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shrink-0 font-hindi"
            >
              नया लेख पोस्ट करें
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── LEFT COLUMN: Sticky Navigation Sidebar (cols 1-3) ─── */}
          <aside className="lg:col-span-3 lg:sticky lg:top-[80px] space-y-4">
            <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
              <div className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.href === "/community" 
                    ? pathname === "/community" 
                    : pathname?.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4.5 h-4.5" />
                        <span className="font-hindi">{link.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? "text-white" : "text-slate-400"}`} />
                    </Link>
                  );
                })}
              </div>
            </GlassCard>

            {/* Quick Profile Overview widget */}
            {currentUser && (
              <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-primary uppercase">
                      {currentUser.name ? currentUser.name[0] : "U"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate font-hindi">{currentUser.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">@{currentUser.slug || "user"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <div>
                    <span className="block text-xs font-black text-primary">0</span>
                    <span className="text-[9px] text-slate-400 font-serif">प्रतिष्ठा अंक</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                      Bronze
                    </span>
                    <span className="text-[9px] text-slate-400 font-serif">रैंक टियर</span>
                  </div>
                </div>
              </GlassCard>
            )}
          </aside>

          {/* ─── CENTER COLUMN: Main Content Area (cols 4-9) ─── */}
          <main className="lg:col-span-6 space-y-6">
            {children}
          </main>

          {/* ─── RIGHT COLUMN: Suggested Widgets (cols 10-12) (Desktop only) ─── */}
          <aside className="hidden lg:col-span-3 lg:sticky lg:top-[80px] space-y-6">
            
            {/* Trending topics widget */}
            <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800/65 mb-3">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-xs font-bold font-serif font-hindi">चर्चित विषय (Trending Topics)</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { tag: "निराला_जयंती", count: "48 पोस्ट" },
                  { tag: "गोदान_चर्चा", count: "32 पोस्ट" },
                  { tag: "छायावाद_सत्र", count: "25 पोस्ट" },
                  { tag: "कहानी_चुनौती", count: "19 पोस्ट" }
                ].map((t) => (
                  <div key={t.tag} className="flex justify-between items-center text-xs">
                    <Link href={`/community/discussions?q=${t.tag}`} className="text-primary hover:underline font-bold font-mono">
                      #{t.tag}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-mono">{t.count}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Suggested Writers widget */}
            <GlassCard className="p-4 border-slate-200/60 dark:border-slate-800/40">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800/65 mb-3">
                <UserPlus className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-xs font-bold font-serif font-hindi">सुझाए गए लेखक</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "प्रो. सतीश चंद्र", role: "वरिष्ठ आलोचक", slug: "satish-chandra" },
                  { name: "कविता राय", "role": "कवयित्री", slug: "kavita-rai" }
                ].map((writer) => (
                  <div key={writer.slug} className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase shrink-0">
                        {writer.name[0]}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/community/profile/${writer.slug}`} className="block text-[11px] font-bold text-slate-800 dark:text-white truncate font-hindi hover:text-primary">
                          {writer.name}
                        </Link>
                        <span className="block text-[9px] text-slate-400 truncate font-serif">{writer.role}</span>
                      </div>
                    </div>
                    <button className="text-[9px] font-bold text-primary border border-primary/30 rounded-lg px-2 py-1 hover:bg-primary/5 cursor-pointer shrink-0 font-hindi">
                      फॉलो
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Platform rules / footer credits */}
            <div className="px-2 text-[10px] text-slate-400 space-y-1 font-serif">
              <p>युवाक्षर चौपाल © 2026. सर्वाधिकार सुरक्षित।</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <Link href="/privacy-policy" className="hover:underline">गोपनीयता</Link>
                <span>•</span>
                <Link href="/terms-and-conditions" className="hover:underline">नियम</Link>
                <span>•</span>
                <Link href="/editorial-policy" className="hover:underline">संपादकीय</Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
