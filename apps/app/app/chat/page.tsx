"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@repo/db/client";
import { getUserConnections } from "@repo/db/queries/connections";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar } from "@repo/ui/avatar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { useAuth } from "@/context/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Connection = any;

const supabase = createClient();

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ChatListPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await getUserConnections(supabase as any, user.id);
      const active = (data ?? []).filter((c: Connection) => c.status === "ACTIVE");
      setConnections(active);
      setIsLoading(false);
    };

    void load();
  }, [user]);

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
                <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
                <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
                <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
                <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
              </svg>
            </div>
            <span className="font-display font-bold text-slate-900 text-lg leading-none">Roomie</span>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 pb-28 md:pb-8">
          {/* Page heading */}
          <div className="pt-6 pb-4">
            <h1 className="font-display font-bold text-slate-900 text-3xl md:text-2xl leading-tight">Chat</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isLoading ? "Loading…" : `${connections.length} active connection${connections.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Connections list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <EmptyChat />
          ) : (
            <div className="space-y-2">
              {connections.map((conn: Connection) => {
                const other = conn.requester_id === user?.id ? conn.receiver : conn.requester;
                return (
                  <Link
                    key={conn.id}
                    href={`/chat/${conn.id}`}
                    className="bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={other?.avatar_url}
                        name={other?.display_name}
                        size="md"
                      />
                      {/* Online indicator placeholder */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {other?.display_name ?? "Roommate"}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatRelativeTime(conn.connected_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {other?.university ?? "Tap to start chatting"}
                      </p>
                    </div>

                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomTabNav
        hidden={false}
        items={[
          {
            key: "feed",
            label: "Feed",
            href: "/feed",
            isActive: pathname.startsWith("/feed"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            ),
          },
          {
            key: "discover",
            label: "Discover",
            href: "/discover",
            isActive: pathname.startsWith("/discover"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            ),
          },
          {
            key: "chat",
            label: "Chat",
            href: "/chat",
            isActive: pathname.startsWith("/chat"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ),
          },
          {
            key: "profile",
            label: "Profile",
            href: "/profile",
            isActive: pathname.startsWith("/profile"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
        ]}
      />
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-sage-light flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-slate-700 text-lg">No chats yet</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Connect with a roommate from the Discover page to start chatting.
        </p>
      </div>
      <Link
        href="/discover"
        className="text-sm font-semibold text-brand-600 hover:text-brand-700 underline"
      >
        Browse profiles
      </Link>
    </div>
  );
}
