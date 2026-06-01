"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 6,
      onboarding_complete: true,
    }).eq("id", user.id);
    router.push("/discover");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!ALLOWED.includes(file.type)) {
      alert("Only JPG, PNG, WebP, or PDF accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }

    const supabase = createClient();
    const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("student-ids")
      .upload(path, file, { upsert: false });

    if (error) { alert("Upload failed. Try again."); return; }

    const column = side === "front" ? "student_id_front_url" : "student_id_back_url";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({ [column]: path }).eq("id", user.id);
  };

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={5} />

      <h2 className="text-2xl font-display font-semibold text-slate-900 mt-8 mb-2">
        Get verified
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        Upload your student ID to get the Verified badge on your profile. You can skip this and verify later.
      </p>

      <div className="space-y-4 flex-1">
        {(["front", "back"] as const).map((side) => (
          <label key={side} className="block cursor-pointer">
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-300 transition-colors">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 capitalize">Student ID — {side}</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP or PDF · max 5 MB</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e, side)}
            />
          </label>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={handleSkip}
          disabled={loading}
          className="w-full py-4 bg-peach-200 text-slate-900 font-bold rounded-2xl hover:bg-peach-300 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Setting up..." : "Skip for now — go to feed"}
        </button>
        <p className="text-center text-xs text-slate-400">
          You can verify anytime from your profile page
        </p>
      </div>
    </div>
  );
}
