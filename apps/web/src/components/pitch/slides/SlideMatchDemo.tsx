"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Sliders, Moon, Sun, Trash2, Volume2, ShieldCheck, Mail } from "lucide-react";

// Mustapha's static lifestyle metrics (0 to 10 scale)
const mustapha = {
  name: "Mustapha Yusuf",
  school: "Bayero University Kano (BUK)",
  course: "Computer Science, L300",
  budget: "₦120,000 / yr",
  sleep: 8, // Night Owl
  clean: 9, // Clean-freak
  noise: 2, // Very Quiet
  avatar: "MY",
};

export default function SlideMatchDemo() {
  // User's adjustable metrics (0 to 10 scale)
  const [userSleep, setUserSleep] = useState(5); // 0 = early bird, 10 = night owl
  const [userClean, setUserClean] = useState(6); // 0 = messy/chill, 10 = neat freak
  const [userNoise, setUserNoise] = useState(4); // 0 = absolute silence, 10 = loud music/party
  const [compatibility, setCompatibility] = useState(85);
  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    // Calculate compatibility percentage
    const diffSleep = Math.abs(userSleep - mustapha.sleep);
    const diffClean = Math.abs(userClean - mustapha.clean);
    const diffNoise = Math.abs(userNoise - mustapha.noise);
    
    // Total maximum diff is 30. Subtract weight from 100.
    const totalDiff = diffSleep + diffClean + diffNoise;
    const score = Math.round(100 - (totalDiff / 30) * 60); // Max penalty is 60% (lowest score is 40%)
    
    setCompatibility(Math.max(40, Math.min(100, score)));
  }, [userSleep, userClean, userNoise]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
    if (score >= 60) return "text-yellow-400 border-yellow-500 bg-yellow-500/10 shadow-[0_0_12px_rgba(234,179,8,0.2)]";
    return "text-rose-400 border-rose-500 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left Column: Sliders and Title */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
          <Sliders className="w-4 h-4" />
          <span>Interactive Spotlight</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
          Find your matching <span className="text-brand-500">vibe</span>, instantly.
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg">
          Roomie's core algorithm matches lifestyle coordinates. Adjust the sliders below to match your preferences and see how compatible you are with Mustapha:
        </p>

        {/* Sliders Widget */}
        <div className="space-y-6 bg-slate-900/60 p-6 border border-slate-800 rounded-2xl">
          {/* Slider 1: Sleep Schedule */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Early Bird</span>
              <span className="text-white font-bold">Sleep Schedule</span>
              <span className="flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-brand-300" /> Night Owl</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={userSleep}
              onChange={(e) => setUserSleep(parseInt(e.target.value))}
              className="w-full accent-brand-500 bg-slate-950 h-2 rounded-lg cursor-pointer border border-slate-800"
            />
          </div>

          {/* Slider 2: Cleanliness */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1"><Trash2 className="w-3.5 h-3.5 text-emerald-400" /> Chill/Messy</span>
              <span className="text-white font-bold">Cleanliness Habit</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Neat Freak</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={userClean}
              onChange={(e) => setUserClean(parseInt(e.target.value))}
              className="w-full accent-peach-500 bg-slate-950 h-2 rounded-lg cursor-pointer border border-slate-800"
            />
          </div>

          {/* Slider 3: Noise Tolerance */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1">🤫 Quiet Vibe</span>
              <span className="text-white font-bold">Noise Level</span>
              <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-rose-400" /> Loud Music</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={userNoise}
              onChange={(e) => setUserNoise(parseInt(e.target.value))}
              className="w-full accent-brand-300 bg-slate-950 h-2 rounded-lg cursor-pointer border border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Roommate Profile Card */}
      <div className="flex justify-center items-center">
        <motion.div
          layout
          className="w-full max-w-sm bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-brutal relative overflow-hidden"
        >
          {/* Card Head: Logo & Matching Score */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Available</span>
            </div>

            {/* Compatibility percentage circular-looking badge */}
            <motion.div
              layout
              className={`px-3 py-1 border text-xs font-mono font-bold rounded-full transition-colors ${getScoreColor(compatibility)}`}
            >
              {compatibility}% Match
            </motion.div>
          </div>

          {/* Avatar and Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-500 to-peach-300 text-slate-950 font-display font-black text-xl rounded-2xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {mustapha.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">{mustapha.name}</h3>
              <p className="text-xs text-brand-400 font-mono mt-0.5">{mustapha.school}</p>
              <p className="text-[10px] text-slate-500 font-sans">{mustapha.course}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3 mb-6 font-sans">
            <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
              <span className="text-slate-500">Max Budget</span>
              <span className="text-white font-mono font-bold">{mustapha.budget}</span>
            </div>
            <div className="flex justify-between text-xs py-1.5 border-b border-slate-800">
              <span className="text-slate-500">Lifestyle Profile</span>
              <span className="text-white font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Night Owl • Clean • Quiet
              </span>
            </div>
            <div className="flex justify-between text-xs py-1.5">
              <span className="text-slate-500">Mutual Contacts</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2 Mutuals
              </span>
            </div>
          </div>

          {/* Button Trigger */}
          <div className="relative h-12 mt-6">
            <AnimatePresence mode="wait">
              {!hasConnected ? (
                <motion.button
                  key="connect"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setHasConnected(true)}
                  className="w-full h-full bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold rounded-xl border border-black shadow-brutal-sm flex items-center justify-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm transition-all"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>Connect (₦2,000)</span>
                </motion.button>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full bg-slate-950 border-2 border-brand-500 text-brand-400 font-mono text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(138,175,110,0.15)] cursor-pointer"
                  onClick={() => setHasConnected(false)}
                >
                  <Mail className="w-4 h-4 text-brand-400 animate-bounce" />
                  <span>Chat Unlocked! Click to reset.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
