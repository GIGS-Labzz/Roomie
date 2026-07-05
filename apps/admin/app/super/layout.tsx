"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  ClipboardCheck,
  GraduationCap,
  Link2,
  Megaphone,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/super",             label: "Overview",       icon: LayoutDashboard, exact: true },
  { href: "/super/providers",   label: "Providers",      icon: Building2, exact: true },
  { href: "/super/providers/new", label: "Add Provider",   icon: PlusCircle },
  { href: "/super/approvals",   label: "Approvals",      icon: ClipboardCheck },
  { href: "/super/students",    label: "Student Verify", icon: GraduationCap },
  { href: "/super/connections", label: "Connections",    icon: Link2 },
  { href: "/super/broadcast",   label: "Broadcast",      icon: Megaphone },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
          <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
          <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
          <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
          <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div>
        <div className="font-display font-bold text-slate-900 text-sm leading-none">Roomie</div>
        <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Super Admin</div>
      </div>
    </div>
  );
}

function NavItem({
  href, label, icon: Icon, exact, pathname, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  exact?: boolean; pathname: string; onClick?: () => void;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-brand-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ pathname, email, onNav, onLogout }: {
  pathname: string; email: string; onNav?: () => void; onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} onClick={onNav} />
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="px-3 py-2 mb-1">
          <div className="text-xs font-medium text-slate-900 truncate">{email}</div>
          <div className="text-[10px] text-brand-600 font-semibold uppercase tracking-wide mt-0.5">Super Admin</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (role !== "super_admin") { router.replace("/pending"); return; }
  }, [user, role, isLoading, router]);

  if (isLoading || !user || role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          email={user.email ?? ""}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white shadow-2xl z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <SidebarContent
              pathname={pathname}
              email={user.email ?? ""}
              onNav={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <Logo />
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100 md:ml-0">
          © 2026 Roomie · Super Admin
        </footer>
      </div>
    </div>
  );
}
