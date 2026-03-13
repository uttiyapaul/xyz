// @ts-nocheck
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import DataStreamCanvas from "./DataStreamCanvas";
import HeroSkeleton from "./HeroSkeleton";

/* ─────────────────────────────────────────────
   Dynamic import — three-globe needs the browser
   ───────────────────────────────────────────── */
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
  ssr: false,
  loading: () => <HeroSkeleton />,
});

/* ─────────────────────────────────────────────
   Static data — Live Data Panel rows
   Order is deliberate (psychological sequence):
   1. Trust first  2. Loss aversion  3. Core data
   4. Zero risk    5. Forward momentum
   ───────────────────────────────────────────── */
const LIVE_ROWS = [
  {
    id: "audit",
    label: "Audit Chain",
    value: "✓ Verified",
    sub: "Hash-signed · 14:32 IST",
    valueColor: "#30d158",
    subColor: "rgba(255,255,255,0.28)",
    accent: "rgba(48,209,88,0.65)",
    valueSuffix: "",
  },
  {
    id: "cbam",
    label: "CBAM 2026",
    value: "€2.1M",
    sub: "Estimated liability",
    valueColor: "#ff9500",
    subColor: "rgba(255,149,0,0.55)",
    accent: "rgba(255,149,0,0.75)",
    valueSuffix: "",
  },
  {
    id: "scope1",
    label: "Scope 1",
    value: "45,200",
    sub: "▼ 14.2% vs PY",
    valueColor: "#00d4ff",
    subColor: "#30d158",
    accent: "rgba(0,212,255,0.5)",
    valueSuffix: " tCO₂e",
  },
  {
    id: "anomalies",
    label: "AI Anomalies",
    value: "0",
    sub: "Last 24h · real-time",
    valueColor: "#30d158",
    subColor: "rgba(255,255,255,0.25)",
    accent: "rgba(48,209,88,0.65)",
    valueSuffix: " today",
  },
  {
    id: "scope3",
    label: "Scope 3 Coverage",
    value: "68%",
    sub: "▲ +14% YTD",
    valueColor: "#00d4ff",
    subColor: "#30d158",
    accent: "rgba(10,132,255,0.5)",
    valueSuffix: "",
  },
] as const;

/* ─────────────────────────────────────────────
   Proof bar stats — story arc sequence:
   "Is it real?" → "What does it save?" →
   "How big?" → "Proven?" → "Right now?"
   ───────────────────────────────────────────── */
const PROOF_STATS = [
  { n: "210+",   d: "Facilities Monitored",    ctx: "across 14 countries",     peak: false, live: false, badge: false },
  { n: "€3.1M+", d: "CBAM Penalties Avoided",  ctx: "since 2023",              peak: true,  live: false, badge: false },
  { n: "14",     d: "Countries",               ctx: "EU · IN · UAE · AU",      peak: false, live: false, badge: false },
  { n: "1.2Mt+", d: "CO₂ Tracked",             ctx: "ISO 14064-3 verified",    peak: false, live: false, badge: true  },
  { n: "99.9%",  d: "Audit Integrity",         ctx: "live · hash-chained",     peak: false, live: true,  badge: false },
] as const;

/* ─────────────────────────────────────────────
   Descriptor lines — ALL identical size/weight
   The shape-outside curve is achieved by
   increasing padding-right on middle lines so
   the text block follows the globe's left arc.
   ───────────────────────────────────────────── */
const DESCRIPTOR_LINES = [
  { text: "Measure.",      indent: "4%" },
  { text: "Capture.",      indent: "9%" },
  { text: "Prove.",        indent: "12%" },
  { text: "Comply.",       indent: "8%" },
  { text: "Trade.",        indent: "3%" },
  { text: "Intelligence.", indent: "0%" },
] as const;

/* ─────────────────────────────────────────────
   Shared style tokens
   ───────────────────────────────────────────── */
const BRAND_GRADIENT = "linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)";

