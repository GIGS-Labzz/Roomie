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
}

const sizes = {
  xs: { wrap: "w-6 h-6 rounded-lg",   icon: "w-3.5 h-3.5", text: "text-base"  },
  sm: { wrap: "w-8 h-8 rounded-xl",   icon: "w-5 h-5",     text: "text-lg"   },
  md: { wrap: "w-10 h-10 rounded-2xl", icon: "w-6 h-6",     text: "text-2xl"  },
  lg: { wrap: "w-12 h-12 rounded-2xl", icon: "w-7 h-7",     text: "text-3xl"  },
};

function LogoMark({ size = "md" }: { size?: LogoSize }) {
  const s = sizes[size];
  return (
    <span
      className={`${s.wrap} bg-brand-500 flex items-center justify-center flex-shrink-0 overflow-hidden`}
      style={{ boxShadow: "0 4px 14px rgba(138,175,110,0.32)" }}
    >
      <img
        src="/logo.jpg"
        alt="Roomie"
        className="w-full h-full object-cover"
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
}: LogoProps) {
  const s = sizes[size];
  const textColor = variant === "light" ? "text-white" : "text-slate-900";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
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
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
