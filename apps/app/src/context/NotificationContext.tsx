"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  unreadCount: number;
  unreadMessageCount: number;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const supabase = createClient();

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    setUnreadCount(count ?? 0);
  }, [user]);

  const fetchUnreadMessages = useCallback(async () => {
    if (!user) { setUnreadMessageCount(0); return; }

    try {
      // 1. Fetch active connection IDs for the current user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conns } = await (supabase as any)
        .from("connections")
        .select("id")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "ACTIVE");

      const connIds = conns?.map((c: any) => c.id) || [];
      if (connIds.length === 0) {
        setUnreadMessageCount(0);
        return;
      }

      // 2. Count unread messages (sender != user and read_at is null) in those connections
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("connection_id", connIds)
        .neq("sender_id", user.id)
        .is("read_at", null);

      setUnreadMessageCount(count ?? 0);
    } catch (err) {
      console.error("Failed to query unread messages:", err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    void fetchUnread();
    void fetchUnreadMessages();
  }, [fetchUnread, fetchUnreadMessages]);

  // Realtime subscription — listens for new notifications for this user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  // Realtime subscription — listens to messages changes to keep the unread count in sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`unread-messages:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadMessages]);

  const markAllRead = useCallback(async () => {
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    setUnreadCount(0);
  }, [user]);

  const value = useMemo(
    () => ({ unreadCount, unreadMessageCount, markAllRead }),
    [unreadCount, unreadMessageCount, markAllRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
