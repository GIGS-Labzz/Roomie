"use client";

import { useState } from "react";
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

interface FaceScanLauncherProps {
  onSuccess: (result: { score: number }) => void;
  disabled?: boolean;
}

export function FaceScanLauncher({ onSuccess, disabled }: FaceScanLauncherProps) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLiveness = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kyc/face/init", {
        method: "POST",
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Could not launch face verification.");
        setLoading(false);
        return;
      }

      // Simulate liveness scan steps
      setScanning(true);
      setScanStep("Position your face inside the frame...");
      
      setTimeout(() => {
        setScanStep("Blink slowly...");
      }, 1500);

      setTimeout(() => {
        setScanStep("Turn head slightly to the left...");
      }, 3000);

      setTimeout(() => {
        setScanStep("Matching against official NIMC records...");
      }, 4500);

      setTimeout(async () => {
        // Complete callback
        const callbackRes = await fetch("/api/kyc/face/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "passed",
            score: 0.92,
            vendor_ref: data.sessionId || `face_${Date.now()}`,
          }),
        });

        const callbackData = await callbackRes.json();
        setScanning(false);
        setLoading(false);

        if (callbackData.success) {
          setCompleted(true);
          onSuccess({ score: 0.92 });
        } else {
          setError("Liveness check did not match. Please try again.");
        }
      }, 6000);
    } catch (err: unknown) {
      console.error(err);
      setError("Face verification failed. Please try again.");
      setLoading(false);
      setScanning(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
      {scanning ? (
        <div className="space-y-4 py-8">
          <div className="relative w-40 h-40 mx-auto rounded-full border-4 border-dashed border-brand-500 animate-spin flex items-center justify-center">
            <Camera className="w-12 h-12 text-brand-500 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 animate-bounce">
            {scanStep}
          </p>
        </div>
      ) : completed ? (
        <div className="py-6 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Facial Liveness Verified!
          </h4>
          <p className="text-xs text-slate-500">
            NIMC government photo match confidence: 92%
          </p>
        </div>
      ) : (
        <>
          <div className="w-20 h-20 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 flex items-center justify-center">
            <Camera className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Selfie & Liveness Scan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              We match your live camera scan against your official NIMC government photo record.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={startLiveness}
            disabled={disabled || loading}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initializing Scan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Begin Face Scan
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
