"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { LifestyleTagPicker } from "@/components/onboarding/LifestyleTagPicker";

const SLEEP = [
  { value: "early_bird", label: "Early bird", sub: "Up by 6am" },
  { value: "night_owl", label: "Night owl", sub: "Up past midnight" },
  { value: "flexible", label: "Flexible", sub: "No preference" },
];

const CLEAN = ["very_tidy", "tidy", "relaxed", "messy"] as const;
const NOISE = ["very_quiet", "quiet", "moderate", "lively"] as const;
const CLEAN_LABELS: Record<string, string> = { very_tidy: "Very tidy", tidy: "Tidy", relaxed: "Relaxed", messy: "Messy" };
const NOISE_LABELS: Record<string, string> = { very_quiet: "Very quiet", quiet: "Quiet", moderate: "Moderate", lively: "Lively" };

export default function VibePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sleep_schedule: "flexible",
    cleanliness: "tidy",
    noise_pref: "moderate",
    allows_smoking: false,
    allows_pets: false,
    allows_guests: true,
    lifestyle_tags: [] as string[],
  });

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      ...form,
      sleep_schedule: form.sleep_schedule as "early_bird" | "night_owl" | "flexible",
      cleanliness: form.cleanliness as "very_tidy" | "tidy" | "relaxed" | "messy",
      noise_pref: form.noise_pref as "very_quiet" | "quiet" | "moderate" | "lively",
      onboarding_step: 4,
    }).eq("id", user.id);
    router.push("/onboarding/budget");
  };

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={3} />

      <h2 className="text-2xl font-display font-semibold text-slate-900 mt-8 mb-6">
        Your vibe
      </h2>

      <div className="space-y-6 flex-1">
        {/* Sleep schedule */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Sleep schedule</p>
          <div className="grid grid-cols-3 gap-2">
            {SLEEP.map((s) => (
              <button key={s.value} type="button"
                onClick={() => setForm({ ...form, sleep_schedule: s.value })}
                className={`px-3 py-3 rounded-2xl text-center border transition-all ${
                  form.sleep_schedule === s.value
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
                }`}
              >
                <div className="text-sm font-bold">{s.label}</div>
                <div className={`text-xs mt-0.5 ${form.sleep_schedule === s.value ? "text-white/80" : "text-slate-400"}`}>{s.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cleanliness */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Cleanliness</p>
          <div className="grid grid-cols-4 gap-1.5">
            {CLEAN.map((c) => (
              <button key={c} type="button"
                onClick={() => setForm({ ...form, cleanliness: c })}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  form.cleanliness === c ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {CLEAN_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Noise */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Noise preference</p>
          <div className="grid grid-cols-4 gap-1.5">
            {NOISE.map((n) => (
              <button key={n} type="button"
                onClick={() => setForm({ ...form, noise_pref: n })}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  form.noise_pref === n ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {NOISE_LABELS[n]}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {([
            ["allows_smoking", "Smoking allowed"],
            ["allows_pets", "Pets allowed"],
            ["allows_guests", "Guests allowed"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, [key]: !form[key] })}
                className={`w-12 h-6 rounded-full transition-colors ${form[key] ? "bg-brand-500" : "bg-slate-200"}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key] ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Lifestyle tags */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Your vibe — pick any that fit</p>
          <LifestyleTagPicker
            selected={form.lifestyle_tags}
            onChange={(tags) => setForm({ ...form, lifestyle_tags: tags })}
          />
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
