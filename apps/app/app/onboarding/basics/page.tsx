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
];

function calculateAge(birthdateStr: string): number {
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
    bio: string;
  }>({
    display_name: String(user?.user_metadata?.full_name ?? ""),
    birthday: "",
    gender: "",
    city: "",
    bio: "",
  });

  const isCustomCity = form.city === "Other";
  const isValid =
    form.display_name.trim() &&
    form.birthday &&
    form.gender &&
    (isCustomCity ? customCity.trim() : form.city);

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
      bio: form.bio.trim() || null,
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

        {/* Birthday */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Birthday</label>
          <input
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
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
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, city: val });
              if (val !== "Other") {
                setCustomCity("");
              }
            }}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
          >
            <option value="">Select your city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="Other">My city is not listed...</option>
          </select>
        </div>
 
        {isCustomCity && (
          <div className="mt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specify your city</label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Enter your city name"
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
            />
          </div>
        )}


        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell potential roommates a bit about yourself..."
            rows={3}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 resize-none"
          />
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
