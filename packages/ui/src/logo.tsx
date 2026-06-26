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
      className={`${s.wrap} bg-brand-500 flex items-center justify-center flex-shrink-0`}
      style={{ boxShadow: "0 4px 14px rgba(138,175,110,0.32)" }}
    >
      <svg className={s.icon} viewBox="0 0 20 20" fill="none">
        <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
        <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
        <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
        <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
      </svg>
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
