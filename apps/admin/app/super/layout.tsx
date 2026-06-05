"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="font-display font-bold">Roomie — Super Admin</div>
        <div className="flex gap-2">
          <button onClick={async () => { await logout(); router.replace('/login'); }} className="text-sm text-slate-600">Sign out</button>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <nav className="flex gap-4 mb-6">
          <Link href="/super" className={`${pathname === '/super' ? 'font-semibold' : ''}`}>Home</Link>
          <Link href="/super/providers" className={`${pathname.startsWith('/super/providers') ? 'font-semibold' : ''}`}>Providers</Link>
          <Link href="/super/approvals" className={`${pathname.startsWith('/super/approvals') ? 'font-semibold' : ''}`}>Approvals</Link>
          <Link href="/super/students" className={`${pathname.startsWith('/super/students') ? 'font-semibold' : ''}`}>Student verification</Link>
          <Link href="/super/connections" className={`${pathname.startsWith('/super/connections') ? 'font-semibold' : ''}`}>Connections</Link>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
