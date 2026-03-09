"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface EmissionData {
  scope: string;
  total: number;
  percentage: number;
}

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<EmissionData[]>([]);
  const [total, setTotal] = useState(0);
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    loadData();
  }, [year]);

  async function loadData() {
    const { data: orgs } = await supabase.from("organizations").select("*").limit(1);
    if (orgs && orgs[0]) {
      setOrgId(orgs[0].id);
      setOrgName(orgs[0].name);

      const { data: results } = await supabase
        .from("emission_results")
        .select("scope, co2e_total, calculated_at")
        .eq("organization_id", orgs[0].id);

      if (results) {
        const filtered = results.filter(r => new Date(r.calculated_at).getFullYear() === year);
        const s1 = filtered.filter(r => r.scope === "Scope 1").reduce((sum, r) => sum + Number(r.co2e_total), 0);
        const s2 = filtered.filter(r => r.scope === "Scope 2").reduce((sum, r) => sum + Number(r.co2e_total), 0);
        const s3 = filtered.filter(r => r.scope === "Scope 3").reduce((sum, r) => sum + Number(r.co2e_total), 0);
        const tot = s1 + s2 + s3;

        setTotal(tot);
        setData([
          { scope: "Scope 1", total: s1, percentage: tot > 0 ? (s1 / tot) * 100 : 0 },
          { scope: "Scope 2", total: s2, percentage: tot > 0 ? (s2 / tot) * 100 : 0 },
          { scope: "Scope 3", total: s3, percentage: tot > 0 ? (s3 / tot) * 100 : 0 }
        ]);
      }
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Emission Reports</h1>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "18px", color: "#FAFAF8", margin: 0 }}>{orgName}</h2>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>Annual GHG Inventory</p>
          </div>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: "10px 14px", background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "4px", color: "#FAFAF8", fontSize: "14px" }}>
            {[2024, 2023, 2022, 2021].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>TOTAL EMISSIONS</h3>
            <div style={{ fontSize: "48px", color: "#22C55E", fontWeight: "600", marginBottom: "8px" }}>
              {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280" }}>tCO₂e in {year}</div>

            <div style={{ marginTop: "32px" }}>
              {data.map(d => {
                const color = d.scope === "Scope 1" ? "#EF4444" : d.scope === "Scope 2" ? "#F59E0B" : "#06B6D4";
                return (
                  <div key={d.scope} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{d.scope}</span>
                      <span style={{ fontSize: "12px", color: "#FAFAF8" }}>{d.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })} tCO₂e</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#1A1A24", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${d.percentage}%`, height: "100%", background: color, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "4px" }}>{d.percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>BREAKDOWN BY SCOPE</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1A1A24" }}>
                  <th style={{ padding: "12px 0", textAlign: "left", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>SCOPE</th>
                  <th style={{ padding: "12px 0", textAlign: "right", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>EMISSIONS</th>
                  <th style={{ padding: "12px 0", textAlign: "right", fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {data.map(d => {
                  const color = d.scope === "Scope 1" ? "#EF4444" : d.scope === "Scope 2" ? "#F59E0B" : "#06B6D4";
                  return (
                    <tr key={d.scope} style={{ borderBottom: "1px solid #111120" }}>
                      <td style={{ padding: "16px 0", fontSize: "13px", color: color }}>{d.scope}</td>
                      <td style={{ padding: "16px 0", fontSize: "13px", color: "#FAFAF8", textAlign: "right" }}>
                        {d.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "16px 0", fontSize: "13px", color: "#9CA3AF", textAlign: "right" }}>
                        {d.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#FAFAF8", fontWeight: "600" }}>Total</td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#22C55E", textAlign: "right", fontWeight: "600" }}>
                    {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#9CA3AF", textAlign: "right" }}>100%</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: "32px", padding: "16px", background: "#07070E", borderRadius: "4px" }}>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>COMPLIANCE STATUS</div>
              <div style={{ fontSize: "14px", color: "#22C55E" }}>✓ Data collection in progress</div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px" }}>ISO 14064-1 verification pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
