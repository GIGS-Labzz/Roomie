"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { RegNumberInput } from "@/components/onboarding/RegNumberInput";
import { School, ArrowRight } from "lucide-react";

const UNIVERSITIES = [
  "University of Lagos",
  "University of Nigeria, Nsukka",
  "Obafemi Awolowo University",
  "University of Ibadan",
  "University of Ilorin",
  "Ahmadu Bello University",
  "Federal University of Technology, Akure",
  "Federal University, Oye-Ekiti",
  "Lagos State University",
  "Covenant University",
  "Federal University of Technology, Owerri",
  "Babcock University",
  "Bayero University Kano",
  "Olabisi Onabanjo University",
  "Other Institution",
];

export default function StudentInstitutionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [university, setUniversity] = useState("University of Lagos");
  const [regNumber, setRegNumber] = useState("");
  const [regValid, setRegValid] = useState(false);

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Upsert student_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("student_verifications").upsert({
      user_id: user.id,
      institution_name: university,
      reg_number: regNumber,
      reg_number_format_matched: regValid,
    }, { onConflict: "user_id" });

    // Update profile university & onboarding_step = 7
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      university: university,
      onboarding_step: 7,
    }).eq("id", user.id);

    router.push("/onboarding/student/document");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={6} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <School className="w-4 h-4" />
          <span>Student Lane — Step 6 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          Institution & Registration Number
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select your institution to enable campus format validation.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* University Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            University / Institution Name
          </label>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          >
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Reg Number Input */}
        <RegNumberInput
          institution={university}
          value={regNumber}
          onChange={(val, isValid) => {
            setRegNumber(val);
            setRegValid(isValid);
          }}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={loading || !regNumber.trim()}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading ? "Validating..." : "Continue to Document Upload"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
