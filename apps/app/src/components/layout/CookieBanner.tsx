"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, X, Shield, Settings } from "lucide-react";

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
}

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    setMounted(true);
    const savedConsent = localStorage.getItem("roomie-cookie-consent");
    if (!savedConsent) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (updatedSettings: CookieSettings) => {
    localStorage.setItem("roomie-cookie-consent", JSON.stringify(updatedSettings));
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: updatedSettings }));
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, preferences: true };
    setSettings(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyEssential = { essential: true, analytics: false, preferences: false };
    setSettings(onlyEssential);
    saveConsent(onlyEssential);
  };

  const handleSaveCustom = () => {
    saveConsent(settings);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-3xl border border-slate-200/50 bg-white/90 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:left-auto md:right-6 md:w-[420px]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Shield className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Cookie Privacy Control
                </h3>
                <button
                  onClick={handleRejectAll}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Reject non-essential cookies"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!showSettings ? (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    We use cookies to keep you signed in securely, compile anonymous analytics to improve roommate recommendations, and customize your experience. Read our{" "}
                    <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    for full details.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 text-center bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs py-2.5 px-3.5 rounded-xl transition-all"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Configure
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-3.5 border-t border-slate-100 pt-4"
                >
                  {/* Essential */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold text-slate-800">Necessary Cookies</label>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">Required</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Used for account authentication, route security, and user session token storage.
                      </p>
                    </div>
                    <div className="h-5 w-5 flex items-center justify-center text-brand-600 bg-brand-50 rounded-md">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">Analytics & Performance</label>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Helps us calculate anonymous visits and referral clicks to measure platform performance.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.analytics}
                      onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                    />
                  </div>

                  {/* Preferences */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-800">Preferences & Customizations</label>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Saves layout preferences, sidebar toggles, and matching filters for your next visit.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences}
                      onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={handleSaveCustom}
                      className="flex-1 text-center bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs py-2 px-3 rounded-xl transition-all shadow-sm"
                    >
                      Save Preferences
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-slate-500 hover:text-slate-700 text-xs px-2 py-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
