"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, useState, useCallback } from "react";
import { Check, RefreshCw, ShieldCheck, MessageCircle, SplitSquareVertical, Building2, Banknote, Wifi } from "lucide-react";

import connectingAnimation from "@repo/animations/connecting";
import paymentSuccessAnimation from "@repo/animations/payment-success";
import verifiedBadgeAnimation from "@repo/animations/verified-badge";
import chatTypingAnimation from "@repo/animations/chat-typing";
import matchFoundAnimation from "@repo/animations/match-found";
import emptyFeedAnimation from "@repo/animations/empty-feed";
import emptyChatAnimation from "@repo/animations/empty-chat";
import billSettledAnimation from "@repo/animations/bill-settled";
import loadingAnimation from "@repo/animations/loading";
import offlineAnimation from "@repo/animations/offline";
import roomAnimation from "@repo/animations/room";
import sandyLoadingAnimation from "@repo/animations/sandy-loading";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ─── Lottie catalogue ────────────────────────────────────────────────────────

const lottieItems = [
  { name: "connecting", label: "Connecting", data: connectingAnimation, bg: "bg-peach-100" },
  { name: "payment-success", label: "Payment Success", data: paymentSuccessAnimation, bg: "bg-brand-100" },
  { name: "verified-badge", label: "Verified Badge", data: verifiedBadgeAnimation, bg: "bg-sky-50" },
  { name: "chat-typing", label: "Chat Typing", data: chatTypingAnimation, bg: "bg-sage-surface" },
  { name: "match-found", label: "Match Found", data: matchFoundAnimation, bg: "bg-brand-50" },
  { name: "empty-feed", label: "Empty Feed", data: emptyFeedAnimation, bg: "bg-slate-50" },
  { name: "empty-chat", label: "Empty Chat", data: emptyChatAnimation, bg: "bg-peach-50" },
  { name: "bill-settled", label: "Bill Settled", data: billSettledAnimation, bg: "bg-emerald-50" },
  { name: "loading", label: "Loading", data: loadingAnimation, bg: "bg-amber-50" },
  { name: "offline", label: "Offline", data: offlineAnimation, bg: "bg-red-50" },
  { name: "room", label: "Room", data: roomAnimation, bg: "bg-violet-50" },
  { name: "sandy-loading", label: "Sandy Loading", data: sandyLoadingAnimation, bg: "bg-yellow-50" },
];

