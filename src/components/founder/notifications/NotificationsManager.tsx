"use client";

import React, { useState, useTransition, useCallback, useMemo } from "react";
import {
  Bell, Trash2, Check, CheckCircle2, FileText, Users, AlertTriangle,
  Info, MessageSquare, Search, Filter, BookOpen, Image as ImageIcon,
  Settings, Wifi, WifiOff, ArrowRight, ChevronDown, X, RefreshCw,
  Mail, Sparkles, ShieldAlert
} from "lucide-react";
import {
  NotificationRecord,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
  getAdminNotifications,
} from "@/lib/actions/notificationActions";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { formatDistanceToNow } from "date-fns";
import { hi } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

// ─── Category meta ─────────────────────────────────────────────────────────────

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all",       label: "सभी" },
  { value: "articles",  label: "लेख" },
  { value: "magazine",  label: "पत्रिका" },
  { value: "community", label: "चौपाल" },
  { value: "contact",   label: "संपर्क संदेश" },
  { value: "users",     label: "उपयोगकर्ता" },
  { value: "banners",   label: "बैनर गैलरी" },
  { value: "settings",  label: "सेटिंग्स" },
  { value: "system",    label: "सिस्टम" },
];

const PRIORITIES: { value: string; label: string }[] = [
  { value: "all",      label: "सभी" },
  { value: "critical", label: "अति आवश्यक" },
  { value: "high",     label: "उच्च" },
  { value: "medium",   label: "मध्यम" },
  { value: "low",      label: "कम" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  articles:  <FileText className="w-4 h-4" />,
  magazine:  <BookOpen className="w-4 h-4" />,
  community: <MessageSquare className="w-4 h-4" />,
  contact:   <Mail className="w-4 h-4" />,
  users:     <Users className="w-4 h-4" />,
  banners:   <Sparkles className="w-4 h-4" />,
  settings:  <Settings className="w-4 h-4" />,
  system:    <ShieldAlert className="w-4 h-4" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high:     "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low:      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high:     "bg-orange-500",
  medium:   "bg-yellow-500",
  low:      "bg-slate-400",
};

const TYPE_ICON_CLASSES: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  info:    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  error:   "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  articles:  "लेख",
  magazine:  "पत्रिका",
  community: "चौपाल",
  contact:   "संपर्क संदेश",
  users:     "उपयोगकर्ता",
  banners:   "बैनर",
  settings:  "सेटिंग्स",
  system:    "सिस्टम",
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "अति आवश्यक",
  high:     "उच्च",
  medium:   "मध्यम",
  low:      "कम",
};

const ACTION_URL_LABELS: Record<string, string> = {
  articles:  "लेख खोलें",
  magazine:  "पत्रिका देखें",
  community: "चौपाल देखें",
  contact:   "संदेश देखें",
  users:     "प्रोफ़ाइल देखें",
  banners:   "बैनर गैलरी",
  settings:  "सेटिंग्स देखें",
  system:    "लॉग देखें",
};

const PAGE_SIZE = 20;

// ─── Main Component ─────────────────────────────────────────────────────────────

interface NotificationsManagerProps {
  initialNotifications: NotificationRecord[];
  userRole?: string;
  totalCount?: number;
}

