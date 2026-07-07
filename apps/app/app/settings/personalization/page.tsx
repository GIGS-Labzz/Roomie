"use client";

import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function PersonalizationPage() {
  const router = useRouter();
  const { isLoading } = useAuth();

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

  const features = [
    {
      key: "theme",
      title: "Themes",
      description: "Customize the color scheme of the application.",
      href: "/settings/personalization/theme",
      inProgress: false,
    },
    {
      key: "font",
      title: "Font Size & Style",
      description: "Adjust font scaling and text readability preferences.",
      href: "#",
      inProgress: true,
    },
    {
      key: "icons",
      title: "App Icon Style",
      description: "Choose alternative styles for the app's interface icons.",
      href: "#",
      inProgress: true,
    },
    {
      key: "wallpapers",
      title: "Chat Wallpapers",
      description: "Select unique background images or patterns for chats.",
      href: "#",
      inProgress: true,
    },
    {
      key: "compact",
      title: "Density Mode",
      description: "Switch between standard, cozy, or compact spacing formats.",
      href: "#",
      inProgress: true,
    },
    {
      key: "sound",
      title: "Custom Sound Effects",
      description: "Customize audio triggers for notifications and messages.",
      href: "#",
      inProgress: true,
    },
  ];

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push("/settings")}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-900 text-xl flex-1">Personalization</h1>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6 pb-28">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-slate-950">Customize Your Vibe</h2>
            <p className="text-sm text-slate-500">
              Personalize Roomie's visual design and responsiveness to fit your style.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden divide-y divide-slate-100">
            {features.map((feature) => {
              if (feature.inProgress) {
                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between px-6 py-5 opacity-40 select-none cursor-not-allowed bg-slate-50/30"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-[15px]">{feature.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          In Progress
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={feature.key}
                  href={feature.href}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 text-[15px] group-hover:text-brand-600 transition-colors">
                      {feature.title}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-transform group-hover:translate-x-1">
                    <span>Configure</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
