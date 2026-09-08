"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { UserTypePicker, UserType } from "@/components/onboarding/UserTypePicker";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Database } from "@repo/db/types";

export default function UserTypePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleContinue = async () => {
    if (!selectedType) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({
          user_type: selectedType,
          onboarding_step: 1,
        })
        .eq("id", user.id);
    }

    router.push("/onboarding/basics");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-8 py-6">
        <OnboardingProgress currentStep={0} totalSteps={9} />

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to Roomie</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Choose Your Roomie Profile Archetype
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Select how you are joining Roomie. This tailors your verification journey and roommate compatibility matching.
          </p>
        </div>

        <UserTypePicker selected={selectedType} onSelect={setSelectedType} />
      </div>

      <div className="max-w-3xl mx-auto w-full pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedType || loading}
          className="py-3.5 px-8 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? "Saving Archetype..." : "Continue to Personal Details"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
