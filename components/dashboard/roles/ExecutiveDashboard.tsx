// components/dashboard/roles/ExecutiveDashboard.tsx
"use client";

import { Download, TrendingDown, AlertCircle, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

const MOCK_FINANCIALS = [
  { label: "Carbon Liability (ETS/CBAM)", value: "€ 412k", trend: "+12% YoY", color: "#EF4444", icon: AlertCircle },
  { label: "Carbon Intensity", value: "142", subtext: "tCO₂e per €1M Rev", color: "#F59E0B", icon: TrendingDown },
  { label: "Carbon Credit Portfolio", value: "1,200", subtext: "Verified ARR", color: "#10B981", icon: Leaf },
];

const MOCK_BUDGET_VS_ACTUAL = [
  { quarter: "Q1", budget: 120000, actual: 115000 },
  { quarter: "Q2", budget: 120000, actual: 128000 },
  { quarter: "Q3", budget: 120000, actual: 110000 },
  { quarter: "Q4", budget: 120000, actual: 142000 },
];

const MOCK_PEER_BENCHMARK = [
  { name: "Your Org", intensity: 142, fill: "#FAFAF8" },
  { name: "Peer Avg", intensity: 165, fill: "#374151" },
  { name: "Top 10%", intensity: 98, fill: "#22C55E" },
];

export function ExecutiveDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Executive & Finance</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Financial materiality, carbon liabilities, and strategic benchmarking.</p>
        </div>
        <div>
          <button style={{
            background: "#FAFAF8",
            color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <Download size={16} /> Generate Board Pack
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {MOCK_FINANCIALS.map((metric) => (
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
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "8px", fontWeight: "500" }}>
              {metric.trend || metric.subtext}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Budget vs Actual Carbon Expenditure */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", marginBottom: "8px" }}>Carbon Expenditure: Budget vs Actual (€)</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px" }}>Tracking ETS allowance purchases and carbon taxes.</p>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width={undefined} height="100%">
              <BarChart data={MOCK_BUDGET_VS_ACTUAL} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" vertical={false} />
                <XAxis dataKey="quarter" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `€${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", color: "#E8E6DE" }}
                  itemStyle={{ color: "#E8E6DE" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Bar dataKey="budget" name="Budget" fill="#374151" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="actual" name="Actual Spend" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peer Benchmarking */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", marginBottom: "8px" }}>Peer Benchmarking</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px" }}>Carbon Intensity vs Industry Segment</p>
          <div style={{ flex: 1, minHeight: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PEER_BENCHMARK} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" horizontal={false} />
                <XAxis type="number" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#FAFAF8" tick={{ fill: '#FAFAF8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", color: "#E8E6DE" }}
                  itemStyle={{ color: "#E8E6DE" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="intensity" name="Intensity (tCO₂e/€1M)" radius={[0, 4, 4, 0]} barSize={32}>
                  {MOCK_PEER_BENCHMARK.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
}
