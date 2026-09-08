"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { DocumentUploadSlot } from "@/components/onboarding/DocumentUploadSlot";
import { FileCheck, ArrowRight } from "lucide-react";

export default function StudentDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<"id_card" | "admission_letter" | "student_record">("id_card");
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Update student_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_verifications").upsert({
      user_id: user.id,
      document_type: docType,
      document_url: docUrl,
      document_status: docUrl ? "pending" : "pending",
    }, { onConflict: "user_id" });

    // Update profile onboarding_step = 8
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      student_id_front_url: docUrl,
      onboarding_step: 8,
    }).eq("id", user.id);

    router.push("/onboarding/vibe");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={7} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <FileCheck className="w-4 h-4" />
          <span>Student Lane — Step 7 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Student Document Verification
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload proof of enrollment to earn your verified student badge.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Document Type Picker */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { type: "id_card", label: "Student ID Card" },
              { type: "admission_letter", label: "Admission Letter" },
              { type: "student_record", label: "Course Registration" },
            ].map((d) => (
              <button
                key={d.type}
                type="button"
                onClick={() => setDocType(d.type as typeof docType)}
                className={`py-3 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  docType === d.type
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Slot */}
        <DocumentUploadSlot
          title={`Upload ${docType === "id_card" ? "Student ID Card Photo" : docType === "admission_letter" ? "Admission Letter PDF/Img" : "Course Registration Slip"}`}
          description="Clear photo or scan (PNG, JPG, PDF up to 5MB)"
          value={docUrl}
          onUploadComplete={setDocUrl}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving Document..." : "Continue to Lifestyle & Vibe"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
