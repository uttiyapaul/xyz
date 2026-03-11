// components/dashboard/ClientAdminDashboard.tsx
"use client";

export function ClientAdminDashboard() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE" }}>
      <h1 style={{ fontSize: "24px", color: "#FAFAF8", marginBottom: "8px" }}>Organization Administration</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>User management & settings</p>
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {["Invite User", "Manage Roles", "Organization Settings", "Billing"].map(action => (
            <button key={action} style={{ padding: "12px", background: "#1A1A24", border: "1px solid #2A2A34", borderRadius: "4px", color: "#E8E6DE", fontSize: "14px", cursor: "pointer" }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
