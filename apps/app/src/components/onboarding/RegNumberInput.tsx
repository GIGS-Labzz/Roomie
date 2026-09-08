"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, School } from "lucide-react";
import { validateRegNumber, UniversityPattern } from "@/lib/universityPatterns";

interface RegNumberInputProps {
  institution: string;
  value: string;
  onChange: (val: string, isValid: boolean) => void;
  disabled?: boolean;
}

export function RegNumberInput({ institution, value, onChange, disabled }: RegNumberInputProps) {
  const [hint, setHint] = useState<string | undefined>();
  const [matched, setMatched] = useState<UniversityPattern | undefined>();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!value) {
      setHint(undefined);
      setMatched(undefined);
      setIsValid(false);
      return;
    }

    const res = validateRegNumber(institution, value);
    setHint(res.hint);
    setMatched(res.matchedPattern);
    setIsValid(res.valid);

    onChange(value, res.valid);
  }, [institution, value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        Matriculation / Registration Number
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <School className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase(), isValid)}
          disabled={disabled}
          placeholder={matched ? `e.g. ${matched.example}` : "Enter matric or reg number"}
          className={`w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono text-sm tracking-wider uppercase transition-colors ${
            value && isValid
              ? "border-emerald-500 text-slate-900 dark:text-white"
              : value && !isValid
              ? "border-amber-500 text-slate-900 dark:text-white"
              : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-brand-500"
          }`}
        />

        {value && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>
        )}
      </div>

      {hint && (
        <p className={`text-xs ${isValid ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
