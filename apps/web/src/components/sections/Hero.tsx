"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const heroVideos = [
  "/hero-videos/vibes.mp4",
  "/hero-videos/hugging.mp4",
  "/hero-videos/campus-settings.mp4",
];

export function Hero() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || prefersReducedMotion !== false) return;

    void videoRef.current?.play().catch(() => undefined);
  }, [activeVideoIndex, hasHydrated, prefersReducedMotion]);

  return (
    <section aria-label="Roomie" className="relative h-[100svh] w-full overflow-hidden bg-white">
      <video
        key={heroVideos[activeVideoIndex]}
        aria-hidden="true"
        ref={videoRef}
        autoPlay={hasHydrated && prefersReducedMotion === false}
        className="absolute inset-0 h-full w-full scale-[1.01] object-cover blur-[4px]"
        muted
        playsInline
        preload="auto"
        onEnded={() => {
          setActiveVideoIndex((index) => (index + 1) % heroVideos.length);
        }}
        src={heroVideos[activeVideoIndex]}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/35" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-8 text-center">
        <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl md:text-7xl">
          Find your people.
          <br />
          Find your place.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
          Meet roommates who fit your lifestyle, budget, and next chapter.
        </p>
      </div>
    </section>
  );
}