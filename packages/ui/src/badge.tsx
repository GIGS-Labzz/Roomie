import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "brand" | "peach" | "sage" | "slate" | "red";
  className?: string;
}

const variants = {
  brand: "bg-brand-100 text-brand-700",
  peach: "bg-peach-100 text-peach-700",
  sage:  "bg-sage-surface text-slate-700",
  slate: "bg-slate-100 text-slate-600",
  red:   "bg-red-100 text-red-700",
};

export function Badge({ children, variant = "brand", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
