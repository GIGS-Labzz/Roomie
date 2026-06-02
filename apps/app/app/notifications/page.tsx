"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar } from "@repo/ui/avatar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";

const supabase = createClient();

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  read_at: string | null;
  created_at: string;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function iconForType(type: string) {
  switch (type) {
    case "NEW_MESSAGE":
      return (
        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    case "CONNECTION_REQUEST":
      return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      );
    case "AGREEMENT_CONFIRMED":
    case "HOUSING_UNLOCKED":
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
  }
}

function linkForNotification(n: Notification): string | null {
  const data = n.data ?? {};
  switch (n.type) {
    case "NEW_MESSAGE":
      return data.connection_id ? `/chat/${data.connection_id}` : "/chat";
    case "CONNECTION_REQUEST":
      return data.connection_id ? `/chat/${data.connection_id}` : "/chat";
    case "AGREEMENT_CONFIRMED":
    case "HOUSING_UNLOCKED":
      return "/housing";
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);
    setNotifications((data as Notification[]) ?? []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // Mark all as read when the page is opened
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase as any)
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  }, [user]);

  // Real-time: new notifications arrive while viewing the page
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          // Mark immediately as read since user is on the page
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          void (supabase as any)
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("id", n.id);
          setNotifications((prev) => [{ ...n, read_at: new Date().toISOString() }, ...prev]);
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  const unread = notifications.filter((n) => !n.read_at).length;

  const navItems = [
    {
      key: "feed", label: "Feed", href: "/feed", isActive: pathname.startsWith("/feed"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    },
    {
      key: "discover", label: "Discover", href: "/discover", isActive: pathname.startsWith("/discover"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>,
    },
    {
      key: "chat", label: "Chat", href: "/chat", isActive: pathname.startsWith("/chat"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
    {
      key: "profile", label: "Profile", href: "/profile", isActive: pathname.startsWith("/profile"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-slate-900 text-2xl">Notifications</h1>
              {unread > 0 && (
                <p className="text-xs text-brand-600 font-medium mt-0.5">{unread} unread</p>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (supabase as any)
                    .from("notifications")
                    .update({ read_at: new Date().toISOString() })
                    .eq("user_id", user?.id)
                    .is("read_at", null);
                  setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
                }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Mark all read
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto pb-28 md:pb-8">
          {isLoading ? (
            <div className="space-y-px mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4 bg-white">
                  <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded-full w-1/3 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-display font-semibold text-slate-700 text-lg">No notifications yet</p>
                <p className="text-sm text-slate-400 mt-1">You&apos;ll see messages, connections, and agreement updates here.</p>
              </div>
            </div>
          ) : (
            <ul className="mt-1">
              {notifications.map((n, idx) => {
                const href = linkForNotification(n);
                const isUnread = !n.read_at;

                const inner = (
                  <div className={`flex items-start gap-3 px-4 py-4 transition-colors ${isUnread ? "bg-brand-50/60" : "bg-white"} hover:bg-slate-50`}>
                    {iconForType(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{formatTime(n.created_at)}</span>
                      </div>
                      {n.body && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      )}
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return (
                  <li key={n.id}>
                    {idx > 0 && <div className="ml-[64px] h-px bg-slate-100" />}
                    {href ? (
                      <button className="w-full text-left" onClick={() => router.push(href)}>
                        {inner}
                      </button>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>

      <BottomTabNav hidden={false} items={navItems} />
    </div>
  );
}
