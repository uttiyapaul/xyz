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
      style={{ background: "#010812", position: "relative", width: "100%", overflow: "hidden" }}
    >
      {/* Subtle data streams — left edge only, 28px wide */}
      <DataStreamCanvas />

      {/* ── 3-COLUMN HERO GRID ── */}
      <div
        className="a2z-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "38% 1fr 16%",
          minHeight: "clamp(480px, 82svh, 700px)",
          paddingTop: 68, // reserve space for fixed navbar above
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── COL 1: TEXT ── */}
        <TextColumn />

        {/* ── COL 2: GLOBE ── */}
        <div
          className="a2z-globe-col"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "16px 0" }}
        >
          <GlobeCanvas year={year} showFlights={showFlights} showTrades={showTrades} />

          {/* Controls — compact pill pinned to bottom of globe column */}
          <CompactControls
            year={year}
            onYearChange={setYear}
            showFlights={showFlights}
            onToggleFlights={setShowFlights}
            showTrades={showTrades}
            onToggleTrades={setShowTrades}
          />

          {/* Scroll indicator — links to last section */}
          <ScrollCue />
        </div>

        {/* ── COL 3: LIVE DATA PANEL ── */}
        <LiveDataPanel />
      </div>

      {/* ── PROOF BAR ── */}
      <ProofBar />

      {/* ── RESPONSIVE OVERRIDES ── */}
      <style>{`
        /* Tablet: hide panel, stack globe below text */
        @media (max-width: 900px) {
          .a2z-hero-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .a2z-panel-col {
            display: none !important;
          }
        }
        /* Mobile / PWA */
        @media (max-width: 640px) {
          .a2z-hero-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .a2z-globe-col {
            height: 300px;
            min-height: 260px;
          }
          .a2z-proof-bar {
            flex-wrap: wrap;
            gap: 0;
          }
          .a2z-proof-stat {
            padding: 6px 10px;
          }
          .a2z-proof-ctx {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .a2z-live-dot,
          .a2z-proof-pulse,
          .a2z-proof-sweep,
          .a2z-badge-dot,
          .a2z-scroll-inner {
            animation: none !important;
          }
        }
        /* Global keyframes */
        @keyframes a2z-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
        @keyframes a2z-sweep {
          0%, 100% { opacity: 0; transform: translateX(-90%); }
          50%       { opacity: 1; transform: translateX(90%); }
        }
        @keyframes a2z-scroll-bob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        @keyframes a2z-scroll-inner {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50%       { transform: translateY(6px); opacity: 0.4; }
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
        padding: "clamp(24px,4vh,52px) 0 clamp(20px,3vh,40px) clamp(24px,3vw,52px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Badge pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,212,255,0.07)",
          border: "1px solid rgba(0,212,255,0.18)",
          borderRadius: 9999,
          padding: "4px 12px",
          marginBottom: 14,
          width: "fit-content",
        }}
      >
        <span
          className="a2z-badge-dot"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#00d4ff",
            flexShrink: 0,
            animation: "a2z-blink 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "rgba(0,212,255,0.75)",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          A2Z Carbon Solutions Platform
        </span>
      </div>

      {/* Headline block */}
      <div style={{ marginBottom: "clamp(10px, 1.8vh, 18px)" }}>
        {/* "The Full" — larger brand anchor */}
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(18px, 2.6vw, 28px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.02em",
            lineHeight: 1.18,
          }}
        >
          The Full
        </span>

        {/* "Carbon Stack." — gradient, largest */}
        <span
          id="hero-heading"
          style={{
            display: "block",
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(22px, 3.2vw, 34px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            background: BRAND_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 2,
          }}
        >
          Carbon Stack.
        </span>

        {/* Descriptor lines — ALL same size, weight, colour */}
        {DESCRIPTOR_LINES.map(({ text, indent }) => (
          <span
            key={text}
            style={{
              display: "block",
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: "clamp(14px, 1.9vw, 20px)",
              fontWeight: 600,
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "-0.01em",
              lineHeight: 1.22,
              paddingRight: indent,
            }}
          >
            {text}
          </span>
        ))}

        {/* Micro tag line */}
        <span
          style={{
            display: "block",
            fontSize: "clamp(9px, 0.9vw, 11px)",
            color: "rgba(255,255,255,0.25)",
            fontWeight: 400,
            letterSpacing: "0.08em",
            marginTop: 6,
          }}
        >
          Enterprise carbon management platform
        </span>
      </div>

      {/* Sub paragraph */}
      <p
        style={{
          fontSize: "clamp(12px, 1.1vw, 14px)",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.72,
          marginBottom: "clamp(14px, 2vh, 22px)",
          maxWidth: 340,
        }}
      >
        A2Z operates across the{" "}
        <strong style={{ color: "rgba(255,255,255,0.65)" }}>entire carbon lifecycle</strong>{" "}
        — real-time GHG tracking, CBAM automation, amine manufacturing and turnkey CCS delivery.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "clamp(12px, 2vh, 18px)", flexWrap: "wrap" }}>
        <a href="#demo" style={primaryBtnStyle}>Book a Demo →</a>
        <a href="/calculator" style={ghostBtnStyle}>Free CBAM Calculator</a>
      </div>

      {/* Trust badges */}
      <TrustBadges />
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
    const footer = document.getElementById("footer") || document.querySelector("footer") || document.querySelector(".sec:last-of-type");
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
        bottom: "clamp(10px, 2vh, 20px)",
        left: "18%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        opacity: 0.42,
        animation: "a2z-scroll-bob 2.8s ease-in-out infinite",
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-mono)",
        }}
      >
        EXPLORE
      </span>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="9" height="15" rx="4.5" stroke="rgba(255,255,255,0.25)" />
        <rect
          x="4"
          y="3"
          width="2"
          height="4"
          rx="1"
          fill="rgba(0,212,255,0.5)"
          className="a2z-scroll-inner"
          style={{ animation: "a2z-scroll-inner 2.8s ease-in-out infinite" }}
        />
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
    <motion.aside
      className="a2z-panel-col"
      aria-label="Live platform data"
      style={{
        borderLeft: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        background: "rgba(3,8,18,0.65)",
      }}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "8px 10px 7px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 8,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.2)",
            fontWeight: 600,
          }}
        >
          Live data
        </span>
        <span
          className="a2z-live-dot"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#30d158",
            marginLeft: "auto",
            animation: "a2z-blink 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 7, color: "rgba(48,209,88,0.55)", letterSpacing: "0.1em" }}>
          LIVE
        </span>
      </div>

      {/* Data rows */}
      {LIVE_ROWS.map((row, i) => (
        <div
          key={row.id}
          style={{
            padding: "8px 10px",
            borderBottom: i < LIVE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
            cursor: "default",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Left accent bar — status colour before reading text */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "22%",
              bottom: "22%",
              width: 2,
              borderRadius: 1,
              background: row.accent,
            }}
          />

          {/* Label */}
          <span
            style={{
              fontSize: 7,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.09em",
            }}
          >
            {row.label}
          </span>

          {/* Value */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(11px, 1.2vw, 14px)",
              fontWeight: 700,
              color: row.valueColor,
              lineHeight: 1.15,
            }}
          >
            {row.value}
            {row.valueSuffix && (
              <span style={{ fontSize: 8, color: row.valueColor, opacity: 0.5, fontWeight: 400, fontFamily: "var(--font-body)" }}>
                {row.valueSuffix}
              </span>
            )}
          </span>

          {/* Sub */}
          <span style={{ fontSize: 7, color: row.subColor, lineHeight: 1.3 }}>
            {row.sub}
          </span>
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
    <div
      className="a2z-proof-bar"
      role="region"
      aria-label="Platform statistics"
      style={{
        background: "rgba(4,10,22,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "10px clamp(20px, 4vw, 56px)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        flexWrap: "nowrap",
        position: "relative",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Shimmer sweep — draws eye through sequence */}
      <span
        className="a2z-proof-sweep"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 5%, rgba(0,212,255,0.018) 50%, transparent 95%)",
          animation: "a2z-sweep 5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <span
        style={{
          fontSize: "clamp(8px, 0.7vw, 10px)",
          color: "rgba(255,255,255,0.16)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          paddingRight: "clamp(8px, 1.5vw, 16px)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Trusted across
      </span>

      {PROOF_STATS.map((stat, i) => (
        <span key={stat.d} style={{ display: "flex", alignItems: "center" }}>
          {/* Separator */}
          <span
            style={{
              width: 1,
              background: "rgba(255,255,255,0.07)",
              margin: "4px 0",
              alignSelf: "stretch",
            }}
          />

          {/* Stat block */}
          <div
            className="a2z-proof-stat"
            style={{
              textAlign: "center",
              padding: "0 clamp(8px, 1.5vw, 16px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Number */}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: stat.peak ? "clamp(14px, 1.6vw, 18px)" : "clamp(12px, 1.3vw, 15px)",
                color: stat.peak ? "#ff9500" : "rgba(255,255,255,0.82)",
                display: "flex",
                alignItems: "center",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {stat.n}
              {stat.live && (
                <span
                  className="a2z-proof-pulse"
                  aria-label="live"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#30d158",
                    display: "inline-block",
                    marginLeft: 4,
                    animation: "a2z-blink 2s ease-in-out infinite",
                  }}
                />
              )}
            </span>

            {/* Label */}
            <span
              style={{
                fontSize: "clamp(8px, 0.7vw, 10px)",
                color: stat.peak ? "rgba(255,149,0,0.5)" : "rgba(255,255,255,0.28)",
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
            >
              {stat.d}
            </span>

            {/* Context / badge */}
            {stat.badge ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  background: "rgba(48,209,88,0.07)",
                  border: "1px solid rgba(48,209,88,0.16)",
                  borderRadius: 3,
                  padding: "1px 5px",
                  fontSize: "clamp(7px, 0.6vw, 9px)",
                  color: "rgba(48,209,88,0.62)",
                  marginTop: 2,
                }}
              >
                <svg width="6" height="5" viewBox="0 0 6 5" fill="none" aria-hidden="true">
                  <polyline points="0.8,2.5 2.2,4.2 5.2,0.8" stroke="rgba(48,209,88,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {stat.ctx}
              </span>
            ) : (
              <span
                className="a2z-proof-ctx"
                style={{
                  fontSize: "clamp(7px, 0.6vw, 9px)",
                  color: "rgba(255,255,255,0.14)",
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                {stat.ctx}
              </span>
            )}
          </div>
        </span>
      ))}
    </div>
  );
}
