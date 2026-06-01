"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";

interface ConnectMeta {
  name: string;
  connectionId: string;
}

function readAndClearMeta(): ConnectMeta {
  if (typeof window === "undefined") {
    return { name: "your new roommate", connectionId: "" };
  }
  const name         = sessionStorage.getItem("roomie_conn_name") ?? "your new roommate";
  const connectionId = sessionStorage.getItem("roomie_conn_id")   ?? "";
  // Clear immediately so a hard-refresh shows nothing sensitive
  sessionStorage.removeItem("roomie_conn_name");
  sessionStorage.removeItem("roomie_conn_id");
  return { name, connectionId };
}

export default function ConnectSuccessPage() {
  const [meta, setMeta] = useState<ConnectMeta | null>(null);

  useEffect(() => {
    setMeta(readAndClearMeta());
  }, []);

  // Show a neutral spinner until the client reads sessionStorage
  if (!meta) {
    return (
      <div className="min-h-screen bg-sage-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { name, connectionId } = meta;

  return (
    <div className="min-h-screen bg-sage-surface flex flex-col items-center justify-center px-6 text-center gap-8">

      {/* Success icon — Lottie connecting.json wired in Phase 9 */}
      <div className="w-28 h-28 rounded-full bg-brand-500 flex items-center justify-center shadow-[0_12px_40px_rgba(138,175,110,0.35)]">
        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 24l10 10 18-18" />
        </svg>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-xs">
        <h1 className="font-display font-bold text-slate-900 text-3xl leading-tight">
          You&apos;re connected!
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
          You and <span className="font-semibold text-slate-800">{name}</span> are now connected.
          Your chat is open — say hello!
        </p>
      </div>

      {/* What's next */}
      <div className="w-full max-w-sm space-y-3">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm text-left">
          <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Chat is unlocked</p>
            <p className="text-xs text-slate-400">Start the conversation now</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm text-left">
          <div className="w-8 h-8 rounded-xl bg-peach-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-peach-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Find housing together</p>
            <p className="text-xs text-slate-400">Unlock housing providers for ₦2,000</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Link href={connectionId ? `/chat/${connectionId}` : "/chat"} className="block">
          <Button variant="primary" size="lg" className="w-full">
            Open chat
          </Button>
        </Link>

        <Link href="/housing" className="block">
          <Button variant="peach" size="lg" className="w-full">
            Browse housing providers
          </Button>
        </Link>

        <Link href="/discover" className="block">
          <button className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2">
            Back to Discover
          </button>
        </Link>
      </div>
    </div>
  );
}
