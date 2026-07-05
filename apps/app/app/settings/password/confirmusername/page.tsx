"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useProfile } from "@/hooks/useProfile";

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

export default function ConfirmUsernamePage() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const [inputUsername, setInputUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasUsernameSet = profile?.username && profile.username.trim() !== "";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!profile || !profile.username) {
      setError("Unable to retrieve profile data.");
      return;
    }

    const cleanInput = inputUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanProfile = profile.username.trim().toLowerCase();

    if (cleanInput === cleanProfile) {
      router.push("/settings/password/reset");
    } else {
      setError("Username does not match your profile username.");
    }
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
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Verify Username</h1>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4 pb-28">
          {!hasUsernameSet ? (
            /* Warning / Setup prompt if user doesn't have a username set */
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-display font-bold text-slate-900">Username Required</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  You must configure a username on your profile settings page before you can reset or update your account password.
                </p>
              </div>
              <button
                onClick={() => router.push("/settings")}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 active:scale-[0.98] transition-all text-sm shadow-sm"
              >
                Go to Profile Settings
              </button>
            </div>
          ) : (
            /* Verification form */
            <form onSubmit={handleVerify}>
              <FormSection title="Confirm Profile Username">
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                  To protect your account credentials, please input your exact username. Once verified, you will be allowed to update your password.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-fadeIn">
                    {error}
                  </div>
                )}

                <Field label="Username">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-medium text-sm">@</span>
                    <input
                      type="text"
                      className={`${inputCls} pl-8`}
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="username"
                      required
                    />
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={!inputUsername.trim()}
                  className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-60 text-sm"
                >
                  Verify Username
                </button>
              </FormSection>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
