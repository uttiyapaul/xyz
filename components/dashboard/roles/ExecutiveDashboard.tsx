// components/dashboard/ExecutiveDashboard.tsx
"use client";

export function ExecutiveDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE" }}>
      <h1 style={{ fontSize: "24px", color: "#FAFAF8", marginBottom: "8px" }}>Executive Dashboard</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>High-level metrics & reports</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Emissions", value: "0 tCO₂e", color: "#EF4444" },
          { label: "Target Progress", value: "0%", color: "#F59E0B" },
          { label: "Compliance Status", value: "On Track", color: "#22C55E" },
        ].map(card => (
          <div key={card.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "24px", color: card.color, fontWeight: "600" }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
