"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LifestyleTagPicker } from "@/components/onboarding/LifestyleTagPicker";
import { Avatar } from "@repo/ui/avatar";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@repo/db/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const NIGERIAN_CITIES = [
  "Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt", "Benin City",
  "Enugu", "Owerri", "Calabar", "Uyo", "Warri", "Ilorin", "Abeokuta",
  "Kaduna", "Zaria", "Maiduguri", "Aba", "Onitsha", "Akure", "Ado-Ekiti",
];

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)", "University of Ibadan (UI)", "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)", "Ahmadu Bello University (ABU)", "University of Benin (UNIBEN)",
  "University of Port Harcourt (UNIPORT)", "Federal University of Technology, Akure (FUTA)",
  "Covenant University", "Babcock University", "Lagos State University (LASU)",
  "Nnamdi Azikiwe University (UNIZIK)", "University of Calabar (UNICAL)", "University of Uyo (UNIUYO)",
  "Bayero University Kano (BUK)", "University of Jos (UNIJOS)", "Federal University of Technology, Owerri (FUTO)",
  "Benue State University", "Kwara State University", "Ekiti State University",
];

const YEAR_OPTIONS = [
  { value: 1, label: "100 Level" }, { value: 2, label: "200 Level" },
  { value: 3, label: "300 Level" }, { value: 4, label: "400 Level" },
  { value: 5, label: "500 Level" }, { value: 6, label: "600 Level" },
  { value: 7, label: "Final Year" },
];

