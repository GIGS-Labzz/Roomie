"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar } from "@repo/ui/avatar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { createClient } from "@repo/db/client";
import { getUserConnections } from "@repo/db/queries/connections";

const supabase = createClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Connection = any;

interface SplitSummary {
  connectionId: string;
  otherUser: { id: string; display_name: string; avatar_url: string | null };
  totalActive: number;
  totalSettled: number;
  unpaidAmount: number;
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export default function SplitsIndexPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<SplitSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: connections } = await getUserConnections(supabase as any, user.id);
      const active = (connections ?? []).filter((c: Connection) => c.status === "ACTIVE");

      const results: (SplitSummary | null)[] = await Promise.all(
        active.map(async (conn: Connection) => {
          const other = conn.requester_id === user.id ? conn.receiver : conn.requester;
          try {
            const res = await fetch(`/api/splits?connectionId=${conn.id}`);
            if (!res.ok) return null;
            const data = await res.json() as { splits: { is_settled: boolean; items: { is_paid: boolean; amount: number; user_id: string }[] }[] };
            const splits = data.splits ?? [];
            const totalActive = splits.filter((s) => !s.is_settled).length;
            const totalSettled = splits.filter((s) => s.is_settled).length;
            const unpaidAmount = splits
              .filter((s) => !s.is_settled)
              .flatMap((s) => s.items)
              .filter((item) => item.user_id === user.id && !item.is_paid)
              .reduce((acc, item) => acc + item.amount, 0);

            return {
              connectionId: conn.id,
              otherUser: other,
              totalActive,
              totalSettled,
              unpaidAmount,
            } as SplitSummary;
          } catch {
            return null;
          }
        })
      );

      setSummaries(results.filter((r): r is SplitSummary => r !== null));
      setIsLoading(false);
    };

    void load();
  }, [user]);

  const navItems = [
    {
      key: "feed", label: "Feed", href: "/feed", isActive: pathname === "/feed",
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
    <div className="min-h-screen bg-sage-surface md:flex">
      <AppSidebar />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-brand-500 text-white">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <h1 className="font-display font-bold text-xl">Bill Splits</h1>
            <p className="text-white/70 text-xs mt-0.5">Track shared expenses with your roommates</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
          {isLoading ? (
            <LoadingSkeletons />
          ) : summaries.length === 0 ? (
            <EmptySplits />
          ) : (
            <div className="space-y-3">
              {summaries.map((s) => (
                <Link
                  key={s.connectionId}
                  href={`/splits/${s.connectionId}`}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <Avatar src={s.otherUser.avatar_url} name={s.otherUser.display_name} size="lg" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-[15px] truncate">{s.otherUser.display_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.totalActive > 0 ? `${s.totalActive} active` : "No active splits"}
                      {s.totalSettled > 0 ? ` · ${s.totalSettled} settled` : ""}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {s.unpaidAmount > 0 ? (
                      <>
                        <p className="text-sm font-bold text-red-500">{formatNaira(s.unpaidAmount)}</p>
                        <p className="text-[10px] text-slate-400">you owe</p>
                      </>
                    ) : s.totalActive > 0 ? (
                      <>
                        <p className="text-sm font-bold text-brand-500">All paid</p>
                        <p className="text-[10px] text-slate-400">up to date</p>
                      </>
                    ) : (
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>

                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomTabNav hidden={false} items={navItems} />
    </div>
  );
}

function EmptySplits() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6 gap-5">
      <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-slate-800 text-lg">No splits yet</p>
        <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
          Connect with a roommate first, then use splits to track shared expenses.
        </p>
      </div>
      <Link
        href="/chat"
        className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-colors"
      >
        Go to chats
      </Link>
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="space-y-1">
            <div className="h-3.5 bg-slate-200 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
