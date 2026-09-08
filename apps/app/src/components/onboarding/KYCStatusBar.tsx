"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

interface KYCStatusBarProps {
  daysRemaining?: number;
}

export function KYCStatusBar({ daysRemaining = 30 }: KYCStatusBarProps) {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2.5 shadow-sm text-xs md:text-sm font-medium flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 truncate">
        <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="truncate">
          Action required: Complete your identity check to maintain full roommate messaging access. ({daysRemaining} days left)
        </span>
      </div>

      <Link
        href="/verify/identity"
        className="shrink-0 px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-sm"
      >
        Verify Now
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
