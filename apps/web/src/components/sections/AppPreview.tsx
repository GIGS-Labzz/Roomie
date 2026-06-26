"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.roomie.ng";

const screens = [
  {
    id: "discover",
    label: "Discover",
    description: "Browse profiles filtered by university, city, and lifestyle.",
    mockContent: (
      <div className="space-y-3 p-4">
        {[
          { name: "Amara O.", uni: "UNILAG", budget: "₦80k–₦120k", match: 92, verified: true },
          { name: "Fatimah K.", uni: "UNILAG", budget: "₦60k–₦100k", match: 88, verified: true },
          { name: "Emeka N.", uni: "UniAbuja", budget: "₦50k–₦80k", match: 74, verified: false },
        ].map((profile) => (
          <div
            key={profile.name}
            className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-brand-200 flex-shrink-0 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {profile.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-900 text-xs">{profile.name}</p>
                {profile.verified && (
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-500 flex items-center justify-center">
                    <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                      <path d="M1 3L2.8 5L6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-slate-400 text-[10px]">{profile.uni}</p>
              <p className="text-slate-500 text-[10px]">{profile.budget}/mo</p>
            </div>
            <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
              {profile.match}%
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    description: "Real-time messaging with your match — unlocked for free.",
    mockContent: (
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-200 flex-shrink-0" />
          <div className="bg-sage-surface rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
            <p className="text-xs text-slate-700">Hey! Saw your profile, I&apos;m also near UNILAG</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-brand-500 rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%]">
            <p className="text-xs text-white">That&apos;s great! What&apos;s your budget?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-200 flex-shrink-0" />
          <div className="bg-sage-surface rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
            <p className="text-xs text-slate-700">₦80k-120k/month. Non-smoker, early bird</p>
          </div>
        </div>
        <div className="mt-2 border border-brand-200 rounded-xl p-2.5 bg-brand-50">
          <p className="text-[10px] font-semibold text-brand-700 mb-1">Roommate Agreement Proposal</p>
          <p className="text-[9px] text-slate-600">Accept &amp; unlock housing providers for ₦2,000</p>
          <div className="mt-2 flex gap-1.5">
            <div className="flex-1 text-center py-1 bg-peach-200 rounded-lg text-[9px] font-semibold text-slate-700">Accept &amp; Pay</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "splits",
    label: "Bill Splits",
    description: "Track shared expenses and mark them as paid.",
    mockContent: (
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-700 mb-3">Active Splits</p>
        {[
          { title: "December Rent", total: "₦300,000", paid: "₦150,000", pct: 50 },
          { title: "Electricity Bill", total: "₦18,000", paid: "₦18,000", pct: 100 },
          { title: "WiFi (Monthly)", total: "₦12,000", paid: "₦6,000", pct: 50 },
        ].map((split) => (
          <div key={split.title} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-slate-800">{split.title}</p>
              {split.pct === 100 && (
                <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-semibold">
                  Settled
                </span>
              )}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-brand-400 rounded-full transition-all"
                style={{ width: `${split.pct}%` }}
              />
            </div>
            <div className="flex justify-between">
              <p className="text-[10px] text-slate-400">{split.paid} paid</p>
              <p className="text-[10px] text-slate-500">{split.total}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function AppPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeScreen, setActiveScreen] = useState(0);

  return (
    <section ref={ref} className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
            See it in action
          </p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900">
            Built for Nigerian students
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-md mx-auto">
            A clean, fast PWA that works even without internet. Install it like
            a native app.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Tab selector */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex lg:flex-col gap-3 lg:gap-4 flex-shrink-0"
          >
            {screens.map((screen, i) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(i)}
                className={`px-5 py-3 rounded-2xl text-left transition-all duration-200 ${
                  activeScreen === i
                    ? "bg-brand-500 text-white shadow-brutal"
                    : "bg-sage-surface text-slate-600 hover:bg-brand-50"
                }`}
              >
                <p className="font-semibold text-sm">{screen.label}</p>
                <p
                  className={`text-xs mt-0.5 hidden lg:block ${
                    activeScreen === i ? "text-brand-100" : "text-slate-400"
                  }`}
                >
                  {screen.description}
                </p>
              </button>
            ))}

            <a
              href={APP_URL}
              className="hidden lg:inline-flex items-center justify-center mt-4 px-6 py-3 bg-peach-200 hover:bg-peach-300 text-slate-900 font-semibold rounded-2xl transition-colors text-sm"
            >
              Try it now
            </a>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1 flex justify-center"
          >
            <div
              className="relative w-64 bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 overflow-hidden"
              style={{ aspectRatio: "9/19" }}
            >
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-white flex items-center justify-between px-4 pt-2">
                <span className="text-[9px] font-semibold text-slate-900">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 rounded-sm bg-slate-900" />
                  <div className="w-1 h-1 rounded-full bg-slate-900" />
                </div>
              </div>

              {/* App header */}
              <div className="bg-white pt-8 pb-2 px-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-sm text-slate-900">
                    {screens[activeScreen]?.label ?? ""}
                  </p>
                  <div className="w-6 h-6 rounded-full bg-brand-100" />
                </div>
              </div>

              {/* Screen content */}
              <div
                className="overflow-hidden bg-slate-50"
                style={{ minHeight: "320px" }}
              >
                <motion.div
                  key={activeScreen}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {screens[activeScreen]?.mockContent}
                </motion.div>
              </div>

              {/* Bottom nav */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-2 px-2">
                {["Discover", "Chat", "Splits"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveScreen(i)}
                    className={`text-[9px] flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                      activeScreen === i
                        ? "text-brand-600 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeScreen === i ? "bg-brand-500" : "bg-transparent"
                      }`}
                    />
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
