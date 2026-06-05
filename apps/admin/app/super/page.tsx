"use client";

import React from "react";
import Link from "next/link";

export default function SuperHome() {
  return (
    <div>
      <h1 className="font-display font-bold text-slate-900 text-2xl">Super admin</h1>
      <p className="text-sm text-slate-500 mt-2">Manage providers, approvals, and verifications.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/super/providers" className="p-4 bg-white rounded shadow">Providers</Link>
        <Link href="/super/approvals" className="p-4 bg-white rounded shadow">Provider approvals</Link>
        <Link href="/super/students" className="p-4 bg-white rounded shadow">Student verification</Link>
        <Link href="/super/connections" className="p-4 bg-white rounded shadow">Connections</Link>
      </div>
    </div>
  );
}
