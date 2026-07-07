"use client";

import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  bg: string;
  cardBg: string;
  sidebarBg: string;
  brandColor: string;
  textColor: string;
  borderColor: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "generic",
    name: "Generic Mode",
    description: "The default warm sage green styling.",
    bg: "#EDE8C8",
    cardBg: "#FFFFFF",
    sidebarBg: "#EDE8C8",
    brandColor: "#8AAF6E",
    textColor: "#0F172A",
    borderColor: "#E2DDB6",
  },
  {
    id: "light",
    name: "Light Mode",
    description: "Crisp white and clean slate contrast.",
    bg: "#F8FAFC",
    cardBg: "#FFFFFF",
    sidebarBg: "#F1F5F9",
    brandColor: "#8AAF6E",
    textColor: "#0F172A",
    borderColor: "#E2E8F0",
  },
  {
    id: "dark",
    name: "Midnight Black",
    description: "Pitch black surfaces with emerald hues.",
    bg: "#09090B",
    cardBg: "#18181B",
    sidebarBg: "#09090B",
    brandColor: "#10B981",
    textColor: "#F4F4F5",
    borderColor: "#27272A",
  },
  {
    id: "deep",
    name: "Deep Navy",
    description: "Deep sea blue backgrounds with cobalt accents.",
    bg: "#0B1329",
    cardBg: "#1C2541",
    sidebarBg: "#0B1329",
    brandColor: "#3B82F6",
    textColor: "#FFFFFF",
    borderColor: "#1E293B",
  },
  {
    id: "forest",
    name: "Forest Gold",
    description: "Rich forest greens combined with gold finishes.",
    bg: "#12221A",
    cardBg: "#1C3629",
    sidebarBg: "#12221A",
    brandColor: "#E4C580",
    textColor: "#F7F3E9",
    borderColor: "#244736",
  },
];

export default function ThemeSelectionPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();

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

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push("/settings/personalization")}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Themes</h1>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6 pb-28">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-slate-950">Select Color Theme</h2>
            <p className="text-sm text-slate-500">
              Pick your preferred color palette. The changes take effect instantly across all dashboards, sidebars, and chat systems.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`group text-left p-3 bg-white rounded-3xl border-2 transition-all duration-300 relative flex flex-col gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.04)] ${
                    isSelected
                      ? "border-brand-500 shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-2 ring-brand-200"
                      : "border-slate-100 hover:border-slate-200 hover:shadow-[0_6px_28px_rgba(0,0,0,0.06)] active:scale-[0.98]"
                  }`}
                >
                  {/* Mockup Preview */}
                  <div
                    style={{ backgroundColor: t.bg }}
                    className="h-32 w-full rounded-2xl overflow-hidden relative flex border border-slate-100 transition-colors duration-300"
                  >
                    {/* Mini Sidebar */}
                    <div
                      style={{ backgroundColor: t.sidebarBg, borderRight: `1px solid ${t.borderColor}` }}
                      className="w-1/4 h-full p-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Tiny Logo */}
                        <div style={{ backgroundColor: t.brandColor }} className="w-5 h-2 rounded-sm opacity-90" />
                        {/* Tiny Nav Items */}
                        <div className="space-y-1">
                          <div className="w-full h-1 bg-slate-400/40 rounded-full" />
                          <div className="w-full h-1 bg-slate-400/40 rounded-full" style={{ backgroundColor: isSelected ? t.brandColor : undefined }} />
                          <div className="w-full h-1 bg-slate-400/40 rounded-full" />
                        </div>
                      </div>
                      {/* Avatar placeholder in sidebar footer */}
                      <div className="w-4 h-4 rounded-full bg-slate-400/30" />
                    </div>

                    {/* Mini Content Area */}
                    <div className="flex-1 p-2 flex flex-col justify-between h-full">
                      {/* Mini Header */}
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: t.borderColor }}>
                        <div className="w-12 h-1.5 rounded-full bg-slate-400/50" />
                        <div className="w-3 h-3 rounded-full bg-slate-400/40" />
                      </div>

                      {/* Tiny content container card */}
                      <div
                        style={{ backgroundColor: t.cardBg, borderColor: t.borderColor }}
                        className="rounded-lg p-2 border space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-1 my-1.5 flex flex-col justify-center"
                      >
                        <div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.8 }} />
                        <div className="w-full h-1 rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.3 }} />
                        <div className="w-2/3 h-1 rounded-full" style={{ backgroundColor: t.textColor, opacity: 0.3 }} />
                      </div>

                      {/* Accent button */}
                      <div className="flex justify-end">
                        <div style={{ backgroundColor: t.brandColor }} className="w-10 h-2.5 rounded-md" />
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-brand-500 text-white rounded-full p-1 shadow-md">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Label / Description Block */}
                  <div className="px-1 py-0.5 space-y-0.5">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
