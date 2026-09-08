"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { DocumentUploadSlot } from "@/components/onboarding/DocumentUploadSlot";
import { FileCheck, ArrowRight } from "lucide-react";

export default function NYSCDocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nyscIdUrl, setNyscIdUrl] = useState<string | null>(null);
  const [callupLetterUrl, setCallupLetterUrl] = useState<string | null>(null);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Update nysc_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("nysc_verifications").upsert({
      user_id: user.id,
      nysc_id_url: nyscIdUrl,
      call_up_letter_url: callupLetterUrl,
      document_status: nyscIdUrl || callupLetterUrl ? "pending" : "pending",
    }, { onConflict: "user_id" });

    // Update profile onboarding_step = 8
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 8,
    }).eq("id", user.id);

    router.push("/onboarding/vibe");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={7} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          <FileCheck className="w-4 h-4" />
          <span>NYSC Corper Lane — Step 7 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          NYSC Document Verification
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload photo proof of your NYSC ID card or Call-Up letter.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <DocumentUploadSlot
          title="Upload NYSC ID Card Photo"
          description="Clear photo of your green NYSC Identity Card (JPG/PNG up to 5MB)"
          value={nyscIdUrl}
          onUploadComplete={setNyscIdUrl}
          disabled={loading}
        />

        <DocumentUploadSlot
          title="Upload Call-Up Letter (Optional)"
          description="PDF scan or snapshot of Call-Up Letter"
          value={callupLetterUrl}
          onUploadComplete={setCallupLetterUrl}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving Documents..." : "Continue to Lifestyle & Vibe"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
