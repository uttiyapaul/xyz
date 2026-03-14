// components/dashboard/roles/ClientAdminDashboard.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, Shield, Server, ArrowRight, CircleCheck, Circle } from "lucide-react";

const MOCK_METRICS = [
  { label: "Active Licenses", value: "24 / 50", color: "#06B6D4", icon: Users },
  { label: "MFA Adoption", value: "100%", subtext: "Enforced globally", color: "#10B981", icon: Shield },
  { label: "System Health", value: "99.9%", subtext: "API & DB Uptime", color: "#F59E0B", icon: Server },
];

const MOCK_ONBOARDING = [
  { task: "Configure Organization Details", completed: true },
  { task: "Set up Data Entry Facilities (Sites)", completed: true },
  { task: "Invite Team Members", completed: true },
  { task: "Configure Single Sign-On (SSO)", completed: false },
  { task: "Run Sandbox Calculation", completed: false },
];

const MOCK_ACTIVITY = [
  { user: "Sarah Jenkins", action: "Approved Data (Electricity - Site A)", time: "2 hours ago" },
  { user: "Raj Patel", action: "Uploaded 4 evidence documents", time: "5 hours ago" },
  { user: "System", action: "Automated Data Quality scan completed", time: "1 day ago" },
  { user: "Michael Chen", action: "Invited new user: Amit Kumar", time: "2 days ago" },
];

export function ClientAdminDashboard() {
  const { primaryOrgId } = useAuth();
  const orgId = primaryOrgId || "Your Organization";

  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Organization Administration</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Manage users, licenses, and system-wide security settings.</p>
        </div>
        <div>
          <button style={{
            background: "#FAFAF8",
            color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <Users size={16} /> Manage Users
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
        
        {/* Onboarding & Setup Context */}
        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 16px 0" }}>Organization Setup Checklist</h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", lineHeight: "1.5" }}>Complete these steps to fully configure {orgId} for production use.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {MOCK_ONBOARDING.map((item, idx) => (
              <div key={idx} style={{ padding: "12px", background: item.completed ? "rgba(34,197,94,0.05)" : "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "6px", display: "flex", alignItems: "center", gap: "12px" }}>
                {item.completed ? <CircleCheck size={18} color="#22C55E" /> : <Circle size={18} color="#6B7280" />}
                <span style={{ fontSize: "14px", color: item.completed ? "#9CA3AF" : "#FAFAF8", textDecoration: item.completed ? "line-through" : "none" }}>{item.task}</span>
              </div>
            ))}
          </div>

          <button style={{ background: "transparent", color: "#06B6D4", border: "1px solid #06B6D4", padding: "10px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", marginTop: "24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            Go to Settings <ArrowRight size={14} />
          </button>
        </div>

        {/* Audit Log Preview */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Recent Team Activity</h2>
          </div>
          <div style={{ padding: "0 24px", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {MOCK_ACTIVITY.map((activity, idx) => (
                <div key={idx} style={{ padding: "16px 0", borderBottom: idx !== MOCK_ACTIVITY.length - 1 ? "1px solid #1A1A24" : "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#E8E6DE" }}>{activity.user}</span>
                    <span style={{ fontSize: "11px", color: "#6B7280" }}>{activity.time}</span>
                  </div>
                  <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{activity.action}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 24px", background: "#0D0D14", borderTop: "1px solid #1A1A24", marginTop: "auto" }}>
             <button style={{ background: "transparent", color: "#9CA3AF", border: "none", fontSize: "12px", cursor: "pointer", padding: 0 }}>View Full Audit Log</button>
          </div>
        </div>

      </div>
    </div>
  );
}
