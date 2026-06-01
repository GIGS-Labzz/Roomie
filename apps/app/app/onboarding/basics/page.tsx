"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Benin City", "Port Harcourt", "Kano", "Enugu", "Owerri", "Zaria", "Jos", "Nsukka", "Ile-Ife"];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function BasicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    display_name: string;
    age: string;
    gender: string;
    city: string;
  }>({
    display_name: String(user?.user_metadata?.full_name ?? ""),
    age: "",
    gender: "",
    city: "",
  });

  const isValid = form.display_name.trim() && form.age && form.gender && form.city;

  const handleNext = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      display_name: form.display_name.trim(),
      age: Number(form.age),
      gender: form.gender,
      city: form.city,
      onboarding_step: 2,
    }).eq("id", user.id);
    router.push("/onboarding/university");
  };

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={1} />

      <h2 className="text-2xl font-display font-semibold text-slate-900 mt-8 mb-6">
        The basics
      </h2>

      <div className="space-y-4 flex-1">
        {/* Display name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your name</label>
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder="Display name"
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
          <input
            type="number"
            min={16}
            max={35}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Your age"
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm({ ...form, gender: g.value })}
                className={`px-4 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                  form.gender === g.value
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
          <select
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
          >
            <option value="">Select your city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid || loading}
        className="mt-8 w-full py-4 bg-peach-200 text-slate-900 font-bold rounded-2xl hover:bg-peach-300 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
