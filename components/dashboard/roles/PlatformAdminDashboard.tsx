// components/dashboard/PlatformAdminDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function PlatformAdminDashboard() {
  const [stats, setStats] = useState({ orgs: 0, users: 0, roles: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [orgsRes, usersRes, rolesRes] = await Promise.all([
      supabase.from("client_organizations").select("id", { count: "exact", head: true }),
      supabase.from("user_organization_roles").select("user_id", { count: "exact", head: true }),
      supabase.from("platform_roles").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      orgs: orgsRes.count ?? 0,
      users: usersRes.count ?? 0,
      roles: rolesRes.count ?? 0,
    });
  }

  return (
    <div style={{ padding: "32px", color: "#E8E6DE" }}>
      <h1 style={{ fontSize: "24px", color: "#FAFAF8", marginBottom: "8px" }}>Platform Administration</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>System-wide management & monitoring</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Organizations", value: stats.orgs, color: "#F59E0B" },
          { label: "Active Users", value: stats.users, color: "#06B6D4" },
          { label: "Platform Roles", value: stats.roles, color: "#22C55E" },
        ].map(card => (
          <div key={card.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "32px", color: card.color, fontWeight: "600" }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {["Create Organization", "Manage Users", "System Settings", "View Logs"].map(action => (
            <button key={action} style={{ padding: "12px", background: "#1A1A24", border: "1px solid #2A2A34", borderRadius: "4px", color: "#E8E6DE", fontSize: "14px", cursor: "pointer" }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
