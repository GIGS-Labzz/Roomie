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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white px-6 py-24">
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
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #FFFFFF 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-6xl w-full mx-auto">
        {/* Text side */}
        
      </div>
    </section>
  );
}