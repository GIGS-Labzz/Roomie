"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { Logo } from "@repo/ui/logo";

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: authError, data } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Check your credentials and try again.");
      setIsLoading(false);
      return;
    }

    if (!data.user) { setIsLoading(false); return; }

    // Check role and redirect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminRow } = await (supabase as any)
      .from("admin_users").select("role").eq("id", data.user.id).maybeSingle();

    if (adminRow) { router.replace("/super"); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: platform } = await (supabase as any)
      .from("housing_platforms").select("id, status").eq("contact_email", email).maybeSingle();

    if (platform?.status === "ACTIVE") { router.replace("/dashboard"); return; }

    // Pending approval
    router.replace("/pending");
  };

  const inputCls =
    "w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors bg-slate-50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-w-sm w-full space-y-6">
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <Logo size="lg" showWordmark={false} />
          </div>
          <h1 className="font-display font-bold text-slate-900 text-2xl">Roomie Admin</h1>
          <p className="text-slate-500 text-sm">Sign in to your provider dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            className={inputCls}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            required
            className={inputCls}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Not registered yet?{" "}
          <a href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            List your platform
          </a>
        </p>

        <footer className="pt-2 text-center text-xs text-slate-400 border-t border-slate-100">
          © 2026 Roomie · A{" "}
          <a href="https://gigsrentals.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
            GIGSRentals
          </a>{" "}
          Product
        </footer>
      </div>
    </div>
  );
}
