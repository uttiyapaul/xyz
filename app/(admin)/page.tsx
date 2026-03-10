// app/(admin)/page.tsx  →  URL: /admin
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface OrgRow { id: string; name: string; sector: string; subscription_tier: string | null; }

export default function AdminDashboard() {
  const [orgs, setOrgs]       = useState<OrgRow[]>([]);
  const [counts, setCounts]   = useState({ orgs: 0, users: 0, readings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("organizations").select("id,name,sector,subscription_tier").limit(50),
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      supabase.from("user_organization_roles").select("id", { count: "exact", head: true }),
      supabase.from("ghg_readings").select("id", { count: "exact", head: true }),
    ]).then(([orgsRes, orgCount, userCount, readingCount]) => {
      if (orgsRes.data) setOrgs(orgsRes.data);
      setCounts({
        orgs: orgCount.count ?? 0,
        users: userCount.count ?? 0,
        readings: readingCount.count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#FAFAF8",
          margin: "0 0 4px" }}>Platform Administration</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          System-wide view — all organizations, all data
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginBottom: 28 }}>
        {[
          { label: "Organizations", value: counts.orgs, icon: "⊞", color: "#3B82F6" },
          { label: "Active Users",  value: counts.users, icon: "◉", color: "#22C55E" },
          { label: "GHG Readings",  value: counts.readings, icon: "⊟", color: "#F59E0B" },
        ].map(c => (
          <div key={c.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24",
            borderRadius: "8px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "#6B7280" }}>
                {c.label.toUpperCase()}
              </span>
              <span style={{ fontSize: "16px" }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: c.color }}>
              {loading ? "—" : c.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Organizations table */}
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A24",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#FAFAF8", margin: 0 }}>
            Organizations
          </h2>
        </div>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6B7280",
            fontSize: "13px" }}>Loading…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#07070E" }}>
                {["ORGANIZATION", "SECTOR", "PLAN"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: "10px", color: "#6B7280", fontWeight: "500" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} style={{ borderTop: "1px solid #111120" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px",
                    color: "#FAFAF8", fontWeight: "500" }}>
                    {org.name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#9CA3AF" }}>
                    {org.sector}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                      background: "rgba(124,58,237,0.1)", color: "#A78BFA",
                      fontWeight: "600",
                    }}>
                      {org.subscription_tier?.toUpperCase() ?? "BASIC"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}