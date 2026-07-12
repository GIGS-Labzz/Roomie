"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Award, Network, UserCheck, Shield, ShieldCheck, Sparkles } from "lucide-react";

interface BadgeDetail {
  code: string;
  name: string;
  desc: string;
  issuance: string;
  icon: any;
  color: string;
}

const badgesList: BadgeDetail[] = [
  {
    code: "VERIFIED_STUDENT",
    name: "Verified Student",
    desc: "Academic enrollment is verified using their university student ID.",
    issuance: "Manual Admin verification of uploaded ID credentials.",
    icon: UserCheck,
    color: "text-brand-500 border-brand-500 bg-brand-500/10 shadow-[0_0_15px_#8AAF6E]",
  },
  {
    code: "ROOMIE_PARTNER",
    name: "Roomie Partner",
    desc: "Has successfully matched, paid, and signed a legal roommate contract.",
    issuance: "Automatically issued post-Paystack completion of transaction.",
    icon: Award,
    color: "text-peach-400 border-peach-400 bg-peach-400/10 shadow-[0_0_15px_#eeba76]",
  },
  {
    code: "GOOD_PAYER",
    name: "Good Payer",
    desc: "Consistently settles split NEPA bills and house fees on time.",
    issuance: "Pays split items within 48h for at least 5 consecutive ledger bills.",
    icon: ShieldCheck,
    color: "text-brand-300 border-brand-300 bg-brand-500/10 shadow-[0_0_15px_#b4cc90]",
  },
  {
    code: "HOUSING_VERIFIED",
    name: "Verified Resident",
    desc: "Renter status and rental history confirmed directly by hostel admin.",
    issuance: "Housing platform provider ticks verification box in Admin Dashboard.",
    icon: Shield,
    color: "text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_#10b981]",
  },
];

