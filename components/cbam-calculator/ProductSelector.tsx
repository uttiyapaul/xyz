"use client";

import type { Product, SectorData } from "@/lib/products";

interface ProductSelectorProps {
  sectorData: SectorData;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductSelector({ sectorData, selectedId, onSelect }: ProductSelectorProps) {
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
        02 / PRODUCT
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {sectorData.items.map((p: Product) => (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              padding: "10px 12px",
              background: selectedId === p.id ? sectorData.color + "15" : "#0D0D14",
              border: `1px solid ${selectedId === p.id ? sectorData.color + "60" : "#111120"}`,
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: selectedId === p.id ? "#FAFAF8" : "#9CA3AF",
                    fontWeight: selectedId === p.id ? "600" : "400",
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "9px",
                    color: "#374151",
                    marginTop: "2px",
                  }}
                >
                  CN {p.cn} · {p.route}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "11px",
                    color: sectorData.color,
                  }}
                >
                  {(p.worldDefault * p.indiaF).toFixed(2)}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "9px",
                    color: "#374151",
                  }}
                >
                  tCO₂e/t
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
