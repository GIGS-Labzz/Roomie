"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SplitCard } from "@/components/splits/SplitCard";
import { AddSplitModal } from "@/components/splits/AddSplitModal";
import { createClient } from "@repo/db/client";
import { getConnectionById } from "@repo/db/queries/connections";

const supabase = createClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Split = any;

export default function SplitsConnectionPage() {
  const params = useParams<{ connectionId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const connectionId = params.connectionId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [otherUser, setOtherUser] = useState<any>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; display_name: string }[]>([]);

  const loadSplits = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/splits?connectionId=${connectionId}`);
      if (res.ok) {
        const data = await res.json() as { splits: Split[] };
        setSplits(data.splits ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [connectionId, user]);

  useEffect(() => {
    if (!connectionId || !user) return;

    const loadConn = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conn } = await getConnectionById(supabase as any, connectionId);
      if (!conn) { router.replace("/splits"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connAny = conn as any;
      const other = conn.requester_id === user.id ? connAny.receiver : connAny.requester;
      setOtherUser(other);
      setParticipants([
        { id: user.id, display_name: "You" },
        { id: other.id, display_name: other.display_name },
      ]);
    };

    void loadConn();
    void loadSplits();
  }, [connectionId, user, router, loadSplits]);

  const activeSplits = splits.filter((s: Split) => !s.is_settled);
  const settledSplits = splits.filter((s: Split) => s.is_settled);

  return (
    <div className="min-h-screen bg-sage-surface md:flex">
      <AppSidebar />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-brand-500 text-white">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-lg leading-tight">
                {otherUser ? `Splits with ${otherUser.display_name}` : "Bill Splits"}
              </h1>
              <p className="text-white/70 text-xs">Shared expenses tracker</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-4">
          {isLoading ? (
            <LoadingSkeletons />
          ) : splits.length === 0 ? (
            <EmptyState onAdd={() => setShowAddModal(true)} otherName={otherUser?.display_name} />
          ) : (
            <>
              {activeSplits.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active</h2>
                  <div className="space-y-3">
                    {activeSplits.map((s: Split) => (
                      <SplitCard key={s.id} split={s} currentUserId={user?.id ?? ""} onUpdated={loadSplits} />
                    ))}
                  </div>
                </section>
              )}

              {settledSplits.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Settled</h2>
                  <div className="space-y-3">
                    {settledSplits.map((s: Split) => (
                      <SplitCard key={s.id} split={s} currentUserId={user?.id ?? ""} onUpdated={loadSplits} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add split modal */}
      {showAddModal && (
        <AddSplitModal
          connectionId={connectionId}
          participants={participants}
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); void loadSplits(); }}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd, otherName }: { onAdd: () => void; otherName?: string }) {
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
          Track shared expenses with {otherName ?? "your roommate"} — rent, utilities, groceries.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-colors"
      >
        Add first split
      </button>
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full" />
          <div className="space-y-2 pt-1">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100" />
                <div className="flex-1 h-3 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
