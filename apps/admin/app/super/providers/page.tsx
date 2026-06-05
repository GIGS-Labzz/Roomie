"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Placeholder: fetch providers
      const { data } = await (supabase as any).from("housing_platforms").select("id, name, status").limit(50);
      setProviders(data ?? []);
      setLoading(false);
    };
    void load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div>
      <h1 className="font-display font-bold text-slate-900 text-2xl">Providers</h1>
      <div className="mt-4 space-y-2">
        {providers.map((p) => (
          <div key={p.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-400">{p.id}</div>
            </div>
            <div className="text-sm text-slate-500">{p.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
