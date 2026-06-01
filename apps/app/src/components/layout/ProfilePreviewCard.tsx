"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Avatar } from "@repo/ui/avatar";

export function ProfilePreviewCard() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  // Not signed in
  if (!authLoading && !user) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/60 transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">Sign in</p>
          <p className="text-xs text-slate-400">to see your profile</p>
        </div>
      </Link>
    );
  }

  // Loading skeleton
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-200 rounded-full w-3/4" />
          <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? "You";
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null;
  const university = profile?.university;
  const city = profile?.city;
  const verified = profile?.student_verified;

  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/60 transition-colors group"
    >
      <div className="relative flex-shrink-0">
        <Avatar src={avatarUrl} name={displayName} size="md" />
        {verified && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 border-2 border-sage-surface flex items-center justify-center">
            <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate leading-tight group-hover:text-brand-600 transition-colors">
          {displayName}
        </p>
        {(university || city) && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {[university, city].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Edit indicator */}
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
