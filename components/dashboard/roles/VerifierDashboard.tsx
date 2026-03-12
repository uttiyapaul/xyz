// components/dashboard/roles/VerifierDashboard.tsx
"use client";

import { FileSearch, CheckCircle2, AlertTriangle, ShieldCheck, Download, Search } from "lucide-react";

const MOCK_METRICS = [
  { label: "Verification Progress", value: "45%", color: "#06B6D4", icon: ShieldCheck },
  { label: "Active RFIs", value: "4", subtext: "Pending client response", color: "#F59E0B", icon: AlertTriangle },
  { label: "Sample Coverage (Scope 2)", value: "12.5%", subtext: "Target >10%", color: "#10B981", icon: FileSearch },
];

const MOCK_AUDIT_SAMPLE = [
  { id: "SMP-101", metric: "Site B - Electricity", period: "Jan 2026", hash: "0x8F9...2A1", status: "Verified" },
  { id: "SMP-102", metric: "Fleet Diesel Log", period: "Jan 2026", hash: "0x4B2...9C3", status: "Needs RFI" },
  { id: "SMP-103", metric: "Site A - Nat Gas", period: "Feb 2026", hash: "0x1A7...5E8", status: "Pending" },
  { id: "SMP-104", metric: "Travel - Flights", period: "Q1 2026", hash: "0x9D5...4F4", status: "Pending" },
];

export function VerifierDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Independent Verification Space</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>ISO 14064-3 / CBAM Third-party auditor view. Read-only access.</p>
        </div>
        <div>
          <button style={{
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            color: "#FAFAF8", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <FileSearch size={16} /> Raise RFI
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
        
        {/* Verification Sampling Queue */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Active Sampling Pool</h2>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#6B7280" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" placeholder="Search invoices..." style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "6px 12px 6px 32px", color: "#FAFAF8", fontSize: "12px", outline: "none" }} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0D0D14" }}>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Sample ID</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Data Point</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Period</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Audit Hash</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_SAMPLE.map((sub, i) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #1A1A24", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "16px 24px", color: "#D1D5DB", fontFamily: "'JetBrains Mono', monospace" }}>{sub.id}</td>
                    <td style={{ padding: "16px 24px", color: "#FAFAF8" }}>{sub.metric}</td>
                    <td style={{ padding: "16px 24px", color: "#9CA3AF" }}>{sub.period}</td>
                    <td style={{ padding: "16px 24px", color: "#6366F1", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }}>{sub.hash}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px",
                        background: sub.status === "Verified" ? "rgba(16,185,129,0.1)" : sub.status === "Needs RFI" ? "rgba(245,158,11,0.1)" : "rgba(107,114,128,0.1)",
                        color: sub.status === "Verified" ? "#10B981" : sub.status === "Needs RFI" ? "#F59E0B" : "#9CA3AF",
                        whiteSpace: "nowrap"
                      }}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Plan & Report */}
        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 16px 0" }}>Verification Documents</h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", lineHeight: "1.5" }}>Upload your verified methodology and final ISO 14064-3 statements here.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div style={{ border: "1px solid #1A1A24", background: "#0A0A0F", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span style={{ fontSize: "13px", color: "#E8E6DE", fontWeight: "500" }}>Audit Plan 2026.pdf</span>
              </div>
              <Download size={16} color="#6B7280" style={{ cursor: "pointer" }} />
            </div>
            <div style={{ border: "1px dashed #374151", background: "rgba(255,255,255,0.02)", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "13px", color: "#06B6D4", fontWeight: "500" }}>+ Upload Final Verification Report</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
