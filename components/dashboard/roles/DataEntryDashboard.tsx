// components/dashboard/roles/DataEntryDashboard.tsx
"use client";

import { UploadCloud, AlertCircle, FileText, Clock } from "lucide-react";

const MOCK_METRICS = [
  { label: "Pending Upload Tasks", value: "12", color: "#F59E0B", icon: Clock },
  { label: "Data Completion (Feb)", value: "68%", color: "#06B6D4", icon: FileText },
  { label: "Rework / Rejected", value: "3", color: "#EF4444", icon: AlertCircle },
];

const MOCK_SUBMISSIONS = [
  { id: "SUB-1049", type: "Electricity Consumption", facility: "Site B - Mumbai", date: "2026-03-10", status: "Under Review" },
  { id: "SUB-1048", type: "Diesel Generator Fuel", facility: "Site A - Pune", date: "2026-03-09", status: "Approved" },
  { id: "SUB-1047", type: "Company Travel Logs", facility: "Headquarters", date: "2026-03-08", status: "Rejected" },
  { id: "SUB-1046", type: "Refrigerant Top-up", facility: "Site B - Mumbai", date: "2026-03-05", status: "Draft" },
];

export function DataEntryDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#FAFAF8", fontWeight: "700", marginBottom: "8px" }}>Operations & Data Entry</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Manage your facility data collection tasks and active submissions.</p>
        </div>
        <div>
          <button style={{
            background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
            color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span>+</span> New Manual Entry
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
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        
        {/* Data Submission Table */}
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1A1A24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>Recent Submissions</h2>
            <button style={{ background: "transparent", border: "1px solid #374151", color: "#9CA3AF", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>View All</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0D0D14" }}>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>ID</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Record Type</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Facility</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Date</th>
                  <th style={{ padding: "16px 24px", color: "#6B7280", fontWeight: "500", borderBottom: "1px solid #1A1A24", whiteSpace: "nowrap" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBMISSIONS.map((sub, i) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #1A1A24", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "16px 24px", color: "#D1D5DB", fontFamily: "'JetBrains Mono', monospace" }}>{sub.id}</td>
                    <td style={{ padding: "16px 24px", color: "#FAFAF8" }}>{sub.type}</td>
                    <td style={{ padding: "16px 24px", color: "#9CA3AF" }}>{sub.facility}</td>
                    <td style={{ padding: "16px 24px", color: "#6B7280" }}>{sub.date}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px",
                        background: sub.status === "Approved" ? "rgba(34,197,94,0.1)" : sub.status === "Rejected" ? "rgba(239,68,68,0.1)" : sub.status === "Draft" ? "rgba(107,114,128,0.1)" : "rgba(245,158,11,0.1)",
                        color: sub.status === "Approved" ? "#22C55E" : sub.status === "Rejected" ? "#EF4444" : sub.status === "Draft" ? "#9CA3AF" : "#F59E0B",
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

        {/* Quick Upload Widget */}
        <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 16px 0" }}>Quick AI Extraction</h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", lineHeight: "1.5" }}>Drag and drop electricity bills, fuel receipts, or travel invoices for automated data extraction.</p>
          
          <div style={{ 
            border: "2px dashed #374151", 
            borderRadius: "8px", 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "40px 24px", 
            cursor: "pointer", 
            background: "rgba(255,255,255,0.02)",
            transition: "all 0.2s" 
          }}>
            <UploadCloud size={40} color="#6B7280" style={{ marginBottom: "16px" }} />
            <div style={{ color: "#E8E6DE", fontSize: "14px", fontWeight: "500", marginBottom: "6px", textAlign: "center" }}>Click to upload or drag & drop</div>
            <div style={{ color: "#6B7280", fontSize: "12px" }}>PDF, PNG, JPG (max 20MB)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