export default function SlideTrustNetwork() {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetail>(badgesList[0]);
  const [networkDegree, setNetworkDegree] = useState<1 | 2 | 3>(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left Column: Badge Inspector */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
          <Network className="w-4 h-4" />
          <span>Trust Architecture</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-4 leading-tight">
          Trust networks that prevent scammers.
        </h2>
        <p className="text-slate-400 mb-6 max-w-lg">
          Roomie establishes trust in student roommate matching. We verify academic enrollment, track split bill payment histories, and map mutual connection graphs.
        </p>

        {/* Badge List Selection Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {badgesList.map((badge) => {
            const Icon = badge.icon;
            const isSelected = selectedBadge.code === badge.code;
            return (
              <button
                key={badge.code}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                  isSelected
                    ? "bg-slate-900 border-brand-500 shadow-[4px_4px_0px_0px_#8AAF6E]"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800`}>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-brand-500" : "text-slate-400"}`} />
                </div>
                <span className="text-xs font-bold text-white font-mono leading-tight">{badge.name}</span>
              </button>
            );
          })}
        </div>

        {/* Badge Description Panel */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative min-h-[120px]">
          <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">
            Verification criteria
          </h4>
          <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            {selectedBadge.name}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-2">{selectedBadge.desc}</p>
          <p className="text-[10px] text-brand-400 font-mono italic">Issuance: {selectedBadge.issuance}</p>
        </div>
      </div>

      {/* Right Column: Interactive Network Mapper */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-brutal min-h-[380px] relative">
        <span className="absolute top-4 right-4 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-[9px] font-mono text-slate-400 tracking-wider">
          CONNECTION NETWORK MAPPER
        </span>
        <h3 className="text-sm font-bold font-display text-white mb-4 text-center mt-2">
          Verify through Mutual Connection Degrees
        </h3>

        {/* Network diagram canvas */}
        <div className="relative w-full h-44 flex items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160">
            {/* Connection Lines */}
            {/* 1st Degree connections: user to roommate 1 & 2 */}
            <line x1="150" y1="80" x2="80" y2="40" stroke={networkDegree >= 1 ? "#8AAF6E" : "#2C3A23"} strokeWidth={networkDegree >= 1 ? "2.5" : "1"} className="transition-all duration-300" />
            <line x1="150" y1="80" x2="80" y2="120" stroke={networkDegree >= 1 ? "#8AAF6E" : "#2C3A23"} strokeWidth={networkDegree >= 1 ? "2.5" : "1"} className="transition-all duration-300" />

            {/* 2nd Degree connections: roommate 1 to sub-node A & B */}
            <line x1="80" y1="40" x2="30" y2="25" stroke={networkDegree >= 2 ? "#eeba76" : "#2C3A23"} strokeWidth={networkDegree >= 2 ? "2" : "1"} className="transition-all duration-300" />
            <line x1="80" y1="40" x2="30" y2="60" stroke={networkDegree >= 2 ? "#eeba76" : "#2C3A23"} strokeWidth={networkDegree >= 2 ? "2" : "1"} className="transition-all duration-300" />

            {/* 3rd Degree connections: subnode A to leaf-nodes */}
            <line x1="30" y1="25" x2="210" y2="30" stroke={networkDegree >= 3 ? "#b4cc90" : "#2C3A23"} strokeWidth={networkDegree >= 3 ? "1.5" : "1"} className="transition-all duration-300" />
            <line x1="30" y1="60" x2="270" y2="80" stroke={networkDegree >= 3 ? "#b4cc90" : "#2C3A23"} strokeWidth={networkDegree >= 3 ? "1.5" : "1"} className="transition-all duration-300" />

            {/* Center Node: You */}
            <circle cx="150" cy="80" r="14" fill="#020617" stroke="#ffffff" strokeWidth="2.5" />
            <text x="150" y="84" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">You</text>

            {/* 1st Degree Nodes: Roommate matches */}
            <circle cx="80" cy="40" r="10" fill="#020617" stroke={networkDegree >= 1 ? "#8AAF6E" : "#2C3A23"} strokeWidth="2" className="transition-all duration-300" />
            <circle cx="80" cy="120" r="10" fill="#020617" stroke={networkDegree >= 1 ? "#8AAF6E" : "#2C3A23"} strokeWidth="2" className="transition-all duration-300" />

            {/* 2nd Degree Nodes */}
            <circle cx="30" cy="25" r="8" fill="#020617" stroke={networkDegree >= 2 ? "#eeba76" : "#2C3A23"} strokeWidth="1.5" className="transition-all duration-300" />
            <circle cx="30" cy="60" r="8" fill="#020617" stroke={networkDegree >= 2 ? "#eeba76" : "#2C3A23"} strokeWidth="1.5" className="transition-all duration-300" />

            {/* 3rd Degree Node */}
            <circle cx="210" cy="30" r="7" fill="#020617" stroke={networkDegree >= 3 ? "#b4cc90" : "#2C3A23"} strokeWidth="1" className="transition-all duration-300" />
            <circle cx="270" cy="80" r="7" fill="#020617" stroke={networkDegree >= 3 ? "#b4cc90" : "#2C3A23"} strokeWidth="1" className="transition-all duration-300" />
          </svg>
        </div>

        {/* Connection degree selector toggles */}
        <div className="flex gap-2 w-full mt-4">
          {[1, 2, 3].map((deg) => (
            <button
              key={deg}
              onClick={() => setNetworkDegree(deg as any)}
              className={`flex-1 py-2 border rounded-xl font-mono text-[10px] font-bold uppercase transition-all ${
                networkDegree === deg
                  ? "bg-brand-500 border-black text-slate-950 shadow-brutal-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {deg === 1 && "1st Degree (Direct)"}
              {deg === 2 && "2nd Degree (Mutuals)"}
              {deg === 3 && "3rd Degree (Extended)"}
            </button>
          ))}
        </div>

        {/* Degree explanation text */}
        <div className="mt-4 text-center h-10">
          <p className="text-xs text-slate-400">
            {networkDegree === 1 && "Direct Roommates you have lived with or have paid contracts with."}
            {networkDegree === 2 && "Mutual connections (e.g., 'Mustapha lived with John, who lived with you')."}
            {networkDegree === 3 && "Extended safety net. Roommates of roommates of roommates."}
          </p>
        </div>
      </div>
    </div>
  );
}
