"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";

const supabase = createClient();

const STATUS_STYLE: Record<string, string> = {
  VERIFIED:   "bg-emerald-50 text-emerald-700",
  PENDING:    "bg-amber-50 text-amber-700",
  UNVERIFIED: "bg-slate-100 text-slate-500",
  REJECTED:   "bg-red-50 text-red-600",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const load = async (showAll = false) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("profiles")
      .select("id, display_name, university, faculty, course, year_of_study, verification_status, student_verified, city, avatar_url")
      .eq("onboarding_complete", true)  // exclude housing providers / admin accounts
      .order("created_at", { ascending: false })
      .limit(100);

    if (!showAll) {
      query = query.in("verification_status", ["PENDING", "UNVERIFIED"]);
    }

    const { data, error: loadError } = await query;
    setLoading(false);
    if (loadError) { setError("Unable to load students."); setStudents([]); }
    else setStudents(data ?? []);
  };

  useEffect(() => { void load(tab === "all"); }, [tab]);

  const updateStatus = async (id: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(id);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({ verification_status: status, student_verified: status === "VERIFIED" })
      .eq("id", id);

    setActionLoading(null);
    if (updateError) { setError("Unable to update verification status."); return; }
    if (tab === "pending") setStudents((cur) => cur.filter((s) => s.id !== id));
    else setStudents((cur) => cur.map((s) => s.id === id ? { ...s, verification_status: status, student_verified: status === "VERIFIED" } : s));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = students.filter((s) => ["PENDING", "UNVERIFIED"].includes(s.verification_status)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Student Verification</h1>
          <p className="text-sm text-slate-500 mt-1">Review and verify student ID submissions.</p>
        </div>
        {tab === "pending" && pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {pendingCount} pending
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["pending", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "pending" ? "Needs Review" : "All Students"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
          <div>
            <div className="font-semibold text-slate-900">All clear!</div>
            <div className="text-sm text-slate-500 mt-1">No students awaiting verification.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-brand-600" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{student.display_name || "Unnamed"}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {[student.university, student.faculty, student.course].filter(Boolean).join(" · ")}
                  </div>
                  {student.city && <div className="text-xs text-slate-400">{student.city}</div>}
                </div>
              </div>

              <div className="flex items-center gap-3 md:shrink-0">
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${STATUS_STYLE[student.verification_status] ?? "bg-slate-100 text-slate-500"}`}>
                  {student.verification_status}
                </span>

                {["PENDING", "UNVERIFIED"].includes(student.verification_status) && (
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === student.id}
                      onClick={() => void updateStatus(student.id, "VERIFIED")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 disabled:opacity-60 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {actionLoading === student.id ? "…" : "Verify"}
                    </button>
                    <button
                      disabled={actionLoading === student.id}
                      onClick={() => void updateStatus(student.id, "REJECTED")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-60 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
