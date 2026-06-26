"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import matchFoundAnimation from "@repo/animations/match-found";
import connectingAnimation from "@repo/animations/connecting";
import paymentSuccessAnimation from "@repo/animations/payment-success";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Sign in with Google in one tap. Fill in your lifestyle, budget, and university. Done in under 3 minutes.",
    animation: matchFoundAnimation,
    color: "bg-brand-100",
  },
  {
    number: "02",
    title: "Browse and connect",
    description:
      "Discover profiles filtered by university, city, budget, and lifestyle. Tap Connect — it's free. Chat opens immediately.",
    animation: connectingAnimation,
    color: "bg-peach-100",
  },
  {
    number: "03",
    title: "Move in together",
    description:
      "Propose a Roommate Agreement in the chat. Pay ₦2,000 once to unlock curated housing providers near your campus.",
    animation: paymentSuccessAnimation,
    color: "bg-sage-surface",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900">
            Three steps to your roommate
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.15, duration: 0.5 }}
              className={`${step.color} rounded-3xl p-8 flex flex-col items-center text-center`}
            >
              <div className="w-24 h-24 mb-6">
                <Lottie
                  animationData={step.animation}
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <span className="font-display font-semibold text-4xl text-brand-200 mb-3 block">
                {step.number}
              </span>

              <h3 className="font-display font-semibold text-xl text-slate-900 mb-3">
                {step.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
