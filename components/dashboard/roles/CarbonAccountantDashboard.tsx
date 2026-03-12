// components/dashboard/roles/CarbonAccountantDashboard.tsx
"use client";

import { CheckSquare, Database, AlertTriangle, Layers, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MOCK_METRICS = [
  { label: "Awaiting Calculation", value: "34", color: "#F59E0B", icon: Database },
  { label: "EF Coverage", value: "98.2%", color: "#10B981", icon: CheckSquare },
  { label: "Anomalies Detected", value: "2", color: "#EF4444", icon: AlertTriangle },
  { label: "Calculated Ratio", value: "85%", color: "#06B6D4", icon: Layers },
];

const MOCK_APPROVAL_QUEUE = [
  { id: "ACT-2091", type: "Grid Electricity", facility: "Site B", submittedBy: "Raj P.", amount: "12,450 kWh", status: "Needs Review" },
  { id: "ACT-2090", type: "Diesel Mobile", facility: "Fleet cars", submittedBy: "Amit K.", amount: "400 L", status: "Needs Approval" },
  { id: "ACT-2089", type: "Natural Gas", facility: "Site A", submittedBy: "Sonia T.", amount: "1,200 m³", status: "Needs Review" },
];

const UNCERTAINTY_DATA = [
  { name: "Scope 1", emissions: 120 },
  { name: "Scope 2", emissions: 450 },
  { name: "Scope 3", emissions: 2100 },
];

export function CarbonAccountantDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Carbon Accounting</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Calculate emissions, manage emission factors, and review data quality.</p>
        </div>
        <div>
          <button style={{
            background: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)",
            color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <Activity size={16} /> Run Calculation Engine
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
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
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        
        {/* Uncertainty Analysis */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", marginBottom: "8px" }}>Emissions Uncertainty (tCO₂e)</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px" }}>Confidence intervals based on data quality scores and EF variance.</p>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UNCERTAINTY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", color: "#E8E6DE" }}
                  itemStyle={{ color: "#E8E6DE" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="emissions" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items & Anomalies */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <AlertTriangle color="#EF4444" size={24} />
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#EF4444", margin: 0 }}>AI Anomaly Alerts</h2>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ padding: "12px 0", borderBottom: "1px solid rgba(239,68,68,0.1)", fontSize: "13px", color: "#FAFAF8" }}>
                <strong>Site A Electricity</strong>: Usage is 42% higher YoY compared to Feb 2025.
              </li>
              <li style={{ padding: "12px 0", fontSize: "13px", color: "#FAFAF8", paddingTop: "12px" }}>
                <strong>Fleet Diesel</strong>: Missing 3 expected transport logs for Q1.
              </li>
            </ul>
          </div>

          <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden", flex: 1 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Approval Queue</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#0D0D14" }}>
                    <th style={{ padding: "12px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>ID</th>
                    <th style={{ padding: "12px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Type</th>
                    <th style={{ padding: "12px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Amount</th>
                    <th style={{ padding: "12px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_APPROVAL_QUEUE.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #1A1A24", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "12px 24px", color: "#D1D5DB", fontFamily: "'JetBrains Mono', monospace" }}>{item.id}</td>
                      <td style={{ padding: "12px 24px", color: "#FAFAF8" }}>{item.type}</td>
                      <td style={{ padding: "12px 24px", color: "#9CA3AF" }}>{item.amount}</td>
                      <td style={{ padding: "12px 24px" }}>
                        <button style={{ background: "transparent", color: "#06B6D4", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px", padding: 0 }}>Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
