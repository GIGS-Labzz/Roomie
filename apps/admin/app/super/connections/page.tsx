"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: loadError } = await (supabase as any)
        .from("connections")
        .select("id, requester_id, receiver_id, status, amount_paid, payment_reference, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

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

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Connections</h1>
          <p className="text-sm text-slate-500 mt-1">Review current roommate connection transactions.</p>
        </div>
        <div className="text-sm text-slate-500">{connections.length} recent connection(s)</div>
      </div>

      {error && <div className="rounded-3xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

      {connections.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-slate-500">No connections found.</div>
      ) : (
        <div className="space-y-3">
          {connections.map((connection) => (
            <div key={connection.id} className="rounded-3xl border border-slate-200 bg-white p-4 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr] md:items-center">
              <div>
                <div className="font-semibold text-slate-900">Connection {connection.id.slice(0, 8)}</div>
                <div className="text-xs text-slate-400">Requester: {connection.requester_id}</div>
                <div className="text-xs text-slate-400">Receiver: {connection.receiver_id}</div>
              </div>
              <div className="text-sm text-slate-600">
                <div>Status: {connection.status}</div>
                <div>Paid: {connection.amount_paid ?? 0}</div>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <div className="text-xs text-slate-500">Reference: {connection.payment_reference ?? "N/A"}</div>
                <div className="text-xs text-slate-400">Created {new Date(connection.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
