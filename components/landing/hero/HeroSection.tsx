"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import DataStreamCanvas from "./DataStreamCanvas";
import HeroControls from "./HeroControls";
import HeroSkeleton from "./HeroSkeleton";

// Dynamic import with ssr: false — three-globe requires `window` (WebGL)
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
  ssr: false,
  loading: () => <HeroSkeleton />,
});

export default function HeroSection() {
  const [year, setYear] = useState(2020);
  const [showFlights, setShowFlights] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "600px", background: "#010812" }}
    >
      {/* Globe canvas — dynamically loaded with skeleton fallback (ssr: false) */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas
          year={year}
          showFlights={showFlights}
          showTrades={showTrades}
        />
      </div>

      {/* Vertical AI data streams on the left */}
      <DataStreamCanvas />

      {/* Dark vignette overlay to keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(1,8,18,0.45) 100%)",
        }}
      />

      {/* Title overlay — top-center, transparent so globe shows through */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-14 px-6 text-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div
          className="text-xs font-mono tracking-[0.25em] mb-4 px-4 py-1 rounded-full"
          style={{
            color: "rgba(0,234,255,0.7)",
            background: "rgba(0,234,255,0.06)",
            border: "1px solid rgba(0,234,255,0.15)",
          }}
        >
          A2Z Carbon Solutions Platform
        </div>
        <h1
          className="font-light leading-tight"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 40px rgba(0,0,0,0.8)",
          }}
        >
          Carbon Data.
        </h1>
        <h2
          className="font-light"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(1.6rem, 4.5vw, 3.4rem)",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 40px rgba(0,0,0,0.8)",
          }}
        >
          Trade.{" "}
          <span style={{ color: "rgba(0,234,255,0.85)" }}>Compliance.</span>{" "}
          Intelligence.
        </h2>
      </motion.div>

      {/* Bottom controls */}
      <HeroControls
        year={year}
        onYearChange={setYear}
        showFlights={showFlights}
        onToggleFlights={setShowFlights}
        showTrades={showTrades}
        onToggleTrades={setShowTrades}
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          SCROLL
        </span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <rect x="0.5" y="0.5" width="11" height="19" rx="5.5" stroke="rgba(255,255,255,0.25)" />
          <motion.rect
            x="5" y="4" width="2" height="5" rx="1" fill="rgba(0,234,255,0.6)"
            animate={{ y: [4, 10, 4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </svg>
      </motion.div>
    </section>
  );
}
