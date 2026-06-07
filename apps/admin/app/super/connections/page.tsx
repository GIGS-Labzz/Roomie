"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { Link2, TrendingUp, Users, Clock } from "lucide-react";

const supabase = createClient();

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700",
  PENDING:   "bg-amber-50 text-amber-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  REJECTED:  "bg-red-50 text-red-600",
};

const fmtNaira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `₦${(n / 1_000).toFixed(0)}K`
  : `₦${n}`;

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"connected" | "all">("connected");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: loadError } = await (supabase as any)
        .from("connections")
        .select(`
          id, status, amount_paid, payment_reference, created_at, connected_at,
          requester:profiles!connections_requester_id_fkey(display_name, university, city, avatar_url),
          receiver:profiles!connections_receiver_id_fkey(display_name, university, city, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      setLoading(false);
      if (loadError) { setError("Unable to load connections."); setConnections([]); }
      else setConnections(data ?? []);
    };
    void load();
  }, []);

  const active  = connections.filter((c) => c.status === "ACTIVE");
  const pending = connections.filter((c) => c.status !== "ACTIVE");
  const shown   = tab === "connected" ? active : connections;
  const totalRevenue = active.reduce((s, c) => s + (c.amount_paid ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Connections</h1>
          <p className="text-sm text-slate-500 mt-1">Roommate pairings and connection transactions.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          {fmtNaira(totalRevenue)} total revenue
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          {active.length} connected pairs
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            {pending.length} pending
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "connected", label: `Connected (${active.length})` },
          { key: "all",       label: `All (${connections.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 text-sm">No connections found.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((conn) => (
            <div key={conn.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
              {/* Pair row */}
              <div className="flex items-center gap-3">
                {/* Requester */}
                <div className="flex items-center gap-2 min-w-0">
                  {conn.requester?.avatar_url ? (
                    <img src={conn.requester.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-brand-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{conn.requester?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-slate-400 truncate">{conn.requester?.university ?? "—"}</div>
                  </div>
                </div>

                {/* Connector icon */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
                  <Link2 className="w-4 h-4 text-brand-400" />
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-2 min-w-0">
                  {conn.receiver?.avatar_url ? (
                    <img src={conn.receiver.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-peach-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-peach-700" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{conn.receiver?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-slate-400 truncate">{conn.receiver?.university ?? "—"}</div>
                  </div>
                </div>

                {/* Status + amount — pushed right */}
                <div className="ml-auto flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${STATUS_STYLE[conn.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {conn.status}
                  </span>
                  {conn.amount_paid != null && conn.amount_paid > 0 && (
                    <span className="text-sm font-bold text-slate-900">{fmtNaira(conn.amount_paid)}</span>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>Requested {new Date(conn.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                {conn.connected_at && (
                  <span>Connected {new Date(conn.connected_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                )}
                {conn.payment_reference && <span>Ref: {conn.payment_reference}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
