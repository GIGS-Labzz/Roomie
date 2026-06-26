"use client";

import Lottie from "lottie-react";

interface LottieIconProps {
  animationData: object;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  speed?: number;
}

export function LottieIcon({
  animationData,
  size = 40,
  loop = false,
  autoplay = true,
  className,
}: LottieIconProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size }}
      className={className}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}