function LottieCard({ item }: { item: typeof lottieItems[0] }) {
  const [key, setKey] = useState(0);
  return (
    <div className={`${item.bg} rounded-2xl p-6 flex flex-col items-center gap-3`}>
      <div className="w-28 h-28">
        <Lottie key={key} animationData={item.data} loop autoplay style={{ width: "100%", height: "100%" }} />
      </div>
      <p className="font-semibold text-slate-800 text-sm text-center">{item.label}</p>
      <p className="text-[10px] text-slate-400 font-mono">{item.name}.json</p>
      <button
        onClick={() => setKey(k => k + 1)}
        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── Hero letter spring ───────────────────────────────────────────────────────

const tagline = ["C", "o", "o", "n", "n", "e", "e", "c", "t"];

function HeroLetterDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Hero — staggered letter spring</p>
      <div className="flex flex-wrap gap-0 mb-6 min-h-[60px]">
        {tagline.map((letter, i) => (
          <motion.span
            key={`${key}-${i}`}
            initial={{ opacity: 0, y: 30, scaleY: 0.5 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ delay: i * 0.045, type: "spring", stiffness: 300, damping: 18 }}
            className="font-display font-semibold text-4xl text-brand-500 inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <motion.p
          key={`tagline-${key}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-slate-600 text-sm"
        >
          Find your perfect roommate. Pay once. Move in together.
        </motion.p>
        <motion.div
          key={`btn-${key}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex gap-3 mt-2"
        >
          <div className="px-5 py-2.5 bg-peach-200 text-slate-900 font-semibold rounded-xl text-sm">Find my roommate</div>
          <div className="px-5 py-2.5 border-2 border-brand-500 text-brand-600 font-semibold rounded-xl text-sm">I have a platform</div>
        </motion.div>
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── Stagger cards ────────────────────────────────────────────────────────────

const featureCards = [
  { icon: ShieldCheck, title: "Verified profiles", color: "text-brand-500", bg: "bg-brand-50" },
  { icon: MessageCircle, title: "Real-time chat", color: "text-sky-500", bg: "bg-sky-50" },
  { icon: SplitSquareVertical, title: "Bill splitting", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Building2, title: "Curated housing", color: "text-peach-500", bg: "bg-peach-50" },
  { icon: Banknote, title: "Transparent pricing", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Wifi, title: "Works offline", color: "text-orange-500", bg: "bg-orange-50" },
];

function StaggerCardsDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">WhyRoomie — stagger fade-up cards</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {featureCards.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={`${key}-${i}`}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.45 }}
              className="bg-slate-50 rounded-xl p-4"
            >
              <div className={`w-9 h-9 ${f.bg} ${f.color} rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <p className="text-xs font-semibold text-slate-800">{f.title}</p>
            </motion.div>
          );
        })}
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── Stagger with Lottie (HowItWorks) ────────────────────────────────────────

const steps = [
  { number: "01", label: "Create profile", animation: matchFoundAnimation, color: "bg-brand-100" },
  { number: "02", label: "Browse & connect", animation: connectingAnimation, color: "bg-peach-100" },
  { number: "03", label: "Move in together", animation: paymentSuccessAnimation, color: "bg-sage-surface" },
];

function StepCardsDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">HowItWorks — stagger cards with Lottie</p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {steps.map((step, i) => (
          <motion.div
            key={`${key}-${i}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.15, duration: 0.5 }}
            className={`${step.color} rounded-2xl p-5 flex flex-col items-center text-center`}
          >
            <div className="w-16 h-16 mb-3">
              <Lottie animationData={step.animation} loop autoplay style={{ width: "100%", height: "100%" }} />
            </div>
            <span className="font-display font-semibold text-2xl text-brand-200 block">{step.number}</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">{step.label}</p>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── Pricing list slide-in ────────────────────────────────────────────────────

const pricingItems = [
  "Browse all profiles for free",
  "Send a connection request — free",
  "Chat with your match — free",
  "Propose a Roommate Agreement — free",
  "Pay ₦2,000 when you're both ready",
  "Housing providers unlocked for both of you",
];

function PricingListDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Pricing — list slide-in from left + card scale</p>
      <motion.div
        key={`card-${key}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden border-2 border-slate-200 mb-4"
      >
        <div className="px-6 py-5 text-center" style={{ background: "#FAE8CC" }}>
          <p className="font-display font-semibold text-3xl text-slate-900">₦2,000</p>
          <p className="text-slate-500 text-xs">per connection</p>
        </div>
        <ul className="px-6 py-5 space-y-3 bg-white">
          {pricingItems.map((item, i) => (
            <motion.li
              key={`${key}-${i}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <Check size={9} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="text-slate-700 text-xs">{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── ForProviders stats stagger ───────────────────────────────────────────────

const statsData = [
  { value: "500+", label: "roommates connected" },
  { value: "12", label: "cities covered" },
  { value: "3 min", label: "avg. connection time" },
];

function StatsDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">ForProviders — stats stagger fade-up</p>
      <motion.div
        key={`heading-${key}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <p className="font-display font-semibold text-xl text-slate-900">Reach roommates who are ALREADY ready to rent.</p>
      </motion.div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {statsData.map((s, i) => (
          <motion.div
            key={`${key}-${i}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
            className="rounded-xl p-4 text-center"
            style={{ background: "#EDE8C8" }}
          >
            <p className="font-display font-semibold text-2xl text-slate-900">{s.value}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={11} /> replay
      </button>
    </div>
  );
}

// ─── AppPreview screen transition ────────────────────────────────────────────

const previewScreens = ["Discover", "Chat", "Bill Splits"];

function AppPreviewTransitionDemo() {
  const [active, setActive] = useState(0);
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">AppPreview — screen slide transition</p>
      <div className="flex gap-2 mb-4">
        {previewScreens.map((s, i) => (
          <button
            key={s}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${active === i ? "bg-brand-500 text-white shadow-brutal" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100" style={{ minHeight: 80 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="p-5"
          >
            <p className="text-sm font-semibold text-slate-700">{previewScreens[active]}</p>
            <p className="text-xs text-slate-400 mt-1">Content transitions with 250ms slide + fade</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tailwind animations ──────────────────────────────────────────────────────

function TailwindAnimationsDemo() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Tailwind — spin · bounce · pulse · typing indicator</p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">animate-spin</p>
          <p className="text-[10px] text-slate-400 text-center">Loading states (admin, connect/success)</p>
        </div>
        <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 rounded-xl">
          <p className="text-slate-500 text-sm animate-pulse font-medium">Finding your perfect match…</p>
          <p className="text-xs text-slate-500 font-mono">animate-pulse</p>
          <p className="text-[10px] text-slate-400 text-center">Loading screen subtitle (apps/app)</p>
        </div>
        <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 rounded-xl">
          <div className="flex items-end gap-1 h-8">
            {[0, 0.15, 0.3].map((delay, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${delay}s`, animationDuration: "0.9s" }}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-mono">animate-bounce</p>
          <p className="text-[10px] text-slate-400 text-center">TypingIndicator component (staggered dots)</p>
        </div>
        <div className="flex flex-col items-center gap-3 p-5 bg-slate-50 rounded-xl">
          <div className="w-52 h-52 flex items-center justify-center" style={{ background: "#EDE8C8", borderRadius: 16 }}>
            <Lottie animationData={sandyLoadingAnimation} loop autoplay style={{ width: 80, height: 80 }} />
          </div>
          <p className="text-xs text-slate-500 font-mono">room.json + animate-pulse text</p>
          <p className="text-[10px] text-slate-400 text-center">App loading screen (apps/app/loading.tsx)</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnimationsPreviewPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ background: "#EDE8C8" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-brand-600 font-semibold text-xs uppercase tracking-widest mb-2">Dev preview</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-slate-900 mb-3">Animation Preview</h1>
          <p className="text-slate-500 text-base max-w-xl">
            All Lottie files, Framer Motion patterns, and Tailwind animations used across the Roomie web &amp; app.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["12 Lottie files", "5 Framer Motion patterns", "3 Tailwind animations"].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-600 border border-slate-200">{tag}</span>
            ))}
          </div>
        </div>

        {/* Section 1: Lottie */}
        <section className="mb-16">
          <SectionHeading title="Lottie Animations" subtitle="@repo/animations — 12 JSON files" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lottieItems.map(item => <LottieCard key={item.name} item={item} />)}
          </div>
        </section>

        {/* Section 2: Framer Motion patterns */}
        <section className="mb-16">
          <SectionHeading title="Framer Motion Patterns" subtitle="Reusable animation patterns from landing sections" />
          <div className="flex flex-col gap-6">
            <HeroLetterDemo />
            <div className="grid md:grid-cols-2 gap-6">
              <StaggerCardsDemo />
              <StepCardsDemo />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <PricingListDemo />
              <StatsDemo />
            </div>
            <AppPreviewTransitionDemo />
          </div>
        </section>

        {/* Section 3: Tailwind */}
        <section className="mb-16">
          <SectionHeading title="Tailwind Animations" subtitle="Utility class animations (no JS)" />
          <TailwindAnimationsDemo />
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display font-semibold text-2xl text-slate-900">{title}</h2>
      <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
    </div>
  );
}
