"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const GENDER_PREFS = [
  { value: "", label: "Any" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function BudgetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [minBudget, setMinBudget] = useState(30000);
  const [maxBudget, setMaxBudget] = useState(150000);
  const [moveInDate, setMoveInDate] = useState("");
  const [genderPref, setGenderPref] = useState("");

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      min_budget: minBudget,
      max_budget: maxBudget,
      move_in_date: moveInDate || null,
      roommate_gender_pref: (genderPref as "male" | "female" | null) || null,
      onboarding_step: 5,
    }).eq("id", user.id);
    router.push("/onboarding/verify");
  };

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={4} />

      <h2 className="text-2xl font-display font-semibold text-slate-900 mt-8 mb-6">
        Budget & timeline
      </h2>

      <div className="space-y-6 flex-1">
        {/* Budget range */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-3">Monthly budget range</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-brand-600">{formatNaira(minBudget)}</span>
            <span className="text-slate-400 text-sm">to</span>
            <span className="text-lg font-bold text-brand-600">{formatNaira(maxBudget)}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Minimum</label>
              <input type="range" min={20000} max={500000} step={5000}
                value={minBudget}
                onChange={(e) => setMinBudget(Math.min(Number(e.target.value), maxBudget - 5000))}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Maximum</label>
              <input type="range" min={20000} max={500000} step={5000}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Math.max(Number(e.target.value), minBudget + 5000))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Move-in date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Move-in date <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="date"
            value={moveInDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setMoveInDate(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        {/* Gender preference */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Preferred roommate gender</p>
          <div className="grid grid-cols-3 gap-2">
            {GENDER_PREFS.map((g) => (
              <button key={g.value} type="button"
                onClick={() => setGenderPref(g.value)}
                className={`py-3 rounded-2xl text-sm font-semibold border transition-all ${
                  genderPref === g.value
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-peach-200 text-slate-900 font-bold rounded-2xl hover:bg-peach-300 transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
