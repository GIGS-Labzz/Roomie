"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile - sharing is handled directly from profile page
    router.replace("/profile");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}
