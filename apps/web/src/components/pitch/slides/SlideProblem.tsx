"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, Sparkles, Frown } from "lucide-react";

const problems = [
  {
    id: "whatsapp",
    label: "WhatsApp Spam & Ghosting",
    desc: "Postings get buried in minutes; endless back-and-forth messaging with zero structure.",
    stress: 20,
  },
  {
    id: "vibe",
    label: "Lifestyle Clashes",
    desc: "Moving in with clean-freaks vs messy folks, or early-birds vs night-owls.",
    stress: 25,
  },
  {
    id: "budget",
    label: "Hidden Budget Mismatches",
    desc: "Discovering they can't afford the compound maintenance or energy bills after signing.",
    stress: 25,
  },
  {
    id: "bills",
    label: "No Shared Bills Ledger",
    desc: "Endless disputes over NEPA bills, cleaning supplies, and shared house funds.",
    stress: 30,
  },
];

export default function SlideProblem() {
  const [activeProblems, setActiveProblems] = useState<string[]>(["whatsapp", "vibe"]);

  const toggleProblem = (id: string) => {
    setActiveProblems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalStress = activeProblems.reduce((acc, curr) => {
    const prob = problems.find((p) => p.id === curr);
    return acc + (prob ? prob.stress : 0);
  }, 0);

  const getStressColor = (val: number) => {
    if (val < 40) return "bg-green-500 shadow-[0_0_15px_#22c55e]";
    if (val < 75) return "bg-yellow-500 shadow-[0_0_15px_#eab308]";
    return "bg-rose-600 shadow-[0_0_15px_#e11d48] animate-pulse";
  };

  const getStressLabel = (val: number) => {
    if (val === 0) return "Completely Chill";
    if (val < 30) return "Mildly Annoyed";
    if (val < 60) return "Highly Anxious";
    if (val < 90) return "Extremely Stressed 😰";
    return "Living in a Hostel Nightmare! 💀";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left side: Problem checklist */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-rose-500 font-mono text-sm uppercase mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>The Problem</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-6 leading-tight">
          Finding student roommates is a <span className="text-rose-500 underline decoration-wavy">broken</span> experience.
        </h2>
        <p className="text-slate-500 mb-8 max-w-lg">
          Nigerian university students off-campus are forced to rely on fragmented channels. Click the issues below to simulate the stress:
        </p>

        {/* Checkbox widgets */}
        <div className="space-y-4">
          {problems.map((prob) => {
            const isChecked = activeProblems.includes(prob.id);
            return (
              <button
                key={prob.id}
                onClick={() => toggleProblem(prob.id)}
                className={`w-full text-left p-4 border-2 rounded-xl transition-all duration-200 ${
                  isChecked
                    ? "bg-white border-rose-500 shadow-[4px_4px_0px_0px_#f43f5e]"
                    : "bg-slate-50 border-slate-900/10 hover:border-slate-900/20 shadow-[4px_4px_0px_0px_#e6eeda]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-5 h-5 flex items-center justify-center border-2 rounded ${
                      isChecked ? "border-rose-500 bg-rose-500/20 text-rose-500" : "border-slate-300 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base md:text-lg">{prob.label}</h4>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">{prob.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side: Interactive Stress Tracker */}
      <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white border-2 border-slate-900/10 rounded-2xl shadow-brutal relative overflow-hidden min-h-[350px]">
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center">
          <span className="text-xs font-mono tracking-widest text-slate-500 mb-4 uppercase">
            Interactive Stress Tracker
          </span>

          {/* Stress Meter circle/arc */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            {/* Outer gauge border */}
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />

            <div className="text-center">
              <motion.span
                key={totalStress}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black font-display text-slate-900 block"
              >
                {totalStress}%
              </motion.span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
                STRESS SCORE
              </span>
            </div>

            {/* Glowing active indicator */}
            <motion.div
              animate={{ rotate: (totalStress / 100) * 360 }}
              transition={{ type: "spring", stiffness: 60 }}
              className="absolute inset-1 border-t-4 border-rose-500 rounded-full pointer-events-none"
              style={{ filter: "drop-shadow(0 0 8px #f43f5e)" }}
            />
          </div>

          {/* Progress bar level */}
          <div className="w-full bg-slate-950 border border-slate-800 h-6 rounded-full overflow-hidden mb-4 relative">
            <motion.div
              className={`h-full ${getStressColor(totalStress)}`}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(totalStress, 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Dynamic Stress Status */}
          <div className="text-center h-12">
            <h3 className="font-bold text-lg text-white font-mono">
              {getStressLabel(totalStress)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {totalStress === 0 && "Zero conflicts! Live together in peace."}
              {totalStress > 0 && totalStress <= 45 && "Annoyances are building up..."}
              {totalStress > 45 && totalStress <= 80 && "Frequent arguments, late rent bills, heavy noise."}
              {totalStress > 80 && "Total chaos! Breaking house agreements & high stress."}
            </p>
          </div>

          <AnimatePresence>
            {totalStress >= 80 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute top-4 right-4 text-rose-500 bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl flex items-center gap-1.5 animate-bounce"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">High Risk Alert</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
