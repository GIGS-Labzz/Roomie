"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { FaceScanLauncher } from "@/components/onboarding/FaceScanLauncher";
import { Camera, ArrowRight, Info } from "lucide-react";

export default function FaceVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Fetch user_type to route to correct step 5 lane
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    const userType = (profile as { user_type: string | null } | null)?.user_type;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 5,
    }).eq("id", user.id);

    if (userType === "nysc_corper") {
      router.push("/onboarding/nysc/callup");
    } else if (userType === "young_professional") {
      router.push("/onboarding/professional/occupation");
    } else {
      router.push("/onboarding/student/study");
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={4} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs">
          <Camera className="w-4 h-4" />
          <span>Biometric Liveness</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Facial Recognition & Liveness Check
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step 4 of 9 — Verify your live face against government photo records.
        </p>
      </div>

      <div className="flex-1 space-y-6">
        <FaceScanLauncher
          onSuccess={() => setVerified(true)}
        />
      </div>

      <div className="space-y-3 mt-8">
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
        >
          {loading ? "Advancing..." : verified ? "Continue to Specific Verification" : "Skip/Continue to Next Step"}
          <ArrowRight className="w-4 h-4" />
        </button>

        {!verified && (
          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Liveness check can be completed anytime before full profile badge activation.
          </p>
        )}
      </div>
    </div>
  );
}
