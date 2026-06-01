"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-sage-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ boxShadow: "0 8px 24px rgba(138,175,110,0.35)" }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-2xl tracking-tight text-slate-900">
              Roomie
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {/* Footer attribution */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 Roomie &bull; A{" "}
          <a
            href="https://gigsrentals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500 transition-colors"
          >
            GIGSRentals
          </a>{" "}
          Product
        </p>
      </div>
    </div>
  );
}
