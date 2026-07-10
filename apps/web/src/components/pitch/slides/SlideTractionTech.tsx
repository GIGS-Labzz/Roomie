"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle2, ChevronRight, Cpu, GitBranch, Zap } from "lucide-react";

interface Milestone {
  phase: string;
  title: string;
  status: "completed" | "active" | "future";
  description: string;
  bullets: string[];
  tech: string[];
}

const milestones: Milestone[] = [
  {
    phase: "Phases 1–6",
    title: "Core System Shipped",
    status: "completed",
    description: "Successfully built the roommate matchmaker database, agreement schemas, and offline support.",
    bullets: [
      "Dynamic roommate matching & filters",
      "Real-time chat & connection workflow",
      "Paystack secure connection checkout (₦2,000)",
      "Built-in shared ledger bill splitter",
      "Service workers & PWA install prompts",
    ],
    tech: ["Next.js", "Supabase", "Prisma", "Tailwind CSS", "Paystack SDK"],
  },
  {
    phase: "Phase 7",
    title: "Verification & Alerting",
    status: "active",
    description: "Strengthening the trust core and keeping users engaged with zero network delays.",
    bullets: [
      "Student ID upload & verification workflow",
      "Verified Student dynamic badges",
      "Web Push notification integration",
      "Real-time browser notifications on chat activity",
    ],
    tech: ["Supabase Storage", "WebPush Protocol", "Lottie Animations"],
  },
  {
    phase: "Phases 8–9",
    title: "Provider Dashboard & SEO",
    status: "future",
    description: "Opening up provider monetization and deploying high-converting index structures.",
    bullets: [
      "Landlord/Provider management dashboard",
      "Hostel registration & link trackers",
      "Marketing SPA SEO and indexing optimizations",
      "Referral analytics for housing providers",
    ],
    tech: ["Next.js App Router", "Direct Link Trackers", "SEO Metadata Engines"],
  },
];

export default function SlideTractionTech() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selected = milestones[selectedIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left Column: Timeline Navigation */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
          <GitBranch className="w-4 h-4" />
          <span>Product Readiness</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
          Ready to scale. Shipped core features.
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg">
          Roomie isn't just an idea. We have already built and containerized the core matching, financial ledgers, and contract architectures.
        </p>

        {/* Vertical Timeline Picker */}
        <div className="space-y-4">
          {milestones.map((ms, index) => {
            const isSelected = selectedIdx === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedIdx(index)}
                className={`w-full text-left p-4 border rounded-2xl flex items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-900 border-brand-500 shadow-[4px_4px_0px_0px_#8AAF6E]"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-xs ${
                      ms.status === "completed"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : ms.status === "active"
                        ? "bg-brand-500/20 border-brand-500 text-brand-400 animate-pulse"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    {ms.status === "completed" ? "✓" : index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm md:text-base leading-none">{ms.title}</h4>
                    <span className="text-[10px] font-mono text-slate-500 mt-1.5 block uppercase tracking-wider">
                      {ms.phase}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? "translate-x-1 text-brand-500" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Dynamic Phase Details */}
      <div className="flex justify-center items-center">
        <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-brutal min-h-[380px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 mb-4 uppercase block">
              PHASE DETAIL INSPECTOR
            </span>

            <h3 className="text-xl font-bold font-display text-white mb-2">{selected.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">{selected.description}</p>

            <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Shipped/Planned Items</h4>
            <ul className="space-y-2.5">
              {selected.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className="font-sans leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-850 relative z-10">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Technology Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {selected.tech.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono text-brand-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
