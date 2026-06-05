"use client";

import { createClient } from "@repo/db/client";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-w-sm w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display font-bold text-slate-900 text-xl">Application under review</h2>
          <p className="text-slate-500 text-sm mt-2">
            Your platform registration is being reviewed by the Roomie team. You&apos;ll receive an email once approved.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Sign out
        </button>
        <footer className="pt-2 text-xs text-slate-400 border-t border-slate-100">
          © 2026 Roomie · A{" "}
          <a href="https://gigsrentals.com" target="_blank" rel="noopener noreferrer" className="hover:underline">GIGSRentals</a>{" "}
          Product
        </footer>
      </div>
    </div>
  );
}