export default function NotificationsManager({
  initialNotifications,
  userRole = "editor",
  totalCount = 0,
}: NotificationsManagerProps) {
  const { notifications, unreadCount, isConnected, setNotifications, markRead, markAllRead } =
    useNotificationRealtime({ initialNotifications, userRole });

  const [filter, setFilter]         = useState<"all" | "unread" | "read">("all");
  const [category, setCategory]     = useState("all");
  const [priority, setPriority]     = useState("all");
  const [sort, setSort]             = useState<"newest" | "oldest">("newest");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [serverCount, setServerCount] = useState(totalCount || initialNotifications.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Client-side filter on loaded notifications
  const filtered = useMemo(() => {
    let list = [...notifications];
    if (filter === "unread") list = list.filter(n => !n.is_read);
    if (filter === "read")   list = list.filter(n => n.is_read);
    if (category !== "all")  list = list.filter(n => n.category === category);
    if (priority !== "all")  list = list.filter(n => n.priority === priority);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return list;
  }, [notifications, filter, category, priority, search, sort]);

  // Load more (server-side pagination)
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const res = await getAdminNotifications({
        filter,
        category: category !== "all" ? category : undefined,
        priority: priority !== "all" ? priority : undefined,
        search: search || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (res.data && res.data.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newItems = res.data.filter(n => !existingIds.has(n.id));
          return [...prev, ...newItems];
        });
        setPage(p => p + 1);
        setServerCount(res.count ?? serverCount);
      }
    } catch {
      toast.error("और सूचनाएँ लोड नहीं हो सकीं।");
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, category, priority, search, sort, page, serverCount, setNotifications]);

  // Mark single as read
  const handleMarkAsRead = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    markRead(id);
    startTransition(async () => {
      const res = await markNotificationAsRead(id);
      if (!res.success) toast.error("पढ़ा हुआ चिह्नित करने में विफल।");
    });
  }, [markRead]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    markAllRead();
    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (!res.success) toast.error("सभी पढ़ा हुआ चिह्नित नहीं हो सके।");
      else toast.success("सभी सूचनाएँ पढ़ी हुई चिह्नित कर दी गईं।");
    });
  }, [markAllRead]);

  // Delete
  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    startTransition(async () => {
      const res = await deleteNotification(id);
      if (!res.success) {
        toast.error("सूचना हटाने में विफल।");
      }
    });
  }, [setNotifications]);

  // Clear read
  const handleClearRead = useCallback(() => {
    startTransition(async () => {
      setNotifications(prev => prev.filter(n => !n.is_read));
      const res = await clearReadNotifications();
      if (!res.success) toast.error("पढ़ी गई सूचनाएँ हटाने में विफल।");
      else toast.success("पढ़ी गई सूचनाएँ हटा दी गईं।");
    });
  }, [setNotifications]);

  // Click → mark read + navigate
  const handleClick = useCallback((n: NotificationRecord) => {
    if (!n.is_read) handleMarkAsRead(n.id);
  }, [handleMarkAsRead]);

  const hasMore = filtered.length < serverCount && !search && category === "all" && priority === "all";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 lg:px-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                सूचनाएँ
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                {isConnected ? (
                  <><Wifi className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">रियल-टाइम सक्रिय</span></>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5 text-slate-400" /><span>CMS गतिविधि केंद्र</span></>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleClearRead}
            disabled={isPending || notifications.filter(n => n.is_read).length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            पढ़ी गई हटाएँ
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            सभी पढ़ा हुआ चिह्नित करें
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Read / Unread toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {(["all", "unread", "read"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  filter === f
                    ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {f === "all" ? "सभी" : f === "unread" ? "अपठित" : "पढ़े गए"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="सूचनाएँ खोजें..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl pl-9 pr-9 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category + Priority + Sort */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg outline-none focus:border-primary cursor-pointer transition-all"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg outline-none focus:border-primary cursor-pointer transition-all"
            >
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as "newest" | "oldest")}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg outline-none focus:border-primary cursor-pointer transition-all"
            >
              <option value="newest">नवीनतम पहले</option>
              <option value="oldest">पुरानी पहले</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {filtered.length} सूचनाएँ
          </div>
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              कोई सूचना उपलब्ध नहीं है।
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
              {search
                ? "खोज के अनुसार कोई सूचना नहीं मिली।"
                : "आप अद्यतन हैं! अभी कोई सूचना नहीं है।"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map(n => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClick={handleClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Load More ── */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-xl transition-all disabled:opacity-50"
          >
            {isLoadingMore ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {isLoadingMore ? "लोड हो रहा है..." : "और सूचनाएँ"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Notification Row ───────────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: NotificationRecord;
  onMarkRead: (id: string, e?: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (n: NotificationRecord) => void;
}

function NotificationRow({ notification: n, onMarkRead, onDelete, onClick }: NotificationRowProps) {
  const iconClass = TYPE_ICON_CLASSES[n.type] ?? TYPE_ICON_CLASSES.info;
  const dotClass  = PRIORITY_DOT[n.priority] ?? "bg-slate-400";
  const badgeClass = PRIORITY_COLORS[n.priority] ?? PRIORITY_COLORS.low;
  const categoryIcon = CATEGORY_ICONS[n.category] ?? <Info className="w-4 h-4" />;
  const actionLabel  = ACTION_URL_LABELS[n.category] ?? "खोलें";

  return (
    <div
      onClick={() => onClick(n)}
      className={`group flex gap-4 p-4 lg:p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer ${
        !n.is_read ? "bg-amber-50/20 dark:bg-amber-900/5 border-l-2 border-l-amber-400" : ""
      }`}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass} shadow-sm relative`}>
          {categoryIcon}
          {!n.is_read && (
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0F172A] ${dotClass}`} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm leading-snug ${!n.is_read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
              {n.title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
              {n.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Category badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
            {categoryIcon}
            {CATEGORY_LABELS[n.category] ?? n.category}
          </span>

          {/* Priority badge */}
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md ${badgeClass}`}>
            {PRIORITY_LABELS[n.priority] ?? n.priority}
          </span>

          {/* Time */}
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: hi })}
          </span>

          {/* Action deep link */}
          {n.action_url && (
            <Link
              href={n.action_url}
              onClick={e => { e.stopPropagation(); if (!n.is_read) onMarkRead(n.id); }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all ml-auto"
            >
              {actionLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!n.is_read && (
          <button
            onClick={e => onMarkRead(n.id, e)}
            title="पढ़ा हुआ चिह्नित करें"
            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={e => onDelete(n.id, e)}
          title="सूचना हटाएँ"
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
