"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Network, Copy, Check, ShieldCheck, KeyRound, ArrowRight, Info } from "lucide-react";

const poolMembers = [
  { id: "1", display_name: "Yetunde Balogun", university: "UNILAG", city: "Lagos", initials: "YB" },
  { id: "2", display_name: "Tunde Afolabi", university: "LASU", city: "Ojo", initials: "TA" },
  { id: "3", display_name: "Kenny Okonkwo", university: "UNN", city: "Nsukka", initials: "KO" },
  { id: "4", display_name: "Fatimah Bello", university: "UNILAG", city: "Lagos", initials: "FB" },
  { id: "5", display_name: "Modal Tester", university: "Ahmadu Bello University (ABU)", city: "Zaria", initials: "MO" },
];

const mockPairings = [
  { sideA: "Yetunde Balogun", sideB: "Tunde Afolabi" },
  { sideA: "Kenny Okonkwo", sideB: "Fatimah Bello" },
  { sideA: "Modal Tester", sideB: "Fatimah Bello" },
  { sideA: "Tunde Afolabi", sideB: "Fatimah Bello" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-lg font-mono transition-all active:scale-95 shrink-0"
      title="Copy Roomie ID"
    >
      <span>{text}</span>
      {copied ? (
        <Check className="w-2.5 h-2.5 text-emerald-600" />
      ) : (
        <Copy className="w-2.5 h-2.5" />
      )}
    </button>
  );
}

export function RoomieAuth() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [authStep, setAuthStep] = useState<"idle" | "authenticating" | "success">("idle");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const handleStartAuth = () => {
    setAuthStep("authenticating");
    setTimeout(() => {
      setAuthStep("success");
      setAuthSuccessMsg("Authenticated! Shared Pool ID: RM-E8281D5B with Landlord Portal.");
      setTimeout(() => setAuthStep("idle"), 4000);
    }, 1800);
  };

  const getCoordinates = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: 50 + 35 * Math.cos(angle),
      y: 50 + 32 * Math.sin(angle),
    };
  };

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden" style={{ background: "#F5F2DF" }}>
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #8AAF6E 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <style>{`
        @keyframes flowAnim {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .flow-line {
          stroke-dasharray: 6 6;
          animation: flowAnim 1.2s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Bold Title & Callout Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 text-xs font-semibold border border-brand-500/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Next-Gen Renter Credibility
          </motion.div>

          {/* Bold Highlight Request */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-none uppercase">
              WELCOME TO THE ERA OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-600 to-peach-600">ROOMIE AUTH</span>
            </h2>
            <p className="font-display font-bold text-xl sm:text-2xl text-slate-700 leading-normal">
              . . . Continue with Roomie & Authenticate with Roomie ID
            </p>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Skip filling tedious landlord forms. Group your connection pool under a single unified credibility ID to apply for houses jointly.
            </p>
          </motion.div>
        </div>

        {/* Visual Split Screen */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mt-10">
          {/* SSO Widget & Explainer (Left Columns) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="lg:col-span-5 bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">SSO Credentials</h3>
                  <p className="text-slate-400 text-[10px]">Verify your entire roommate circle instantly</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Authenticate your collective identity with partner housing platforms. Let your shared credit, verification status, and rental history advocate for you as one single unified applicant.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    Bypasses repetitive registration steps
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    Combines search & booking credibility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    Unlocked immediately upon pool activation
                  </li>
                </ul>
              </div>
            </div>

            {/* Interactive SSO Button */}
            <div className="mt-8 pt-4 border-t border-slate-50">
              {authStep === "idle" && (
                <button
                  onClick={handleStartAuth}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-all shadow-[0_4px_14px_rgba(138,175,110,0.3)] active:scale-[0.98]"
                >
                  <img src="/logo.jpg" alt="" className="w-5 h-5 rounded-md object-cover" />
                  <span>Continue with Roomie</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {authStep === "authenticating" && (
                <div className="w-full py-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-600 text-xs font-semibold">
                  <span className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                  <span>Connecting to roommate network...</span>
                </div>
              )}

              {authStep === "success" && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold text-center space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Authentication Successful
                  </div>
                  <p className="text-[10px] text-emerald-700/80 leading-normal font-medium">
                    {authSuccessMsg}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Interactive Pool Showcase (Right Columns) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="lg:col-span-7 bg-white border border-slate-100/80 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden"
          >
            {/* Visual Constellation */}
            <div className="w-full md:w-[220px] shrink-0 relative h-48 bg-slate-50/50 rounded-2xl border border-slate-100/80 flex items-center justify-center overflow-hidden">
              {/* SVG Flow Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {poolMembers.map((member, i) => {
                  const coords = getCoordinates(i, poolMembers.length);
                  return (
                    <g key={member.id}>
                      <line
                        x1="50"
                        y1="50"
                        x2={coords.x}
                        y2={coords.y}
                        className="stroke-brand-200"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="50"
                        y1="50"
                        x2={coords.x}
                        y2={coords.y}
                        className="stroke-brand-500/70 flow-line"
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Central Pool Hub */}
              <div className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white z-10">
                <div className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-20" />
                <Network className="w-4 h-4 relative z-10" />
              </div>

              {/* Member Satellites */}
              {poolMembers.map((member, i) => {
                const coords = getCoordinates(i, poolMembers.length);
                return (
                  <div
                    key={member.id}
                    className="absolute w-10 h-10 -ml-5 -mt-5 group/node cursor-pointer z-10"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    {/* Interactive Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900/95 backdrop-blur-sm text-white text-[9px] p-2 rounded-xl shadow-xl opacity-0 group-hover/node:opacity-100 transition-all duration-200 pointer-events-none z-20">
                      <div className="font-bold truncate text-slate-100">{member.display_name}</div>
                      <div className="text-slate-300 truncate text-[8px] mt-0.5">{member.university}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
                    </div>

                    {/* Node Circle */}
                    <div className="w-full h-full rounded-2xl bg-white border border-slate-200 p-0.5 shadow-sm group-hover/node:border-brand-500 group-hover/node:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full rounded-[12px] bg-brand-50 flex items-center justify-center text-brand-700">
                        <span className="font-bold text-[9px]">{member.initials}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Details */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                        Multi-Member Pool
                      </span>
                      <span className="text-xs text-slate-400 font-medium">5 members</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Pool ID:</span>
                      <CopyButton text="RM-E8281D5B" />
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                {/* Member Network List */}
                <div className="mt-3.5 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Info className="w-2.5 h-2.5 text-slate-300" />
                    Roommate Network
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {poolMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 bg-white border border-slate-100/60 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-2 py-0.5 rounded-lg text-[10px]"
                      >
                        <span className="font-semibold text-slate-800">{m.display_name}</span>
                        <span className="text-[8px] text-slate-400 border-l border-slate-200 pl-1.5">{m.university.replace(/\s*\(.*\)/, "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Underlying Pairings & Transactions
                </div>
                <div className="space-y-1">
                  {mockPairings.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[10px] py-1 px-1.5 hover:bg-slate-50 rounded-lg transition-all"
                    >
                      <div className="flex items-center gap-1 text-slate-600 min-w-0">
                        <span className="font-medium truncate">{c.sideA}</span>
                        <span className="text-[9px] text-slate-400">⇆</span>
                        <span className="font-medium truncate">{c.sideB}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 font-medium">Connected 11 Jul</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
