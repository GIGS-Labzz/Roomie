"use client";

import React, { ReactNode } from "react";
import { Logo } from "./logo";

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
          <Logo href="/" size="md" />
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
