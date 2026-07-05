"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
      <h3 className="font-display font-semibold text-slate-900 text-base">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-sage-surface border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateNewPassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationErr = validateNewPassword(newPassword);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);
    const supabase = createClient();

    // Update password via Supabase Auth and save metadata
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { has_password: true }
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
      <div className="min-h-screen bg-sage-surface flex">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push("/settings/password")}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Reset Password</h1>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4 pb-28">
          <form onSubmit={handleUpdate}>
            <FormSection title="Update Credentials">
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                Choose a strong, secure new password for your account.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-fadeIn">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 animate-fadeIn">
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
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>

              <Field label="Confirm New Password">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={inputCls}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-600">Password requirements:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li className={newPassword.length >= 8 ? "text-green-600 font-medium" : ""}>At least 8 characters long</li>
                  <li className={/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : ""}>Must contain at least one number</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-600 font-medium" : ""}>Must contain at least one special character</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isUpdating || !newPassword || !confirmPassword}
                className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-60 text-sm"
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
