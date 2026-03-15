"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import DataStreamCanvas from "./DataStreamCanvas";
import styles from "./HeroSection.module.css";

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
  ssr: false,
  loading: () => null,
});

type DescriptorIndentClass =
  | "descriptorIndentMeasure"
  | "descriptorIndentCapture"
  | "descriptorIndentProve"
  | "descriptorIndentComply"
  | "descriptorIndentTrade"
  | "descriptorIndentIntelligence";

type LiveValueClass =
  | "liveValueSuccess"
  | "liveValueWarning"
  | "liveValueBrand";

type LiveSubClass =
  | "liveSubMuted"
  | "liveSubWarning"
  | "liveSubPositive";

type LiveAccentClass =
  | "liveAccentSuccess"
  | "liveAccentWarning"
  | "liveAccentBrand";

interface LiveRow {
  id: string;
  label: string;
  value: string;
  valueSuffix?: string;
  sub: string;
  valueClass: LiveValueClass;
  subClass: LiveSubClass;
  accentClass: LiveAccentClass;
}

interface ProofStat {
  value: string;
  description: string;
  context: string;
  isPeak?: boolean;
  isLive?: boolean;
  isBadge?: boolean;
}

const DESCRIPTOR_LINES: Array<{
  text: string;
  indentClass: DescriptorIndentClass;
}> = [
  { text: "Measure.", indentClass: "descriptorIndentMeasure" },
  { text: "Capture.", indentClass: "descriptorIndentCapture" },
  { text: "Prove.", indentClass: "descriptorIndentProve" },
  { text: "Comply.", indentClass: "descriptorIndentComply" },
  { text: "Trade.", indentClass: "descriptorIndentTrade" },
  { text: "Intelligence.", indentClass: "descriptorIndentIntelligence" },
];

const TRUST_ITEMS = [
  "GDPR Compliant",
  "ISO 14064-3 Ready",
  "SOC 2 Pursuing",
  "CBAM 2026 Ready",
] as const;

const LIVE_ROWS: LiveRow[] = [
  {
    id: "audit",
    label: "Audit Chain",
    value: "Verified",
    sub: "Hash-signed / 14:32 IST",
    valueClass: "liveValueSuccess",
    subClass: "liveSubMuted",
    accentClass: "liveAccentSuccess",
  },
  {
    id: "cbam",
    label: "CBAM 2026",
    value: "EUR 2.1M",
    sub: "Estimated liability",
    valueClass: "liveValueWarning",
    subClass: "liveSubWarning",
    accentClass: "liveAccentWarning",
  },
  {
    id: "scope1",
    label: "Scope 1",
    value: "45,200",
    valueSuffix: " tCO2e",
    sub: "Down 14.2% vs PY",
    valueClass: "liveValueBrand",
    subClass: "liveSubPositive",
    accentClass: "liveAccentBrand",
  },
  {
    id: "anomalies",
    label: "AI Anomalies",
    value: "0",
    valueSuffix: " today",
    sub: "Last 24h / real-time",
    valueClass: "liveValueSuccess",
    subClass: "liveSubMuted",
    accentClass: "liveAccentSuccess",
  },
  {
    id: "scope3",
    label: "Scope 3 Coverage",
    value: "68%",
    sub: "Up 14% YTD",
    valueClass: "liveValueBrand",
    subClass: "liveSubPositive",
    accentClass: "liveAccentBrand",
  },
];

const PROOF_STATS: ProofStat[] = [
  { value: "210+", description: "Facilities Monitored", context: "across 14 countries" },
  { value: "EUR 3.1M+", description: "CBAM Penalties Avoided", context: "since 2023", isPeak: true },
  { value: "14", description: "Countries", context: "EU / IN / UAE / AU" },
  { value: "1.2Mt+", description: "CO2 Tracked", context: "ISO 14064-3 verified", isBadge: true },
  { value: "99.9%", description: "Audit Integrity", context: "live / hash-chained", isLive: true },
];

