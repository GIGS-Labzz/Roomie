"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, TrendingUp, HelpCircle, GraduationCap } from "lucide-react";

export default function SlideMarketKano() {
  const [adoptionRate, setAdoptionRate] = useState<number>(3.5); // default % penetration

  // Constants for Kano State tertiary student market
  const kanoOffCampusStudents = 120000; // estimated off-campus students across BUK, KUST, ADUSTECH, etc.
  const connectionFee = 2000; // ₦2,000 per pair
  const avgReferralFee = 5000; // ₦5,000 per referral from landlords (approx 5% on ₦100k hostel rent)

  // Calculations
  const targetStudents = Math.round(kanoOffCampusStudents * (adoptionRate / 100));
  const roommatePairs = Math.round(targetStudents / 2);
  const directRevenue = roommatePairs * connectionFee;
  const referralRevenue = roommatePairs * avgReferralFee;
  const totalRevenue = directRevenue + referralRevenue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left Column: Kano Context */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
          <GraduationCap className="w-4 h-4" />
          <span>Market Opportunity</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
          Kano State: A massive hub of student renters.
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg">
          Kano houses major institutions like **BUK (45k+ students)** and **ADUSTECH/KUST (25k+ students)**. Over 80% of these students live off-campus, facing extreme housing stress every academic session.
        </p>

        {/* Adoption Slider */}
        <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-3">
            <span>Target Adoption Rate</span>
            <span className="text-brand-400 font-bold">{adoptionRate}% Penetration</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={adoptionRate}
            onChange={(e) => setAdoptionRate(parseFloat(e.target.value))}
            className="w-full accent-brand-500 bg-slate-950 h-2.5 rounded-lg cursor-pointer border border-slate-800 mb-6"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Target Users</span>
              <span className="text-lg font-black font-mono text-white">
                {targetStudents.toLocaleString()} Students
              </span>
            </div>
            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Matched Pairs</span>
              <span className="text-lg font-black font-mono text-white">
                {roommatePairs.toLocaleString()} Pairs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Calculator Output */}
      <div className="flex justify-center items-center">
        <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-brutal relative overflow-hidden">
          {/* Grid bg */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 mb-4 uppercase block">
              Financial Projections (Kano)
            </span>

            {/* Total projection */}
            <div className="mb-6">
              <span className="text-xs text-slate-500 font-mono">Projected Session Revenue</span>
              <div className="text-4xl font-black font-mono text-brand-500 mt-1">
                ₦{totalRevenue.toLocaleString()}
              </div>
            </div>

            {/* Income Streams */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Connections</h4>
                  <p className="text-[9px] font-mono text-slate-500">₦2k connection fee per pair</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-white font-bold">
                    ₦{directRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">Landlord Referrals</h4>
                  <p className="text-[9px] font-mono text-slate-500">₦5k referral fee average</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-white font-bold">
                    ₦{referralRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-slate-850 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                Calculations based on an estimated off-campus pool of 120,000 students in Kano State. Expandable to 2.5M+ tertiary students nationwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
