"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const supabase = createClient();

export default function AppealPage() {
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();

  const [pendingAppeal, setPendingAppeal] = useState<any | null>(null);
  const [appealsLoading, setAppealsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAppeals = async () => {
    if (!user) return;
    setAppealsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("user_appeals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "PENDING")
        .maybeSingle();

      if (error) throw error;
      setPendingAppeal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAppealsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadAppeals();
    }
  }, [user]);

  // Redirect if user is not barred
  useEffect(() => {
    if (!profileLoading && profile && profile.is_active !== false) {
      router.replace("/feed");
    }
  }, [profile, profileLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Only JPG, PNG, WebP, or PDF files are accepted.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be under 10 MB.");
      return;
    }
    setFile(selectedFile);
    setUploadState("idle");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !message.trim()) {
      setErrorMsg("Please provide both an explanation and a document.");
      return;
    }

    setUploadState("uploading");
    setErrorMsg(null);

    try {
      const ext = file.name.split(".").pop();
      const path = `appeals/${user.id}/${crypto.randomUUID()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from("student-ids")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await (supabase as any)
        .from("user_appeals")
        .insert({
          user_id: user.id,
          message: message.trim(),
          document_url: path,
          status: "PENDING"
        });

      if (dbError) throw dbError;

      setUploadState("done");
      void loadAppeals();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit appeal. Please try again.");
      setUploadState("error");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/signin");
  };

  if (profileLoading || appealsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-display font-black text-slate-900 text-2xl">Account Suspended</h1>
            <p className="text-sm text-slate-500 mt-1">Your account has been temporarily barred.</p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all"
          >
            Log Out
          </button>
        </div>

        {pendingAppeal ? (
          <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Appeal Under Review</h3>
              <p className="text-sm text-slate-500 mt-1.5">
                We have received your appeal and documentation. Our trust and safety team will review your case shortly to verify your details. You will receive an email or message once your account has been unfrozen.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-xs font-medium leading-relaxed">
              To appeal this decision and unfreeze your profile, please describe your case and upload a valid supporting document (such as your student ID, registration letter, or utility bill showing your university address).
            </div>

            <div>
              <label htmlFor="message-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Appeal Message
              </label>
              <textarea
                id="message-field"
                placeholder="Briefly explain why your account should be reactivated..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 h-28"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Verification Document
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-all relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  required
                />
                <div className="space-y-1">
                  <svg className="mx-auto h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-700">
                    {file ? file.name : "Select ID or Document"}
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP, or PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={uploadState === "uploading" || !file || !message.trim()}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-60"
            >
              {uploadState === "uploading" ? "Uploading & Submitting..." : "Submit Appeal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
