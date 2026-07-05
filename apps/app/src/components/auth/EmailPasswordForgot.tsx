"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";

export function EmailPasswordForgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-sm text-brand-700 animate-fadeIn">
          <p className="font-semibold mb-1">Reset email sent!</p>
          <p className="text-xs text-brand-600/90">Please check your inbox for instructions to reset your password.</p>
        </div>
        <button
          onClick={() => router.push("/auth/signin")}
          className="w-full px-6 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-fadeIn">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
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

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
      </button>
    </form>
  );
}
