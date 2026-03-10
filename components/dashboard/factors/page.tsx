// app/dashboard/factors/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface Factor {
  id: string;
  factor_name: string;
  scope: string;
  category: string;
  co2_factor: number;
  unit: string;
  source: string;
  valid_from: string;
}

export default function FactorsPage() {
  const [factors, setFactors]   = useState<Factor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    supabase.from("emission_factors")
      .select("id,factor_name,scope,category,co2_factor,unit,source,valid_from")
      .eq("is_active", true)
      .order("scope").order("category").order("factor_name")
      .limit(200)
      .then(({ data }) => { if (data) setFactors(data); setLoading(false); });
  }, []);

  const filtered = factors.filter(f =>
    !search || f.factor_name?.toLowerCase().includes(search.toLowerCase())
      || f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8",
            margin: "0 0 4px" }}>Emission Factors</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            {filtered.length} of {factors.length} factors · Read-only reference
          </p>
        </div>
        <input type="search" placeholder="Search factors…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 12px", background: "#0D0D14",
            border: "1px solid #1A1A24", borderRadius: "6px",
            color: "#FAFAF8", fontSize: "13px", outline: "none", width: 240 }} />
      </div>

      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B7280",
            fontSize: "13px" }}>Loading factors…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#07070E" }}>
                {["FACTOR", "SCOPE", "CATEGORY", "CO₂e VALUE", "UNIT", "SOURCE"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: "10px", color: "#6B7280", fontWeight: "500" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={f.id} style={{
                  borderTop: "1px solid #111120",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}>
                  <td style={{ padding: "11px 16px", fontSize: "13px",
                    color: "#FAFAF8", maxWidth: 200, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.factor_name}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                      fontWeight: "600",
                      background: f.scope === "Scope 1" ? "rgba(239,68,68,0.1)"
                        : f.scope === "Scope 2" ? "rgba(245,158,11,0.1)" : "rgba(6,182,212,0.1)",
                      color: f.scope === "Scope 1" ? "#EF4444"
                        : f.scope === "Scope 2" ? "#F59E0B" : "#06B6D4",
                    }}>
                      {f.scope}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#9CA3AF" }}>
                    {f.category}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "13px",
                    color: "#22C55E", fontWeight: "600" }}>
                    {Number(f.co2_factor).toFixed(4)}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#6B7280" }}>
                    {f.unit}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "11px", color: "#4B5563",
                    maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }}>
                    {f.source}
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