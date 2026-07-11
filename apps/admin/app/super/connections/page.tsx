"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { Link2, TrendingUp, Users, Clock, Network, Copy, Check, Info } from "lucide-react";

const supabase = createClient();

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-700 border border-emerald-100",
  PENDING:   "bg-amber-50 text-amber-700 border border-amber-100",
  CANCELLED: "bg-slate-100 text-slate-500 border border-slate-200",
  REJECTED:  "bg-red-50 text-red-600 border border-red-100",
};

const fmtNaira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `₦${(n / 1_000).toFixed(0)}K`
  : `₦${n}`;

interface RoommatePool {
  poolId: string | null;
  status: string;
  amountPaid: number;
  createdAt: string;
  connectedAt: string | null;
  members: {
    id: string;
    display_name: string | null;
    university: string | null;
    city: string | null;
    avatar_url: string | null;
  }[];
  connections: {
    id: string;
    status: string;
    amount_paid: number | null;
    payment_reference: string | null;
    created_at: string;
    connected_at: string | null;
    requester: any;
    receiver: any;
  }[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-lg font-mono transition-all active:scale-95 shrink-0"
      title="Copy Roomie ID"
    >
      <span>{text}</span>
      {copied ? (
        <Check className="w-2.5 h-2.5 text-emerald-600 animate-scale" />
      ) : (
        <Copy className="w-2.5 h-2.5" />
      )}
    </button>
  );
}

