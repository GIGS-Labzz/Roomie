"use client";

import dynamic from "next/dynamic";
import roomAnimation from "@repo/animations/room";
import { Logo } from "@repo/ui/logo";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: "#EDE8C8" }}
    >
      {/* Logo */}
      <div className="mb-6">
        <Logo size="md" />
      </div>

      {/* Bed animation */}
      <div className="w-52 h-52">
        <Lottie
          animationData={roomAnimation}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Loading label */}
      <p className="mt-6 text-brand-600 text-sm font-medium tracking-wide animate-pulse">
        Finding your perfect match…
      </p>
    </div>
  );
}
