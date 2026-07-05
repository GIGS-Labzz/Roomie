"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@repo/ui/logo";
import { ProfilePreviewCard } from "./ProfilePreviewCard";
import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/hooks/useProfile";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "feed",
    label: "Feed",
    href: "/feed",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    key: "discover",
    label: "Discover",
    href: "/discover",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    key: "chat",
    label: "Chat",
    href: "/chat",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "housing",
    label: "Find Housing",
    href: "/housing",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "splits",
    label: "Bill Splits",
    href: "/splits",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const { profile } = useProfile();

  const isSupportAcct =
    profile?.id === "a99928a0-8de7-4da0-871a-22077d13945d" ||
    profile?.display_name?.toLowerCase() === "roomie.app" ||
    profile?.username?.toLowerCase() === "fav_roomiee";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (isSupportAcct && (item.key === "housing" || item.key === "splits")) {
      return false;
    }
    return true;
  });

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 flex-shrink-0 sticky top-0 h-screen py-4 px-3 gap-1">

      {/* Brand */}
      <div className="px-3 py-3 mb-1">
        <Logo href="/feed" size="sm" />
      </div>

      {/* Profile preview */}
      <div className="mb-2">
        <ProfilePreviewCard />
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200/70 mx-3 mb-2" />

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-150 group ${
                isActive
                  ? "bg-white text-brand-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-700"}`}>
                {item.icon}
              </span>
              <span className="text-[15px] leading-none">{item.label}</span>
              <span className="ml-auto flex items-center gap-1.5">
                {item.key === "notifications" && unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {item.key === "chat" && unreadMessageCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="mt-2 px-3 space-y-2">
        <div className="h-px bg-slate-200/70" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "mailto:hello@roomie.ng" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          © 2026 Roomie ·{" "}
          <a
            href="https://gigsrentals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500 transition-colors"
          >
            A GIGSRentals Product
          </a>
        </p>
      </footer>
    </aside>
  );
}
