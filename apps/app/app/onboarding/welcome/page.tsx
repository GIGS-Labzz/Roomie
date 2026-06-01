"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0] || "there";

  const handleNext = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update({ onboarding_step: 1 })
      .eq("id", user.id);
    router.push("/onboarding/basics");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      {/* Lottie placeholder — wired in Phase 9 */}
      <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center mb-8 text-4xl">
        👋
      </div>

      <h1 className="text-3xl font-display font-semibold text-slate-900 mb-3">
        Hi {firstName}!
      </h1>
      <p className="text-slate-500 text-base leading-relaxed max-w-xs mb-10">
        You&apos;re one step away from finding your perfect roommate.
        Let&apos;s build your profile.
      </p>

      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full max-w-xs px-8 py-4 bg-peach-200 text-slate-900 font-bold rounded-2xl hover:bg-peach-300 transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Setting up..." : "Let's go"}
      </button>
    </div>
  );
}
