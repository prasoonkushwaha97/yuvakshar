"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Search, Bell, Moon, Sun, 
  LayoutDashboard, FileText, Layers, BookOpen, Video,
  CheckSquare, Activity,
  Users, UsersRound, MessageSquare,
  Shield, Key, ClipboardList,
  Settings, LineChart, Server,
  LogOut, ChevronDown, User
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "founder" | "admin" | "editor" | "moderator";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { currentUser } = useCms();
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("सफलतापूर्वक लॉग आउट हो गए");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("लॉग आउट करने में त्रुटि");
    }
  };

  // Define navigation sections
  const navSections = [
    {
      title: "Dashboard",
      items: [
        { label: "Overview", href: `/${role}`, icon: LayoutDashboard, roles: ["founder", "admin", "editor", "moderator"] },
      ]
    },
    {
      title: "Content Management",
      roles: ["founder", "admin", "editor"],
      items: [
        { label: "Articles", href: `/${role}/articles`, icon: FileText },
        { label: "Categories", href: `/${role}/categories`, icon: Layers },
        { label: "Magazine", href: `/${role}/magazine`, icon: BookOpen },
        { label: "Videos", href: `/${role}/videos`, icon: Video },
      ]
    },
    {
      title: "Editorial",
      roles: ["founder", "admin", "editor"],
      items: [
        { label: "Reviews", href: `/${role}/reviews`, icon: CheckSquare },
        { label: "Workflow", href: `/${role}/workflow`, icon: Activity },
      ]
    },
    {
      title: "Community",
      roles: ["founder", "admin", "moderator"],
      items: [
        { label: "Authors", href: `/${role}/authors`, icon: User },
        { label: "Communities", href: `/${role}/communities`, icon: UsersRound },
        { label: "Comments", href: `/${role}/comments`, icon: MessageSquare },
      ]
    },
    {
      title: "Governance",
      roles: ["founder", "admin"],
      items: [
        { label: "Users", href: `/${role}/users`, icon: Users },
        { label: "Roles", href: `/${role}/roles`, icon: Shield, roles: ["founder"] },
        { label: "Permissions", href: `/${role}/permissions`, icon: Key, roles: ["founder"] },
        { label: "Audit Logs", href: `/${role}/audit`, icon: ClipboardList, roles: ["founder"] },
      ]
    },
    {
      title: "System",
      roles: ["founder"],
      items: [
        { label: "Settings", href: `/${role}/system`, icon: Settings },
        { label: "Analytics", href: `/${role}/analytics`, icon: LineChart },
        { label: "Monitoring", href: `/${role}/monitoring`, icon: Server },
      ]
    }
  ];

  if (!mounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/" className="font-serif font-bold text-xl text-primary tracking-wide">
            युवाक्षर CMS
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section, idx) => {
            // Filter section by role
            if (section.roles && !section.roles.includes(role)) return null;

            // Filter items inside section
            const visibleItems = section.items.filter(item => !item.roles || item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-md px-3 py-1.5 w-64 border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent text-sm w-full outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <Moon className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] overflow-hidden shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold uppercase text-primary">
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser?.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser?.name ? currentUser.name[0] : "U"
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none mb-1">{currentUser?.name || "Admin"}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">{role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
                          <User className="w-4 h-4 mr-3 text-slate-400" />
                          My Profile
                        </Link>
                        <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
                          <Settings className="w-4 h-4 mr-3 text-slate-400" />
                          Account Settings
                        </Link>
                      </div>
                      <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
