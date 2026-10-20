"use client";

import { ShieldCheck, CheckCircle2, Clock } from "lucide-react";

interface VerificationBadgeProps {
  ninVerified?: boolean;
  faceVerified?: boolean;
  identityVerified?: boolean;
  compact?: boolean;
}

export function VerificationBadge({
  ninVerified,
  faceVerified,
  identityVerified,
  compact = false,
}: VerificationBadgeProps) {
  if (identityVerified) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Identity Verified</span>
      </div>
    );
  }

  if (ninVerified || faceVerified) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{ninVerified ? "NIN Verified" : "Face Verified"}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium ${
        compact ? "text-[11px]" : "text-xs"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>KYC Pending</span>
    </div>
  );
}
