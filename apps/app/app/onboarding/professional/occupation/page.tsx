"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Briefcase, ArrowRight } from "lucide-react";

const EMPLOYMENT_TYPES = [
  { value: "employed", label: "Full-Time / Part-Time Employed" },
  { value: "freelancer", label: "Freelancer / Remote Contractor" },
  { value: "contractor", label: "Self-Employed / Business Owner" },
  { value: "other", label: "Other Work Arrangement" },
];

export default function ProfessionalOccupationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employmentType, setEmploymentType] = useState("employed");

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Upsert professional_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("professional_verifications").upsert({
      user_id: user.id,
      occupation: occupation.trim(),
      employer_name: employerName.trim() || null,
      employment_type: employmentType,
    }, { onConflict: "user_id" });

    // Update profile course/bio & onboarding_step = 6
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      course: occupation.trim(), // store profession in course column for feed compatibility
      onboarding_step: 6,
    }).eq("id", user.id);

    router.push("/onboarding/professional/location");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={5} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs">
          <Briefcase className="w-4 h-4" />
          <span>Professional Lane — Step 5 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Occupation & Work Field
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Specify your role and employment setup.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Occupation */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Primary Role / Occupation Title
          </label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Frontend Developer, Brand Designer, Accountant"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Employment Setup
          </label>
          <div className="space-y-2">
            {EMPLOYMENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setEmploymentType(type.value)}
                className={`w-full p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
                  employmentType === type.value
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Employer or Platform */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Company / Client Platform Name
          </label>
          <input
            type="text"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            placeholder="e.g. Paystack, Upwork, Self-Employed Studio"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading || !occupation.trim()}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading ? "Saving Occupation..." : "Continue to Location Proof"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
