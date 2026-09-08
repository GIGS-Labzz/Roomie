"use client";

import { NIGERIAN_STATES, getLGAsForState } from "@/lib/nigerianStates";

interface NigerianStateSelectProps {
  stateValue: string;
  onStateChange: (state: string) => void;
  lgaValue?: string;
  onLgaChange?: (lga: string) => void;
  stateLabel?: string;
  lgaLabel?: string;
  disabled?: boolean;
}

export function NigerianStateSelect({
  stateValue,
  onStateChange,
  lgaValue,
  onLgaChange,
  stateLabel = "State of Origin",
  lgaLabel = "LGA of Origin",
  disabled,
}: NigerianStateSelectProps) {
  const lgas = stateValue ? getLGAsForState(stateValue) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {stateLabel}
        </label>

        <select
          value={stateValue}
          onChange={(e) => {
            onStateChange(e.target.value);
            if (onLgaChange) onLgaChange("");
          }}
          disabled={disabled}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-brand-500 transition-colors"
        >
          <option value="">-- Select State --</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {onLgaChange && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {lgaLabel}
          </label>

          <select
            value={lgaValue || ""}
            onChange={(e) => onLgaChange(e.target.value)}
            disabled={disabled || !stateValue}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-brand-500 transition-colors disabled:opacity-50"
          >
            <option value="">-- Select LGA --</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
