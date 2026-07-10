"use client";

import { motion } from "framer-motion";
import { CheckCircle, Heart, ShieldCheck, Wallet, ArrowUpRight } from "lucide-react";

const solutions = [
  {
    icon: Heart,
    title: "Compatibility Scoring",
    desc: "AI-driven matching based on budget, cleanliness, sleeping habits, and noise levels. No more guesswork.",
    badge: "Matching",
    color: "border-brand-500 hover:shadow-[4px_4px_0px_0px_#8AAF6E]",
  },
  {
    icon: ShieldCheck,
    title: "Verified Roomie Network",
    desc: "Verification badges & professional credentials link roommates safely (1st, 2nd, 3rd-degree network connections).",
    badge: "Trust",
    color: "border-peach-500 hover:shadow-[4px_4px_0px_0px_#e49e45]",
  },
  {
    icon: Wallet,
    title: "Auto-Shared Bills Splitter",
    desc: "A built-in ledger for managing house costs. Automate splitting of NEPA bills, water rates, and cleaning costs.",
    badge: "Finance",
    color: "border-brand-300 hover:shadow-[4px_4px_0px_0px_#b4cc90]",
  },
  {
    icon: ArrowUpRight,
    title: "Seamless Housing Handoff",
    desc: "Once matched and connected, we direct roommates straight to local housing agencies & hostels with verified listings.",
    badge: "Monetization",
    color: "border-white hover:shadow-[4px_4px_0px_0px_#ffffff]",
  },
];

export default function SlideSolution() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <div className="flex flex-col justify-center min-h-[75vh] px-4 md:px-12 relative">
      <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
        <CheckCircle className="w-4 h-4" />
        <span>The Solution</span>
      </div>
      <div className="max-w-3xl mb-10">
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-4 leading-tight">
          Enter Roomie: The Renter's Matchmaker
        </h2>
        <p className="text-slate-400 text-lg">
          Roomie streamlines the search. We connect students with compatible roommates, secure their agreement, verify their identities, and hand them off to verified housing providers.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {solutions.map((sol, index) => {
          const Icon = sol.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`p-6 bg-slate-900 border-2 rounded-2xl flex flex-col justify-between transition-all duration-200 cursor-default ${sol.color} group`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold bg-slate-950 px-2.5 py-1 rounded-full">
                    {sol.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">{sol.title}</h3>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{sol.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
