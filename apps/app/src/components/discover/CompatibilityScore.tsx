interface CompatibilityScoreProps {
  score: number;
  className?: string;
}

export function CompatibilityScore({ score, className = "" }: CompatibilityScoreProps) {
  const color =
    score >= 70 ? "bg-brand-100 text-brand-700 border-brand-200" :
    score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color} ${className}`}
      title={`${score}% compatibility`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {score}% match
    </span>
  );
}
