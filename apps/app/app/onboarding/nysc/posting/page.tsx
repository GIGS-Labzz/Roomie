"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { NigerianStateSelect } from "@/components/onboarding/NigerianStateSelect";
import { Award, ArrowRight } from "lucide-react";

const CDS_GROUPS = [
  "Editorial & Publicity CDS",
  "Medical & Health CDS",
  "Education / Teaching CDS",
  "Disaster Management (NEMA) CDS",
  "Environmental & Sanitation CDS",
  "Legal Aid CDS",
  "Road Safety (FRSC) CDS",
  "Gender & Charity CDS",
  "Sports CDS",
  "Culture & Tourism CDS",
  "Other CDS Group",
];

export default function NYSCPostingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stateOfPosting, setStateOfPosting] = useState("Lagos");
  const [cdsGroup, setCdsGroup] = useState(CDS_GROUPS[0]);
  const [cdsLocation, setCdsLocation] = useState("");

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Upsert nysc_verifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("nysc_verifications").upsert({
      user_id: user.id,
      state_of_posting: stateOfPosting,
      cds_group: cdsGroup,
      cds_location: cdsLocation.trim(),
    }, { onConflict: "user_id" });

    // Update profile state & onboarding_step = 7
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      state: stateOfPosting,
      onboarding_step: 7,
    }).eq("id", user.id);

    router.push("/onboarding/nysc/documents");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={6} totalSteps={9} />

      <div className="mt-8 mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          <Award className="w-4 h-4" />
          <span>NYSC Corper Lane — Step 6 of 9</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          State of Posting & CDS Details
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Match with co-corpers posted in your state and meeting location.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* State of Posting */}
        <NigerianStateSelect
          stateValue={stateOfPosting}
          onStateChange={setStateOfPosting}
          stateLabel="State of Posting (Deployed State)"
        />

        {/* CDS Group */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            CDS Group Name
          </label>
          <select
            value={cdsGroup}
            onChange={(e) => setCdsGroup(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          >
            {CDS_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* CDS Location / LGA */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            CDS Meeting Location / LGA
          </label>
          <input
            type="text"
            value={cdsLocation}
            onChange={(e) => setCdsLocation(e.target.value)}
            placeholder="e.g. Ikeja Local Govt Secretariat, Lagos"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading || !cdsLocation.trim()}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading ? "Saving Posting..." : "Continue to NYSC Document Upload"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
