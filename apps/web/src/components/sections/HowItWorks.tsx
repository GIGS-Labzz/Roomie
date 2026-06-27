"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Sign in with Google in one tap. Fill in your lifestyle, budget, and university. Done in under 3 minutes.",
    animation:
      "https://lottie.host/b7e18fcd-5f37-4ae3-9eb0-30c46900d522/yEsNQH5aJZ.lottie",
    color: "bg-brand-100",
  },
  {
    number: "02",
    title: "Browse and connect",
    description:
      "Discover profiles filtered by university, city, budget, and lifestyle. Tap Connect — it's free. Chat opens immediately.",
    animation:
      "https://lottie.host/5e52dae9-1797-468f-a621-adbbcb1d33ba/Uf3UO6x3RW.lottie",
    color: "bg-peach-100",
  },
  {
    number: "03",
    title: "Move in together",
    description:
      "Propose a Roommate Agreement in the chat. Pay ₦2,000 once to unlock curated housing providers near your campus.",
    animation:
      "https://lottie.host/aee91568-2dd1-4900-82aa-93af486605b1/I4cpTPzziC.lottie",
    color: "bg-sage-surface",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
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
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className={`${step.color} rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-brand-200`}
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-40 h-40 lg:w-48 lg:h-48 mb-4"
              >
                <DotLottieReact
                  src={step.animation}
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </motion.div>

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