function PoolVisualizer({ pool }: { pool: RoommatePool }) {
  const members = pool.members;
  const N = members.length;

  const getCoordinates = (index: number, total: number) => {
    if (total === 1) {
      return { x: 50, y: 50 };
    }
    if (total === 2) {
      return { x: index === 0 ? 20 : 80, y: 50 };
    }
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: 50 + 32 * Math.cos(angle),
      y: 50 + 30 * Math.sin(angle),
    };
  };

  return (
    <div className="relative w-full h-48 bg-slate-50/50 rounded-2xl border border-slate-100/80 overflow-hidden flex items-center justify-center">
      <style>{`
        @keyframes connectionFlow {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .connection-flow {
          stroke-dasharray: 6 6;
          animation: connectionFlow 1.2s linear infinite;
        }
      `}</style>

      {/* SVG Flow Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {members.map((member, i) => {
          const coords = getCoordinates(i, N);
          const isActive = pool.status === "ACTIVE";
          return (
            <g key={member.id}>
              <line
                x1="50"
                y1="50"
                x2={coords.x}
                y2={coords.y}
                className={isActive ? "stroke-brand-200" : "stroke-slate-200"}
                strokeWidth="1.5"
                strokeDasharray={!isActive ? "3 3" : undefined}
              />
              {isActive && (
                <line
                  x1="50"
                  y1="50"
                  x2={coords.x}
                  y2={coords.y}
                  className="stroke-brand-500/70 connection-flow"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Central Hub */}
      <div
        className={`absolute w-11 h-11 -ml-5.5 -mt-5.5 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 transition-all duration-300 hover:scale-105 ${
          pool.status === "ACTIVE"
            ? "bg-gradient-to-tr from-brand-500 to-emerald-500 text-white"
            : "bg-slate-200 text-slate-500 border-slate-300"
        }`}
        style={{ left: "50%", top: "50%" }}
      >
        {pool.status === "ACTIVE" && (
          <div className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-25" />
        )}
        <Network className="w-4.5 h-4.5 relative z-10" />
      </div>

      {/* Satellite Member Nodes */}
      {members.map((member, i) => {
        const coords = getCoordinates(i, N);
        return (
          <div
            key={member.id}
            className="absolute w-12 h-12 -ml-6 -mt-6 group/node cursor-pointer z-10"
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
          >
            {/* Tooltip details on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] p-2 rounded-xl shadow-xl opacity-0 group-hover/node:opacity-100 transition-all duration-200 pointer-events-none z-20 translate-y-1 group-hover/node:translate-y-0">
              <div className="font-bold truncate text-slate-100">{member.display_name}</div>
              <div className="text-slate-300 truncate text-[9px] mt-0.5">{member.university || "No University"}</div>
              <div className="text-slate-400 truncate text-[9px]">{member.city || "No City"}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
            </div>

            {/* Avatar container */}
            <div className="w-full h-full rounded-2xl bg-white border border-slate-200 p-0.5 shadow-sm group-hover/node:border-brand-500 group-hover/node:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="" className="w-full h-full rounded-[14px] object-cover" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-brand-50/50 flex items-center justify-center text-brand-700">
                  <span className="font-bold text-[10px]">{member.display_name?.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "all" | "multi">("active");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Fetch connections along with their profiles and roommate agreements
      const { data, error: loadError } = await (supabase as any)
        .from("connections")
        .select(`
          id, status, amount_paid, payment_reference, created_at, connected_at,
          requester:profiles!connections_requester_id_fkey(id, display_name, university, city, avatar_url),
          receiver:profiles!connections_receiver_id_fkey(id, display_name, university, city, avatar_url),
          roommate_agreements(id, status, roomie_id, pool_roomie_id)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      setLoading(false);
      if (loadError) {
        setError("Unable to load connections.");
        setConnections([]);
      } else {
        setConnections(data ?? []);
      }
    };
    void load();
  }, []);

  // Group connections into pools
  const poolsMap: Record<string, RoommatePool> = {};
  const standalonePools: RoommatePool[] = [];

  connections.forEach((conn) => {
    const agreement = conn.roommate_agreements?.[0] || conn.roommate_agreements;
    const roomieId = agreement?.roomie_id || agreement?.pool_roomie_id;

    if (roomieId && conn.status === "ACTIVE") {
      if (!poolsMap[roomieId]) {
        poolsMap[roomieId] = {
          poolId: roomieId,
          status: "ACTIVE",
          amountPaid: 0,
          createdAt: conn.created_at,
          connectedAt: conn.connected_at || conn.created_at,
          members: [],
          connections: [],
        };
      }
      const pool = poolsMap[roomieId];
      pool.connections.push(conn);
      pool.amountPaid += conn.amount_paid || 0;

      if (new Date(conn.created_at) < new Date(pool.createdAt)) {
        pool.createdAt = conn.created_at;
      }
      if (conn.connected_at && (!pool.connectedAt || new Date(conn.connected_at) < new Date(pool.connectedAt))) {
        pool.connectedAt = conn.connected_at;
      }

      [conn.requester, conn.receiver].forEach((profile) => {
        if (profile && !pool.members.some((m) => m.id === profile.id)) {
          pool.members.push({
            id: profile.id,
            display_name: profile.display_name,
            university: profile.university,
            city: profile.city,
            avatar_url: profile.avatar_url,
          });
        }
      });
    } else {
      const standalone: RoommatePool = {
        poolId: null,
        status: conn.status,
        amountPaid: conn.amount_paid || 0,
        createdAt: conn.created_at,
        connectedAt: conn.connected_at,
        members: [],
        connections: [conn],
      };

      [conn.requester, conn.receiver].forEach((profile) => {
        if (profile && !standalone.members.some((m) => m.id === profile.id)) {
          standalone.members.push({
            id: profile.id,
            display_name: profile.display_name,
            university: profile.university,
            city: profile.city,
            avatar_url: profile.avatar_url,
          });
        }
      });

      standalonePools.push(standalone);
    }
  });

  const activePools = Object.values(poolsMap);
  const allPools = [...activePools, ...standalonePools];

  const totalRevenue = connections
    .filter((c) => c.status === "ACTIVE")
    .reduce((s, c) => s + (c.amount_paid ?? 0), 0);

  const shownPools =
    tab === "active" ? allPools.filter((p) => p.status === "ACTIVE") :
    tab === "multi"  ? activePools.filter((p) => p.members.length >= 3) :
    allPools;

  const activeConnectionsCount = connections.filter((c) => c.status === "ACTIVE").length;
  const pendingConnectionsCount = connections.filter((c) => c.status !== "ACTIVE").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Roommate Connection Pools</h1>
          <p className="text-sm text-slate-500 mt-1">Visualize student pairings grouped by verified roommate pool networks.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 shadow-sm">
          <TrendingUp className="w-4 h-4" />
          {fmtNaira(totalRevenue)} total revenue
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Active Pools</div>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">{activePools.length}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Multi-Member Pools (3+)</div>
          <div className="flex items-center gap-2 mt-1">
            <Network className="w-4 h-4 text-brand-600" />
            <span className="text-xl font-bold text-slate-900">
              {activePools.filter((p) => p.members.length >= 3).length}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Connected Pairs</div>
          <div className="flex items-center gap-2 mt-1">
            <Link2 className="w-4 h-4 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">{activeConnectionsCount}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Pending Pairings</div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xl font-bold text-slate-900">{pendingConnectionsCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "active", label: `Active Pools (${activePools.length + standalonePools.filter(s => s.status === "ACTIVE").length})` },
          { key: "multi",  label: `Multi-Member (${activePools.filter((p) => p.members.length >= 3).length})` },
          { key: "all",    label: `All (${allPools.length})` },
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

      {shownPools.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-slate-400 text-sm shadow-sm">
          No connection pools found in this tab.
        </div>
      ) : (
        <div className="space-y-4">
          {shownPools.map((pool, idx) => {
            const isMultiMember = pool.members.length >= 3;
            const uniqueKey = pool.poolId || `standalone-${idx}-${pool.connections[0]?.id}`;

            return (
              <div
                key={uniqueKey}
                className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 p-5 flex flex-col md:flex-row gap-6 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              >
                {/* Visual Representation (Left Column) */}
                <div className="w-full md:w-[260px] shrink-0">
                  <PoolVisualizer pool={pool} />
                </div>

                {/* Pool Info (Right Column) */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Labels & Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {pool.poolId ? (
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                              {isMultiMember ? "Multi-Member Pool" : "Standard Pool"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 uppercase tracking-wider">
                              Unconfirmed Pairing
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-medium">
                            {pool.members.length} member{pool.members.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        {pool.poolId && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-medium">Pool ID:</span>
                            <CopyButton text={pool.poolId} />
                          </div>
                        )}
                      </div>

                      {/* Status + Amount */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${STATUS_STYLE[pool.status] ?? "bg-slate-50 text-slate-500"}`}>
                          {pool.status}
                        </span>
                        {pool.amountPaid > 0 && (
                          <span className="text-xs font-bold text-slate-900">
                            {fmtNaira(pool.amountPaid)} Paid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Quick-Profiles */}
                    <div className="mt-4 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-300" />
                        Roommate Network
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pool.members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 bg-white border border-slate-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-2.5 py-1 rounded-xl text-xs"
                          >
                            <span className="font-semibold text-slate-800">{m.display_name || "Unknown"}</span>
                            {m.university && (
                              <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                                {m.university}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transactions Details */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Underlying Pairings & Transactions
                    </div>
                    <div className="space-y-2">
                      {pool.connections.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                            <span className="font-medium truncate">{c.requester?.display_name || "Unknown"}</span>
                            <span className="text-[10px] text-slate-400">⇆</span>
                            <span className="font-medium truncate">{c.receiver?.display_name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4 font-mono text-[10px] text-slate-400">
                            {c.payment_reference && (
                              <span className="hidden sm:inline">Ref: {c.payment_reference.slice(0, 12)}...</span>
                            )}
                            {c.connected_at ? (
                              <span>Connected {new Date(c.connected_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                            ) : (
                              <span>Requested {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

