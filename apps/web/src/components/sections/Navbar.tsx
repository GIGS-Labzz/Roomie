"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@repo/ui/logo";
import { useAutoHideOnScroll } from "@repo/ui/hooks/use-auto-hide-on-scroll";
import { useWaitlist } from "@/context/waitlist";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Roomie",   href: "#why-roomie"   },
  { label: "Pricing",      href: "#pricing"       }
];

export function Navbar() {
  const { openWaitlist } = useWaitlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hidden } = useAutoHideOnScroll({
    mode: "window",
    enabled: true,
    deltaThreshold: 8,
    topReset: 40,
  });

  useEffect(() => {
    if (hidden) setMobileOpen(false);
  }, [hidden]);

  return (
    <motion.header
      animate={{
        y: hidden ? "-110%" : "0%",
        scaleX: hidden ? 0.84 : 1,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-x-0 top-0 z-50 origin-top transform-gpu px-4 pt-4 sm:px-6"
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex w-full max-w-max items-center justify-between rounded-full bg-black p-1.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:w-fit md:justify-center md:bg-transparent md:p-0 md:shadow-none"
      >
        {/* <Logo
          href="/"
          size="lg"
          showWordmark={false}
          className="relative z-20 rounded-full bg-[#F4F4F0] mr-3"
          markClassName="rounded-full bg-[#f4f4f0] p-1"
        /> */}

        <div className="relative z-10 hidden items-center rounded-full bg-black px-4 py-2 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-white/30 md:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
                className={`relative z-10 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                index > 0 ? "border-l border-white/25" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={openWaitlist}
          className="relative z-10 -ml-1 hidden min-h-14 items-center justify-center rounded-full bg-black px-4 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-white/30 md:inline-flex"
        >
          <span className="relative z-10 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors ">
            Get the app
          </span>
        </button>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={20} aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu size={20} aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            id="mobile-navigation"
            className="mx-auto mt-2 max-w-sm overflow-hidden rounded-3xl border border-black/10 bg-black/95 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  {link.label}
                </motion.a>
              ))}

              <button
                onClick={() => { setMobileOpen(false); openWaitlist(); }}
                className="mt-2 min-h-11 rounded-2xl border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              >
                Get the app
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
