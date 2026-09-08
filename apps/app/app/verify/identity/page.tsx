"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { NINInput } from "@/components/onboarding/NINInput";
import { FaceScanLauncher } from "@/components/onboarding/FaceScanLauncher";
import { DocumentUploadSlot } from "@/components/onboarding/DocumentUploadSlot";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RetroactiveIdentityVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState<string | null>(null);
  const [ninDone, setNinDone] = useState(false);

  const [faceDone, setFaceDone] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState("student");

  const [overallIdentityVerified, setOverallIdentityVerified] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      if (!user) return;
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("nin_verified, face_verified, identity_verified, user_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNinDone(!!profile.nin_verified);
        setFaceDone(!!profile.face_verified);
        setOverallIdentityVerified(!!profile.identity_verified);
        if (profile.user_type) setUserType(profile.user_type);
      }
    }
    loadStatus();
  }, [user]);

  const handleVerifyNIN = async () => {
    if (nin.length !== 11) return;
    setLoading(true);
    setNinError(null);

    try {
      const res = await fetch("/api/kyc/nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setNinError(data.error || "NIN verification failed");
        return;
      }

      setNinDone(true);
    } catch (err: unknown) {
      console.error(err);
      setLoading(false);
      setNinError("Error verifying NIN");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <VerificationBadge
            ninVerified={ninDone}
            faceVerified={faceDone}
            identityVerified={overallIdentityVerified}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-500" />
            Roomie Identity Verification Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Complete your official NIN lookup, facial liveness scan, and document submission to retain full roommate messaging permissions.
          </p>
        </div>

        {/* Section 1: NIN Verification */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. National Identification Number (NIN)
            </h3>
            {ninDone && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </span>
            )}
          </div>

          {!ninDone ? (
            <div className="space-y-4">
              <NINInput
                value={nin}
                onChange={setNin}
                error={ninError}
                disabled={loading}
              />
              <button
                onClick={handleVerifyNIN}
                disabled={nin.length !== 11 || loading}
                className="py-3 px-6 bg-brand-500 text-white font-semibold text-xs rounded-xl hover:bg-brand-600 disabled:opacity-40"
              >
                {loading ? "Verifying..." : "Verify NIN"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Your 11-digit NIN has been encrypted and matched against official NIMC records.
            </p>
          )}
        </div>

        {/* Section 2: Facial Liveness */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Facial Recognition & Liveness Scan
            </h3>
            {faceDone && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </span>
            )}
          </div>

          {!faceDone ? (
            <FaceScanLauncher
              onSuccess={() => {
                setFaceDone(true);
                setOverallIdentityVerified(ninDone);
              }}
            />
          ) : (
            <p className="text-xs text-slate-500">
              Biometric liveness challenge passed and matched against NIMC records.
            </p>
          )}
        </div>

        {/* Section 3: Archetype Document Upload */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            3. Archetype Proof Document ({userType === "nysc_corper" ? "NYSC ID / Call-Up" : userType === "young_professional" ? "Work Proof / Utility Bill" : "Student ID"})
          </h3>

          <DocumentUploadSlot
            title="Upload Proof Document"
            description="Clear scan or photo upload (JPG, PNG, PDF up to 5MB)"
            value={docUrl}
            onUploadComplete={setDocUrl}
          />
        </div>

      </div>
    </div>
  );
}
