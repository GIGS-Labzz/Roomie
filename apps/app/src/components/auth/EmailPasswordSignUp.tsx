"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@repo/db/client";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { validateEmail } from "@/lib/email-validation";
import { validatePassword } from "@/lib/password-validation";

export function EmailPasswordSignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validationResult = validatePassword(password);
  const emailResult = validateEmail(email);
  const showEmailError = email.length > 0 && !emailResult.isValid;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailValidationResult = validateEmail(email);
    if (!emailValidationResult.isValid) {
      setError(emailValidationResult.error);
      setLoading(false);
      return;
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      setError(passwordResult.error);
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Sign up failed. Please try again.");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding/welcome");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
          <p className="mb-1 font-semibold">Account created successfully!</p>
          <p className="text-xs text-brand-600/90">Please check your email to verify your account before signing in.</p>
        </div>
        <button
          onClick={() => router.push("/auth/signin")}
          className="w-full rounded-2xl bg-brand-500 px-6 py-4 font-bold text-white transition-all hover:bg-brand-600"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-3">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-invalid={showEmailError}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 ${
            showEmailError
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
              : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/30"
          }`}
        />
        {showEmailError && <p className="mt-1.5 text-xs font-medium text-red-500">{emailResult.error}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrengthMeter result={validationResult} show={password.length > 0} />
      </div>

      <button
        type="submit"
        disabled={loading || !fullName || !email || !password || !emailResult.isValid}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 font-bold text-white transition-all hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
        <span>{loading ? "Creating Account..." : "Create Account"}</span>
      </button>
    </form>
  );
}
