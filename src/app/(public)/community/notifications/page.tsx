"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Trophy, 
  ArrowRight,
  UserCheck
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchNotifications, 
  markNotificationsRead, 
  CommunityNotification 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";

export default function NotificationsPage() {
  const { currentUser } = useCms();
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");
  const [followedBackIds, setFollowedBackIds] = useState<string[]>([]);

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
      setNotifications(notifications?.map(n => ({ ...n, is_read: true })));
      alert("सभी सूचनाओं को पढ़ा गया मार्क कर दिया गया है।");
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityScore = (type: CommunityNotification["notification_type"]) => {
    switch (type) {
      case "rank_up":
      case "challenge_update":
      case "collab_request":
        return 1; // High priority
      case "reply":
      case "comment":
        return 2; // Medium priority
      case "like":
      case "follow":
      default:
        return 3; // Normal priority
    }
  };

  const filtered = notifications
    .filter(n => {
      if (filterType === "unread") return !n.is_read;
      return true;
    })
    .sort((a, b) => {
      // First sort by priority score
      const scoreDiff = getPriorityScore(a.notification_type) - getPriorityScore(b.notification_type);
      if (scoreDiff !== 0) return scoreDiff;
      // Then sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

  const groupNotificationsByTime = (notifs: CommunityNotification[]) => {
    const today: CommunityNotification[] = [];
    const yesterday: CommunityNotification[] = [];
    const thisWeek: CommunityNotification[] = [];
    const older: CommunityNotification[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    notifs.forEach(n => {
      const date = new Date(n.created_at);
      const diff = now.getTime() - date.getTime();
      
      if (diff < oneDay && now.getDate() === date.getDate()) {
        today.push(n);
      } else if (diff < 2 * oneDay) {
        yesterday.push(n);
      } else if (diff < 7 * oneDay) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const timeGroups = groupNotificationsByTime(filtered);

  const renderGroup = (title: string, list: CommunityNotification[]) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-3.5">
        <h4 className="text-[10px] uppercase font-bold text-slate-400 font-serif tracking-wider pl-1">{title}</h4>
        <div className="space-y-3">
          {list?.map((notif) => {
            const priority = getPriorityScore(notif.notification_type);
            const isHigh = priority === 1;

            return (
              <GlassCard 
                key={notif.id} 
                className={`p-4 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  !notif.is_read
                    ? "border-l-3 border-l-primary bg-primary/2.5 dark:bg-primary/5 border-slate-200/80 dark:border-slate-800/80"
                    : "border-slate-200/60 dark:border-slate-800/40"
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850">
                    {getIcon(notif.notification_type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-hindi leading-relaxed font-medium">
                      {notif.content}
                    </p>
                    <span className="block text-[9px] text-slate-400 font-mono">
                      {new Date(notif.created_at).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Inline Action buttons */}
                <div className="flex items-center space-x-2 shrink-0 ml-12 md:ml-0">
                  {notif.notification_type === "collab_request" && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => alert("सहयोग अनुरोध स्वीकार कर लिया गया है!")}
                        className="bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg font-hindi cursor-pointer"
                      >
                        स्वीकार करें
                      </button>
                      <button 
                        onClick={() => alert("सहयोग अनुरोध अस्वीकार कर दिया गया है।")}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 text-[9px] font-bold px-2.5 py-1 rounded-lg font-hindi cursor-pointer"
                      >
                        हटाएं
                      </button>
                    </div>
                  )}

                  {(notif.notification_type === "comment" || notif.notification_type === "reply" || notif.notification_type === "like") && notif.related_id && (
                    <Link 
                      href={`/community/discussion/thread/${notif.related_id}`}
                      className="text-[9px] font-bold text-primary border border-primary/20 hover:bg-primary/5 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 font-hindi"
                    >
                      <span>देखें</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  )}

                  {notif.notification_type === "follow" && (
                    <div className="flex gap-2">
                      <Link 
                        href={`/community/u/${notif.sender_id}`}
                        className="text-[9px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 font-hindi shrink-0"
                      >
                        <span>प्रोफ़ाइल खोलें</span>
                      </Link>
                      <button
                        onClick={() => {
                          setFollowedBackIds([...followedBackIds, notif.sender_id]);
                          // Simulating follow back API call
                        }}
                        className={`text-[9px] font-bold rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 font-hindi cursor-pointer shrink-0 ${
                          followedBackIds.includes(notif.sender_id) 
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800" 
                            : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                        }`}
                        disabled={followedBackIds.includes(notif.sender_id)}
                      >
                        {followedBackIds.includes(notif.sender_id) ? (
                          <>
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>फॉलो किया</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-2.5 h-2.5" />
                            <span>वापस फॉलो करें</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                  )}
                </div>

              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  };

  const hasNotifications = filtered.length > 0;

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        <div className="flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
          <Bell className="w-5 h-5" />
          <span>सूचना केंद्र (Notification Center)</span>
        </div>

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

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        {[
          { id: "all", name: "सभी सूचनाएं" },
          { id: "unread", name: "अपठित" }
        ]?.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi ${
              filterType === tab.id
                ? "bg-white dark:bg-slate-950 text-slate-850 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grouped Listings */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            सूचनाएं लोड की जा रही हैं...
          </div>
        ) : hasNotifications ? (
          <>
            {renderGroup("आज (Today)", timeGroups.today)}
            {renderGroup("कल (Yesterday)", timeGroups.yesterday)}
            {renderGroup("इस सप्ताह (This Week)", timeGroups.thisWeek)}
            {renderGroup("विगत सूचनाएं (Older)", timeGroups.older)}
          </>
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
