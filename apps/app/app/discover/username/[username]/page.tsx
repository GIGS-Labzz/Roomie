"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";

export default function UsernameRedirectPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!params.username) {
      router.replace("/discover");
      return;
    }

    const supabase = createClient();
    
    const resolveUsername = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("username", params.username)
          .maybeSingle();

        if (error || !data) {
          router.replace("/discover");
        } else {
          router.replace(`/discover/${(data as any).id}`);
        }
      } catch (err) {
        console.error("Error resolving username redirect:", err);
        router.replace("/discover");
      }
    };

    void resolveUsername();
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
