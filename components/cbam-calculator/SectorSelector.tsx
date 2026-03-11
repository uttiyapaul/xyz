"use client";

import type { SectorData } from "@/lib/products";

interface SectorSelectorProps {
  products: Record<string, SectorData>;
  selected: string;
  onSelect: (key: string) => void;
}

export function SectorSelector({ products, selected, onSelect }: SectorSelectorProps) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#4B5563",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        01 / SECTOR
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
        {Object.entries(products).map(([key, sec]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              padding: "10px 6px",
              background: selected === key ? sec.color + "18" : "transparent",
              border: `1px solid ${selected === key ? sec.color : "#1A1A24"}`,
              borderRadius: "3px",
              cursor: "pointer",
              color: selected === key ? sec.color : "#4B5563",
              fontFamily: "'DM Mono',monospace",
              fontSize: "9px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              transition: "all 0.15s",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "14px", marginBottom: "3px" }}>{sec.icon}</div>
            {sec.label}
          </button>
        ))}
      </div>
    </div>
  );
}
