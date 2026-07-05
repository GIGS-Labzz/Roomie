"use client";

import React, { useState } from "react";
import { Megaphone, Send, AlertCircle, CheckCircle, Info, Sparkles } from "lucide-react";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (!message.trim()) {
      setError("Announcement message cannot be empty.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to broadcast this announcement? It will be sent straight to the DMs of EVERY active profile on Roomie."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send broadcast");
      }

      setSuccessCount(data.count ?? 0);
      setMessage(""); // Clear after sending
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-display font-bold text-slate-900 text-2xl flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-brand-600" /> System Broadcast
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Send an announcement from the Roomie Support account directly to the DMs of every active user.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form panel */}
        <form onSubmit={handleSendBroadcast} className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successCount !== null && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-bold">Broadcast sent successfully!</span>
                  <p className="mt-0.5">Delivered announcement to {successCount} active roommates.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="announcement" className="text-sm font-semibold text-slate-700 flex justify-between">
                <span>Announcement Message</span>
                <span className="text-[11px] font-normal text-slate-400">Supports multiline text</span>
              </label>
              <textarea
                id="announcement"
                rows={10}
                required
                placeholder="Write your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans leading-relaxed resize-y"
              />
            </div>

            {/* Info panel */}
            <div className="p-4 bg-slate-50 rounded-2xl flex gap-2.5 text-xs text-slate-500 leading-normal">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">How it works:</p>
                <p className="mt-1">
                  1. The message will appear as a direct message from the official <strong className="text-slate-800">Roomie.app</strong> support account.
                </p>
                <p className="mt-0.5">
                  2. It triggers push notifications and bubbles up to the top of users' chat logs.
                </p>
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Broadcasting Announcement...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Announcement
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-peach-500" /> Live DM Preview
              </h2>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
                Roomie.app
              </span>
            </div>

            {/* Simulated Chat bubble container */}
            <div className="flex-1 rounded-2xl p-4 bg-[#EDE8C8] min-h-[220px] flex flex-col justify-end space-y-3 font-sans">
              <div className="max-w-[85%] bg-white text-slate-800 rounded-3xl rounded-bl-sm p-3.5 text-xs shadow-sm self-start whitespace-pre-wrap leading-relaxed">
                {message.trim() || (
                  <span className="text-slate-400 italic">
                    Type a message on the left to see its preview in the DM chat bubble...
                  </span>
                )}
                <div className="text-[9px] text-slate-400 text-right mt-1.5 font-medium">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
