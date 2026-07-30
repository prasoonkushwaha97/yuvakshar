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
  Award,
  FolderTree,
  BookOpen, 
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Sparkles,
  Users,
  Bell,
  Settings
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import { getContactStats } from "@/lib/actions/contactActions";
import { getUnreadNotificationCount } from "@/lib/actions/notificationActions";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useCms();
  const [newMessagesCount, setNewMessagesCount] = React.useState<number>(0);
  const [unreadNotifCount, setUnreadNotifCount] = React.useState<number>(0);
  
  // Fetch contact badge + notification badge
  React.useEffect(() => {
    async function loadBadges() {
      const [contactRes, notifCount] = await Promise.all([
        getContactStats(),
        getUnreadNotificationCount(),
      ]);
      if (contactRes.success && contactRes.stats.newCount > 0) {
        setNewMessagesCount(contactRes.stats.newCount);
      }
      setUnreadNotifCount(notifCount);
    }
    loadBadges();

    // Refresh every 60 seconds
    const interval = setInterval(loadBadges, 60_000);
    return () => clearInterval(interval);
  }, []);
  
  // Note: we fetch the resolved role directly or default to Reader
  const role = currentUser?.role || "Reader";

  const navItems = [
    { name: "डैशबोर्ड", href: "/admin", icon: LayoutDashboard, requiredPermission: null },
    { name: "लेख", href: "/admin/articles", icon: FileText, requiredPermission: "create_article" as const },
    { name: "संपादकीय चयन", href: "/admin/articles/editorial-picks", icon: Award, requiredPermission: "create_article" as const },
    { name: "श्रेणियाँ", href: "/admin/categories", icon: FolderTree, requiredPermission: "manage_settings" as const },
    { name: "पत्रिका", href: "/admin/magazine", icon: BookOpen, requiredPermission: "publish_article" as const },
    { name: "चौपाल", href: "/admin/community", icon: MessageSquare, requiredPermission: "manage_users" as const },
    { name: "संपर्क संदेश", href: "/admin/contact-messages", icon: Mail, requiredPermission: "manage_contact_messages" as const, badge: newMessagesCount },
    { name: "उपयोगकर्ता", href: "/admin/users", icon: Users, requiredPermission: "manage_users" as const },
    { name: "बैनर गैलरी", href: "/admin/media/banners", icon: Sparkles, requiredPermission: "manage_settings" as const },
    { name: "सूचनाएँ", href: "/admin/notifications", icon: Bell, requiredPermission: "review_article" as const, badge: unreadNotifCount, badgeColor: "amber" },
    { name: "सेटिंग्स", href: "/admin/cms/settings", icon: Settings, requiredPermission: "manage_settings" as const }
  ];

  const visibleItems = navItems.filter(item => 
    !item.requiredPermission || hasPermission(role, item.requiredPermission)
  );

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center">
        <h1 className="text-2xl font-serif font-black text-primary tracking-tight whitespace-nowrap">युवाक्षर <span className="text-slate-800 dark:text-white text-lg font-sans">एडमिन</span></h1>
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
              <span className="flex-1 truncate">{item.name}</span>
              {!!item.badge && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full animate-pulse ${
                  (item as any).badgeColor === "amber"
                    ? "bg-amber-500 text-white"
                    : "bg-orange-500 text-white"
                }`}>
                  {item.badge}
                </span>
              )}
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
