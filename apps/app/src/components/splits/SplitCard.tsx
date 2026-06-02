"use client";

import { useState } from "react";
import { SplitItemRow } from "./SplitItemRow";

interface SplitItem {
  id: string;
  user_id: string;
  description: string | null;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  proof_url?: string | null;
  amount_paid?: number | null;
  payment_status?: "unpaid" | "partial" | "full" | null;
  user: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface Split {
  id: string;
  title: string;
  description: string | null;
  total_amount: number;
  is_settled: boolean;
  created_at: string;
  items: SplitItem[];
  creator: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface SplitCardProps {
  split: Split;
  currentUserId: string;
  onUpdated: () => void;
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SplitCard({ split, currentUserId, onUpdated }: SplitCardProps) {
  const [localItems, setLocalItems] = useState<SplitItem[]>(split.items ?? []);
  const [isSettling, setIsSettling] = useState(false);

  // Count items that are fully paid (not partial) for progress + settle button
  const paidCount = localItems.filter((i) => (i.payment_status ?? (i.is_paid ? "full" : "unpaid")) === "full").length;
  const allPaid = paidCount === localItems.length && localItems.length > 0;

  const handleItemUpdated = (itemId: string, updates: Partial<SplitItem>) => {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
    );
  };

  const handleSettle = async () => {
    if (isSettling || split.is_settled) return;
    setIsSettling(true);
    try {
      const res = await fetch(`/api/splits/${split.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settle" }),
      });
      if (res.ok) onUpdated();
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${split.is_settled ? "border-brand-100 opacity-70" : "border-slate-100"}`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-[15px] truncate">{split.title}</h3>
              {split.is_settled && (
                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  Settled
                </span>
              )}
            </div>
            {split.description && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{split.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{formatDate(split.created_at)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-slate-900 text-lg leading-tight">{formatNaira(split.total_amount)}</p>
            <p className="text-xs text-slate-400">{paidCount}/{localItems.length} paid</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-300"
            style={{ width: localItems.length > 0 ? `${(paidCount / localItems.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="px-4 divide-y divide-slate-50">
        {localItems.map((item) => (
          <SplitItemRow
            key={item.id}
            item={item}
            splitId={split.id}
            isSettled={split.is_settled}
            currentUserId={currentUserId}
            onItemUpdated={handleItemUpdated}
          />
        ))}
      </div>

      {/* Footer — settle button */}
      {!split.is_settled && allPaid && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={handleSettle}
            disabled={isSettling}
            className="w-full py-2.5 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {isSettling ? "Settling…" : "Mark as settled"}
          </button>
        </div>
      )}
    </div>
  );
}
