"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return (
    <div className="min-h-screen bg-sage-surface flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}
