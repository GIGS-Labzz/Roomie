"use client";

import { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";

interface PoolAddRequestCardProps {
  agreementId: string;
  connectionId: string;
  initiatorName: string;
  inviteeName: string;
  inviteeId: string;
  isOwn: boolean;
  currentUserId: string;
}

export function PoolAddRequestCard({
  agreementId,
  connectionId,
  initiatorName,
  inviteeName,
  isOwn,
  currentUserId,
}: PoolAddRequestCardProps) {
  const [agreementStatus, setAgreementStatus] = useState<string>("PENDING_APPROVAL");
  const [poolApprovals, setPoolApprovals] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agreementId) return;

    const loadAgreement = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/agreements/${agreementId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Could not load agreement status");
        setAgreementStatus(data.agreement?.status ?? "PENDING_APPROVAL");
        setPoolApprovals(data.agreement?.pool_approvals ?? {});
      } catch (err) {
        console.error("Failed to load pool add agreement status", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAgreement();
  }, [agreementId]);

  // Realtime subscription to dynamic status updates
  useEffect(() => {
    if (!agreementId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`agreement-pool-card:${agreementId}-${Math.random().toString(36).substring(2, 9)}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "roommate_agreements",
          filter: `id=eq.${agreementId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setAgreementStatus(row.status ?? "PENDING_APPROVAL");
          setPoolApprovals(row.pool_approvals ?? {});
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [agreementId]);

  const handleApprovalAction = async (approve: boolean) => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: approve ? "pool_approve" : "pool_decline" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Action failed");
      setAgreementStatus(data.status);
      setPoolApprovals(data.approvals ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform action");
    } finally {
      setIsProcessing(false);
    }
  };

  const myApproval = poolApprovals[currentUserId] || "pending";

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 font-display">Add Roommate to Pool</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {initiatorName} wants to add <strong className="font-semibold text-slate-700">{inviteeName}</strong> to your roommate pool.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Loading approval status...
        </p>
      ) : agreementStatus === "CONFIRMED" ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-center text-xs font-semibold text-emerald-800">
          {inviteeName} has successfully joined the roommate pool!
        </div>
      ) : agreementStatus === "DECLINED" ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Roommate pool addition declined.
        </p>
      ) : myApproval === "approved" ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-center text-xs font-semibold text-emerald-800">
          You approved this addition. Waiting for other approvals / payment...
        </p>
      ) : myApproval === "declined" ? (
        <p className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-3 py-2 text-center text-xs font-semibold text-red-700">
          You declined this addition.
        </p>
      ) : isOwn ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Waiting for other roommates to approve.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleApprovalAction(true)}
              className="flex-1 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Approving..." : "Approve"}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleApprovalAction(false)}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
          </div>
          {error && <p className="text-xs font-medium text-red-500 text-center mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
