"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Award, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const BATCHES = [
  "2026 Batch A Stream 1",
  "2026 Batch A Stream 2",
  "2026 Batch B Stream 1",
  "2026 Batch B Stream 2",
  "2026 Batch C Stream 1",
  "2026 Batch C Stream 2",
  "2025 Batch A/B/C",
];

export default function NYSCCallupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [callupNumber, setCallupNumber] = useState("");
  const [batchYear, setBatchYear] = useState(BATCHES[0]);

  // NYSC Call Up Format: NYSC/XXX/YYYY/XXXXXX or NIG/YYYY/STATE/XXXXX
  const callupRegex = /^(NYSC|NIG)\/[A-Z0-9]+\/[0-9]{4}\/[0-9]{4,6}$/i;
  const isValidFormat = callupRegex.test(callupNumber.trim());

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Upsert nysc_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("nysc_verifications").upsert({
      user_id: user.id,
      call_up_number: callupNumber.toUpperCase().trim(),
      batch_year: batchYear,
    }, { onConflict: "user_id" });

    // Update profile onboarding_step = 6
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 6,
    }).eq("id", user.id);

    router.push("/onboarding/nysc/posting");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={5} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          <Award className="w-4 h-4" />
          <span>NYSC Corper Lane — Step 5 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          NYSC Call-Up Number & Batch
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your official NYSC call-up details.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Call-Up Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            NYSC Call-Up Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={callupNumber}
              onChange={(e) => setCallupNumber(e.target.value.toUpperCase())}
              placeholder="e.g. NYSC/ABU/2026/123456"
              className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl font-mono text-sm tracking-wider uppercase transition-colors ${
                callupNumber && isValidFormat
                  ? "border-emerald-500 text-slate-900 dark:text-white"
                  : callupNumber && !isValidFormat
                  ? "border-amber-500 text-slate-900 dark:text-white"
                  : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              }`}
            />
            {callupNumber && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                {isValidFormat ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Format hint: NYSC/INSTITUTION/YEAR/NUMBER (e.g. NYSC/UNILAG/2026/045123)
          </p>
        </div>

        {/* Batch Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Service Batch & Stream
          </label>
          <select
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          >
            {BATCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading || !callupNumber.trim()}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading ? "Saving..." : "Continue to Posting & CDS Details"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
