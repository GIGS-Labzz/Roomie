"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { DocumentUploadSlot } from "@/components/onboarding/DocumentUploadSlot";
import { MapPin, ArrowRight } from "lucide-react";

export default function ProfessionalLocationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [utilityBillUrl, setUtilityBillUrl] = useState<string | null>(null);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Update professional_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("professional_verifications").upsert({
      user_id: user.id,
      utility_bill_url: utilityBillUrl,
    }, { onConflict: "user_id" });

    // Update profile onboarding_step = 7
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 7,
    }).eq("id", user.id);

    router.push("/onboarding/professional/proof");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={6} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs">
          <MapPin className="w-4 h-4" />
          <span>Professional Lane — Step 6 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Address & Location Proof
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload proof of residential location or utility bill.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <DocumentUploadSlot
          title="Upload Utility Bill / Address Proof"
          description="NEPA/EKEDC bill, Waste bill, Tenancy agreement, or Bank statement header"
          value={utilityBillUrl}
          onUploadComplete={setUtilityBillUrl}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving Address Proof..." : "Continue to Occupation Proof"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
