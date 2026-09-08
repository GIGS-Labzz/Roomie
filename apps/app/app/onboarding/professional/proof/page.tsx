"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { DocumentUploadSlot } from "@/components/onboarding/DocumentUploadSlot";
import { Briefcase, ArrowRight, Link2 } from "lucide-react";

export default function ProfessionalProofPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proofType, setProofType] = useState<"employer_letter" | "payslip" | "freelance_receipt" | "linkedin_url">("freelance_receipt");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    const finalDoc = proofType === "linkedin_url" ? linkedinUrl.trim() : proofUrl;

    // Update professional_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("professional_verifications").upsert({
      user_id: user.id,
      proof_type: proofType,
      proof_of_occupation_url: finalDoc,
      document_status: finalDoc ? "pending" : "pending",
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs">
          <Briefcase className="w-4 h-4" />
          <span>Professional Lane — Step 7 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Proof of Occupation & Work
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload employment document or NDA-safe freelance payment receipt.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Proof Type Picker */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Proof Document Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: "freelance_receipt", label: "Freelance / Payout Receipt" },
              { type: "employer_letter", label: "Employment Offer/Letter" },
              { type: "payslip", label: "Payslip / Work ID" },
              { type: "linkedin_url", label: "LinkedIn Profile URL" },
            ].map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => setProofType(p.type as typeof proofType)}
                className={`py-3 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  proofType === p.type
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {proofType === "linkedin_url" ? (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              LinkedIn Profile Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        ) : (
          <DocumentUploadSlot
            title={
              proofType === "freelance_receipt"
                ? "Freelance Payment Receipt / Client Payout Snippet"
                : proofType === "employer_letter"
                ? "Employer Offer / Work Recommendation Letter"
                : "Recent Payslip or Work Badge"
            }
            description="Sanitized snippet or PDF (Stripe, Paystack, Upwork, Deel, PayPal, Wise)"
            value={proofUrl}
            onUploadComplete={setProofUrl}
            disabled={loading}
          />
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving Proof..." : "Continue to Lifestyle & Vibe"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
