"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Hammer, Sparkles, Send, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function UnderConstructionPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-slate-100 flex flex-col justify-center overflow-hidden selection:bg-brand-500/30 selection:text-brand-300">
      
      {/* Dynamic Cosmic Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Subtle Geometric Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #b1becfff 1px, transparent 0)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase"
        >
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            UNDER CONSTRUCTION
          </span>
        </motion.h1>

        {/* Exact Subtitle Requested */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-5 text-base sm:text-xl md:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed"
        >
          We are working hard to bring this concept back to life. Check back soon.
        </motion.p>

        {/* Interactive "Notify Me" Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 w-full max-w-md"
        >
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl shadow-black/40 focus-within:border-brand-500/50 transition-all">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for relaunch..."
                required
                className="w-full px-4 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Notify Me</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-semibold backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-5 h-5 text-brand-400" />
              <span>You&apos;re on the priority list! We&apos;ll notify you first.</span>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
