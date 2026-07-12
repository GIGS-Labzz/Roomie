"use client";

import { Terminal } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#090c08] z-50">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 animate-pulse mb-4">
        <Terminal className="w-6 h-6" />
      </div>
      <p className="text-brand-400 text-sm font-mono tracking-wider animate-pulse">
        Initializing developer console...
      </p>
    </div>
  );
}
