"use client";

// Filled in Phase 9 — sourcing Lottie JSON files from LottieFiles.com
// Stub renders a placeholder box until animations are sourced.

interface LottieIconProps {
  animationData?: object;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieIcon({
  size = 40,
  className,
}: LottieIconProps) {
  return (
    <div
      className={`rounded-full bg-brand-100 flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    />
  );
}
