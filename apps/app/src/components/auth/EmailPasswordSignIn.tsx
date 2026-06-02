"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";

export function EmailPasswordSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, onboarding_step")
      .eq("id", data.user.id)
      .single();

    if (!profile?.onboarding_complete) {
      const step = profile?.onboarding_step ?? 0;
      const stepRoutes: Record<number, string> = {
        0: "/onboarding/welcome",
        1: "/onboarding/basics",
        2: "/onboarding/university",
        3: "/onboarding/vibe",
        4: "/onboarding/budget",
        5: "/onboarding/verify",
      };
      router.push(stepRoutes[step] ?? "/onboarding/welcome");
    } else {
      router.push("/feed");
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        <span>{loading ? "Signing in..." : "Sign in"}</span>
      </button>
    </form>
  );
}
