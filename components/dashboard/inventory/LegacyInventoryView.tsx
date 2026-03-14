// Legacy route prototype kept during migration out of components/page.tsx naming.
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Reading {
  id: string;
  activity_type: string;
  scope: string;
  quantity: number;
  unit: string;
  kgco2e_total: number;
  reporting_period_start: string;
  data_quality: string;
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#6B7280", submitted: "#3B82F6",
  verified: "#22C55E", rejected: "#EF4444",
};

export default function InventoryPage() {
  const { orgIds } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading]   = useState(true);
  const [scope, setScope]       = useState<string>("all");
  const [orgId, setOrgId]       = useState<string>("");

  useEffect(() => {
    if (orgIds.length > 0) setOrgId(orgIds[0]);
  }, [orgIds]);

  useEffect(() => {
    if (!orgId) return;
    loadReadings();
  }, [orgId, scope]);

  async function loadReadings() {
    setLoading(true);
    let query = supabase
      .from("ghg_readings")
      .select("id,activity_type,scope,quantity,unit,kgco2e_total,reporting_period_start,data_quality,status")
      .eq("organization_id", orgId)
      .order("reporting_period_start", { ascending: false })
      .limit(100);

    if (scope !== "all") query = query.eq("scope", scope);

    const { data, error } = await query;
    setLoading(false);
    if (!error && data) setReadings(data);
  }

  const total = readings.reduce((s, r) => s + Number(r.kgco2e_total || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8",
            margin: "0 0 4px" }}>GHG Inventory</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            {readings.length} readings · {(total / 1000).toFixed(2)} tCO₂e total
          </p>
        </div>

        {/* Scope filter */}
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "Scope 1", "Scope 2", "Scope 3"].map(s => (
            <button key={s} onClick={() => setScope(s)} style={{
              padding: "6px 14px", borderRadius: "6px", fontSize: "12px",
              border: "1px solid",
              borderColor: scope === s ? "#F59E0B" : "#1A1A24",
              background: scope === s ? "rgba(245,158,11,0.1)" : "transparent",
              color: scope === s ? "#F59E0B" : "#6B7280", cursor: "pointer",
            }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B7280",
            fontSize: "13px" }}>Loading readings…</div>
        ) : readings.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⊟</div>
            <div style={{ color: "#6B7280", fontSize: "13px" }}>No readings found</div>
            <div style={{ color: "#4B5563", fontSize: "12px", marginTop: "4px" }}>
              Add activity data to get started
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#07070E" }}>
                {["PERIOD", "ACTIVITY", "SCOPE", "QUANTITY", "CO₂e (kg)", "QUALITY", "STATUS"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: "10px", color: "#6B7280", fontWeight: "500",
                    letterSpacing: "0.5px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={r.id} style={{
                  borderTop: "1px solid #111120",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>
                    {r.reporting_period_start?.slice(0, 7) ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#FAFAF8",
                    maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }}>
                    {r.activity_type}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                      fontWeight: "600", letterSpacing: "0.3px",
                      background: r.scope === "Scope 1" ? "rgba(239,68,68,0.1)"
                        : r.scope === "Scope 2" ? "rgba(245,158,11,0.1)"
                        : "rgba(6,182,212,0.1)",
                      color: r.scope === "Scope 1" ? "#EF4444"
                        : r.scope === "Scope 2" ? "#F59E0B" : "#06B6D4",
                    }}>
                      {r.scope}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#FAFAF8" }}>
                    {Number(r.quantity).toLocaleString("en-IN")} {r.unit}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#22C55E",
                    fontWeight: "600" }}>
                    {Number(r.kgco2e_total).toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>
                    {r.data_quality ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                      color: STATUS_COLOR[r.status] ?? "#6B7280",
                      background: `${STATUS_COLOR[r.status] ?? "#6B7280"}18`,
                      fontWeight: "600",
                    }}>
                      {r.status?.toUpperCase() ?? "DRAFT"}
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
