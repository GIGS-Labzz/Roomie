import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "outlined";
}

export function Card({ variant = "default", className = "", children, ...props }: CardProps) {
  const variants = {
    default:  "bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)]",
    surface:  "bg-sage-surface rounded-3xl",
    outlined: "bg-white rounded-3xl border border-slate-200",
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