const BUDGET_MARKS = [20_000, 40_000, 60_000, 80_000, 100_000, 150_000, 200_000, 300_000, 500_000];

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T | null | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-2xl overflow-hidden border border-slate-200 bg-white">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-brand-500 text-white"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
      <h3 className="font-display font-semibold text-slate-900 text-base">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-sage-surface border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors";

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();

  const [form, setForm] = useState<ProfileUpdate>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      bio: profile.bio,
      phone: profile.phone,
      university: profile.university,
      faculty: profile.faculty,
      course: profile.course,
      year_of_study: profile.year_of_study,
      sleep_schedule: profile.sleep_schedule,
      cleanliness: profile.cleanliness,
      noise_pref: profile.noise_pref,
      allows_smoking: profile.allows_smoking,
      allows_pets: profile.allows_pets,
      allows_guests: profile.allows_guests,
      min_budget: profile.min_budget,
      max_budget: profile.max_budget,
      move_in_date: profile.move_in_date,
      roommate_gender_pref: profile.roommate_gender_pref,
      avatar_url: profile.avatar_url,
    });
    setSelectedTags(profile.lifestyle_tags ?? []);
  }, [profile]);

  const set = <K extends keyof ProfileUpdate>(key: K, val: ProfileUpdate[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const budgetError =
    form.min_budget && form.max_budget && (form.min_budget as number) > (form.max_budget as number)
      ? "Min budget can't exceed max budget"
      : null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setSaveError("Only JPG, PNG, or WebP images accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Image must be under 5 MB.");
      return;
    }

    setAvatarUploading(true);
    setSaveError(null);

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

    if (error) {
      setSaveError("Avatar upload failed. Please try again.");
      setAvatarPreview(null);
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    set("avatar_url", data.publicUrl);
    setAvatarUploading(false);
  };

  const handleSave = async () => {
    if (budgetError) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await updateProfile({ ...form, lifestyle_tags: selectedTags });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-surface flex">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentAvatarSrc = avatarPreview ?? (form.avatar_url as string | null) ?? undefined;

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={isSaving || !!budgetError}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                saved
                  ? "bg-brand-100 text-brand-700"
                  : "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.97]"
              } disabled:opacity-60`}
            >
              {isSaving ? "Saving…" : saved ? "Saved!" : "Save"}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4 pb-16">

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          {/* Avatar */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar
                  src={currentAvatarSrc}
                  name={(form.display_name as string) ?? ""}
                  size="xl"
                  className="ring-2 ring-sage-surface"
                />
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-2xl hover:bg-brand-600 transition-colors active:scale-[0.97]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Change photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                </label>
                <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or WebP · max 5 MB</p>
              </div>
            </div>
          </div>

          {/* Basics */}
          <FormSection title="Basics">
            <Field label="Display name">
              <input
                type="text"
                className={inputCls}
                value={(form.display_name as string) ?? ""}
                onChange={(e) => set("display_name", e.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Age">
              <input
                type="number"
                className={inputCls}
                value={(form.age as number) ?? ""}
                min={16}
                max={35}
                onChange={(e) => set("age", e.target.value ? Number(e.target.value) : null)}
                placeholder="Your age"
              />
            </Field>
            <Field label="Gender">
              <SegmentedControl
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "non_binary" },
                ]}
                value={form.gender as string}
                onChange={(v) => set("gender", v as ProfileUpdate["gender"])}
              />
            </Field>
            <Field label="City">
              <select
                className={inputCls}
                value={(form.city as string) ?? ""}
                onChange={(e) => set("city", e.target.value || null)}
              >
                <option value="">Select city</option>
                {NIGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                className={inputCls}
                value={(form.phone as string) ?? ""}
                onChange={(e) => set("phone", e.target.value || null)}
                placeholder="e.g. +234 801 234 5678"
              />
            </Field>
            <Field label="Bio">
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={(form.bio as string) ?? ""}
                onChange={(e) => set("bio", e.target.value || null)}
                placeholder="A short intro about yourself…"
              />
            </Field>
          </FormSection>

          {/* University */}
          <FormSection title="University">
            <Field label="University">
              <select
                className={inputCls}
                value={(form.university as string) ?? ""}
                onChange={(e) => set("university", e.target.value || null)}
              >
                <option value="">Select university</option>
                {NIGERIAN_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Year of study">
              <select
                className={inputCls}
                value={(form.year_of_study as number) ?? ""}
                onChange={(e) => set("year_of_study", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Faculty">
              <input
                type="text"
                className={inputCls}
                value={(form.faculty as string) ?? ""}
                onChange={(e) => set("faculty", e.target.value || null)}
                placeholder="e.g. Engineering, Social Sciences…"
              />
            </Field>
            <Field label="Course">
              <input
                type="text"
                className={inputCls}
                value={(form.course as string) ?? ""}
                onChange={(e) => set("course", e.target.value || null)}
                placeholder="e.g. Computer Science, Business Admin…"
              />
            </Field>
          </FormSection>

          {/* Vibe */}
          <FormSection title="Your Vibe">
            <Field label="Sleep schedule">
              <SegmentedControl
                options={[
                  { label: "Early bird", value: "early_bird" },
                  { label: "Night owl", value: "night_owl" },
                  { label: "Flexible", value: "flexible" },
                ]}
                value={form.sleep_schedule as string}
                onChange={(v) => set("sleep_schedule", v as ProfileUpdate["sleep_schedule"])}
              />
            </Field>
            <Field label="Cleanliness">
              <SegmentedControl
                options={[
                  { label: "Very tidy", value: "very_tidy" },
                  { label: "Tidy", value: "tidy" },
                  { label: "Relaxed", value: "relaxed" },
                  { label: "Messy", value: "messy" },
                ]}
                value={form.cleanliness as string}
                onChange={(v) => set("cleanliness", v as ProfileUpdate["cleanliness"])}
              />
            </Field>
            <Field label="Noise level">
              <SegmentedControl
                options={[
                  { label: "Very quiet", value: "very_quiet" },
                  { label: "Quiet", value: "quiet" },
                  { label: "Moderate", value: "moderate" },
                  { label: "Lively", value: "lively" },
                ]}
                value={form.noise_pref as string}
                onChange={(v) => set("noise_pref", v as ProfileUpdate["noise_pref"])}
              />
            </Field>
            <div className="space-y-3 pt-1">
              {(
                [
                  { key: "allows_smoking", label: "Smoking OK" },
                  { key: "allows_pets", label: "Pets OK" },
                  { key: "allows_guests", label: "Guests welcome" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!(form[key] as boolean)}
                    onClick={() => set(key, !(form[key] as boolean))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      (form[key] as boolean) ? "bg-brand-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        (form[key] as boolean) ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
            <Field label="Lifestyle tags">
              <LifestyleTagPicker selected={selectedTags} onChange={setSelectedTags} />
            </Field>
          </FormSection>

          {/* Budget */}
          <FormSection title="Budget & Timeline">
            <Field label="Min budget (₦)" error={budgetError}>
              <select
                className={`${inputCls} ${budgetError ? "border-red-300" : ""}`}
                value={(form.min_budget as number) ?? ""}
                onChange={(e) => set("min_budget", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">No minimum</option>
                {BUDGET_MARKS.map((v) => (
                  <option key={v} value={v}>
                    ₦{v.toLocaleString("en-NG")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Max budget (₦)">
              <select
                className={`${inputCls} ${budgetError ? "border-red-300" : ""}`}
                value={(form.max_budget as number) ?? ""}
                onChange={(e) => set("max_budget", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">No maximum</option>
                {BUDGET_MARKS.map((v) => (
                  <option key={v} value={v}>
                    ₦{v.toLocaleString("en-NG")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Move-in date">
              <input
                type="date"
                className={inputCls}
                value={(form.move_in_date as string) ?? ""}
                onChange={(e) => set("move_in_date", e.target.value || null)}
              />
            </Field>
            <Field label="Preferred roommate gender">
              <SegmentedControl
                options={[
                  { label: "Any", value: "prefer_not_to_say" },
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                value={(form.roommate_gender_pref as string) ?? "prefer_not_to_say"}
                onChange={(v) => set("roommate_gender_pref", v as ProfileUpdate["roommate_gender_pref"])}
              />
            </Field>
          </FormSection>

          {/* Save button (bottom) */}
          <button
            onClick={handleSave}
            disabled={isSaving || !!budgetError}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isSaving ? "Saving…" : saved ? "Saved!" : "Save changes"}
          </button>
        </main>
      </div>
    </div>
  );
}
