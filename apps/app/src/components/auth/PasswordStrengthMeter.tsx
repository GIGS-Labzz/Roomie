"use client";

import { Check, X } from "lucide-react";
import type { PasswordValidationResult, PasswordStrength } from "@/lib/password-validation";

interface PasswordStrengthMeterProps {
  result: PasswordValidationResult;
  show: boolean;
}

const strengthTone: Record<PasswordStrength, { text: string; fill: string }> = {
  weak: { text: "text-red-500", fill: "bg-red-500" },
  medium: { text: "text-amber-500", fill: "bg-amber-500" },
  strong: { text: "text-green-600", fill: "bg-green-500" },
};

export function PasswordStrengthMeter({ result, show }: PasswordStrengthMeterProps) {
  if (!show) {
    return null;
  }

  const { criteria, score, strength } = result;
  const tone = strengthTone[strength];
  const activeSegments = strength === "strong" ? 3 : strength === "medium" ? 2 : score > 0 ? 1 : 0;
  const checks = [
    { label: "At least 8 characters", valid: criteria.length },
    { label: "Uppercase and lowercase letters", valid: criteria.uppercase && criteria.lowercase },
    { label: "At least one number", valid: criteria.number },
    { label: "At least one special character", valid: criteria.special },
    { label: "No 3-character repeats", valid: criteria.noConsecutiveRepeats },
    { label: "At least 4 unique characters", valid: criteria.enoughUniqueCharacters },
    { label: "No alphabet, number, or keyboard sequences", valid: criteria.noSequentialCharacters },
    { label: "No common guessable words", valid: criteria.noCommonWords },
  ];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">Password strength</span>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${tone.text}`}>{strength}</span>
      </div>

      <div className="grid h-1.5 w-full grid-cols-3 gap-1 overflow-hidden rounded-full bg-slate-100">
        {[1, 2, 3].map((threshold) => (
          <div
            key={threshold}
            className={`h-full rounded-full transition-colors duration-300 ${
              activeSegments >= threshold ? tone.fill : "bg-transparent"
            }`}
          />
        ))}
      </div>

      <ul className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                check.valid ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
              }`}
            >
              {check.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <span className={check.valid ? "font-medium text-slate-700" : ""}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
