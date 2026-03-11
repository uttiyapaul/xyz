"use client";

// ─── Top header bar ───────────────────────────────────────────────────────────
export function CBAMHeader() {
  return (
    <div
      style={{
        padding: "20px 32px 18px",
        borderBottom: "1px solid #111120",
        background: "linear-gradient(180deg,#07070E 0%,#050508 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "10px",
            color: "#F59E0B",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          CBAM EXPOSURE CALCULATOR · EU Regulation 2023/956
        </div>
        <div
          style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "24px",
            color: "#FAFAF8",
            letterSpacing: "-0.5px",
          }}
        >
          India Export Carbon Cost
        </div>
      </div>

      <div
        style={{
          textAlign: "right",
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#374151",
          lineHeight: "1.8",
        }}
      >
        <div>DATA: EU Commission DVs 2026 · Reg. 2025/2620</div>
        <div>Phase-in: 2.5% (2026) → 100% (2034)</div>
        <div style={{ color: "#F59E0B88" }}>Free · No registration required</div>
      </div>
    </div>
  );
}
