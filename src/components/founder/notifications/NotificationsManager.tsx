"use client";

import React, { useState, useTransition } from "react";
import { Bell, Trash2, Check, CheckCircle2, MoreHorizontal, FileText, Users, AlertTriangle, Info, MessageSquare, Search, Filter } from "lucide-react";
import { Notification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/actions/notificationActions";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsManager({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread" && n.is_read) return false;
    if (filter === "read" && !n.is_read) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    startTransition(async () => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      const res = await markNotificationAsRead(id);
      if (!res.success) {
        toast.error("Failed to mark as read");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      const res = await markAllNotificationsAsRead();
      if (!res.success) {
        toast.error("Failed to mark all as read");
      } else {
        toast.success("All notifications marked as read");
      }
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      const res = await deleteNotification(id);
      if (!res.success) {
        toast.error("Failed to delete notification");
      }
    });
  };

  const getIconForType = (type: string, category: string, priority: string) => {
    const t = type.toLowerCase();
    if (t.includes('article') || t.includes('magazine')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (t.includes('user') || t.includes('registration')) return <Users className="w-5 h-5 text-emerald-500" />;
    if (t.includes('report') || t.includes('community')) return <MessageSquare className="w-5 h-5 text-orange-500" />;
    if (category === 'Security' || priority === 'Urgent') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-indigo-500" />;
  };

  const getNotificationLink = (n: Notification) => {
    const t = n.type.toLowerCase();
    const triggerId = n.trigger_event_id;
    if (!triggerId) return "#";
    
    if (t.includes('article')) return `/admin/articles/editor?id=${triggerId}`;
    if (t.includes('magazine')) return `/admin/magazine`;
    if (t.includes('user')) return `/admin/users`;
    if (t.includes('report')) return `/admin/community`;
    return "#";
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      handleMarkAsRead(n.id);
    }
    const link = getNotificationLink(n);
    if (link !== "#") {
      router.push(link);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your alerts, assignments, and updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0 || isPending}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all disabled:opacity-50 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[#0B0F19] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button 
            onClick={() => setFilter("all")} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === "all" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("unread")} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === "unread" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter("read")} 
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === "read" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Read
          </button>
        </div>
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notifications found</h3>
            <p className="text-slate-500 max-w-sm">
              {search ? "We couldn't find any notifications matching your search." : "You're all caught up! There are no notifications to display right now."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`group p-4 lg:p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
              >
                <div className="flex-shrink-0 mt-1 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!n.is_read ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {getIconForType(n.type, n.category, n.priority)}
                  </div>
                  {!n.is_read && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-[#0B0F19]"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm md:text-base ${!n.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <p className={`text-sm mt-1 line-clamp-2 ${!n.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {n.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {!n.is_read && (
                     <button 
                       onClick={(e) => handleMarkAsRead(n.id, e)}
                       className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                       title="Mark as read"
                     >
                       <Check className="w-4 h-4" />
                     </button>
                   )}
                   <button 
                     onClick={(e) => handleDelete(n.id, e)}
                     className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                     title="Delete notification"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
