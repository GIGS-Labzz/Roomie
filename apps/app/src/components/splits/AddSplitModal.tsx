"use client";

import { useState } from "react";

interface Participant {
  id: string;
  display_name: string;
}

interface AddSplitModalProps {
  connectionId: string;
  participants: Participant[];
  onClose: () => void;
  onCreated: () => void;
}

export function AddSplitModal({ connectionId, participants, onClose, onCreated }: AddSplitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [shares, setShares] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    participants.forEach((p) => { init[p.id] = ""; });
    return init;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalKobo = Math.round(parseFloat(totalAmount || "0") * 100);

  const splitEvenly = () => {
    if (!totalAmount || participants.length === 0) return;
    const each = Math.floor(totalKobo / participants.length);
    const remainder = totalKobo - each * participants.length;
    const updated: Record<string, string> = {};
    participants.forEach((p, i) => {
      updated[p.id] = ((each + (i === 0 ? remainder : 0)) / 100).toString();
    });
    setShares(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Title is required"); return; }
    if (totalKobo <= 0) { setError("Enter a valid amount"); return; }

    const parsedShares = participants.map((p) => ({
      userId: p.id,
      amount: Math.round(parseFloat(shares[p.id] || "0") * 100),
      description: undefined as string | undefined,
    }));

    const sharesTotal = parsedShares.reduce((acc, s) => acc + s.amount, 0);
    if (sharesTotal !== totalKobo) {
      setError(`Shares total (₦${(sharesTotal / 100).toLocaleString()}) must equal the total amount (₦${(totalKobo / 100).toLocaleString()})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/splits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, title: title.trim(), description: description.trim() || undefined, totalAmount: totalKobo, shares: parsedShares }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create split");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create split");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="font-display font-bold text-xl text-slate-900">New bill split</h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. December Rent"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-900 border border-slate-200 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              maxLength={80}
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Description <span className="font-normal text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note…"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-900 border border-slate-200 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              maxLength={200}
            />
          </div>

          {/* Total amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Total amount (₦)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-900 border border-slate-200 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Shares */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Each person pays (₦)</label>
              <button
                type="button"
                onClick={splitEvenly}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Split evenly
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200">
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{p.display_name}</span>
                  <input
                    type="number"
                    value={shares[p.id] ?? ""}
                    onChange={(e) => setShares((s) => ({ ...s, [p.id]: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-28 text-right bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating…" : "Create split"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