const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 44,
  padding: "0 22px",
  background: BRAND_GRADIENT,
  border: "none",
  borderRadius: 8,
  fontSize: "clamp(13px, 1.1vw, 15px)",
  fontWeight: 700,
  color: "#fff",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  boxShadow: "0 4px 20px rgba(0,212,255,0.25)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const ghostBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 44,
  padding: "0 18px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  fontSize: "clamp(13px, 1.1vw, 15px)",
  fontWeight: 500,
  color: "rgba(255,255,255,0.65)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "border-color 0.2s, color 0.2s",
};

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export default function HeroSection() {
  const [year, setYear]               = useState(2020);
  const [showFlights, setShowFlights] = useState(true);
  const [showTrades, setShowTrades]   = useState(true);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      style={{ position: "relative", width: "100%", height: "100svh", minHeight: 580, overflow: "hidden", background: "#010812" }}
    >

      {/* ── 1. FULL-BLEED GLOBE + STARS ─── z:0, behind everything */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GlobeCanvas year={year} showFlights={showFlights} showTrades={showTrades} />
      </div>

      {/* ── 2. DATA STREAM ─── left edge, z:1 */}
      <DataStreamCanvas />

      {/* ── 3. GRADIENT OVERLAYS ─── stars visible, text readable */}
      {/* Left: darkens text column */}
      <div aria-hidden="true" className="a2z-left-overlay" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "44%", zIndex: 1, background: "linear-gradient(90deg, rgba(1,8,18,0.88) 0%, rgba(1,8,18,0.7) 55%, transparent 100%)", pointerEvents: "none" }} />
      {/* Right: darkens panel */}
      <div aria-hidden="true" className="a2z-right-overlay" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "22%", zIndex: 1, background: "linear-gradient(270deg, rgba(1,8,18,0.9) 0%, rgba(1,8,18,0.72) 55%, transparent 100%)", pointerEvents: "none" }} />
      {/* Radial depth vignette */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(ellipse 80% 90% at 50% 50%, transparent 35%, rgba(1,8,18,0.32) 100%)", pointerEvents: "none" }} />

      {/* ── 4. 3-COLUMN GRID ─── z:2, transparent, full height */}
      <div
        className="a2z-hero-grid"
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "38% 1fr 16%",
          height: "100%",
          paddingTop: 68,    /* clear fixed navbar */
          paddingBottom: 52, /* clear proof bar */
        }}
      >
        <TextColumn />

        {/* Centre col: transparent — globe shows through, scroll cue only */}
        <div className="a2z-centre-col" style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <ScrollCue />
        </div>

        <LiveDataPanel />
      </div>

      {/* ── 5. CONTROLS ─── bottom-centre, above proof bar */}
      <div style={{ position: "absolute", bottom: 54, left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
        <CompactControls
          year={year} onYearChange={setYear}
          showFlights={showFlights} onToggleFlights={setShowFlights}
          showTrades={showTrades}   onToggleTrades={setShowTrades}
        />
      </div>

      {/* ── 6. PROOF BAR ─── absolute bottom of section */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
        <ProofBar />
      </div>

      {/* ── RESPONSIVE + KEYFRAMES ─────────────────────────────────────────── */}
      <style>{`
        /* TABLET */
        @media (max-width: 900px) {
          .a2z-hero-grid { grid-template-columns: 52% 1fr !important; }
          .a2z-panel-col  { display: none !important; }
          .a2z-right-overlay { width: 4% !important; }
        }

        /* MOBILE — entire hero in 100svh, globe full-bleed behind */
        @media (max-width: 640px) {
          .a2z-hero-grid {
            grid-template-columns: 1fr !important;
            padding-top: 64px !important;
            padding-bottom: 44px !important;
            align-items: flex-start !important;
            height: 100% !important;
          }
          /* Full-width dark overlay so text is readable over globe */
          .a2z-left-overlay {
            width: 100% !important;
            background: linear-gradient(180deg,
              rgba(1,8,18,0.84) 0%,
              rgba(1,8,18,0.62) 45%,
              rgba(1,8,18,0.25) 100%
            ) !important;
          }
          .a2z-right-overlay { display: none !important; }
          .a2z-centre-col    { display: none !important; }
          .a2z-panel-col     { display: none !important; }

          /* Text column: compact */
          .a2z-text-col {
            padding: 6px 20px 10px !important;
            justify-content: flex-start !important;
          }
          /* Hide sub-paragraph to save space */
          .a2z-sub-para { display: none !important; }

          /* CTA buttons: full-width column */
          .a2z-cta-row { flex-direction: column !important; gap: 6px !important; }
          .a2z-cta-primary, .a2z-cta-ghost { width: 100% !important; justify-content: center !important; }

          /* Controls: smaller, keep visible */
          .a2z-controls { padding: 4px 10px !important; }

          /* Proof bar: 3 stats only, no context labels */
          .a2z-proof-stat-3,
          .a2z-proof-stat-4,
          .a2z-proof-stat-5 { display: none !important; }
          .a2z-proof-ctx    { display: none !important; }
          .a2z-proof-bar    {
            padding: 5px 12px !important;
            justify-content: space-around !important;
          }
          .a2z-proof-label  { display: none !important; }
          .a2z-proof-num    { font-size: 12px !important; }
          .a2z-proof-desc   { font-size: 8px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .a2z-live-dot, .a2z-badge-dot,
          .a2z-proof-pulse, .a2z-proof-sweep { animation: none !important; }
        }

        @keyframes a2z-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.15; }
        }
        @keyframes a2z-sweep {
          0%, 100% { opacity: 0; transform: translateX(-90%); }
          50%       { opacity: 1; transform: translateX(90%); }
        }
        @keyframes a2z-scroll-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
          50%       { transform: translateX(-50%) translateY(6px); opacity: 0.72; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TEXT COLUMN
   ───────────────────────────────────────────── */
function TextColumn() {
  return (
    <motion.div
      className="a2z-text-col"
      style={{
        padding: "clamp(14px, 2.5vh, 38px) 0 14px clamp(20px, 3vw, 52px)",
        display: "flex", flexDirection: "column", justifyContent: "center", height: "100%",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 9999, padding: "3px 10px", marginBottom: "clamp(7px, 1.2vh, 13px)", width: "fit-content" }}>
        <span className="a2z-badge-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4ff", flexShrink: 0, animation: "a2z-blink 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(0,212,255,0.75)", textTransform: "uppercase", fontWeight: 600 }}>
          A2Z Carbon Solutions Platform
        </span>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: "clamp(7px, 1.2vh, 14px)" }}>
        <span style={{ display: "block", fontFamily: "var(--font-syne), sans-serif", fontSize: "clamp(16px, 2.3vw, 27px)", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em", lineHeight: 1.18 }}>The Full</span>
        <span id="hero-heading" style={{ display: "block", fontFamily: "var(--font-syne), sans-serif", fontSize: "clamp(19px, 2.8vw, 33px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 2 }}>
          Carbon Stack.
        </span>
        {DESCRIPTOR_LINES.map(({ text, indent }) => (
          <span key={text} style={{ display: "block", fontFamily: "var(--font-syne), sans-serif", fontSize: "clamp(12px, 1.6vw, 18px)", fontWeight: 600, color: "rgba(255,255,255,0.78)", letterSpacing: "-0.01em", lineHeight: 1.22, paddingRight: indent }}>
            {text}
          </span>
        ))}
        <span style={{ display: "block", fontSize: "clamp(8px, 0.8vw, 10px)", color: "rgba(255,255,255,0.2)", fontWeight: 400, letterSpacing: "0.08em", marginTop: 4 }}>
          Enterprise carbon management platform
        </span>
      </div>

      {/* Sub paragraph — hidden mobile */}
      <p className="a2z-sub-para" style={{ fontSize: "clamp(11px, 0.95vw, 13px)", color: "rgba(255,255,255,0.37)", lineHeight: 1.7, marginBottom: "clamp(10px, 1.5vh, 18px)", maxWidth: 310 }}>
        A2Z operates across the <strong style={{ color: "rgba(255,255,255,0.65)" }}>entire carbon lifecycle</strong> — real-time GHG tracking, CBAM automation, amine manufacturing and turnkey CCS delivery.
      </p>

      {/* CTAs */}
      <div className="a2z-cta-row" style={{ display: "flex", gap: 8, marginBottom: "clamp(9px, 1.3vh, 15px)", flexWrap: "wrap" }}>
        <a href="#demo" className="a2z-cta-primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 42, padding: "0 20px", background: BRAND_GRADIENT, border: "none", borderRadius: 8, fontSize: "clamp(12px, 1vw, 14px)", fontWeight: 700, color: "#fff", cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 18px rgba(0,212,255,0.22)" }}>
          Book a Demo →
        </a>
        <a href="/calculator" className="a2z-cta-ghost" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 42, padding: "0 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, fontSize: "clamp(12px, 1vw, 14px)", fontWeight: 500, color: "rgba(255,255,255,0.62)", cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" }}>
          Free CBAM Calculator
        </a>
      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {TRUST_ITEMS.map((label, i) => (
          <span key={label} className="a2z-trust-item" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {i > 0 && <span style={{ width: 1, height: 9, background: "rgba(255,255,255,0.1)" }} />}
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "clamp(9px, 0.78vw, 11px)", color: "rgba(255,255,255,0.38)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "rgba(48,209,88,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="6" height="5" viewBox="0 0 6 5" fill="none" aria-hidden="true"><polyline points="0.8,3 2.4,4.8 5.6,0.8" stroke="#30d158" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              {label}
            </span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   TRUST BADGES ROW
   ───────────────────────────────────────────── */
const TRUST_ITEMS = ["GDPR Compliant", "ISO 14064-3 Ready", "SOC 2 Pursuing", "CBAM 2026 Ready"] as const;

function TrustBadges() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {TRUST_ITEMS.map((label, i) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && (
            <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)" }} />
          )}
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "clamp(10px, 0.85vw, 12px)", color: "rgba(255,255,255,0.38)" }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "rgba(48,209,88,0.13)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="7" height="6" viewBox="0 0 7 6" fill="none" aria-hidden="true">
                <polyline
                  points="0.8,3 2.6,5 6.2,1"
                  stroke="#30d158"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPACT CONTROLS — year slider + toggles
   Positioned as a pill at bottom of globe col
   ───────────────────────────────────────────── */
interface CompactControlsProps {
  year: number;
  onYearChange: (y: number) => void;
  showFlights: boolean;
  onToggleFlights: (v: boolean) => void;
  showTrades: boolean;
  onToggleTrades: (v: boolean) => void;
}

function CompactControls({
  year, onYearChange,
  showFlights, onToggleFlights,
  showTrades, onToggleTrades,
}: CompactControlsProps) {
  const pct = ((year - 2000) / 24) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "clamp(10px, 2vh, 20px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "rgba(3,7,16,0.88)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 9999,
        padding: "5px 14px",
        whiteSpace: "nowrap",
        zIndex: 5,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Year label */}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
        Year
      </span>

      {/* Slider */}
      <div style={{ position: "relative", width: "clamp(60px, 8vw, 120px)" }}>
        <input
          type="range"
          min={2000}
          max={2024}
          step={1}
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          aria-label="Select year"
          style={{
            WebkitAppearance: "none",
            width: "100%",
            height: 2,
            borderRadius: 9999,
            background: `linear-gradient(90deg, #00d4ff ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
            outline: "none",
            cursor: "pointer",
          }}
        />
        <style>{`
          input[type=range].a2z-ctrl-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #00d4ff;
            cursor: pointer;
            box-shadow: 0 0 6px rgba(0,212,255,0.7);
          }
        `}</style>
      </div>

      {/* Year value */}
      <span
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "#00d4ff",
          fontWeight: 600,
          minWidth: 32,
        }}
      >
        {year}
      </span>

      {/* Divider */}
      <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />

      {/* Flight toggle */}
      <TogglePill
        label="✈ Flights"
        active={showFlights}
        color="#00d4ff"
        onToggle={() => onToggleFlights(!showFlights)}
      />

      {/* Trade toggle */}
      <TogglePill
        label="⇄ Trades"
        active={showTrades}
        color="#ffaa00"
        onToggle={() => onToggleTrades(!showTrades)}
      />
    </div>
  );
}

