"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PaystackButton } from "@/components/connect/PaystackButton";

interface AgreementCardProps {
  agreementId: string;
  connectionId: string;
  initiatorName: string;
  isOwn: boolean;
  isInitiator: boolean;
}

export function AgreementCard({ agreementId, connectionId, initiatorName, isOwn, isInitiator }: AgreementCardProps) {
  const [status, setStatus] = useState<"PENDING" | "DECLINED" | "CONFIRMED" | "PAYMENT_STARTED" | "CONFIRMING">("PENDING");
  const [isDeclining, setIsDeclining] = useState(false);
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
        setStatus(data.agreement?.status ?? "PENDING");
      } catch (err) {
        console.error("Failed to load agreement status", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAgreement();
  }, [agreementId]);

  const decline = async () => {
    setIsDeclining(true);
    setError("");
    try {
      const response = await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not decline agreement");
      setStatus("DECLINED");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not decline agreement");
    } finally {
      setIsDeclining(false);
    }
  };

  const canRespond = !isOwn && !isInitiator && status === "PENDING";

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Roommate agreement</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {initiatorName} proposed becoming official Roomie partners.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-600">
        {["Confirm roommate commitment", "Pay one-time housing access fee", "Unlock housing providers for both"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Loading agreement status...
        </p>
      ) : status === "CONFIRMED" ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-3 text-center text-sm font-semibold text-emerald-800">
          Roomie partners confirmed — housing providers are unlocked for both of you.
          <div className="mt-2">
            <Link
              href={`/housing?connectionId=${connectionId}`}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Browse housing
            </Link>
          </div>
        </div>
      ) : status === "DECLINED" ? (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Agreement declined
        </p>
      ) : status === "PAYMENT_STARTED" ? (
        <p className="mt-4 rounded-2xl bg-brand-50 px-3 py-2 text-center text-xs font-semibold text-brand-700">
          Complete payment in the Paystack popup…
        </p>
      ) : status === "CONFIRMING" ? (
        <p className="mt-4 rounded-2xl bg-brand-50 px-3 py-2 text-center text-xs font-semibold text-brand-700">
          Payment received — confirming your agreement…
        </p>
      ) : canRespond ? (
        <div className="mt-4 flex flex-col gap-2">
          <PaystackButton
            agreementId={agreementId}
            connectionId={connectionId}
            onStarted={() => setStatus("PAYMENT_STARTED")}
            onConfirmed={() => setStatus("CONFIRMING")}
          />
          <button
            type="button"
            onClick={decline}
            disabled={isDeclining}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </button>
          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Waiting for the other person to accept.
        </p>
      )}
    </div>
  );
}
