"use client";

import { AnimNum } from "./AnimNum";

interface KPICardsProps {
  cost2026: number;
  cost2030: number;
  cost2034: number;
  inrRate: number;
}

export function KPICards({ cost2026, cost2030, cost2034, inrRate }: KPICardsProps) {
  const cards = [
    { label: "2026 (2.5%)",  val: cost2026, inrVal: cost2026 * inrRate, tag: "First year",  color: "#F59E0B" },
    { label: "2030 (48.5%)", val: cost2030, inrVal: cost2030 * inrRate, tag: "Mid-point",   color: "#F97316" },
    { label: "2034 (100%)",  val: cost2034, inrVal: cost2034 * inrRate, tag: "Full CBAM",   color: "#EF4444" },
  ];

  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#4B5563",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        ANNUAL CBAM EXPOSURE — INDIA DEFAULT VALUES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              background: "#0D0D14",
              border: `1px solid ${c.color}40`,
              borderRadius: "4px",
              padding: "16px",
              animation: "fadeUp 0.4s ease forwards",
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "9px",
                color: c.color,
                letterSpacing: "1.5px",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "20px",
                color: "#FAFAF8",
                fontWeight: "500",
                marginBottom: "4px",
              }}
            >
              <AnimNum value={c.val} prefix="€" />
            </div>
            <div
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "13px",
                color: c.color,
                marginBottom: "8px",
              }}
            >
              <AnimNum value={c.inrVal} prefix="₹" />
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "9px", color: "#374151" }}>
              {c.tag}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
