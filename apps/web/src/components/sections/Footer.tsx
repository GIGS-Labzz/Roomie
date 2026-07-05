"use client";

import Link from "next/link";
import { Logo } from "@repo/ui/logo";
import { useWaitlist } from "@/context/waitlist";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.roomie.ng";

export function Footer() {
  const { openWaitlist } = useWaitlist();
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo href="/" size="md" variant="light" />
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Perfect Roomie. Just Connect and Coonneect.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Product</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@roomie.ng"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* For providers */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">
              Housing Providers
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={openWaitlist}
                  className="hover:text-white transition-colors text-left"
                >
                  List your platform
                </button>
              </li>
              <li>
                <button
                  onClick={openWaitlist}
                  className="hover:text-white transition-colors text-left"
                >
                  Provider login
                </button>
              </li>
              <li>
                <a
                  href="#for-providers"
                  className="hover:text-white transition-colors"
                >
                  Why list on Roomie?
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            &copy; 2026 Roomie &bull; A{" "}
            <a
              href="https://go-finder-dashboard.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              GIGSRentals
            </a>{" "}
            Product
          </p>
          <p>Made in Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
