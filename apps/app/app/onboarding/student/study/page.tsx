"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { GraduationCap, ArrowRight } from "lucide-react";

const STUDY_STATUSES = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate (Masters/PhD)" },
  { value: "hnd", label: "HND / ND Student" },
  { value: "diploma", label: "Diploma / Professional" },
];

const YEARS = [1, 2, 3, 4, 5, 6];

export default function StudentStudyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [studyStatus, setStudyStatus] = useState("undergraduate");
  const [yearOfStudy, setYearOfStudy] = useState(2);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Upsert into student_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_verifications").upsert({
      user_id: user.id,
      study_status: studyStatus,
    }, { onConflict: "user_id" });

    // Update profile year_of_study & onboarding_step = 6
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      year_of_study: yearOfStudy,
      onboarding_step: 6,
    }).eq("id", user.id);

    router.push("/onboarding/student/institution");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={5} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <GraduationCap className="w-4 h-4" />
          <span>Student Lane — Step 5 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Study Level & Year
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tell us about your current academic standing.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Study Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Level of Study
          </label>
          <div className="space-y-2">
            {STUDY_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setStudyStatus(status.value)}
                className={`w-full p-4 rounded-xl border text-left font-semibold text-sm transition-all ${
                  studyStatus === status.value
                    ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year of Study */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Current Year of Study
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYearOfStudy(y)}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  yearOfStudy === y
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
              >
                Year {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving..." : "Continue to Institution & Reg Number"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
