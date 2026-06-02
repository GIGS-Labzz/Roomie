"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SplitItem {
  user_id: string;
  amount: number;
  is_paid: boolean;
}

interface ActiveSplit {
  id: string;
  title: string;
  total_amount: number;
  is_settled: boolean;
  items: SplitItem[];
}

interface BillSplitPinnedBannerProps {
  connectionId: string;
  currentUserId: string;
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function BillSplitPinnedBanner({ connectionId, currentUserId }: BillSplitPinnedBannerProps) {
  const [activeSplits, setActiveSplits] = useState<ActiveSplit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/splits?connectionId=${connectionId}`);
        if (!res.ok) return;
        const data = await res.json() as { splits: ActiveSplit[] };
        setActiveSplits((data.splits ?? []).filter((s) => !s.is_settled));
      } catch {
        // ignore
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
    // Re-fetch when the user comes back to this tab
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [connectionId]);

  if (!isLoaded || activeSplits.length === 0 || isDismissed) return null;

  // Total I still owe across all active splits
  const myUnpaidTotal = activeSplits.reduce((acc, split) => {
    const mine = split.items.find((i) => i.user_id === currentUserId && !i.is_paid);
    return acc + (mine?.amount ?? 0);
  }, 0);

  const featured = activeSplits[0];
  const extraCount = activeSplits.length - 1;

  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2.5 px-4 py-2">
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[12px] font-semibold text-slate-800 truncate">{featured.title}</span>
            {extraCount > 0 && (
              <span className="text-[10px] text-slate-400 flex-shrink-0">+{extraCount} more</span>
            )}
          </div>
          {myUnpaidTotal > 0 ? (
            <p className="text-[11px] font-medium text-red-500">
              You owe {formatNaira(myUnpaidTotal)}
            </p>
          ) : (
            <p className="text-[11px] font-medium text-brand-600">
              Your shares are all paid
            </p>
          )}
        </div>

        {/* View link */}
        <Link
          href={`/splits/${connectionId}`}
          className="flex-shrink-0 text-[11px] font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap"
        >
          View splits
        </Link>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
