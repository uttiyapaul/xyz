// components/dashboard/CarbonAccountantDashboard.tsx
"use client";

export function CarbonAccountantDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE" }}>
      <h1 style={{ fontSize: "24px", color: "#FAFAF8", marginBottom: "8px" }}>Carbon Accounting</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>Inventory management & calculations</p>
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "12px" }}>Inventory Status</h2>
        <p style={{ fontSize: "13px", color: "#6B7280" }}>No inventory data available</p>
      </div>
    </div>
  );
}
