"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UsernameRedirectPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!params.username) {
      router.replace("/discover");
      return;
    }

    router.replace(`/discover/${encodeURIComponent(params.username)}`);
  }, [params.username, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500">Redirecting to profile...</p>
      </div>
    </div>
  );
}
