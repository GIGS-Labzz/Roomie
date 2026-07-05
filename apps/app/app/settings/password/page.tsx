"use client";

import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/context/AuthContext";

export default function SecurityOptionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const hasPassword = !!(user?.app_metadata?.providers?.includes("email") || user?.user_metadata?.has_password === true);

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
              onClick={() => router.push("/settings")}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Password Options</h1>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6 pb-28">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-slate-950">Manage Account Credentials</h2>
            <p className="text-sm text-slate-500">
              Only one credential setup option is active based on your current login configuration.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card 1: Update (Reset) Password */}
            <button
              onClick={() => {
                if (hasPassword) {
                  router.push("/settings/password/confirmusername");
                }
              }}
              disabled={!hasPassword}
              className={`group text-left p-6 bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[180px] ${
                hasPassword
                  ? "border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-brand-300 active:scale-[0.98] cursor-pointer"
                  : "border-slate-100 opacity-40 cursor-not-allowed shadow-none"
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  hasPassword
                    ? "bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white"
                    : "bg-slate-50 text-slate-400"
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 2a2 2 0 012 2m-2-4a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM3 21v-1a4 4 0 0112 0v1M19 21v-1a4 4 0 00-3-3.87m-4-12a4 4 0 01-2.013 3.468M15 11.23a4 4 0 00-3.327-2.306" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-slate-900 text-base">Update Password</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify your set profile username to reset or update your existing password.
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold mt-4 transition-transform ${
                hasPassword
                  ? "text-brand-600 group-hover:translate-x-1"
                  : "text-slate-400"
              }`}>
                <span>{hasPassword ? "Continue" : "Update Disabled"}</span>
                {hasPassword && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Card 2: Set Password */}
            <button
              onClick={() => {
                if (!hasPassword) {
                  router.push("/settings/password/reset");
                }
              }}
              disabled={hasPassword}
              className={`group text-left p-6 bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[180px] ${
                !hasPassword
                  ? "border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-brand-300 active:scale-[0.98] cursor-pointer"
                  : "border-slate-100 opacity-40 cursor-not-allowed shadow-none"
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  !hasPassword
                    ? "bg-slate-50 text-slate-600 group-hover:bg-brand-500 group-hover:text-white"
                    : "bg-slate-50 text-slate-400"
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-slate-900 text-base">Set Password</h3>
                    {!hasPassword && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-brand-50 text-brand-700 font-semibold uppercase tracking-wider">
                        OAuth Sign-In
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {!hasPassword
                      ? "Create a password for your OAuth-linked account to enable email & password logins."
                      : "Password is already configured for this account."}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold mt-4 transition-transform ${
                !hasPassword
                  ? "text-brand-600 group-hover:translate-x-1"
                  : "text-slate-400"
              }`}>
                <span>{!hasPassword ? "Go to Set Password" : "Set Password Disabled"}</span>
                {!hasPassword && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
