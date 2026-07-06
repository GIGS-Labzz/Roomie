"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export function BarredCheck({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && profile && profile.is_active === false) {
      if (pathname !== "/appeal" && !pathname.startsWith("/auth")) {
        router.push("/appeal");
      }
    }
  }, [profile, isLoading, pathname, router]);

  // If barred and trying to access app pages, block render and redirect
  if (!isLoading && profile && profile.is_active === false && pathname !== "/appeal" && !pathname.startsWith("/auth")) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <span className="w-8 h-8 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-600 font-medium">Checking account status...</p>
      </div>
    );
  }

  return <>{children}</>;
}
