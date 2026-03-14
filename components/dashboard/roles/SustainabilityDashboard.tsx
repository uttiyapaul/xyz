// components/dashboard/roles/SustainabilityDashboard.tsx
"use client";

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Calendar, Euro, Target, AlertTriangle, FileCheck } from "lucide-react";

const CHART_COLORS = ['#EF4444', '#F59E0B', '#06B6D4'];
const SCOPE_DATA = [
  { name: 'Scope 1', value: 1250 },
  { name: 'Scope 2', value: 3400 },
  { name: 'Scope 3', value: 18500 },
];

const TRAJECTORY_DATA = [
  { year: '2023', actual: 23150, target: 23150 },
  { year: '2024', actual: 21400, target: 21500 },
  { year: '2025', actual: 19800, target: 20000 },
  { year: '2026', actual: null, target: 18500 },
  { year: '2027', actual: null, target: 17000 },
];

export function SustainabilityDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Sustainability & Compliance</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Strategic overview of emissions trajectory and regulatory obligations.</p>
        </div>
        <div>
          <button style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <FileCheck size={16} /> Submit Formal Declaration
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1 }}><Target size={48} color="#22C55E" /></div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Total Footprint (YTD)</div>
          <div style={{ fontSize: "32px", color: "#22C55E", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>23,150 <span style={{fontSize: "14px", color: "#6B7280"}}>tCO₂e</span></div>
          <div style={{ fontSize: "12px", color: "#10B981", marginTop: "8px", fontWeight: "500" }}>↓ 4.2% vs baseline target</div>
        </div>

        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1 }}><Euro size={48} color="#F59E0B" /></div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>CBAM Est. Liability</div>
          <div style={{ fontSize: "32px", color: "#F59E0B", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>€142,500</div>
          <div style={{ fontSize: "12px", color: "#F59E0B", marginTop: "8px", fontWeight: "500" }}>Based on 1,850t embedded emissions</div>
        </div>

        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1 }}><Calendar size={48} color="#06B6D4" /></div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Next Deadline</div>
          <div style={{ fontSize: "32px", color: "#FAFAF8", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>14 Days</div>
          <div style={{ fontSize: "12px", color: "#06B6D4", marginTop: "8px", fontWeight: "500" }}>CBAM Q1 2026 Declaration</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Trajectory */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", marginBottom: "8px" }}>Emissions Trajectory vs SBTi Target</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px" }}>Tracking operational emissions against validated science-based targets.</p>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width={undefined} height="100%">
              <LineChart data={TRAJECTORY_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" vertical={false} />
                <XAxis dataKey="year" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", color: "#E8E6DE" }}
                  itemStyle={{ color: "#E8E6DE" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
                <Line type="monotone" dataKey="actual" name="Actual Emissions" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: "#0D0D14", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Science-Based Target" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scope Breakdown */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", marginBottom: "8px" }}>Inventory Breakdown</h2>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px" }}>Distribution across Scope 1, 2, and 3.</p>
          <div style={{ flex: 1, minHeight: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SCOPE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {SCOPE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", color: "#E8E6DE" }}
                  itemStyle={{ color: "#E8E6DE" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Action Items */}
      <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Required Sign-offs & Action Items</h2>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: "rgba(245,158,11,0.1)", padding: "10px", borderRadius: "50%" }}>
                <AlertTriangle size={20} color="#F59E0B" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#FAFAF8", marginBottom: "4px" }}>Approve Q1 Corporate Inventory</div>
                <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Prepared by Carbon Accounting team. Awaiting your final sign-off.</div>
              </div>
            </div>
            <button style={{ background: "transparent", color: "#F59E0B", border: "1px solid #F59E0B", padding: "8px 16px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Review Inventory
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
