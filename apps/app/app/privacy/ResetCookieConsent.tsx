"use client";

import { useState } from "react";
import { Cookie } from "lucide-react";

export function ResetCookieConsent() {
  const [reset, setReset] = useState(false);

  const handleReset = () => {
    localStorage.removeItem("roomie-cookie-consent");
    setReset(true);
    window.location.reload();
  };

  return (
    <button
      onClick={handleReset}
      disabled={reset}
      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Cookie className="w-3.5 h-3.5 text-brand-600" />
      {reset ? "Resetting choice..." : "Configure Cookie Preferences"}
    </button>
  );
}
