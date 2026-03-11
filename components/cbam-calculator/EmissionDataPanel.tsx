"use client";

import type { Product } from "@/lib/products";

interface EmissionDataPanelProps {
  product: Product;
}

export function EmissionDataPanel({ product }: EmissionDataPanelProps) {
  const indiaDefault   = product.worldDefault * product.indiaF;
  const actualVerified = product.worldDefault * 0.87;

  const rows: [string, string, string][] = [
    ["World avg default",        product.worldDefault.toFixed(2),  "#6B7280"],
    ["India default (est.)",     indiaDefault.toFixed(2),          "#F59E0B"],
    ["Actual verified (est.)",   actualVerified.toFixed(2),        "#22C55E"],
    ["EU Benchmark BMg (Col B)", product.bmgB.toFixed(3),          "#6366F1"],
  ];

  return (
    <div
      style={{
        background: "#0D0D14",
        border: "1px solid #111120",
        borderRadius: "3px",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "9px",
          color: "#374151",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        EMISSION DATA
      </div>
      {rows.map(([label, val, color]) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "5px 0",
            borderBottom: "1px solid #111120",
          }}
        >
          <span style={{ fontSize: "11px", color: "#6B7280" }}>{label}</span>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "12px",
              color,
              fontWeight: "600",
            }}
          >
            {val} tCO₂e/t
          </span>
        </div>
      ))}
    </div>
  );
}
