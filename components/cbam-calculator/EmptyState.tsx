"use client";

export function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        textAlign: "center",
        padding: "60px 40px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "10px",
          color: "#374151",
          letterSpacing: "3px",
          marginBottom: "20px",
        }}
      >
        ENTER EXPORT VOLUME TO CALCULATE
      </div>
      <div
        style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: "32px",
          color: "#1A1A24",
          lineHeight: "1.3",
          maxWidth: "360px",
        }}
      >
        How much will CBAM cost your EU exports?
      </div>
      <div
        style={{
          marginTop: "24px",
          fontFamily: "'DM Mono',monospace",
          fontSize: "11px",
          color: "#374151",
          lineHeight: "1.8",
        }}
      >
        <div>Based on EU Commission Regulation 2025/2620</div>
        <div>Actual benchmark values from official documents</div>
        <div>Phase-in trajectory 2026 → 2034</div>
      </div>
    </div>
  );
}
