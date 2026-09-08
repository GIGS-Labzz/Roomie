"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { NigerianStateSelect } from "@/components/onboarding/NigerianStateSelect";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Benin City", "Port Harcourt", "Kano", "Enugu", "Owerri", "Zaria", "Jos", "Nsukka", "Ile-Ife"];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const AGE_RANGES = ["18-24", "25-30", "31-35", "36+"];

const RELIGIONS = ["Christianity", "Islam", "Other", "Prefer not to say"];

function calculateAge(birthdateStr: string): number {
  if (!birthdateStr) return 22;
  const birthDate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function BasicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [form, setForm] = useState<{
    display_name: string;
    birthday: string;
    gender: string;
    city: string;
    state_of_origin: string;
    lga_of_origin: string;
    religion: string;
    age_range: string;
    bio: string;
  }>({
    display_name: String(user?.user_metadata?.full_name ?? ""),
    birthday: "",
    gender: "",
    city: "",
    state_of_origin: "",
    lga_of_origin: "",
    religion: "",
    age_range: "18-24",
    bio: "",
  });

  const isCustomCity = form.city === "Other";
  const isValid =
    form.display_name.trim() &&
    form.birthday &&
    form.gender &&
    (isCustomCity ? customCity.trim() : form.city) &&
    form.state_of_origin;

  const handleNext = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    const supabase = createClient();
    const age = calculateAge(form.birthday);
    const finalCity = isCustomCity ? customCity.trim() : form.city;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      display_name: form.display_name.trim(),
      birthday: form.birthday,
      age: age,
      gender: form.gender,
      city: finalCity,
      state_of_origin: form.state_of_origin,
      lga_of_origin: form.lga_of_origin || null,
      religion: form.religion || null,
      age_range: form.age_range,
      bio: form.bio.trim() || null,
      onboarding_step: 2,
    }).eq("id", user.id);

    router.push("/onboarding/demographics");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={1} totalSteps={9} />

      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-8 mb-2">
        Personal Details & Background
      </h2>
      <p className="text-xs text-slate-500 mb-6">
        Step 1 of 9 — Tell us about yourself to match with compatible roommates.
      </p>

      <div className="space-y-5 flex-1">
        {/* Display name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Full Display Name (matches NIN)
          </label>
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder="e.g. Chinedu Emmanuel Okonkwo"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Birthday & Age Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Birthday</label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Age Bracket</label>
            <select
              value={form.age_range}
              onChange={(e) => setForm({ ...form, age_range: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
            >
              {AGE_RANGES.map((r) => <option key={r} value={r}>{r} years</option>)}
            </select>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Gender</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm({ ...form, gender: g.value })}
                className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  form.gender === g.value
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* State & LGA of Origin */}
        <NigerianStateSelect
          stateValue={form.state_of_origin}
          onStateChange={(st) => setForm({ ...form, state_of_origin: st })}
          lgaValue={form.lga_of_origin}
          onLgaChange={(lga) => setForm({ ...form, lga_of_origin: lga })}
          stateLabel="State of Origin"
          lgaLabel="LGA of Origin (Optional)"
        />

        {/* Current City */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Current City / Location</label>
          <select
            value={form.city}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, city: val });
              if (val !== "Other") {
                setCustomCity("");
              }
            }}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
          >
            <option value="">Select your city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="Other">My city is not listed...</option>
          </select>
        </div>

        {isCustomCity && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Specify City</label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Enter your city name"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {/* Religion */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Religion (Optional)</label>
          <select
            value={form.religion}
            onChange={(e) => setForm({ ...form, religion: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
          >
            <option value="">-- Select Religion --</option>
            {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Short Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell potential roommates a bit about yourself..."
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid || loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Saving Basics..." : "Continue to Demographics"}
      </button>
    </div>
  );
}
