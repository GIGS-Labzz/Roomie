"use client";

import Link from "next/link";

type LogoSize = "xs" | "sm" | "md" | "lg";
type LogoVariant = "default" | "light";

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showWordmark?: boolean;
  href?: string;
  className?: string;
  markClassName?: string;
}

const sizes = {
  xs: { wrap: "w-6 h-6 rounded-lg",   icon: "w-3.5 h-3.5", text: "text-base"  },
  sm: { wrap: "w-8 h-8 rounded-xl",   icon: "w-5 h-5",     text: "text-lg"   },
  md: { wrap: "w-10 h-10 rounded-2xl", icon: "w-6 h-6",     text: "text-2xl"  },
  lg: { wrap: "w-12 h-12 rounded-2xl", icon: "w-7 h-7",     text: "text-3xl"  },
};

function LogoMark({ size = "md", className = "" }: { size?: LogoSize; className?: string }) {
  const s = sizes[size];
  return (
    <span
      className={`${s.wrap} ${className} flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      <img
        src="/logo.jpg"
        alt="Roomie"
        className="w-full h-full object-contain mix-blend-multiply"
      />
    </span>
  );
}

export function Logo({
  size = "md",
  variant = "default",
  showWordmark = true,
  href,
  className = "",
  markClassName = "",
}: LogoProps) {
  const s = sizes[size];
  const textColor = variant === "light" ? "text-white" : "text-slate-900";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className={markClassName} />
      {showWordmark && (
        <span
          className={`font-display font-semibold ${s.text} tracking-tight ${textColor} leading-none`}
        >
          Roomie
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={showWordmark ? undefined : "Roomie home"}
        className="inline-flex rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {content}
      </Link>
    );
  }

  return content;
}
