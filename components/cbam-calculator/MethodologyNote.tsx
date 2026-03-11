"use client";

interface MethodologyNoteProps {
  indiaF: number;
}

export function MethodologyNote({ indiaF }: MethodologyNoteProps) {
  return (
    <div
      style={{
        background: "#0A0A0F",
        border: "1px solid #1A1A24",
        borderRadius: "3px",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          color: "#374151",
          letterSpacing: "2px",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        METHODOLOGY
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#374151",
          lineHeight: "1.8",
        }}
      >
        CBAM certificates = CBAMfactor × max(0, EmbeddedEmissions − CSCF × BMg_B) × Tonnage
        · CSCF = 0.87 · BMg_B from Reg. 2025/2620 Col B · India defaults = world avg ×{" "}
        {indiaF}× (estimated) ·{" "}
        <span style={{ color: "#F59E0B" }}>
          Illustrative only. Engage a qualified CBAM advisor for official declarations.
        </span>
      </div>
    </div>
  );
}
