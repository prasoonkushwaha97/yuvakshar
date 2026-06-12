"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Trophy, 
  Award,
  FileText,
  AlertCircle
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchNotifications, 
  markNotificationsRead, 
  CommunityNotification 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function NotificationsPage() {
  const { currentUser } = useCms();
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      alert("सभी सूचनाओं को पढ़ा गया मार्क कर दिया गया है।");
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filterType === "unread") return !n.is_read;
    return true;
  });

  const getIcon = (type: CommunityNotification["notification_type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-4.5 h-4.5 text-red-500 fill-red-500" />;
      case "comment":
      case "reply":
        return <MessageSquare className="w-4.5 h-4.5 text-primary" />;
      case "follow":
      case "collab_request":
        return <UserPlus className="w-4.5 h-4.5 text-green-500" />;
      case "challenge_update":
      case "rank_up":
        return <Trophy className="w-4.5 h-4.5 text-amber-500" />;
      default:
        return <Bell className="w-4.5 h-4.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header board */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        
        {/* Title */}
        <div className="flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
          <Bell className="w-5 h-5" />
          <span>सूचना केंद्र (Notification Center)</span>
        </div>

        {/* Action button */}
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-primary hover:text-primary/90 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer font-hindi"
          >
            <CheckCheck className="w-4 h-4" />
            <span>सभी को पढ़ा गया मार्क करें</span>
          </button>
        )}

      </div>

      {/* Tabs / Filters row */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "all", name: "सभी सूचनाएं" },
          { id: "unread", name: "अपठित" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi ${
              filterType === tab.id
                ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Notifications listings */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            सूचनाएं लोड की जा रही हैं...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((notif) => (
            <GlassCard 
              key={notif.id} 
              className={`p-4 border-slate-200/60 dark:border-slate-800/40 flex items-start space-x-3.5 transition-all ${
                !notif.is_read ? "border-l-3 border-l-primary bg-primary/2.5" : ""
              }`}
            >
              {/* Type indicator icon */}
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850">
                {getIcon(notif.notification_type)}
              </div>

              {/* Notification text details */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs text-slate-700 dark:text-slate-355 font-hindi leading-relaxed font-medium">
                  {notif.content}
                </p>
                <span className="block text-[9px] text-slate-400 font-mono">
                  {new Date(notif.created_at).toLocaleString("hi-IN")}
                </span>
              </div>

              {/* Unread circle badge */}
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
              )}

            </GlassCard>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs flex flex-col items-center gap-2 justify-center">
            <CheckCheck className="w-8 h-8 text-green-500" />
            <span className="font-hindi">कोई नई सूचना नहीं है। आप पूरी तरह अपडेट हैं!</span>
          </div>
        )}
      </div>

    </div>
  );
}
