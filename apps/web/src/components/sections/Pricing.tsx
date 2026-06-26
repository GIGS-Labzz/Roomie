"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.roomie.ng";

const included = [
  "Browse all student profiles for free",
  "Send a connection request — free",
  "Chat with your match — free",
  "Propose a Roommate Agreement — free",
  "Pay ₦2,000 when you're both ready",
  "Housing providers unlocked for both of you",
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900">
            One simple fee.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-3xl overflow-hidden shadow-brutal border-2 border-slate-900"
        >
          {/* Pricing header */}
          <div
            className="px-10 py-12 text-center"
            style={{ background: "#FAE8CC" }}
          >
            <p className="text-slate-500 text-sm font-medium mb-2">
              One-time payment
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-3">
              <span className="font-display font-semibold text-7xl text-slate-900">
                ₦2,000
              </span>
            </div>
            <p className="text-slate-600">per connection</p>
          </div>

          {/* What's included */}
          <div className="px-10 py-10 bg-white">
            <p className="font-semibold text-slate-700 mb-6 text-sm uppercase tracking-wide">
              What&apos;s included
            </p>

            <ul className="space-y-4 mb-10">
              {included.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className="text-slate-700 text-sm">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="border-t pt-8">
              <p className="text-slate-500 text-xs mb-6 text-center">
                No subscriptions. No hidden charges. The ₦2,000 is paid by the
                roommate who accepts the agreement — one payment unlocks housing
                access for both of you.
              </p>
              <a
                href={APP_URL}
                className="block w-full text-center py-4 bg-peach-200 hover:bg-peach-300 text-slate-900 font-semibold rounded-2xl transition-colors shadow-brutal hover:translate-y-[-2px] active:translate-y-0 duration-150"
              >
                Get started for free
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