function TogglePill({
  label, active, color, onToggle,
}: {
  label: string;
  active: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      style={{
        background: active ? `${color}18` : "transparent",
        border: `1px solid ${active ? color + "40" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 9999,
        padding: "2px 8px",
        fontSize: 10,
        color: active ? color : "rgba(255,255,255,0.35)",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "var(--font-body)",
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   SCROLL CUE — links to bottom of page
   ───────────────────────────────────────────── */
function ScrollCue() {
  const handleScroll = () => {
    const footer = document.getElementById("footer") || 
                   document.querySelector("footer") || 
                   document.querySelector(".sec:last-of-type");
    
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleScroll}
      aria-label="Scroll to explore"
      style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        animation: "a2z-scroll-bob 2.8s ease-in-out infinite",
      }}
    >
      <span
        style={{
          fontSize: 8,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.42)",
          fontFamily: "var(--font-mono)",
        }}
      >
        EXPLORE
      </span>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="9" height="15" rx="4.5" stroke="rgba(255,255,255,0.22)" />
        <rect x="4" y="3" width="2" height="4" rx="1" fill="rgba(0,212,255,0.5)" />
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────
   LIVE DATA PANEL — 16% col, right side
   Bloomberg terminal logic: chart left, readouts right.
   Left accent bar encodes status pre-attentively.
   ───────────────────────────────────────────── */
function LiveDataPanel() {
  return (
    <motion.aside className="a2z-panel-col" aria-label="Live platform data"
      style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", background: "rgba(2,6,16,0.52)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ padding: "7px 10px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>Live data</span>
        <span className="a2z-live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#30d158", marginLeft: "auto", animation: "a2z-blink 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 7, color: "rgba(48,209,88,0.55)", letterSpacing: "0.1em" }}>LIVE</span>
      </div>
      {LIVE_ROWS.map((row, i) => (
        <div key={row.id} style={{ padding: "clamp(5px, 1vh, 9px) 10px", borderBottom: i < LIVE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", flexDirection: "column", gap: 2, position: "relative", flex: 1, justifyContent: "center" }}>
          <span style={{ position: "absolute", left: 0, top: "22%", bottom: "22%", width: 2, borderRadius: 1, background: row.accent }} />
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.09em" }}>{row.label}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(11px, 1.1vw, 14px)", fontWeight: 700, color: row.valueColor, lineHeight: 1.15 }}>{row.value}</span>
          <span style={{ fontSize: 7, color: row.subColor, lineHeight: 1.3 }}>{row.sub}</span>
        </div>
      ))}
    </motion.aside>
  );
}

/* ─────────────────────────────────────────────
   PROOF BAR
   Psychological story arc — see comments.
   Shimmer sweep draws eye left-to-right.
   ───────────────────────────────────────────── */
function ProofBar() {
  return (
    <div className="a2z-proof-bar" role="region" aria-label="Platform statistics"
      style={{ background: "rgba(1,5,14,0.94)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", padding: "7px clamp(14px, 3.5vw, 48px)", display: "flex", alignItems: "stretch", justifyContent: "center", flexWrap: "nowrap", position: "relative", overflow: "hidden" }}
    >
      <span className="a2z-proof-sweep" aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 5%, rgba(0,212,255,0.016) 50%, transparent 95%)", animation: "a2z-sweep 5s ease-in-out infinite", pointerEvents: "none" }} />
      <span className="a2z-proof-label" style={{ fontSize: "clamp(8px, 0.7vw, 10px)", color: "rgba(255,255,255,0.16)", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", paddingRight: "clamp(8px, 1.5vw, 14px)", whiteSpace: "nowrap", flexShrink: 0 }}>
        Trusted across
      </span>
      {PROOF_STATS.map((stat, i) => (
        <span key={stat.d} className={`a2z-proof-stat a2z-proof-stat-${i + 1}`} style={{ display: "flex", alignItems: "center" }}>
          <span style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0", alignSelf: "stretch" }} />
          <div style={{ textAlign: "center", padding: "0 clamp(7px, 1.2vw, 13px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="a2z-proof-num" style={{ fontFamily: "var(--font-mono)", fontSize: stat.peak ? "clamp(13px, 1.4vw, 16px)" : "clamp(11px, 1.1vw, 14px)", color: stat.peak ? "#ff9500" : "rgba(255,255,255,0.82)", display: "flex", alignItems: "center", fontWeight: 700, lineHeight: 1.1 }}>
              {stat.n}
              {stat.live && <span className="a2z-proof-pulse" aria-label="live" style={{ width: 4, height: 4, borderRadius: "50%", background: "#30d158", display: "inline-block", marginLeft: 3, animation: "a2z-blink 2s ease-in-out infinite" }} />}
            </span>
            <span className="a2z-proof-desc" style={{ fontSize: "clamp(7px, 0.62vw, 9px)", color: stat.peak ? "rgba(255,149,0,0.5)" : "rgba(255,255,255,0.28)", whiteSpace: "nowrap", marginTop: 1 }}>{stat.d}</span>
            {stat.badge ? (
              <span className="a2z-proof-ctx" style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "rgba(48,209,88,0.07)", border: "1px solid rgba(48,209,88,0.16)", borderRadius: 3, padding: "1px 4px", fontSize: "clamp(6px, 0.5vw, 8px)", color: "rgba(48,209,88,0.62)", marginTop: 2 }}>
                <svg width="5" height="4" viewBox="0 0 5 4" fill="none" aria-hidden="true"><polyline points="0.6,2 1.8,3.4 4.4,0.6" stroke="rgba(48,209,88,0.7)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {stat.ctx}
              </span>
            ) : (
              <span className="a2z-proof-ctx" style={{ fontSize: "clamp(6px, 0.5vw, 8px)", color: "rgba(255,255,255,0.14)", whiteSpace: "nowrap", marginTop: 1 }}>{stat.ctx}</span>
            )}
          </div>
        </span>
      ))}
    </div>
  );
}
