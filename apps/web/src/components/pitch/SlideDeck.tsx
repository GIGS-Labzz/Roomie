"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, Home, Landmark } from "lucide-react";
import Link from "next/link";

// Slide Components
import SlideCover from "./slides/SlideCover";
import SlideProblem from "./slides/SlideProblem";
import SlideSolution from "./slides/SlideSolution";
import SlideMatchDemo from "./slides/SlideMatchDemo";
import SlideBillSplitDemo from "./slides/SlideBillSplitDemo";
import SlideTrustNetwork from "./slides/SlideTrustNetwork";
import SlideBusinessModel from "./slides/SlideBusinessModel";
import SlideMarketKano from "./slides/SlideMarketKano";
import SlideTractionTech from "./slides/SlideTractionTech";
import SlideCTA from "./slides/SlideCTA";

export function SlideDeck() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const totalSlides = 10;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Autoplay handler
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 10000); // 10s slide duration
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen error", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <SlideCover onNext={nextSlide} />;
      case 1:
        return <SlideProblem />;
      case 2:
        return <SlideSolution />;
      case 3:
        return <SlideMatchDemo />;
      case 4:
        return <SlideBillSplitDemo />;
      case 5:
        return <SlideTrustNetwork />;
      case 6:
        return <SlideBusinessModel />;
      case 7:
        return <SlideMarketKano />;
      case 8:
        return <SlideTractionTech />;
      case 9:
        return <SlideCTA />;
      default:
        return <SlideCover onNext={nextSlide} />;
    }
  };

  // Slide names for the timeline tracker tooltips
  const slideNames = [
    "Cover",
    "Problem",
    "Solution",
    "Matcher",
    "Bills Ledger",
    "Trust Badges",
    "Business Model",
    "Kano Market",
    "Roadmap",
    "Wrap Up",
  ];

  // Animation variants (slide horizontal transition)
  const slideVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as any } },
    exit: { opacity: 0, x: -80, transition: { duration: 0.25, ease: "easeIn" as any } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none font-sans justify-between py-6">
      {/* Top Navbar HUD */}
      <div className="max-w-6xl mx-auto w-full px-6 flex justify-between items-center h-12">
        <Link
          href="/"
          className="flex items-center gap-2 hover:bg-slate-900 border border-transparent hover:border-slate-800 px-3 py-1.5 rounded-xl transition-all"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-400">Main Site</span>
        </Link>

        {/* Roomie Wordmark */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          <span className="font-display font-black tracking-widest text-sm text-white">ROOMIE PITCH HUD</span>
        </div>

        {/* Action HUD buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl transition-colors"
            title={isPlaying ? "Pause Autoplay" : "Play Autoplay (10s)"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-brand-500" />
            ) : (
              <Play className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-brand-500" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Panel */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 flex items-center justify-center">
        <div className="w-full relative overflow-hidden py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="max-w-6xl mx-auto w-full px-6 flex flex-col gap-4 mt-4">
        {/* Navigation timeline tracker */}
        <div className="flex justify-between items-center gap-3">
          {slideNames.map((name, idx) => {
            const isActive = idx === currentSlide;
            const isCompleted = idx < currentSlide;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="flex-1 group flex flex-col items-stretch text-left focus:outline-none"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-brand-500 shadow-[0_0_8px_#8AAF6E]"
                      : isCompleted
                      ? "bg-brand-500/50"
                      : "bg-slate-850"
                  }`}
                />
                <span
                  className={`hidden md:block text-[9px] font-mono tracking-wide mt-2 transition-colors ${
                    isActive ? "text-white font-bold" : "text-slate-500 group-hover:text-slate-400"
                  }`}
                >
                  {idx + 1}. {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buttons Nav HUD */}
        <div className="flex justify-between items-center border-t border-slate-900 pt-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span>Slide</span>
            <span className="font-bold text-white font-mono">{currentSlide + 1}</span>
            <span>of</span>
            <span className="font-bold text-white font-mono">{totalSlides}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-850 rounded-xl transition-all flex items-center gap-1.5 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="px-4 py-2 bg-brand-500 border border-black hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand-500 rounded-xl text-slate-950 font-bold transition-all shadow-brutal-sm hover:shadow-brutal flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
