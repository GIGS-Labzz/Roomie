"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { MessageSquare, PhoneCall, MessageCircle, ArrowRight } from "lucide-react";

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin English", "French", "Other"];

const CONTACT_PREFS = [
  { value: "whatsapp", label: "WhatsApp Chat", icon: MessageCircle, desc: "Fast direct chats" },
  { value: "in_app", label: "In-App Chat Only", icon: MessageSquare, desc: "Keep privacy inside Roomie" },
  { value: "phone", label: "Phone Calls", icon: PhoneCall, desc: "Direct phone connection" },
];

export default function DemographicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [contactPref, setContactPref] = useState("whatsapp");

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      lifestyle_tags: [language, contactPref],
      onboarding_step: 3,
    }).eq("id", user.id);

    router.push("/onboarding/nin");
  };

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={2} totalSteps={9} />

      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-8 mb-2">
        Demographics & Communication
      </h2>
      <p className="text-xs text-slate-500 mb-8">
        Step 2 of 9 — Preferences for interacting with potential roommates.
      </p>

      <div className="space-y-6 flex-1">
        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Primary Spoken Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  language === lang
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Pref */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Preferred Communication Channel
          </label>
          <div className="space-y-3">
            {CONTACT_PREFS.map((pref) => {
              const Icon = pref.icon;
              const isSelected = contactPref === pref.value;
              return (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => setContactPref(pref.value)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{pref.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{pref.desc}</p>
                    </div>
                  </div>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full py-4 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loading ? "Saving Demographics..." : "Continue to NIN Check"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
