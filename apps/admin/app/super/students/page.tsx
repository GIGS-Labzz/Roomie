"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { GraduationCap, CheckCircle, XCircle, Clock, Table, Search, ArrowUpDown, X, FileSpreadsheet, FileText } from "lucide-react";

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [exportLoading, setExportLoading] = useState<"xlsx" | "pdf" | null>(null);

  // Bulk Actions State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleBulkBar = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update({ is_active: false, verification_status: "REJECTED" })
        .in("id", selectedUserIds);

      if (updateError) throw updateError;

      // Update local state in modal
      setAllUsers((prev) =>
        prev.map((u) =>
          selectedUserIds.includes(u.id) ? { ...u, is_active: false, verification_status: "REJECTED" } : u
        )
      );
      // Update local state on main list
      setStudents((prev) =>
        prev.map((u) =>
          selectedUserIds.includes(u.id) ? { ...u, is_active: false, verification_status: "REJECTED" } : u
        )
      );

      setSelectedUserIds([]);
      alert("Successfully barred selected accounts.");
    } catch (err) {
      console.error(err);
      alert("Failed to bar selected accounts.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error: deleteError } = await (supabase as any)
        .from("profiles")
        .delete()
        .in("id", selectedUserIds);

      if (deleteError) throw deleteError;

      // Update local state in modal
      setAllUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      // Update local state on main list
      setStudents((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));

      setSelectedUserIds([]);
      setShowConfirmDelete(false);
      alert("Successfully deleted selected accounts.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected accounts.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const load = async (showAll = false) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("profiles")
      .select("id, display_name, username, university, faculty, course, year_of_study, verification_status, student_verified, city, avatar_url, created_at")
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

  const loadAllUsers = async () => {
    setModalLoading(true);
    setModalError(null);
    try {
      const { data, error: loadError } = await (supabase as any)
        .from("profiles")
        .select("id, display_name, username, university, faculty, course, year_of_study, verification_status, student_verified, city, avatar_url, created_at")
        .eq("onboarding_complete", true)
        .order("created_at", { ascending: false });

      if (loadError) throw loadError;
      setAllUsers(data ?? []);
    } catch (err: any) {
      console.error(err);
      setModalError("Unable to load all users database.");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      void loadAllUsers();
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredUsers = () => {
    let result = [...allUsers];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => {
        const fullName = (u.display_name || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        const school = [u.university, u.faculty, u.course].filter(Boolean).join(" ").toLowerCase();
        const location = (u.city || "").toLowerCase();
        return fullName.includes(q) || username.includes(q) || school.includes(q) || location.includes(q);
      });
    }

    // Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let valA: any = "";
        let valB: any = "";

        if (key === "school") {
          valA = [a.university, a.faculty, a.course].filter(Boolean).join(" · ").toLowerCase();
          valB = [b.university, b.faculty, b.course].filter(Boolean).join(" · ").toLowerCase();
        } else if (key === "joinDate") {
          valA = a.created_at ? new Date(a.created_at).getTime() : 0;
          valB = b.created_at ? new Date(b.created_at).getTime() : 0;
        } else {
          valA = (a[key] || "").toString().toLowerCase();
          valB = (b[key] || "").toString().toLowerCase();
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const filteredAndSortedUsers = getSortedAndFilteredUsers();

  const exportToXLSX = async () => {
    setExportLoading("xlsx");
    try {
      const XLSX = await import("xlsx");
      const wsData = filteredAndSortedUsers.map(u => ({
        "Full Name": u.display_name || "Unnamed",
        "Username": u.username ? `@${u.username}` : "Not set",
        "School": [u.university, u.faculty, u.course].filter(Boolean).join(" · ") || "N/A",
        "Location": u.city || "N/A",
        "Join Date": u.created_at ? new Date(u.created_at).toLocaleString() : "N/A",
        "Verification Status": u.verification_status || "UNVERIFIED"
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users Data");

      // Auto-fit column widths
      const colWidths = [
        { wch: 25 }, // Full Name
        { wch: 20 }, // Username
        { wch: 35 }, // School
        { wch: 20 }, // Location
        { wch: 25 }, // Join Date
        { wch: 20 }, // Verification Status
      ];
      ws["!cols"] = colWidths;

      XLSX.writeFile(wb, `roomie_users_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export XLSX");
    } finally {
      setExportLoading(null);
    }
  };

  const exportToPDF = async () => {
    setExportLoading("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");
      
      const doc = new jsPDF("landscape");
      
      // Title and Meta Info
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("Roomie Onboarded Users Database", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);
      doc.text(`Total Records: ${filteredAndSortedUsers.length}`, 14, 31);
      
      const tableHeaders = ["Full Name", "Username", "School", "Location", "Join Date", "Verification Status"];
      const tableRows = filteredAndSortedUsers.map(u => [
        u.display_name || "Unnamed",
        u.username ? `@${u.username}` : "Not set",
        [u.university, u.faculty, u.course].filter(Boolean).join(" · ") || "N/A",
        u.city || "N/A",
        u.created_at ? new Date(u.created_at).toLocaleString() : "N/A",
        u.verification_status || "UNVERIFIED"
      ]);

      (doc as any).autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: 36,
        theme: "striped",
        headStyles: { 
          fillColor: [79, 70, 229], // brand-600
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold"
        },
        bodyStyles: { 
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          2: { cellWidth: 80 }
        },
        margin: { top: 35 }
      });
      
      doc.save(`roomie_users_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF");
    } finally {
      setExportLoading(null);
    }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Student Verification</h1>
          <p className="text-sm text-slate-500 mt-1">Review and verify student ID submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0"
          >
            <Table className="w-4 h-4" />
            All Users Database
          </button>
          {tab === "pending" && pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {pendingCount} pending
            </div>
          )}
        </div>
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
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    {student.display_name || "Unnamed"}
                    {student.username && (
                      <span className="font-mono text-slate-400 text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        @{student.username}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {[student.university, student.faculty, student.course].filter(Boolean).join(" · ")}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                    {student.city && <span>{student.city}</span>}
                    {student.city && student.created_at && <span className="text-slate-300">•</span>}
                    {student.created_at && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        Joined: {new Date(student.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                  </div>
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

      {/* All Users Database Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white shrink-0">
              {selectedUserIds.length > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-brand-50 px-4 py-2.5 rounded-2xl border border-brand-100 animate-in fade-in duration-200">
                  <div className="text-sm font-semibold text-brand-800">
                    {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={bulkActionLoading}
                      onClick={() => void handleBulkBar()}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                    >
                      {bulkActionLoading ? "Processing..." : "Bar Accounts"}
                    </button>
                    <button
                      disabled={bulkActionLoading}
                      onClick={() => setShowConfirmDelete(true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                    >
                      Delete Accounts
                    </button>
                    <button
                      disabled={bulkActionLoading}
                      onClick={() => setSelectedUserIds([])}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1.5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="font-display font-bold text-slate-900 text-xl flex items-center gap-2">
                      <Table className="w-5 h-5 text-brand-500" />
                      All Users Database
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Search, sort, and export onboarding-complete user profiles.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search name, username, school..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 text-slate-900"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2">
                      <button
                        disabled={exportLoading !== null || modalLoading}
                        onClick={() => void exportToXLSX()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold disabled:opacity-60 transition-all border border-emerald-100"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        {exportLoading === "xlsx" ? "Exporting..." : "Excel"}
                      </button>
                      <button
                        disabled={exportLoading !== null || modalLoading}
                        onClick={() => void exportToPDF()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold disabled:opacity-60 transition-all border border-rose-100"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {exportLoading === "pdf" ? "Exporting..." : "PDF"}
                      </button>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => { setIsModalOpen(false); setSelectedUserIds([]); }}
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Modal Body / Table */}
            <div className="flex-1 overflow-auto bg-slate-50">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Loading database...</span>
                </div>
              ) : modalError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-6 py-4 text-sm text-red-700 max-w-md text-center shadow-sm">
                    {modalError}
                  </div>
                </div>
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                  <div className="font-semibold text-slate-900">No users found</div>
                  <div className="text-xs text-slate-500">Try adjusting your search criteria.</div>
                </div>
              ) : (
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden border-b border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_rgba(226,232,240,0.8)]">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left w-12 sticky top-0 bg-slate-50 z-10">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                              checked={
                                filteredAndSortedUsers.length > 0 &&
                                filteredAndSortedUsers.every((u) => selectedUserIds.includes(u.id))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds((prev) => {
                                    const newIds = [...prev];
                                    filteredAndSortedUsers.forEach((u) => {
                                      if (!newIds.includes(u.id)) newIds.push(u.id);
                                    });
                                    return newIds;
                                  });
                                } else {
                                  setSelectedUserIds((prev) =>
                                    prev.filter((id) => !filteredAndSortedUsers.some((u) => u.id === id))
                                  );
                                }
                              }}
                            />
                          </th>
                          {[
                            { label: "Full Name", key: "display_name" },
                            { label: "Username", key: "username" },
                            { label: "School", key: "school" },
                            { label: "Location", key: "city" },
                            { label: "Join Date", key: "joinDate" },
                            { label: "Verification", key: "verification_status" },
                          ].map((col) => (
                            <th
                              key={col.key}
                              scope="col"
                              onClick={() => handleSort(col.key)}
                              className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none font-display"
                            >
                              <div className="flex items-center gap-1.5">
                                {col.label}
                                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredAndSortedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Checkbox */}
                            <td className="px-6 py-3.5 whitespace-nowrap w-12">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                                checked={selectedUserIds.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUserIds((prev) => [...prev, user.id]);
                                  } else {
                                    setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
                                  }
                                }}
                              />
                            </td>

                            {/* Full Name */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-4 h-4 text-brand-600" />
                                  </div>
                                )}
                                <div className="text-sm font-semibold text-slate-900">
                                  {user.display_name || "Unnamed"}
                                </div>
                              </div>
                            </td>

                            {/* Username */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                              {user.username ? (
                                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-xs border border-slate-100">
                                  @{user.username}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs italic">Not set</span>
                              )}
                            </td>

                            {/* School */}
                            <td className="px-6 py-3.5 text-sm text-slate-600 max-w-xs truncate">
                              {[user.university, user.faculty, user.course].filter(Boolean).join(" · ") || (
                                <span className="text-slate-400 text-xs italic">N/A</span>
                              )}
                            </td>

                            {/* Location */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-600">
                              {user.city || <span className="text-slate-400 text-xs italic">N/A</span>}
                            </td>

                            {/* Join Date */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-600">
                              {user.created_at ? (
                                <div className="text-xs">
                                  <div>{new Date(user.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</div>
                                  <div className="text-slate-400 mt-0.5">{new Date(user.created_at).toLocaleTimeString("en-US", { timeStyle: "short" })}</div>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs italic">N/A</span>
                              )}
                            </td>

                            {/* Verification Status */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-sm">
                              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg ${STATUS_STYLE[user.verification_status] ?? "bg-slate-100 text-slate-500"}`}>
                                {user.verification_status || "UNVERIFIED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white text-xs text-slate-500 shrink-0 font-medium">
              <div>
                Showing {filteredAndSortedUsers.length} of {allUsers.length} total users
              </div>
              <div>
                Press ESC or click the Close button to exit database view
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Warning Modal for Deletion */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-slate-900 text-lg">Confirm Account Deletion</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to permanently delete the <strong>{selectedUserIds.length}</strong> selected account{selectedUserIds.length > 1 ? "s" : ""}?
            </p>
            <p className="text-xs text-red-600 font-semibold mt-2 bg-red-50 p-2.5 rounded-lg border border-red-100">
              Warning: This will permanently drop the users from the database, including their profile details, matches, and chats. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                disabled={bulkActionLoading}
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                disabled={bulkActionLoading}
                onClick={() => void handleBulkDelete()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
              >
                {bulkActionLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
