"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Presentation } from "lucide-react";

interface SlideProps {
  onNext: () => void;
}

export default function SlideCover({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 md:px-12 text-center select-none relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-peach-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Kano Pitchathon Badge */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white rounded-full bg-slate-900 shadow-[4px_4px_0px_0px_#8AAF6E] mb-8"
      >
        <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse" />
        <span className="text-xs md:text-sm font-semibold tracking-wider font-mono text-brand-300">
          KANO PITCHATHON 2026
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-8xl font-black font-display tracking-tight text-white mb-6 leading-none">
          ROOM<span className="text-brand-500">IE</span>
        </h1>
        <p className="text-xl md:text-3xl font-medium text-slate-300 max-w-2xl mx-auto mb-8 font-sans">
          Find your perfect roommate. <span className="text-peach-300 font-semibold underline decoration-wavy decoration-brand-500">Pay once</span>. Move in together.
        </p>
      </motion.div>

      {/* Description & Secondary Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-12 max-w-lg"
      >
        <div className="text-slate-400 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2">
          <span>Connect</span>
          <span className="text-brand-500">and</span>
          <span className="text-peach-400 animate-pulse font-bold">Cooonnectttt ⚡</span>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <button
          onClick={onNext}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-lg rounded-xl border-2 border-white shadow-[6px_6px_0px_0px_#FAE8CC] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#FAE8CC] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#FAE8CC]"
        >
          <Presentation className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>Launch Presentation</span>
        </button>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 flex justify-between w-full max-w-6xl px-6 text-xs font-mono text-slate-500"
      >
        <div>GoFinder Team</div>
        <div>Press [Space] or [→] to advance</div>
      </motion.div>
    </div>
  );
}
