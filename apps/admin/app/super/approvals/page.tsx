"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";

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
        .select("id, name, status, contact_email, url, cities, campus_tags, description")
        .eq("status", "PENDING_REVIEW")
        .limit(100);

      if (loadError) setError("Unable to load pending platforms.");
      else setPending(data ?? []);
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
    if (updateError) { setError("Unable to update platform status. Try again."); return; }
    setPending((current) => current.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Provider Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Approve platforms so they can log in and manage their dashboard.
          </p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {pending.length} awaiting review
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div>
            <div className="font-semibold text-slate-900">All caught up!</div>
            <div className="text-sm text-slate-500 mt-1">No platforms are awaiting approval.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((platform) => (
            <div key={platform.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{platform.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{platform.contact_email}</div>
                  {platform.description && (
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{platform.description}</p>
                  )}
                </div>
              </div>

              {(platform.cities?.length > 0 || platform.campus_tags?.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {(platform.cities ?? []).map((c: string) => (
                    <span key={c} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">{c}</span>
                  ))}
                  {(platform.campus_tags ?? []).map((t: string) => (
                    <span key={t} className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-lg font-medium">{t}</span>
                  ))}
                </div>
              )}

              {platform.url && (
                <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">
                  {platform.url}
                </a>
              )}

              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  disabled={actionLoading === platform.id}
                  onClick={() => void handleDecision(platform.id, "ACTIVE")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading === platform.id ? "Working…" : "Approve"}
                </button>
                <button
                  disabled={actionLoading === platform.id}
                  onClick={() => void handleDecision(platform.id, "REJECTED")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-all"
                >
                  <XCircle className="w-4 h-4" />
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
