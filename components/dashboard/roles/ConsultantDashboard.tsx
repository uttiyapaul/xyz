// components/dashboard/roles/ConsultantDashboard.tsx
"use client";

import { Users, Lightbulb, TrendingDown, Target, ArrowRight } from "lucide-react";

const MOCK_METRICS = [
  { label: "Active Clients Managed", value: "8", color: "#06B6D4", icon: Users },
  { label: "Upcoming Client Deadlines", value: "3", subtext: "Within 30 days", color: "#F59E0B", icon: Target },
  { label: "Avg Portfolio Data Quality", value: "B+", subtext: "Requires improvement", color: "#10B981", icon: TrendingDown },
];

const MOCK_CLIENT_PORTFOLIO = [
  { id: "ORG-001", name: "TechCorp Global", industry: "Technology", emissions: "24,500", trend: "-2.4%", status: "On Track" },
  { id: "ORG-002", name: "SteelWorks India", industry: "Manufacturing", emissions: "142,000", trend: "+5.1%", status: "At Risk" },
  { id: "ORG-003", name: "Logistics Pro", industry: "Transportation", emissions: "88,200", trend: "-1.2%", status: "On Track" },
];

export function ConsultantDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Advisory & Consulting</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Manage multiple client portfolios and model decarbonization scenarios.</p>
        </div>
        <div>
          <button style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
            color: "#FAFAF8", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <Lightbulb size={16} /> Open Scenario Modeler
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {MOCK_METRICS.map((metric) => (
          <div key={metric.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1 }}>
              <metric.icon size={48} color={metric.color} />
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>
              {metric.label}
            </div>
            <div style={{ fontSize: "36px", color: metric.color, fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>
              {metric.value}
            </div>
            {metric.subtext && (
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "8px", fontWeight: "500" }}>
                {metric.subtext}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        
        {/* Client Portfolio Table */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Client Portfolio Health</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0D0D14" }}>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Client Name</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Industry</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>YTD Emissions (tCO₂e)</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>YoY Trend</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CLIENT_PORTFOLIO.map((client, i) => (
                  <tr key={client.id} style={{ borderBottom: "1px solid #1A1A24", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "16px 24px", color: "#FAFAF8", fontWeight: "500" }}>{client.name}</td>
                    <td style={{ padding: "16px 24px", color: "#9CA3AF" }}>{client.industry}</td>
                    <td style={{ padding: "16px 24px", color: "#D1D5DB", fontFamily: "'JetBrains Mono', monospace" }}>{client.emissions}</td>
                    <td style={{ padding: "16px 24px", color: client.trend.startsWith('+') ? "#EF4444" : "#22C55E", fontFamily: "'JetBrains Mono', monospace" }}>{client.trend}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px",
                        background: client.status === "On Track" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: client.status === "On Track" ? "#22C55E" : "#EF4444",
                        whiteSpace: "nowrap"
                      }}>
                        {client.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <button style={{ background: "transparent", color: "#8B5CF6", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                        View <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decarbonization Scenario Modeler Snapshot */}
        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 16px 0" }}>Scenario Modeler</h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", lineHeight: "1.5" }}>Test decarbonization strategies to advise clients on highest-ROI initiatives.</p>
          
          <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Active Scenario: TechCorp Global</div>
            <div style={{ fontSize: "14px", color: "#FAFAF8", fontWeight: "500", marginBottom: "8px" }}>Switch 40% Grid Electricity to Solar PPA</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Est. Reduction:</span>
              <span style={{ fontSize: "14px", color: "#22C55E", fontWeight: "600" }}>-2,450 tCO₂e</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Est. CAPEX:</span>
              <span style={{ fontSize: "14px", color: "#F59E0B", fontWeight: "600" }}>$450,000</span>
            </div>
          </div>

          <button style={{ background: "transparent", color: "#8B5CF6", border: "1px solid #8B5CF6", padding: "10px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%" }}>
            Create New Scenario
          </button>
        </div>

      </div>
    </div>
  );
}
