"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { Building2, Globe, MapPin, Tag } from "lucide-react";

const supabase = createClient();

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:         "bg-emerald-50 text-emerald-700",
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  REJECTED:       "bg-red-50 text-red-600",
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PENDING_REVIEW" | "REJECTED">("ALL");

  useEffect(() => {
    const load = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("housing_platforms")
        .select("id, name, status, contact_email, url, cities, campus_tags, is_featured, total_clicks")
        .order("created_at", { ascending: false })
        .limit(100);
      setProviders(data ?? []);
      setLoading(false);
    };
    void load();
  }, []);

  const filtered = filter === "ALL" ? providers : providers.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Providers</h1>
          <p className="text-sm text-slate-500 mt-1">All housing platforms registered on Roomie.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {(["ALL", "ACTIVE", "PENDING_REVIEW", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {s === "ALL" ? "All" : s === "PENDING_REVIEW" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-400 text-sm">No providers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.contact_email}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg shrink-0 ${STATUS_STYLE[p.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {p.status === "PENDING_REVIEW" ? "Pending" : p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                    {(p.url ?? "").replace(/^https?:\/\//, "")}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{(p.cities ?? []).join(", ") || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{(p.campus_tags ?? []).join(", ") || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {p.total_clicks ?? 0} clicks
                  {p.is_featured && <span className="ml-2 text-peach-600 font-semibold">★ Featured</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
