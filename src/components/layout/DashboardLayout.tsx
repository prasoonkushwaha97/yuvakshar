"use client";
import Image from "next/image";


import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Search, Bell, Moon, 
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
import { getCanonicalProfileUrl } from "@/utils/username";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "founder" | "admin" | "editorial" | "author"; // Maps to the workspace
}

export default function DashboardLayout({ children, role: workspace }: DashboardLayoutProps) {
  const { currentUser, currentUserRoles } = useCms();
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

  // Define navigation sections for the specific workspace
  // They are only visible if the user possesses one of the required roles
  const getWorkspaceNav = () => {
    switch (workspace) {
      case "founder":
        return [
          {
            title: "Content Management",
            items: [
              { label: "Articles", href: "/admin/articles", icon: FileText },
              { label: "Categories", href: "/admin/categories", icon: Layers },
              { label: "Magazine", href: "/admin/magazine", icon: BookOpen },
              { label: "Videos", href: "/admin/videos", icon: Video },
            ]
          },
          {
            title: "Editorial",
            items: [
              { label: "Reviews", href: "/admin/reviews", icon: CheckSquare },
              { label: "Workflow", href: "/admin/workflow", icon: Activity },
            ]
          },
          {
            title: "Community",
            items: [
              { label: "Authors", href: "/admin/authors", icon: User },
              { label: "Communities", href: "/admin/communities", icon: UsersRound },
              { label: "Comments", href: "/admin/comments", icon: MessageSquare },
            ]
          },
          {
            title: "Governance",
            items: [
              { label: "Users", href: "/admin/users", icon: Users },
              { label: "Roles", href: "/admin/roles", icon: Shield },
              { label: "Permissions", href: "/admin/permissions", icon: Key },
              { label: "Audit Logs", href: "/admin/audit", icon: ClipboardList },
            ]
          },
          {
            title: "System",
            items: [
              { label: "Analytics", href: "/admin/analytics", icon: LineChart },
              { label: "Monitoring", href: "/admin/monitoring", icon: Server },
              { label: "Settings", href: "/admin/system", icon: Settings },
            ]
          }
        ];
      case "admin":
        return [
          {
            title: "Operations",
            items: [
              { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
              { label: "Users", href: "/admin/users", icon: Users, roles: ["admin"] },
              { label: "Communities", href: "/admin/communities", icon: UsersRound, roles: ["admin", "moderator"] },
              { label: "Comments", href: "/admin/comments", icon: MessageSquare, roles: ["admin", "moderator"] },
              { label: "Moderation", href: "/admin/moderation", icon: Shield, roles: ["admin", "moderator"] },
              { label: "Reports", href: "/admin/reports", icon: ClipboardList, roles: ["admin", "moderator"] },
            ]
          }
        ];
      case "editorial":
        return [
          {
            title: "Publishing",
            items: [
              { label: "Editorial Desk", href: "/admin", icon: LayoutDashboard },
              { label: "Articles", href: "/admin/articles", icon: FileText, roles: ["editor_in_chief", "managing_editor", "editor"] },
              { label: "Categories", href: "/admin/categories", icon: Layers, roles: ["editor_in_chief"] },
              { label: "Magazine", href: "/admin/magazine", icon: BookOpen, roles: ["editor_in_chief"] },
              { label: "Reviews", href: "/admin/reviews", icon: CheckSquare, roles: ["editor_in_chief", "editor"] },
              { label: "Workflow", href: "/admin/workflow", icon: Activity, roles: ["editor_in_chief", "managing_editor", "editor"] },
              { label: "Assignments", href: "/admin/assignments", icon: ClipboardList, roles: ["editor_in_chief", "managing_editor"] },
              { label: "Publishing Queue", href: "/admin/queue", icon: CheckSquare, roles: ["editor_in_chief", "managing_editor"] },
              { label: "Fact Check Queue", href: "/admin/fact-check", icon: Shield, roles: ["fact_checker"] },
            ]
          }
        ];
      case "author":
        return [
          {
            title: "Author Workspace",
            items: [
              { label: "My Articles", href: "/author", icon: LayoutDashboard },
              { label: "Drafts", href: "/author/drafts", icon: FileText },
              { label: "Review Notes", href: "/author/reviews", icon: MessageSquare },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const navSections = getWorkspaceNav();

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
          {navSections?.map((section, idx) => {
            // Filter items inside section based on currentUserRoles
            const visibleItems = section.items.filter(item => {
              if (!item.roles) return true; // Accessible to everyone in this workspace
              return item.roles.some((r: string) => currentUserRoles.includes(r) || currentUserRoles.includes('founder') || currentUserRoles.includes('co_founder') || currentUserRoles.includes('super_admin'));
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems?.map(item => {
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
                placeholder="कुछ भी खोजें..." 
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
                      <Image src={currentUser.avatar_url} alt={currentUser?.name} className="w-full h-full object-cover" fill sizes="40px" />
                    ) : (
                      currentUser?.name ? currentUser.name[0] : "U"
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none mb-1">{currentUser?.name || "प्रशासन"}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">{workspace}</span>
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
                        <Link href={getCanonicalProfileUrl(currentUser)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
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
