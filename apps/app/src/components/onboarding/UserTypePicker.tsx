"use client";

import { GraduationCap, Briefcase, Award, Check } from "lucide-react";

export type UserType = "student" | "nysc_corper" | "young_professional";

interface UserTypePickerProps {
  selected: UserType | null;
  onSelect: (type: UserType) => void;
}

export function UserTypePicker({ selected, onSelect }: UserTypePickerProps) {
  const options: {
    id: UserType;
    title: string;
    subtitle: string;
    icon: typeof GraduationCap;
    badge: string;
    color: string;
    description: string;
  }[] = [
    {
      id: "student",
      title: "Student",
      subtitle: "Undergraduate, Postgraduate & Diploma",
      icon: GraduationCap,
      badge: "Campus Verified",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-200 dark:border-blue-800",
      description: "Match with students at your university or campus area.",
    },
    {
      id: "nysc_corper",
      title: "NYSC Corps Member",
      subtitle: "Serving Corper (Batch A/B/C)",
      icon: Award,
      badge: "Corper Priority",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-200 dark:border-emerald-800",
      description: "Find co-corpers posting in your state and CDS group location.",
    },
    {
      id: "young_professional",
      title: "Young Professional",
      subtitle: "Employed, Freelancer & Tech Workers",
      icon: Briefcase,
      badge: "Pro Network",
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-200 dark:border-purple-800",
      description: "Connect with working professionals, remote workers & founders.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`relative group text-left p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between ${
              isSelected
                ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 shadow-lg shadow-brand-500/10 scale-[1.02]"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                <Check className="w-4 h-4" />
              </div>
            )}

            <div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
                {opt.badge}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {opt.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                {opt.subtitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {opt.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
