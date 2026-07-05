"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useWaitlist } from "@/context/waitlist";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false }
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://roomie-app-umber.vercel.app";

const tagline = ["C", "o", "n", "n", "e", "c", "t"];

export function Hero() {
  const { openWaitlist } = useWaitlist();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* Animated dot background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8AAF6E 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial fade mask */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #EDE8C8 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-6xl w-full mx-auto">
        {/* Text side */}
        <div className="flex-1 text-center lg:text-left">
          {/* Main heading — Perfect Roomie */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-tight text-slate-900 mb-4"
          >
            Perfect <span className="text-brand-500">Roomie</span>
          </motion.h1>

          {/* Smaller tagline below the main heading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-brand-600 font-semibold text-sm sm:text-base uppercase tracking-widest mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-1.5"
          >
            <span>Just Connect and</span>
            <span className="flex">
              {tagline.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12, scaleY: 0.5 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  transition={{
                    delay: 0.4 + i * 0.04,
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-slate-600 text-lg sm:text-xl max-w-md mx-auto lg:mx-0 mb-10"
          >
            Find your perfect roommate. Pay once. Move in together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={openWaitlist}
              className="inline-flex items-center justify-center px-8 py-4 bg-peach-200 hover:bg-peach-300 text-slate-900 font-semibold rounded-2xl transition-colors shadow-brutal hover:translate-y-[-2px] active:translate-y-0 duration-150"
            >
              Find my roommate
            </button>
            <a
              href="#for-providers"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-500 text-brand-600 font-semibold rounded-2xl hover:bg-brand-50 transition-colors duration-150"
            >
              I have a housing platform
            </a>
          </motion.div>
        </div>

        {/* Lottie illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          className="flex-shrink-0 w-85 h-90 sm:w-[30rem] sm:h-[30rem]"
        >
          <DotLottieReact
            src="https://lottie.host/61a70a8a-164d-4019-94f6-30dd055be848/lI67sDqalE.lottie"
            loop
            autoplay
          />
        </motion.div>
      </div>
    </section>
  );
}