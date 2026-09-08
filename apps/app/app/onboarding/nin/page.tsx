"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { NINInput } from "@/components/onboarding/NINInput";
import { ShieldCheck, ArrowRight, Lock, AlertCircle, Info } from "lucide-react";

export default function NINVerificationPage() {
  const router = useRouter();
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (nin.length !== 11) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kyc/nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || "NIN verification failed. Check your number and try again.");
        return;
      }

      router.push("/onboarding/face");
    } catch (err: unknown) {
      console.error(err);
      setLoading(false);
      setError("Network error performing NIN verification. Please try again.");
    }
  };

  const handleSkip = () => {
    // Grace period allows skipping during onboarding
    router.push("/onboarding/face");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={3} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Identity Verification</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          National Identification Number (NIN)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step 3 of 9 — Verify your official identity with your 11-digit NIN.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs space-y-1 mb-6">
        <div className="font-bold flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          NDPR Compliant Encryption
        </div>
        <p>
          Your raw NIN is never stored in plain text or logged. It is hashed using SHA-256 and matched securely against official NIMC database records.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <NINInput
          value={nin}
          onChange={setNin}
          error={error}
          disabled={loading}
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mt-8">
        <button
          onClick={handleVerify}
          disabled={nin.length !== 11 || loading}
          className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading ? "Verifying NIN with NIMC..." : "Verify NIN & Proceed"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSkip}
          type="button"
          className="w-full py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          Skip for now (30-day grace period applies)
        </button>
      </div>
    </div>
  );
}
