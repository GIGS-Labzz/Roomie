"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

type UploadState = "idle" | "uploading" | "done" | "error";

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [frontState, setFrontState] = useState<UploadState>("idle");
  const [backState, setBackState] = useState<UploadState>("idle");
  const [frontPath, setFrontPath] = useState<string | null>(null);
  const [backPath, setBackPath] = useState<string | null>(null);

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      onboarding_step: 6,
      onboarding_complete: true,
    }).eq("id", user.id);

    // Auto-connect to official roommate support account
    const officialId = "a99928a0-8de7-4da0-871a-22077d13945d";
    try {
      const { data: conn } = await (supabase as any).from("connections").insert({
        requester_id: officialId,
        receiver_id: user.id,
        status: "ACTIVE",
        connected_at: new Date().toISOString(),
      }).select().single();

      if (conn) {
        await (supabase as any).from("messages").insert({
          connection_id: conn.id,
          sender_id: officialId,
          content: "Welcome to Roomie 😊 , this is the official support account, visit our Website on https://roomie-web-pg11.vercel.app/ \nFeel free to always reach out in case of any type of support",
        });
      }
    } catch (err) {
      console.error("Auto-connect to support failed:", err);
    }

    router.push("/onboarding/success");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!ALLOWED.includes(file.type)) {
      alert("Only JPG, PNG, WebP, or PDF accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }

    side === "front" ? setFrontState("uploading") : setBackState("uploading");

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${side}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("student-ids")
      .upload(path, file, { upsert: false });

    if (error) {
      side === "front" ? setFrontState("error") : setBackState("error");
      alert("Upload failed. Try again.");
      return;
    }

    const column = side === "front" ? "student_id_front_url" : "student_id_back_url";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({ [column]: path }).eq("id", user.id);

    if (side === "front") { setFrontState("done"); setFrontPath(path); }
    else { setBackState("done"); setBackPath(path); }
  };

  const handleSubmitVerification = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({
      verification_status: "PENDING",
      onboarding_step: 6,
      onboarding_complete: true,
    }).eq("id", user.id);

    // Auto-connect to official roommate support account
    const officialId = "a99928a0-8de7-4da0-871a-22077d13945d";
    try {
      const { data: conn } = await (supabase as any).from("connections").insert({
        requester_id: officialId,
        receiver_id: user.id,
        status: "ACTIVE",
        connected_at: new Date().toISOString(),
      }).select().single();

      if (conn) {
        await (supabase as any).from("messages").insert({
          connection_id: conn.id,
          sender_id: officialId,
          content: "Welcome to Roomie 😊 , this is the official support account, visit our Website on https://roomie-web-pg11.vercel.app/ \nFeel free to always reach out in case of any type of support",
        });
      }
    } catch (err) {
      console.error("Auto-connect to support failed:", err);
    }

    router.push("/onboarding/success");
  };

  const bothUploaded = frontState === "done" && backState === "done";

  function UploadSlot({ side, state }: { side: "front" | "back"; state: UploadState }) {
    return (
      <label className="block cursor-pointer">
        <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
          state === "done"
            ? "bg-brand-50 border-brand-300"
            : state === "uploading"
            ? "bg-slate-50 border-slate-200 animate-pulse"
            : state === "error"
            ? "bg-red-50 border-red-300"
            : "bg-white border-slate-200 hover:border-brand-300"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
            state === "done" ? "bg-brand-100" : state === "error" ? "bg-red-100" : "bg-brand-100"
          }`}>
            {state === "done" ? (
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : state === "uploading" ? (
              <span className="w-5 h-5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-700 capitalize">
            {state === "done" ? `Student ID ${side} — uploaded` : `Student ID — ${side}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {state === "done" ? "Tap to replace" : "JPG, PNG, WebP or PDF · max 5 MB"}
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          disabled={state === "uploading"}
          onChange={(e) => handleUpload(e, side)}
        />
      </label>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
      <OnboardingProgress currentStep={5} />

      <h2 className="text-2xl font-display font-semibold text-slate-900 mt-8 mb-2">
        Get verified
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        Upload your student ID to get the Verified badge on your profile. You can skip this and verify later from your profile page.
      </p>

      <div className="space-y-4 flex-1">
        <UploadSlot side="front" state={frontState} />
        <UploadSlot side="back" state={backState} />
      </div>

      <div className="mt-8 space-y-3">
        {bothUploaded ? (
          <button
            onClick={handleSubmitVerification}
            disabled={loading}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit for verification"}
          </button>
        ) : (
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-4 bg-peach-200 text-slate-900 font-bold rounded-2xl hover:bg-peach-300 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Setting up..." : "Skip for now — go to feed"}
          </button>
        )}
        {!bothUploaded && (
          <p className="text-center text-xs text-slate-400">
            You can verify anytime from your profile page
          </p>
        )}
        {(frontState === "done" || backState === "done") && !bothUploaded && (
          <p className="text-center text-xs text-amber-600 font-medium">
            Upload both sides to submit for verification
          </p>
        )}
      </div>
    </div>
  );
}