const proofStatClassNames = [
  styles.proofStatOne,
  styles.proofStatTwo,
  styles.proofStatThree,
  styles.proofStatFour,
  styles.proofStatFive,
] as const;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * Public landing hero.
 *
 * Why this file exists:
 * - Owns the live public first impression for the platform.
 * - Keeps the globe, data stream, public controls, and proof messaging in one
 *   place while avoiding inline CSS and injected style tags.
 * - Provides a stable public pre-production surface without relying on demo-only
 *   placeholders.
 */
export default function HeroSection() {
  const [year, setYear] = useState(2020);
  const [showFlights, setShowFlights] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  return (
    <section id="home" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.globeLayer}>
        <GlobeCanvas year={year} showFlights={showFlights} showTrades={showTrades} />
      </div>

      <DataStreamCanvas />

      <div aria-hidden="true" className={classNames(styles.overlay, styles.leftOverlay)} />
      <div aria-hidden="true" className={classNames(styles.overlay, styles.rightOverlay)} />
      <div aria-hidden="true" className={classNames(styles.overlay, styles.vignetteOverlay)} />

      <div className={styles.heroGrid}>
        <TextColumn />

        <div className={styles.centerColumn}>
          <ScrollCue />
        </div>

        <LiveDataPanel />
      </div>

      <div className={styles.controlsAnchor}>
        <CompactControls
          year={year}
          onYearChange={setYear}
          showFlights={showFlights}
          onToggleFlights={setShowFlights}
          showTrades={showTrades}
          onToggleTrades={setShowTrades}
        />
      </div>

      <div className={styles.proofAnchor}>
        <ProofBar />
      </div>
    </section>
  );
}

