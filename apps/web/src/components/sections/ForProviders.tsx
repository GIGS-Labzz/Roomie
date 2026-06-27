"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, MapPin, Zap } from "lucide-react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="for-providers"
      ref={ref}
      className="py-24 px-6"
      style={{ background: "#EDE8C8" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white border-2 border-slate-100 overflow-hidden">
          <div className="p-10 lg:p-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >

              <h2 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900 max-w-xl">
                Reach students who are ALREADY ready to rent.
              </h2>
              <p className="text-slate-500 mt-4 text-lg max-w-lg">
                Every student who pays ₦2,000 has already found a roommate and
                committed to living together. They are actively looking for a
                place. That&apos;s your audience.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
                    className="rounded-2xl p-6 text-center"
                    style={{ background: "#EDE8C8" }}
                  >
                    <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <p className="font-display font-semibold text-3xl text-slate-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-slate-500 text-sm">{stat.label}</p>
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
              <a
                href={`${ADMIN_URL}/register`}
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-colors shadow-brutal hover:translate-y-[-2px] active:translate-y-0 duration-150"
              >
                List your platform
              </a>
              <a
                href={`${ADMIN_URL}/login`}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-brand-400 transition-colors duration-150"
              >
                Provider login
              </a>
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
