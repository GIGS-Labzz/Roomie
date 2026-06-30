"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, MapPin, Zap } from "lucide-react";
import { useWaitlist } from "@/context/waitlist";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.roomie.ng";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "students connected",
  },
  {
    icon: MapPin,
    value: "12",
    label: "cities covered",
  },
  {
    icon: Zap,
    value: "3 min",
    label: "avg. connection time",
  },
];

export function ForProviders() {
  const { openWaitlist } = useWaitlist();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="for-providers"
      className="py-24 bg-slate-900 text-slate-100 overflow-hidden relative"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8AAF6E 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div ref={ref}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="font-display font-semibold text-4xl sm:text-5xl leading-tight text-white mb-6"
            >
              Partner with Nigeria&apos;s leading student roommate service
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-slate-400 text-lg leading-relaxed mb-8"
            >
              Unlock access to verified student groups searching for rooms.
              Integrate your housing platforms or list available properties to
              fill rooms fast.
            </motion.p>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                  >
                    <Icon className="w-6 h-6 text-brand-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={openWaitlist}
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-colors shadow-brutal hover:translate-y-[-2px] active:translate-y-0 duration-150"
              >
                List your platform
              </button>
              <button
                onClick={openWaitlist}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-brand-400 transition-colors duration-150"
              >
                Provider login
              </button>
            </motion.div>

            <p className="text-slate-400 text-xs mt-6">
              Currently free for housing providers. Registration is reviewed by
              the Roomie team before going live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
