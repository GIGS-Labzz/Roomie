"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export default function ApprovalsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: loadError } = await (supabase as any)
        .from("housing_platforms")
        .select("id, name, status, contact_email")
        .eq("status", "PENDING_REVIEW")
        .limit(100);

      if (loadError) {
        setError("Unable to load pending platforms.");
        setPending([]);
      } else {
        setPending(data ?? []);
      }
      setLoading(false);
    };

    void load();
  }, []);

  const handleDecision = async (id: string, status: "ACTIVE" | "REJECTED") => {
    setActionLoading(id);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("housing_platforms")
      .update({ status })
      .eq("id", id);

    setActionLoading(null);
    if (updateError) {
      setError("Unable to update platform status. Try again.");
      return;
    }
    setPending((current) => current.filter((platform) => platform.id !== id));
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Provider approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Review provider listings and approve or reject applications.</p>
        </div>
        <div className="text-sm text-slate-500">{pending.length} pending request(s)</div>
      </div>

      {error && <div className="rounded-3xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

      {pending.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-slate-500">No pending providers.</div>
      ) : (
        <div className="space-y-3">
          {pending.map((platform) => (
            <div key={platform.id} className="rounded-3xl border border-slate-200 bg-white p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{platform.name}</div>
                <div className="text-xs text-slate-400">{platform.contact_email}</div>
                <div className="text-xs text-slate-500 mt-1">Status: {platform.status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={actionLoading === platform.id}
                  onClick={() => void handleDecision(platform.id, "ACTIVE")}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {actionLoading === platform.id ? "Working…" : "Approve"}
                </button>
                <button
                  disabled={actionLoading === platform.id}
                  onClick={() => void handleDecision(platform.id, "REJECTED")}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
