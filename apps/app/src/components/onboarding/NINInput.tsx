"use client";

import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";
import { validateNINFormat } from "@/lib/kyc";

interface NINInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function NINInput({ value, onChange, error, disabled }: NINInputProps) {
  const [showNin, setShowNin] = useState(false);

  const isValid = validateNINFormat(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    onChange(raw);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        11-Digit National Identification Number (NIN)
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <input
          type={showNin ? "text" : "password"}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="e.g. 12345678901"
          maxLength={11}
          className={`w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono text-base tracking-widest transition-colors ${
            error
              ? "border-red-500 text-red-900 dark:text-red-200 focus:ring-red-500"
              : isValid
              ? "border-emerald-500 text-slate-900 dark:text-white focus:ring-emerald-500"
              : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-brand-500"
          }`}
        />

        <button
          type="button"
          onClick={() => setShowNin(!showNin)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showNin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-slate-500 flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          Encrypted & SHA-256 Hashed (NDPR Compliant)
        </span>
        <span className={isValid ? "text-emerald-600 font-medium" : "text-slate-400"}>
          {value.length}/11 digits
        </span>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
