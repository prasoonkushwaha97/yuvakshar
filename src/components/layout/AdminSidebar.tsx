"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { hasPermission } from "@/domains/users/permissions";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BookOpen, 
  MessageSquare,
  Image as ImageIcon,
  Video,
  LayoutTemplate
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useCms();
  
  // Note: we fetch the resolved role directly or default to Reader
  const role = currentUser?.role || "Reader";

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, requiredPermission: null },
    
    // Content Domain
    { name: "Editorial Queue", href: "/admin/reviews", icon: BookOpen, requiredPermission: "review_article" as const },
    { name: "Articles", href: "/admin/articles", icon: FileText, requiredPermission: "create_article" as const },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon, requiredPermission: "create_article" as const },
    { name: "Magazine", href: "/admin/magazine", icon: BookOpen, requiredPermission: "publish_article" as const },
    { name: "Videos", href: "/admin/videos", icon: Video, requiredPermission: "publish_article" as const },
    
    // Homepage / Builder
    { name: "Homepage Builder", href: "/admin/homepage", icon: LayoutTemplate, requiredPermission: "manage_homepage" as const },
    
    // Community
    { name: "Community", href: "/admin/community", icon: MessageSquare, requiredPermission: "manage_users" as const },
    
    // Users & System
    { name: "Users & Roles", href: "/admin/users", icon: Users, requiredPermission: "manage_users" as const },
    { name: "Settings", href: "/admin/settings", icon: Settings, requiredPermission: "manage_settings" as const },
  ];

  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission(role, item.requiredPermission)
  );

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-serif font-black text-primary tracking-tight">Yuvakshar<span className="text-slate-800 dark:text-white">Admin</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                isActive 
                  ? "bg-primary/10 text-primary dark:bg-primary/20" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
             {currentUser?.avatar_url ? (
               <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                 {currentUser?.name?.charAt(0) || "U"}
               </div>
             )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {currentUser?.name || "Loading..."}
            </span>
            <span className="text-xs text-slate-500 truncate">{role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
