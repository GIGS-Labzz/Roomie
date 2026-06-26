"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ShieldCheck,
  MessageCircle,
  SplitSquareVertical,
  Building2,
  Banknote,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified student profiles",
    description:
      "Upload your student ID and earn a Verified badge. Filter for verified-only profiles when browsing.",
    color: "text-brand-500",
    bg: "bg-brand-50",
  },
  {
    icon: MessageCircle,
    title: "Real-time chat",
    description:
      "Chat opens the moment you connect — no payment needed. Get to know your potential roommate first.",
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
  {
    icon: SplitSquareVertical,
    title: "Bill splitting tracker",
    description:
      "Track shared expenses after moving in. Mark items paid. Keep finances transparent and dispute-free.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Building2,
    title: "Curated housing nearby",
    description:
      "Unlock a shortlist of housing providers near your campus after paying the one-time ₦2,000 fee.",
    color: "text-peach-500",
    bg: "bg-peach-50",
  },
  {
    icon: Banknote,
    title: "Transparent pricing",
    description:
      "₦2,000 one-time payment. No subscriptions. No hidden charges. Pay once when you're ready to commit.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Wifi,
    title: "Works offline (PWA)",
    description:
      "Install Roomie on your phone like an app. Browse cached profiles and read messages without internet.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

export function WhyRoomie() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6" style={{ background: "#EDE8C8" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Why Roomie
          </p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900">
            Everything you need to find and live with your roommate
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.08 * i, duration: 0.45 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`w-11 h-11 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
