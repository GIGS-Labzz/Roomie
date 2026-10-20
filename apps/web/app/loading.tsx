"use client";

import { Infinity } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#080c14] text-slate-200">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
        <Infinity className="w-12 h-12 text-brand-400 animate-pulse animate-float" />
      </div>
      <p className="mt-4 text-xs font-medium tracking-widest text-slate-400 uppercase">
        Loading...
      </p>
    </div>
  );
}
