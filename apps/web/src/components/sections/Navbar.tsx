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
  { label: "Pricing",      href: "#pricing"       },
  { label: "For providers",href: "#for-providers" },
  { label: "Pitch Deck ⚡", href: "/pitch"        },
];

export function Navbar() {
  const { openWaitlist } = useWaitlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hidden } = useAutoHideOnScroll({
    mode: "window",
    enabled: true,
    deltaThreshold: 8,
    topReset: 40,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when navbar hides
  useEffect(() => {
    if (hidden) setMobileOpen(false);
  }, [hidden]);

  return (
    <motion.header
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Glass bar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-white/65 backdrop-blur-xl border-b border-white/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo href="/" size="sm" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-xl transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button
              onClick={openWaitlist}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-brutal-sm hover:-translate-y-px active:translate-y-0 duration-150"
            >
              Get the app
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/70 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate:  90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={20} className="text-slate-700" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate:  90, opacity: 0 }}
                  animate={{ rotate:  0,  opacity: 1 }}
                  exit={{   rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} className="text-slate-700" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden md:hidden bg-white/75 backdrop-blur-xl border-b border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 rounded-xl transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              <button
                onClick={() => { setMobileOpen(false); openWaitlist(); }}
                className="mt-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm text-center transition-colors"
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
