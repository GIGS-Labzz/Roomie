"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@repo/db/client";
import { Shield, CheckCircle, XCircle, FileText, AlertTriangle, UserMinus, ShieldAlert, Clock, ChevronDown, ChevronUp } from "lucide-react";

const supabase = createClient();

export default function AppealDashboardPage() {
  const [tab, setTab] = useState<"appeals" | "reports">("appeals");
  const [appeals, setAppeals] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedReportedIds, setExpandedReportedIds] = useState<string[]>([]);

  // Group reports by reported_id and sort by report count descending
  const groupedReports = useMemo(() => {
    const groups: Record<string, {
      reported_id: string;
      reported: any;
      reports: any[];
    }> = {};

    reports.forEach((r) => {
      if (!r.reported_id) return;
      if (!groups[r.reported_id]) {
        groups[r.reported_id] = {
          reported_id: r.reported_id,
          reported: r.reported,
          reports: [],
        };
      }
      groups[r.reported_id].reports.push(r);
    });

    return Object.values(groups).sort((a, b) => b.reports.length - a.reports.length);
  }, [reports]);

  const toggleExpandReport = (reportedId: string) => {
    setExpandedReportedIds((prev) =>
      prev.includes(reportedId)
        ? prev.filter((id) => id !== reportedId)
        : [...prev, reportedId]
    );
  };

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
          .select("id, reporter_id, reported_id, reason, created_at, reporter:profiles!reporter_id(display_name, username), reported:profiles!reported_id(display_name, username, is_active, is_barred, verification_status)")
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
        .update({ is_active: true, is_barred: false, verification_status: "VERIFIED", student_verified: true })
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
        .update({ is_active: false, is_barred: true, verification_status: "REJECTED" })
        .eq("id", userId);

      if (profileErr) throw profileErr;

      // Update reports state locally
      setReports((prev) =>
        prev.map((r) =>
          r.reported_id === userId
            ? { ...r, reported: { ...r.reported, is_active: false, is_barred: true, verification_status: "REJECTED" } }
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
                    {appeal.document_url === "Awaiting upload" ? (
                      <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold select-none">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Upload
                      </span>
                    ) : (
                      <a
                        href={getDocLink(appeal.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-sm border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Document
                      </a>
                    )}
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
      ) : groupedReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div>
            <div className="font-semibold text-slate-900">All Clear!</div>
            <div className="text-sm text-slate-500 mt-1">No user flags have been submitted.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedReports.map((group) => {
            const isExpanded = expandedReportedIds.includes(group.reported_id);
            const rUser = group.reported;
            const reportCount = group.reports.length;
            const isAutoBarredThreshold = reportCount > 3;

            return (
              <div 
                key={group.reported_id} 
                className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden transition-all duration-200"
              >
                {/* Header Summary Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => toggleExpandReport(group.reported_id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={isExpanded ? "Collapse reports" : "Expand reports"}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        {rUser?.display_name || "Deleted Profile"}
                        {rUser?.username && <span className="font-mono text-xs text-slate-400">@{rUser.username}</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Status:</span>
                        {rUser?.is_barred ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-600 rounded border border-red-100 uppercase tracking-wide">
                            Barred
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Report Count Badge */}
                    <div className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      isAutoBarredThreshold 
                        ? "bg-red-50 border border-red-200 text-red-700 font-bold animate-pulse" 
                        : "bg-amber-50 border border-amber-200 text-amber-700"
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {reportCount} {reportCount === 1 ? "report" : "reports"}
                    </div>

                    {/* Bar User Button */}
                    {!rUser?.is_barred && (
                      <button
                        disabled={actionLoading === group.reported_id}
                        onClick={() => void handleManualBarUser(group.reported_id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold disabled:opacity-60 transition-all border border-amber-100 text-xs shadow-sm"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        {actionLoading === group.reported_id ? "..." : "Bar User"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Individual Reports list */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Individual Flags List
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reporter</th>
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason / Flag Category</th>
                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                          {group.reports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                                {report.reporter?.display_name || "Unknown Reporter"}
                                {report.reporter?.username && (
                                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                                    @{report.reporter.username}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-sm whitespace-pre-wrap">
                                {report.reason}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                {new Date(report.created_at).toLocaleString()}
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
          })}
        </div>
      )}
    </div>
  );
}
