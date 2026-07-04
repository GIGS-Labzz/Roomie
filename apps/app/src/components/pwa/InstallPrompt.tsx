"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hasDismissedRecently, setHasDismissedRecently] = useState(true);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect Android
    const ua = navigator.userAgent;
    const android = /android/i.test(ua);
    setIsAndroid(android);

    // Detect Standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check dismissal cooldown (24 hours)
    const dismissedTimeStr = localStorage.getItem("roomie_pwa_dismissed_time");
    if (dismissedTimeStr) {
      const dismissedTime = parseInt(dismissedTimeStr, 10);
      if (!isNaN(dismissedTime)) {
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - dismissedTime < cooldown) {
          setHasDismissedRecently(true);
        } else {
          setHasDismissedRecently(false);
        }
      } else {
        setHasDismissedRecently(false);
      }
    } else {
      setHasDismissedRecently(false);
    }

    // Capture beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDismissed(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Error triggering PWA install prompt:", err);
      }
    } else if (isAndroid) {
      // Fallback for Android Chrome when event is unavailable/throttled
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("roomie_pwa_dismissed_time", Date.now().toString());
  };

  const shouldShow =
    !isStandalone &&
    !dismissed &&
    !hasDismissedRecently &&
    (deferredPrompt !== null || isAndroid);

  if (!shouldShow) return null;

  return (
    <>
      {/* Installation Banner */}
      {!showInstructions && (
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
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Add to your home screen for the best experience.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Installation Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" viewBox="0 0 20 20" fill="none">
                  <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
                  <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
                  <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
                  <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Install Roomie</h3>
              <p className="text-xs text-slate-500 mt-1 px-4">
                Follow these simple steps to install the app on your Android device.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Open Browser Menu</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap the menu icon (three dots <span className="font-bold">⋮</span> or browser menu) in the toolbar.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Select Install Option</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap <span className="font-semibold text-slate-700">"Install app"</span> or <span className="font-semibold text-slate-700">"Add to Home screen"</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Confirm Installation</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm the prompt to add Roomie to your home screen.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
