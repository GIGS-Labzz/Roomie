"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useAuth } from "@/context/AuthContext";
import { validatePassword } from "@/lib/password-validation";
import { createClient } from "@repo/db/client";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
      <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-sage-surface px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-300";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const { isLoading } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordResult = validatePassword(newPassword);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationResult = validatePassword(newPassword);
    if (!validationResult.isValid) {
      setError(validationResult.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { has_password: true },
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/settings");
      }, 1500);
    }

    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-sage-surface">
        <AppSidebar />
        <div className="flex flex-1 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sage-surface">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-sage-light/40 bg-sage-surface/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <button
              onClick={() => router.push("/settings/password")}
              className="-ml-2 rounded-xl p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
              aria-label="Go back"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display flex-1 text-xl font-bold text-slate-900">Reset Password</h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6 pb-28">
          <form onSubmit={handleUpdate}>
            <FormSection title="Update Credentials">
              <p className="mb-2 text-xs leading-relaxed text-slate-500">
                Choose a strong, secure new password for your account.
              </p>

              {error && (
                <div className="animate-fadeIn rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="animate-fadeIn rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  Password updated successfully! Redirecting...
                </div>
              )}

              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputCls}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    required
                    autoComplete="new-password"
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
                <PasswordStrengthMeter result={passwordResult} show={newPassword.length > 0} />
              </Field>

              <Field label="Confirm New Password">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={inputCls}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your secure password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={isUpdating || !newPassword || !confirmPassword}
                className="w-full rounded-2xl bg-slate-800 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Save Password"}
              </button>
            </FormSection>
          </form>
        </main>
      </div>
    </div>
  );
}
