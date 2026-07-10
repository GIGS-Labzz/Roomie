"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GraduationCap, Github, Mail, Globe, Users } from "lucide-react";

export default function SlideCTA() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 md:px-12 text-center relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-1.5 px-3 py-1 border border-brand-500/30 rounded-full bg-brand-500/5 text-brand-400 font-mono text-xs mb-8"
      >
        <span>Kano Pitchathon 2026</span>
      </motion.div>

      {/* Main Pitch */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-3xl mx-auto mb-10"
      >
        <h2 className="text-4xl md:text-7xl font-black font-display text-white mb-6 leading-none uppercase">
          Connect <span className="text-brand-500 font-normal italic font-sans lowercase">and</span> <br />
          <span className="text-peach-200 underline decoration-wavy decoration-brand-500">Cooonnectttt!</span> ⚡
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-sans leading-relaxed">
          Let's eliminate hostel housing stress and build transparency for millions of university students across Nigeria.
        </p>
      </motion.div>

      {/* Grid of contact details */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-12"
      >
        <a
          href="mailto:contact@gofinder.team"
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-brand-500 hover:bg-slate-950 transition-all flex flex-col items-center justify-center gap-1.5"
        >
          <Mail className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold text-white font-mono">contact@gofinder.team</span>
        </a>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5">
          <Globe className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold text-white font-mono">roomie.ng</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5">
          <Users className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold text-white font-mono">@gofinder_team</span>
        </div>
      </motion.div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-[10px] font-mono text-slate-600 uppercase tracking-widest"
      >
        Thank you for listening! • GoFinder Product Development
      </motion.div>
    </div>
  );
}
