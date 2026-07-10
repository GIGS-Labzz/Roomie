"use client";

import { motion } from "framer-motion";
import { CreditCard, Building, ArrowUpRight, CheckCircle2, BadgePercent } from "lucide-react";

const channels = [
  {
    icon: CreditCard,
    title: "Roommate Connection Fee",
    price: "₦2,000",
    charge: "One-Time / Pair",
    desc: "Unlocks direct real-time chat, roommate agreement contract signing, and verified provider recommendations.",
    features: ["1-Tap chat unlock", "Pre-built sharing contracts", "Verified Badge display"],
    color: "border-brand-500 shadow-[4px_4px_0px_0px_#8AAF6E]",
  },
  {
    icon: Building,
    title: "Housing Referral Fees",
    price: "5% - 10%",
    charge: "Hostel Tenancy Commisson",
    desc: "Commission paid by verified student housing platforms (hostels.ng, UniHousing) upon tenant lease sign-ups.",
    features: ["Platform redirects", "Prefilled onboarding records", "Partner dashboard sync"],
    color: "border-peach-400 shadow-[4px_4px_0px_0px_#eeba76]",
  },
  {
    icon: BadgePercent,
    title: "Provider Sponsored Ads",
    price: "₦5,000+",
    charge: "Monthly Campaign",
    desc: "Premium ad spaces for private hostel operators to display their available rooms on the Roomie handoff feed.",
    features: ["Priority search bump", "Promo label flags", "Traffic stats report"],
    color: "border-brand-300 shadow-[4px_4px_0px_0px_#b4cc90]",
  },
];

export default function SlideBusinessModel() {
  return (
    <div className="flex flex-col justify-center min-h-[75vh] px-4 md:px-12 relative">
      <div className="flex items-center gap-2 text-brand-500 font-mono text-sm uppercase mb-3">
        <ArrowUpRight className="w-4 h-4" />
        <span>Business Architecture</span>
      </div>
      <div className="max-w-3xl mb-8">
        <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-3 leading-tight">
          Double-Sided Monetization Model
        </h2>
        <p className="text-slate-400">
          Roomie captures value at matching (from students) and placement (from hostel providers), keeping user acquisition costs low and margins high.
        </p>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map((ch, index) => {
          const Icon = ch.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`p-6 bg-slate-900 border-2 rounded-2xl flex flex-col justify-between ${ch.color}`}
            >
              <div>
                <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-brand-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 font-display">{ch.title}</h3>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-black font-mono text-white">{ch.price}</span>
                  <span className="text-xs text-slate-500 font-mono">{ch.charge}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{ch.desc}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                {ch.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
