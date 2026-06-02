"use client";

import { useRef, useState } from "react";
import { Avatar } from "@repo/ui/avatar";

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

interface ReceiptResult {
  paymentStatus: "full" | "partial" | "unpaid";
  amountPaidKobo: number;
  balanceKobo: number;
  confidence: "high" | "medium" | "low";
  readError: string | null;
  proofUrl: string;
}

interface SplitItemRowProps {
  item: SplitItem;
  splitId: string;
  isSettled: boolean;
  currentUserId: string;
  onItemUpdated?: (itemId: string, updates: Partial<SplitItem>) => void;
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

const MAX_BYTES = 4 * 1024 * 1024;

export function SplitItemRow({ item, splitId, isSettled, currentUserId, onItemUpdated }: SplitItemRowProps) {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "reading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [localProof, setLocalProof] = useState<ReceiptResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveStatus = localProof?.paymentStatus ?? item.payment_status ?? (item.is_paid ? "full" : "unpaid");
  const effectiveProofUrl = localProof?.proofUrl ?? item.proof_url;
  const effectiveAmountPaid = localProof?.amountPaidKobo ?? item.amount_paid ?? 0;
  const effectiveBalance = localProof?.balanceKobo ?? Math.max(0, item.amount - (item.amount_paid ?? 0));

  const isOwnItem = item.user_id === currentUserId;
  const canUpload = isOwnItem && !isSettled && effectiveStatus !== "full";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setUploadError("Image must be under 4 MB");
      setUploadState("error");
      return;
    }
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Use a JPG, PNG, or WebP image");
      setUploadState("error");
      return;
    }

    setUploadError("");
    setUploadState("uploading");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadState("reading");

      const res = await fetch(`/api/splits/${splitId}/items/${item.id}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64, mimeType: file.type }),
      });

      const data = await res.json() as ReceiptResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to analyse receipt");

      setLocalProof(data);
      setUploadState("done");

      onItemUpdated?.(item.id, {
        proof_url: data.proofUrl,
        amount_paid: data.amountPaidKobo,
        payment_status: data.paymentStatus,
        is_paid: data.paymentStatus === "full",
        paid_at: data.paymentStatus === "full" ? new Date().toISOString() : null,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  };

  return (
    <div className={`py-3 px-1 ${effectiveStatus === "full" ? "opacity-75" : ""}`}>
      {/* ── Main row ── */}
      <div className="flex items-center gap-3">
        <Avatar src={item.user?.avatar_url} name={item.user?.display_name ?? "?"} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {item.user?.display_name ?? "Unknown"}
          </p>
          {item.description && (
            <p className="text-xs text-slate-400 truncate">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Amount */}
          <div className="text-right">
            <span className={`text-sm font-bold ${effectiveStatus === "full" ? "line-through text-slate-400" : "text-slate-900"}`}>
              {formatNaira(item.amount)}
            </span>
            {effectiveStatus === "partial" && effectiveAmountPaid > 0 && (
              <p className="text-[10px] text-amber-600 font-medium">{formatNaira(effectiveAmountPaid)} paid</p>
            )}
          </div>

          {/* Receipt upload button — own item, not settled, not fully paid */}
          {canUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState === "uploading" || uploadState === "reading"}
                className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Upload receipt to mark as paid"
                aria-label="Upload receipt"
              >
                {uploadState === "uploading" || uploadState === "reading" ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </>
          )}

          {/* Status indicator — non-interactive, reflects receipt result */}
          {effectiveStatus === "full" && (
            <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          {effectiveStatus === "partial" && (
            <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0" title="Partially paid">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* ── Receipt proof ── */}
      {effectiveProofUrl && (
        <div className="mt-2 ml-10 flex items-start gap-2">
          <a href={effectiveProofUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img
              src={effectiveProofUrl}
              alt="Receipt"
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 hover:opacity-80 transition-opacity"
            />
          </a>
          <div className="min-w-0">
            {effectiveStatus === "full" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Fully paid · {formatNaira(effectiveAmountPaid || item.amount)}
              </span>
            )}
            {effectiveStatus === "partial" && effectiveAmountPaid > 0 && (
              <>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Partially paid · {formatNaira(effectiveAmountPaid)}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-1">Balance: {formatNaira(effectiveBalance)}</p>
              </>
            )}
            {effectiveStatus === "unpaid" && (
              <span className="text-[10px] text-slate-400 font-medium">Receipt saved — upload a clearer photo to confirm amount</span>
            )}
          </div>
        </div>
      )}

      {/* ── Upload state feedback ── */}
      {uploadState === "uploading" && (
        <p className="mt-1.5 ml-10 text-[11px] text-slate-400">Uploading receipt…</p>
      )}
      {uploadState === "reading" && (
        <p className="mt-1.5 ml-10 text-[11px] text-brand-600 font-medium">Reading amount from receipt…</p>
      )}
      {(uploadState === "error" && uploadError) && (
        <p className="mt-1.5 ml-10 text-[11px] text-red-500">{uploadError}</p>
      )}
      {uploadState === "done" && localProof?.readError && localProof.amountPaidKobo === 0 && (
        <p className="mt-1.5 ml-10 text-[11px] text-amber-600">Could not read the amount — try a clearer photo.</p>
      )}
    </div>
  );
}
