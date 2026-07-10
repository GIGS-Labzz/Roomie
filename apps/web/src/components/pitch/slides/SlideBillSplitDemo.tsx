"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Users, Check, AlertCircle } from "lucide-react";

export default function SlideBillSplitDemo() {
  const [billAmount, setBillAmount] = useState<number>(180000); // default rent
  const [numRoommates, setNumRoommates] = useState<number>(3);
  const [splitType, setSplitType] = useState<"even" | "ratio">("even");
  const [paidStatus, setPaidStatus] = useState<Record<number, boolean>>({
    0: true, // Master roommate already paid
  });

  const handlePay = (index: number) => {
    setPaidStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Custom ratios for Ratio splitting: Roommate 0 takes master bedroom, pays more.
  const ratios =
    numRoommates === 2
      ? [0.55, 0.45]
      : numRoommates === 3
      ? [0.45, 0.3, 0.25]
      : [0.35, 0.25, 0.2, 0.2];

  const calculateShares = () => {
    const shares: number[] = [];
    if (splitType === "even") {
      const share = billAmount / numRoommates;
      for (let i = 0; i < numRoommates; i++) {
        shares.push(share);
      }
    } else {
      for (let i = 0; i < numRoommates; i++) {
        shares.push(billAmount * ratios[i]);
      }
    }
    return shares;
  };

  const shares = calculateShares();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[75vh] px-4 md:px-12 relative">
      {/* Left Column: Calculator Controls */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
          <Wallet className="w-4 h-4" />
          <span>Expense Automation</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
          Transparency by default. Built-in bill splitting.
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg">
          No more awkward text messages about NEPA bills or water rates. Roomie automates expense collection, allowing roommates to pay their exact splits via Paystack.
        </p>

        {/* Calculator Widget Controls */}
        <div className="space-y-5 bg-slate-900/60 p-6 border border-slate-800 rounded-2xl">
          {/* Bill Input */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
              Total bill to split (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-mono font-bold">₦</span>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 font-mono text-white text-lg font-bold focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Roommates count */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
              Number of roommates
            </label>
            <div className="flex gap-2">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setNumRoommates(num);
                    setPaidStatus({ 0: true }); // reset payment status
                  }}
                  className={`flex-1 py-2 font-mono font-bold border rounded-lg transition-colors ${
                    numRoommates === num
                      ? "bg-brand-500 border-black text-slate-950 shadow-brutal-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {num} People
                </button>
              ))}
            </div>
          </div>

          {/* Split weights */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
              Split Formula
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSplitType("even")}
                className={`flex-1 py-2.5 font-mono text-xs font-bold border rounded-lg transition-colors ${
                  splitType === "even"
                    ? "bg-peach-200 border-black text-slate-950 shadow-brutal-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Even Split
              </button>
              <button
                onClick={() => setSplitType("ratio")}
                className={`flex-1 py-2.5 font-mono text-xs font-bold border rounded-lg transition-colors ${
                  splitType === "ratio"
                    ? "bg-peach-200 border-black text-slate-950 shadow-brutal-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                By Room Size (Ratio)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Ledger Simulation */}
      <div className="flex justify-center items-center">
        <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-brutal relative">
          <span className="absolute top-4 right-4 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-[9px] font-mono text-slate-400 tracking-wider">
            LIVE LEDGER
          </span>
          <h3 className="text-lg font-bold font-display text-white mb-1">Hostel Split</h3>
          <p className="text-xs text-slate-500 font-mono mb-6">Split of ₦{billAmount.toLocaleString()}</p>

          {/* Splitted Items list */}
          <div className="space-y-3">
            {shares.map((share, index) => {
              const isPaid = paidStatus[index] || false;
              const isMaster = index === 0;
              return (
                <div
                  key={index}
                  className={`p-3 border rounded-xl flex items-center justify-between transition-all ${
                    isPaid
                      ? "bg-slate-950/40 border-slate-800"
                      : "bg-slate-950 border-rose-900/50 shadow-[2px_2px_0px_0px_#9f1239]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-850 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                      R{index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        {isMaster ? "Roommate (You)" : `Roommate ${index + 1}`}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        {splitType === "ratio"
                          ? `${Math.round(ratios[index] * 100)}% allocation`
                          : "Equal distribution"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-xs font-mono font-bold text-white">
                        ₦{Math.round(share).toLocaleString()}
                      </div>
                      <span
                        className={`text-[9px] font-mono tracking-wide ${
                          isPaid ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPaid ? "PAID" : "UNPAID"}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePay(index)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isPaid
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30"
                      }`}
                    >
                      {isPaid ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px] font-bold">₦</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ledger summary */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Progress
            </span>
            <span className="font-mono text-white">
              {Object.values(paidStatus).filter(Boolean).length} / {numRoommates} Cleared
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
