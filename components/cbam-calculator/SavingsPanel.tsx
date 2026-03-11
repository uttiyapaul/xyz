"use client";

import { AnimNum } from "./AnimNum";

interface SavingsPanelProps {
  saving2034: number;
  cumulativeSaving: number;
  indiaDefault: number;
  actualVerified: number;
  inrRate: number;
}

export function SavingsPanel({
  saving2034,
  cumulativeSaving,
  indiaDefault,
  actualVerified,
  inrRate,
}: SavingsPanelProps) {
  if (saving2034 <= 0) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#0A1F0F,#0D1A10)",
        border: "1px solid #22C55E40",
        borderRadius: "4px",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "20px",
        animation: "fadeUp 0.4s ease 0.3s forwards",
        opacity: 0,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "9px",
            color: "#22C55E",
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          ANNUAL SAVING IN 2034
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "22px",
            color: "#22C55E",
            fontWeight: "500",
          }}
        >
          <AnimNum value={saving2034 * inrRate / 100000} prefix="₹" suffix=" lakh" decimals={1} />
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "11px",
            color: "#166534",
            marginTop: "4px",
          }}
        >
          <AnimNum value={saving2034} prefix="€" />
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "9px",
            color: "#22C55E",
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          8-YEAR CUMULATIVE SAVING
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "22px",
            color: "#FAFAF8",
            fontWeight: "500",
          }}
        >
          <AnimNum value={cumulativeSaving * inrRate / 100000} prefix="₹" suffix=" lakh" />
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "11px",
            color: "#166534",
            marginTop: "4px",
          }}
        >
          2026–2034 total
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "9px",
            color: "#166534",
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          BY SWITCHING TO
        </div>
        <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: "1.6" }}>
          Verified actual emissions vs India penalty default
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "9px",
            color: "#374151",
            marginTop: "6px",
          }}
        >
          ({indiaDefault.toFixed(2)} → {actualVerified.toFixed(2)} tCO₂e/t)
        </div>
      </div>
    </div>
  );
}
