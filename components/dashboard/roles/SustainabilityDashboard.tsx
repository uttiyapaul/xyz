// components/dashboard/SustainabilityDashboard.tsx
"use client";

import { useAuth } from "@/context/AuthContext";

export function SustainabilityDashboard() {
  const { orgIds } = useAuth();

  return (
    <div style={{ padding: "32px", color: "#E8E6DE" }}>
      <h1 style={{ fontSize: "24px", color: "#FAFAF8", marginBottom: "8px" }}>Sustainability Dashboard</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>Emissions tracking & climate targets</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Scope 1", value: "0", unit: "tCO₂e", color: "#EF4444" },
          { label: "Scope 2", value: "0", unit: "tCO₂e", color: "#F59E0B" },
          { label: "Scope 3", value: "0", unit: "tCO₂e", color: "#06B6D4" },
          { label: "Total", value: "0", unit: "tCO₂e", color: "#22C55E" },
        ].map(card => (
          <div key={card.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "28px", color: card.color, fontWeight: "600" }}>{card.value}</div>
            <div style={{ fontSize: "10px", color: "#4B5563", marginTop: "4px" }}>{card.unit}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>Climate Targets</h2>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>No targets configured yet</p>
      </div>
    </div>
  );
}
