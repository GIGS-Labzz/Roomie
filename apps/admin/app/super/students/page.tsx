"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: loadError } = await (supabase as any)
        .from("profiles")
        .select("id, display_name, university, verification_status, student_verified")
        .in("verification_status", ["PENDING", "UNVERIFIED"])
        .limit(100);

      setLoading(false);
      if (loadError) {
        setError("Unable to load students.");
        setStudents([]);
      } else {
        setStudents(data ?? []);
      }
    };

    void load();
  }, []);

  const updateStatus = async (id: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(id);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({ verification_status: status, student_verified: status === "VERIFIED" })
      .eq("id", id);

    setActionLoading(null);
    if (updateError) {
      setError("Unable to update verification status.");
      return;
    }
    setStudents((current) => current.filter((student) => student.id !== id));
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Student verification</h1>
          <p className="text-sm text-slate-500 mt-1">Review student ID verification requests.</p>
        </div>
        <div className="text-sm text-slate-500">{students.length} pending review(s)</div>
      </div>

      {error && <div className="rounded-3xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}

      {students.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-slate-500">No students awaiting verification.</div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="rounded-3xl border border-slate-200 bg-white p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{student.display_name || "Unnamed student"}</div>
                <div className="text-xs text-slate-400">{student.university || "University not provided"}</div>
                <div className="text-xs text-slate-500 mt-1">Status: {student.verification_status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={actionLoading === student.id}
                  onClick={() => void updateStatus(student.id, "VERIFIED")}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {actionLoading === student.id ? "Working…" : "Verify"}
                </button>
                <button
                  disabled={actionLoading === student.id}
                  onClick={() => void updateStatus(student.id, "REJECTED")}
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
