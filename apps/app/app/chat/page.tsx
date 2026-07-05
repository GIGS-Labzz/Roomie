"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@repo/db/client";
import { getUserConnections } from "@repo/db/queries/connections";
import {
  getLastMessagesForConnections,
  getUnreadCountPerConnection,
  type LastMessagePreview,
} from "@repo/db/queries/messages";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar } from "@repo/ui/avatar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Connection = any;

type Filter = "ALL" | "UNREAD";

const supabase = createClient();

function formatChatTime(isoString?: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-NG", { weekday: "short" });
  }
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

interface OutboxMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  error?: boolean;
}

const getOutbox = (connectionId: string): OutboxMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`outbox:${connectionId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

function previewText(
  msg: (LastMessagePreview & { isSending?: boolean; isFailed?: boolean }) | undefined,
  isOwn: boolean
): string {
  if (!msg) return "Tap to start chatting";
  
  let prefix = isOwn ? "You: " : "";
  if (isOwn && msg.isSending) {
    prefix = "🕒 You: ";
  } else if (isOwn && msg.isFailed) {
    prefix = "⚠️ You: ";
  }

  switch (msg.message_type) {
    case "image": return `${prefix}📷 Photo`;
    case "agreement_request": return `${prefix}Roommate agreement proposal`;
    case "agreement_confirmed": return "Agreement confirmed";
    case "agreement_declined": return "Agreement declined";
    case "system": return msg.content;
    default: return `${prefix}${msg.content}`;
  }
}

export default function ChatListPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadMessageCount } = useNotifications();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessagePreview>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // UI state — filter pills + search, ported from the guest/host MessagesScreen layout
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await getUserConnections(supabase as any, user.id);
      if (!isMounted) return;

      const active = (data ?? []).filter((c: Connection) => c.status === "ACTIVE");

      if (active.length === 0) {
        setConnections([]);
        setLastMessages({});
        setUnreadCounts({});
        setIsLoading(false);
        return;
      }

      const ids = active.map((c: Connection) => c.id as string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [msgs, counts] = await Promise.all([
        getLastMessagesForConnections(supabase as any, ids),
        getUnreadCountPerConnection(supabase as any, ids, user.id),
      ]);
      if (!isMounted) return;

      active.sort((a: Connection, b: Connection) => {
        const aTime = msgs[a.id]?.created_at ?? a.connected_at ?? "";
        const bTime = msgs[b.id]?.created_at ?? b.connected_at ?? "";
        return bTime.localeCompare(aTime);
      });

      setLastMessages(msgs);
      setUnreadCounts(counts);
      setConnections(active);
      setIsLoading(false);
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Resolve "other participant" once per connection so filtering/search can reuse it
  const enriched = useMemo(() => {
    return connections.map((c: Connection) => {
      const other = c.requester_id === user?.id ? c.receiver : c.requester;
      
      const outbox = getOutbox(c.id);
      const pendingLast = outbox[outbox.length - 1];

      const lastMsg = pendingLast
        ? {
            connection_id: c.id,
            content: pendingLast.content,
            sender_id: pendingLast.sender_id,
            created_at: pendingLast.created_at,
            message_type: "text" as any,
            isSending: !pendingLast.error,
            isFailed: !!pendingLast.error,
          }
        : lastMessages[c.id];

      const unread = unreadCounts[c.id] ?? 0;
      const isOwnLast = lastMsg?.sender_id === user?.id;
      return {
        connection: c,
        other,
        lastMsg,
        unread,
        preview: previewText(lastMsg, isOwnLast),
        time: formatChatTime(lastMsg?.created_at ?? c.connected_at),
      };
    });
  }, [connections, lastMessages, unreadCounts, user?.id]);

  const filteredConnections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((row) => (filter === "UNREAD" ? row.unread > 0 : true))
      .filter((row) => {
        if (!q) return true;
        const name = row.other?.display_name ?? "";
        const hay = `${name} ${row.lastMsg?.content ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
  }, [enriched, filter, query]);

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
      badgeCount: unreadMessageCount,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
    {
      key: "profile", label: "Profile", href: "/profile", isActive: pathname.startsWith("/profile"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Header (brand bar, kept from original) ── */}
        <header className="sticky top-0 z-30 bg-brand-500 text-white">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="font-display font-bold text-xl">Chats</h1>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="bg-red-600 text-white px-4 py-2 text-center text-xs font-semibold shadow-sm flex-shrink-0">
          Technical Fixes in progress
        </div>

        {/* ── List panel — layout ported from MessagesScreen's conversation list ── */}
        <main className="flex-1 max-w-2xl w-full mx-auto pb-28 md:pb-6">
          <div className="px-4 pt-4">
            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-full border font-bold text-sm transition-colors ${
                  filter === "ALL"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("UNREAD")}
                className={`px-4 py-2 rounded-full border font-bold text-sm transition-colors ${
                  filter === "UNREAD"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                Unread
              </button>
            </div>

            {/* Search input */}
            <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  aria-label="Clear"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            {isLoading ? (
              <LoadingSkeletons />
            ) : connections.length === 0 ? (
              <EmptyChat />
            ) : filteredConnections.length === 0 ? (
              <EmptySearch onClear={() => { setQuery(""); setFilter("ALL"); }} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredConnections.map(({ connection: conn, other, unread, preview, time }) => (
                  <li key={conn.id}>
                    <div className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                      <Link
                        href={`/discover/${other?.id}`}
                        className="flex-shrink-0 mr-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative">
                          <Avatar src={other?.avatar_url} name={other?.display_name} size="lg" />
                          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-brand-400 rounded-full border-2 border-white" />
                        </div>
                      </Link>

                      <Link href={`/chat/${conn.id}`} className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`font-semibold text-[15px] truncate ${unread > 0 ? "text-slate-900" : "text-slate-800"}`}>
                                {other?.display_name ?? "Roommate"}
                              </span>
                              {other?.student_verified && (
                                <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-[11px] shrink-0 ${unread > 0 ? "text-brand-500 font-semibold" : "text-slate-400"}`}>
                              {time}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${unread > 0 ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                              {preview}
                            </p>
                            {unread > 0 && (
                              <span className="shrink-0 min-w-[20px] h-5 px-1 bg-brand-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                                {unread > 99 ? "99+" : unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      <BottomTabNav hidden={false} items={navItems} />
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <ul>
      {[1, 2, 3, 4].map((i) => (
        <li key={i}>
          {i > 1 && <div className="ml-[72px] h-px bg-slate-100" />}
          <div className="flex items-center px-4 py-3 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-200 rounded-full w-1/3 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
            </div>
            <div className="h-2.5 w-10 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6 gap-5">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-slate-800 text-lg">No chats yet</p>
        <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
          Connect with a student from the Discover page to start chatting for free.
        </p>
      </div>
      <Link
        href="/discover"
        className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-colors"
      >
        Browse profiles
      </Link>
    </div>
  );
}

function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <p className="font-semibold text-slate-700">No matches</p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        Clear filters
      </button>
    </div>
  );
}