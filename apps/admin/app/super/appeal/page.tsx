"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { Shield, CheckCircle, XCircle, FileText, AlertTriangle, UserMinus, ShieldAlert } from "lucide-react";

const supabase = createClient();

export default function AppealDashboardPage() {
  const [tab, setTab] = useState<"appeals" | "reports">("appeals");
  const [appeals, setAppeals] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "appeals") {
        // Fetch pending appeals
        const { data, error: fetchErr } = await (supabase as any)
          .from("user_appeals")
          .select("id, user_id, status, document_url, message, created_at, profiles(id, display_name, username, university, city, avatar_url)")
          .eq("status", "PENDING")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;
        setAppeals(data ?? []);
      } else {
        // Fetch reports
        const { data, error: fetchErr } = await (supabase as any)
          .from("user_reports")
          .select("id, reporter_id, reported_id, reason, created_at, reporter:profiles!reporter_id(display_name, username), reported:profiles!reported_id(display_name, username, is_active, verification_status)")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;
        setReports(data ?? []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [tab]);

  const handleApproveAppeal = async (appealId: string, userId: string) => {
    setActionLoading(appealId);
    setError(null);
    try {
      // 1. Unfreeze profile
      const { error: profileErr } = await (supabase as any)
        .from("profiles")
        .update({ is_active: true, verification_status: "VERIFIED", student_verified: true })
        .eq("id", userId);

      if (profileErr) throw profileErr;

      // 2. Clear all reports against this user
      const { error: reportsErr } = await (supabase as any)
        .from("user_reports")
        .delete()
        .eq("reported_id", userId);

      if (reportsErr) throw reportsErr;

      // 3. Mark appeal as APPROVED
      const { error: appealErr } = await (supabase as any)
        .from("user_appeals")
        .update({ status: "APPROVED" })
        .eq("id", appealId);

      if (appealErr) throw appealErr;

      // Remove from list
      setAppeals((prev) => prev.filter((a) => a.id !== appealId));
      alert("Appeal approved! The user has been unfrozen and their reports have been cleared.");
    } catch (err: any) {
      console.error(err);
      setError("Failed to approve appeal.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppeal = async (appealId: string) => {
    setActionLoading(appealId);
    setError(null);
    try {
      const { error: appealErr } = await (supabase as any)
        .from("user_appeals")
        .update({ status: "REJECTED" })
        .eq("id", appealId);

      if (appealErr) throw appealErr;

      setAppeals((prev) => prev.filter((a) => a.id !== appealId));
      alert("Appeal rejected. The user remains barred.");
    } catch (err: any) {
      console.error(err);
      setError("Failed to reject appeal.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualBarUser = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    try {
      const { error: profileErr } = await (supabase as any)
        .from("profiles")
        .update({ is_active: false, verification_status: "REJECTED" })
        .eq("id", userId);

      if (profileErr) throw profileErr;

      // Update reports state locally
      setReports((prev) =>
        prev.map((r) =>
          r.reported_id === userId
            ? { ...r, reported: { ...r.reported, is_active: false, verification_status: "REJECTED" } }
            : r
        )
      );
      alert("User account has been barred.");
    } catch (err: any) {
      console.error(err);
      setError("Failed to bar user.");
    } finally {
      setActionLoading(null);
    }
  };

  const getDocLink = (path: string) => {
    const { data } = supabase.storage.from("student-ids").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-brand-500" />
            Appeals & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review account suspension appeals and user-submitted flags.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("appeals")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "appeals" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pending Appeals ({tab === "appeals" && !loading ? appeals.length : "..."})
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "reports" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Reports ({tab === "reports" && !loading ? reports.length : "..."})
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : tab === "appeals" ? (
        appeals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center text-center gap-3">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <div>
              <div className="font-semibold text-slate-900">All Clear!</div>
              <div className="text-sm text-slate-500 mt-1">No pending account appeals to review.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appeals.map((appeal) => {
              const u = appeal.profiles;
              return (
                <div key={appeal.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 border border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    {u?.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        {u?.display_name || "Unnamed"}
                        {u?.username && <span className="font-mono text-xs text-slate-400">@{u.username}</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {u?.university || "No university set"} · Joined: {new Date(appeal.created_at).toLocaleString()}
                      </div>
                      <p className="text-sm text-slate-600 mt-3.5 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap max-w-2xl leading-relaxed">
                        <strong className="text-xs font-semibold text-slate-400 block mb-1">APPEAL MESSAGE:</strong>
                        {appeal.message || "No explanation provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 md:items-end justify-end pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                    <a
                      href={getDocLink(appeal.document_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-sm border border-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Document
                    </a>
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading === appeal.id}
                        onClick={() => void handleApproveAppeal(appeal.id, appeal.user_id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold disabled:opacity-60 transition-all shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {actionLoading === appeal.id ? "…" : "Approve"}
                      </button>
                      <button
                        disabled={actionLoading === appeal.id}
                        onClick={() => void handleRejectAppeal(appeal.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold disabled:opacity-60 transition-all border border-red-100"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div>
            <div className="font-semibold text-slate-900">All Clear!</div>
            <div className="text-sm text-slate-500 mt-1">No user flags have been submitted.</div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 rounded-3xl">
          <div className="min-w-full inline-block align-middle overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Reported User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Reporter</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Reason</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Reported User */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {report.reported?.display_name || "Deleted Profile"}
                      </div>
                      {report.reported?.username && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">@{report.reported.username}</div>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-700">
                        {report.reporter?.display_name || "Unknown Reporter"}
                      </div>
                      {report.reporter?.username && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">@{report.reporter.username}</div>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-3.5 text-sm text-slate-600 max-w-xs truncate" title={report.reason}>
                      {report.reason}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {new Date(report.created_at).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {report.reported?.is_active === false ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 rounded border border-red-100 uppercase tracking-wide">
                          Barred
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-right text-xs">
                      {report.reported?.is_active !== false && (
                        <button
                          disabled={actionLoading === report.reported_id}
                          onClick={() => void handleManualBarUser(report.reported_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold disabled:opacity-60 transition-all border border-amber-100"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Bar User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
