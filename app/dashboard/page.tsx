"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  industry: string;
  country: string;
}

interface EmissionSummary {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [summary, setSummary] = useState<EmissionSummary>({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) loadSummary();
  }, [selectedOrg]);

  async function loadOrganizations() {
    const { data } = await supabase.from("organizations").select("*");
    if (data && data.length > 0) {
      setOrgs(data);
      setSelectedOrg(data[0].id);
    }
    setLoading(false);
  }

  async function loadSummary() {
    const { data } = await supabase
      .from("emission_results")
      .select("scope, co2e_total")
      .eq("organization_id", selectedOrg);

    if (data) {
      const s1 = data.filter(d => d.scope === "Scope 1").reduce((sum, d) => sum + Number(d.co2e_total), 0);
      const s2 = data.filter(d => d.scope === "Scope 2").reduce((sum, d) => sum + Number(d.co2e_total), 0);
      const s3 = data.filter(d => d.scope === "Scope 3").reduce((sum, d) => sum + Number(d.co2e_total), 0);
      setSummary({ scope1: s1, scope2: s2, scope3: s3, total: s1 + s2 + s3 });
    }
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>GHG Accounting Dashboard</h1>
        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>Multi-tenant emission tracking & reporting</p>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "8px" }}>ORGANIZATION</label>
          <select
            value={selectedOrg}
            onChange={e => setSelectedOrg(e.target.value)}
            style={{ padding: "10px 14px", background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px", width: "300px" }}
          >
            {orgs.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Scope 1", value: summary.scope1, color: "#EF4444" },
            { label: "Scope 2", value: summary.scope2, color: "#F59E0B" },
            { label: "Scope 3", value: summary.scope3, color: "#06B6D4" },
            { label: "Total", value: summary.total, color: "#22C55E" }
          ].map(card => (
            <div key={card.label} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>{card.label}</div>
              <div style={{ fontSize: "28px", color: card.color, fontWeight: "600" }}>
                {card.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: "10px", color: "#4B5563", marginTop: "4px" }}>tCO₂e</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <Link href="/dashboard/activity" style={{ textDecoration: "none" }}>
            <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px", cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>📊</div>
              <div style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "4px" }}>Activity Data</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Enter emission sources & activity</div>
            </div>
          </Link>

          <Link href="/dashboard/sources" style={{ textDecoration: "none" }}>
            <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px", cursor: "pointer" }}>
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>🏭</div>
              <div style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "4px" }}>Emission Sources</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Manage facilities & sources</div>
            </div>
          </Link>

          <Link href="/dashboard/reports" style={{ textDecoration: "none" }}>
            <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px", cursor: "pointer" }}>
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>📈</div>
              <div style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "4px" }}>Reports</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Generate compliance reports</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
