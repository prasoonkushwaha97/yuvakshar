"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { NotificationRecord } from "@/lib/actions/notificationActions";

interface UseNotificationRealtimeOptions {
  initialNotifications?: NotificationRecord[];
  userRole?: string;
}

interface UseNotificationRealtimeReturn {
  notifications: NotificationRecord[];
  unreadCount: number;
  isConnected: boolean;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationRecord[]>>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * useNotificationRealtime
 * ──────────────────────────────────────────────────────────────────
 * Subscribes to Supabase Realtime on the `notifications` table.
 * New inserts appear immediately at the top without page refresh.
 * Gracefully degrades if Realtime is not enabled on the project.
 */
export function useNotificationRealtime({
  initialNotifications = [],
  userRole = "editor",
}: UseNotificationRealtimeOptions = {}): UseNotificationRealtimeReturn {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Sort helper: critical first, then by date desc
  const sortNotifications = useCallback((list: NotificationRecord[]) => {
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...list].sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, []);

  // Optimistic mark-read
  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
  }, []);

  // Optimistic mark-all-read
  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: now })));
  }, []);

  useEffect(() => {
    // Re-sync initial notifications when prop changes (e.g., after server action)
    setNotifications(sortNotifications(initialNotifications));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channelName = `cms-notifications-${userRole}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as NotificationRecord;

          // Only show if targeted at this role (all or matching role) or targeted at current user
          const isTargetAll = !newNotif.target_role || newNotif.target_role === "all";
          const isTargetRole = newNotif.target_role === userRole;

          if (!isTargetAll && !isTargetRole) return;

          setNotifications((prev) => {
            // Deduplicate by id
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return sortNotifications([newNotif, ...prev]);
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const updated = payload.new as NotificationRecord;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userRole, sortNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    setNotifications,
    markRead,
    markAllRead,
  };
}
