"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import {
  UNIVERSITIES_BY_CITY,
  ALL_UNIVERSITIES,
  getUniversityData,
} from "./data";

const YEARS = [
  "100 Level", "200 Level", "300 Level",
  "400 Level", "500 Level", "600 Level", "Final Year",
];

export default function UniversityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Load saved city from profile
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("profiles")
      .select("city")
      .eq("id", user.id)
      .single()
      .then(({ data }: { data: { city: string | null } | null }) => {
        if (data?.city) setUserCity(data.city);
      });
  }, [user]);

  // Reset faculty/course when university changes
  const handleUniversityChange = (u: string) => {
    setSelectedUniversity(u);
    setSelectedFaculty("");
    setSelectedCourse("");
  };

  // Reset course when faculty changes
  const handleFacultyChange = (f: string) => {
    setSelectedFaculty(f);
    setSelectedCourse("");
  };

  // Universities list: city-filtered or full
  const universityList = userCity && UNIVERSITIES_BY_CITY[userCity]
    ? [...UNIVERSITIES_BY_CITY[userCity], "Other (not listed)"]
    : [...ALL_UNIVERSITIES, "Other (not listed)"];

  // Faculty + course lists derived from selected university
  const uniData = selectedUniversity ? getUniversityData(selectedUniversity) : null;
  const faculties = uniData?.faculties ?? [];
  const courses = selectedFaculty ? (uniData?.coursesByFaculty[selectedFaculty] ?? []) : [];

  const isValid = selectedUniversity && selectedYear;

  const handleNext = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      university: selectedUniversity,
      year_of_study: Number(selectedYear),
      faculty: selectedFaculty || null,
      course: selectedCourse || null,
      onboarding_step: 3,
    }).eq("id", user.id);
    router.push("/onboarding/vibe");
  };

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={2} />

      <div className="mt-8 mb-6">
        <h2 className="text-2xl font-display font-semibold text-slate-900">
          Your university
        </h2>
        {userCity && (
          <p className="text-sm text-brand-600 font-semibold mt-1">
            Showing universities near {userCity}
          </p>
        )}
      </div>

      <div className="space-y-4 flex-1">

        {/* University */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            University
          </label>
          <select
            value={selectedUniversity}
            onChange={(e) => handleUniversityChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
          >
            <option value="">Select your university</option>
            {universityList.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Year of study */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Year of study
          </label>
          <div className="grid grid-cols-3 gap-2">
            {YEARS.map((y, i) => (
              <button
                key={y}
                type="button"
                onClick={() => setSelectedYear(String(i + 1))}
                className={`px-3 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                  selectedYear === String(i + 1)
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Faculty — only shown once university is selected */}
        {selectedUniversity && faculties.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Faculty <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
            >
              <option value="">Select your faculty</option>
              {faculties.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {/* Course — only shown once faculty is selected */}
        {selectedFaculty && courses.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Course <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500"
            >
              <option value="">Select your course</option>
              {courses.sort().map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
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
