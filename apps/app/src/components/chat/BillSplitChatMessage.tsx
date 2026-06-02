"use client";

import Link from "next/link";

interface BillSplitPayload {
  event: "created" | "item_paid" | "item_unpaid" | "settled";
  split_id: string;
  title: string;
  total_naira?: string;
  creator_name?: string;
  payer_name?: string;
  amount_naira?: string;
  settler_name?: string;
}

interface BillSplitChatMessageProps {
  content: string;
  connectionId: string;
}

export function BillSplitChatMessage({ content, connectionId }: BillSplitChatMessageProps) {
  let p: BillSplitPayload | null = null;
  try {
    p = JSON.parse(content) as BillSplitPayload;
  } catch {
    return null;
  }
  if (!p) return null;

  // ── New split created — full card ──────────────────────────────────────
  if (p.event === "created") {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm w-full max-w-[85%]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">New bill split</p>
              <p className="text-sm font-bold text-slate-900 truncate leading-tight mt-0.5">{p.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {p.creator_name} · {p.total_naira} total
              </p>
            </div>
            <Link
              href={`/splits/${connectionId}`}
              className="flex-shrink-0 text-xs font-bold text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-xl hover:bg-brand-50 transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Item marked as paid ────────────────────────────────────────────────
  if (p.event === "item_paid") {
    return (
      <div className="flex justify-center py-1">
        <span className="bg-white/90 border border-brand-100 text-brand-700 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm max-w-[80%] text-center">
          {p.payer_name} paid {p.amount_naira} for {p.title}
        </span>
      </div>
    );
  }

  // ── Item unmarked ──────────────────────────────────────────────────────
  if (p.event === "item_unpaid") {
    return (
      <div className="flex justify-center py-1">
        <span className="bg-white/80 text-slate-400 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm max-w-[80%] text-center">
          {p.payer_name} unmarked {p.amount_naira} for {p.title}
        </span>
      </div>
    );
  }

  // ── Split fully settled ────────────────────────────────────────────────
  if (p.event === "settled") {
    return (
      <div className="flex justify-center py-1.5">
        <span className="bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-sm max-w-[80%] text-center flex items-center gap-1.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {p.title} settled by {p.settler_name}
        </span>
      </div>
    );
  }

  return null;
}