function TextColumn() {
  return (
    <motion.div
      className={styles.textColumn}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.eyebrow}>
        <span aria-hidden="true" className={styles.eyebrowDot} />
        <span className={styles.eyebrowText}>A2Z Carbon Solutions Platform</span>
      </div>

      <div className={styles.headlineBlock}>
        <span className={styles.headlineLead}>The Full</span>
        <span id="hero-heading" className={styles.headlinePrimary}>
          Carbon Stack.
        </span>
        {DESCRIPTOR_LINES.map((line) => (
          <span
            key={line.text}
            className={classNames(styles.descriptorLine, styles[line.indentClass])}
          >
            {line.text}
          </span>
        ))}
        <span className={styles.headlineContext}>Enterprise carbon management platform</span>
      </div>

      <p className={styles.subParagraph}>
        A2Z operates across the <strong className={styles.subParagraphStrong}>entire carbon lifecycle</strong> -
        real-time GHG tracking, CBAM automation, amine manufacturing and turnkey CCS delivery.
      </p>

      <div className={styles.ctaRow}>
        <a href="#demo" className={styles.ctaPrimary}>
          Book a Demo -&gt;
        </a>
        <a href="/calculator" className={styles.ctaGhost}>
          Free CBAM Calculator
        </a>
      </div>

      <div className={styles.trustRow}>
        {TRUST_ITEMS.map((label, index) => (
          <span key={label} className={styles.trustItem}>
            {index > 0 ? <span aria-hidden="true" className={styles.trustDivider} /> : null}
            <span className={styles.trustBadge}>
              <span className={styles.trustBadgeIcon}>
                <svg width="6" height="5" viewBox="0 0 6 5" fill="none" aria-hidden="true">
                  <polyline
                    points="0.8,3 2.4,4.8 5.6,0.8"
                    stroke="#30d158"
                    strokeWidth="1.3"
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
    </motion.div>
  );
}

interface CompactControlsProps {
  year: number;
  onYearChange: (year: number) => void;
  showFlights: boolean;
  onToggleFlights: (value: boolean) => void;
  showTrades: boolean;
  onToggleTrades: (value: boolean) => void;
}

function CompactControls({
  year,
  onYearChange,
  showFlights,
  onToggleFlights,
  showTrades,
  onToggleTrades,
}: CompactControlsProps) {
  return (
    <div className={styles.controlsShell}>
      <span className={styles.controlsLabel}>Year</span>
      <div className={styles.sliderTrack}>
        <input
          type="range"
          min={2000}
          max={2024}
          step={1}
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
          aria-label="Select display year"
          className={styles.slider}
        />
      </div>
      <span className={styles.yearValue}>{year}</span>
      <span aria-hidden="true" className={styles.controlsDivider} />
      <TogglePill
        label="Flights"
        kind="flights"
        active={showFlights}
        onToggle={() => onToggleFlights(!showFlights)}
      />
      <TogglePill
        label="Trades"
        kind="trades"
        active={showTrades}
        onToggle={() => onToggleTrades(!showTrades)}
      />
    </div>
  );
}

function TogglePill({
  label,
  kind,
  active,
  onToggle,
}: {
  label: string;
  kind: "flights" | "trades";
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={classNames(
        styles.togglePill,
        kind === "flights" ? styles.toggleFlights : styles.toggleTrades,
        active && (kind === "flights" ? styles.toggleFlightsActive : styles.toggleTradesActive),
      )}
    >
      {label}
    </button>
  );
}

function ScrollCue() {
  const handleScroll = () => {
    const footer =
      document.getElementById("footer") ??
      document.querySelector("footer") ??
      document.querySelector(".sec:last-of-type");

    if (footer instanceof HTMLElement) {
      footer.scrollIntoView({ behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <button type="button" onClick={handleScroll} aria-label="Scroll to explore" className={styles.scrollCue}>
      <span className={styles.scrollCueLabel}>EXPLORE</span>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="9" height="15" rx="4.5" className={styles.scrollCueFrame} />
        <rect x="4" y="3" width="2" height="4" rx="1" className={styles.scrollCueWheel} />
      </svg>
    </button>
  );
}

function LiveDataPanel() {
  return (
    <motion.aside
      aria-label="Live platform data"
      className={styles.panelColumn}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.panelHeader}>
        <span className={styles.panelHeaderLabel}>Live data</span>
        <span aria-hidden="true" className={styles.panelLiveDot} />
        <span className={styles.panelHeaderStatus}>LIVE</span>
      </div>

      {LIVE_ROWS.map((row, index) => (
        <div
          key={row.id}
          className={classNames(
            styles.liveRow,
            index === LIVE_ROWS.length - 1 ? styles.liveRowLast : undefined,
          )}
        >
          <span aria-hidden="true" className={classNames(styles.liveAccent, styles[row.accentClass])} />
          <span className={styles.liveLabel}>{row.label}</span>
          <span className={classNames(styles.liveValue, styles[row.valueClass])}>
            {row.value}
            {row.valueSuffix ? <span className={styles.liveValueSuffix}>{row.valueSuffix}</span> : null}
          </span>
          <span className={classNames(styles.liveSub, styles[row.subClass])}>{row.sub}</span>
        </div>
      ))}
    </motion.aside>
  );
}

function ProofBar() {
  return (
    <div role="region" aria-label="Platform statistics" className={styles.proofBar}>
      <span aria-hidden="true" className={styles.proofSweep} />
      <span className={styles.proofLabel}>Trusted across</span>

      {PROOF_STATS.map((stat, index) => (
        <span
          key={stat.description}
          className={classNames(styles.proofStat, proofStatClassNames[index])}
        >
          <span aria-hidden="true" className={styles.proofDivider} />
          <span className={styles.proofBody}>
            <span
              className={classNames(
                styles.proofNum,
                stat.isPeak && styles.proofNumPeak,
              )}
            >
              {stat.value}
              {stat.isLive ? <span aria-hidden="true" className={styles.proofPulse} /> : null}
            </span>
            <span
              className={classNames(
                styles.proofDescription,
                stat.isPeak && styles.proofDescriptionPeak,
              )}
            >
              {stat.description}
            </span>
            {stat.isBadge ? (
              <span className={classNames(styles.proofContext, styles.proofContextBadge)}>
                <svg width="5" height="4" viewBox="0 0 5 4" fill="none" aria-hidden="true">
                  <polyline
                    points="0.6,2 1.8,3.4 4.4,0.6"
                    stroke="rgba(48,209,88,0.7)"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {stat.context}
              </span>
            ) : (
              <span className={styles.proofContext}>{stat.context}</span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}
