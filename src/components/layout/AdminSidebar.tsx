"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { hasPermission } from "@/domains/users/permissions";
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree,
  BookOpen, 
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  Users,
  Bell,
  Settings
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useCms();
  
  // Note: we fetch the resolved role directly or default to Reader
  const role = currentUser?.role || "Reader";

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, requiredPermission: null },
    { name: "Articles", href: "/admin/articles", icon: FileText, requiredPermission: "create_article" as const },
    { name: "Categories", href: "/admin/categories", icon: FolderTree, requiredPermission: "manage_settings" as const },
    { name: "Magazine", href: "/admin/magazine", icon: BookOpen, requiredPermission: "publish_article" as const },
    { name: "Chaupaal", href: "/admin/community", icon: MessageSquare, requiredPermission: "manage_users" as const },
    { name: "Users", href: "/admin/users", icon: Users, requiredPermission: "manage_users" as const },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon, requiredPermission: "create_article" as const },
    { name: "Banner Gallery", href: "/admin/media/banners", icon: Sparkles, requiredPermission: "manage_settings" as const },
    { name: "Notifications", href: "/admin/notifications", icon: Bell, requiredPermission: "review_article" as const },
    { name: "Settings", href: "/admin/cms/settings", icon: Settings, requiredPermission: "manage_settings" as const }
  ];

  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission(role, item.requiredPermission)
  );

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center">
        <h1 className="text-2xl font-serif font-black text-primary tracking-tight whitespace-nowrap">Yuvakshar<span className="text-slate-800 dark:text-white">Admin</span></h1>
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
          <div className="relative w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
             <Avatar url={currentUser?.avatar_url} alt={currentUser?.name} name={currentUser?.name} className="w-full h-full" />
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
