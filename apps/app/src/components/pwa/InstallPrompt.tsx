"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed as standalone — no prompt needed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 md:inset-x-auto md:right-4 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="none">
            <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
            <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
            <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
            <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm leading-tight">Install Roomie</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Add to your home screen for the best experience.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
