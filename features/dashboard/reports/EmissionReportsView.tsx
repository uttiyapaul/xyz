"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { getMyAnnualEmissions } from "@/lib/supabase/queries";

/**
 * Reports stay in a client view for now because year switching and summary
 * recalculation are interactive. The route file should remain a thin entry
 * while this feature owns the live-read model translation.
 */

interface AnnualEmissionRow {
  organization_id: string;
  fy_year: string;
  scope: number;
  tco2e_total: number | string | null;
  reading_count: number | string | null;
  anomaly_count: number | string | null;
  avg_trust_score: number | string | null;
}

interface EmissionData {
  scope: number;
  label: string;
  total: number;
  percentage: number;
  color: string;
}

interface SummaryState {
  total: number;
  readingCount: number;
  anomalyCount: number;
  avgTrustScore: number | null;
}

const EMPTY_BREAKDOWN: EmissionData[] = [
  { scope: 1, label: "Scope 1", total: 0, percentage: 0, color: "#EF4444" },
  { scope: 2, label: "Scope 2", total: 0, percentage: 0, color: "#F59E0B" },
  { scope: 3, label: "Scope 3", total: 0, percentage: 0, color: "#06B6D4" },
];

function getCurrentFiscalYearLabel(date = new Date()): string {
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const endYear = String(startYear + 1).slice(-2);
  return `${startYear}-${endYear}`;
}

/**
 * The RPC already returns a denormalized annual view. This loader converts it
 * into predictable UI state so charts and tables can render without knowing the
 * database response shape.
 */
async function loadReportData(activeOrgId: string, requestedFyYear: string) {
  const [{ data: orgRow, error: orgError }, annualRows] = await Promise.all([
    supabase
      .from("v_active_organizations")
      .select("legal_name")
      .eq("id", activeOrgId)
      .maybeSingle(),
    getMyAnnualEmissions(activeOrgId),
  ]);

  if (orgError) {
    throw orgError;
  }

  const rows = (annualRows ?? []) as AnnualEmissionRow[];
  const fallbackYear = getCurrentFiscalYearLabel();
  const availableYears = Array.from(new Set(rows.map((row) => row.fy_year).filter(Boolean)))
    .sort()
    .reverse();
  const resolvedYear = availableYears.includes(requestedFyYear)
    ? requestedFyYear
    : (availableYears[0] ?? fallbackYear);
  const scopedRows = rows.filter((row) => row.fy_year === resolvedYear);
  const normalized = EMPTY_BREAKDOWN.map((item) => {
    const row = scopedRows.find((candidate) => Number(candidate.scope) === item.scope);

    return {
      ...item,
      total: Number(row?.tco2e_total ?? 0),
      readingCount: Number(row?.reading_count ?? 0),
      anomalyCount: Number(row?.anomaly_count ?? 0),
      avgTrustScore: row?.avg_trust_score == null ? null : Number(row.avg_trust_score),
    };
  });

  const total = normalized.reduce((sum, item) => sum + item.total, 0);
  const trustScores = normalized
    .map((item) => item.avgTrustScore)
    .filter((value): value is number => value != null);

  return {
    orgName: orgRow?.legal_name ?? "Organization",
    resolvedYear,
    availableYears: availableYears.length > 0 ? availableYears : [fallbackYear],
    data: normalized.map((item) => ({
      scope: item.scope,
      label: item.label,
      total: item.total,
      percentage: total > 0 ? (item.total / total) * 100 : 0,
      color: item.color,
    })),
    summary: {
      total,
      readingCount: normalized.reduce((sum, item) => sum + item.readingCount, 0),
      anomalyCount: normalized.reduce((sum, item) => sum + item.anomalyCount, 0),
      avgTrustScore:
        trustScores.length > 0
          ? trustScores.reduce((sum, value) => sum + value, 0) / trustScores.length
          : null,
    },
  };
}

export function EmissionReportsView() {
  const { orgIds, isLoading: authLoading } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [fyYear, setFyYear] = useState(getCurrentFiscalYearLabel());
  const [availableYears, setAvailableYears] = useState<string[]>([getCurrentFiscalYearLabel()]);
  const [data, setData] = useState<EmissionData[]>(EMPTY_BREAKDOWN);
  const [summary, setSummary] = useState<SummaryState>({
    total: 0,
    readingCount: 0,
    anomalyCount: 0,
    avgTrustScore: null,
  });
  const [loading, setLoading] = useState(true);
  const orgId = orgIds[0] ?? "";

  useEffect(() => {
    if (authLoading || !orgId) {
      return;
    }

    setLoading(true);

    loadReportData(orgId, fyYear)
      .then((result) => {
        setOrgName(result.orgName);
        setAvailableYears(result.availableYears);
        setData(result.data);
        setSummary(result.summary);

        if (result.resolvedYear !== fyYear) {
          setFyYear(result.resolvedYear);
        }
      })
      .catch((error) => {
        console.error("Error loading emissions report:", error);
        setData(EMPTY_BREAKDOWN);
        setSummary({
          total: 0,
          readingCount: 0,
          anomalyCount: 0,
          avgTrustScore: null,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, fyYear, orgId]);

  if (authLoading || (orgId && loading)) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
        Loading reports...
      </div>
    );
  }

  if (!orgId) {
    return (
      <div style={{ padding: "32px", color: "#E8E6DE", minHeight: "100vh", background: "#050508" }}>
        <div
          style={{ padding: "24px", background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px" }}
        >
          <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: "0 0 8px" }}>Emission Reports</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
            No organization is available in your current session scope yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Emission Reports</h1>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", color: "#FAFAF8", margin: 0 }}>{orgName}</h2>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
              Annual inventory from live GHG readings
            </p>
          </div>
          <select
            value={fyYear}
            onChange={(event) => setFyYear(event.target.value)}
            style={{
              padding: "10px 14px",
              background: "#0D0D14",
              border: "1px solid #1A1A24",
              borderRadius: "4px",
              color: "#FAFAF8",
              fontSize: "14px",
            }}
          >
            {availableYears.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>TOTAL EMISSIONS</h3>
            <div style={{ fontSize: "48px", color: "#22C55E", fontWeight: "600", marginBottom: "8px" }}>
              {summary.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "14px", color: "#6B7280" }}>tCO2e in {fyYear}</div>

            <div style={{ marginTop: "32px" }}>
              {data.map((item) => (
                <div key={item.label} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", color: "#FAFAF8" }}>
                      {item.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })} tCO2e
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#1A1A24",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: "100%",
                        background: item.color,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "4px" }}>
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>BREAKDOWN BY SCOPE</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1A1A24" }}>
                  <th
                    style={{
                      padding: "12px 0",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    SCOPE
                  </th>
                  <th
                    style={{
                      padding: "12px 0",
                      textAlign: "right",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    EMISSIONS
                  </th>
                  <th
                    style={{
                      padding: "12px 0",
                      textAlign: "right",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.label} style={{ borderBottom: "1px solid #111120" }}>
                    <td style={{ padding: "16px 0", fontSize: "13px", color: item.color }}>{item.label}</td>
                    <td style={{ padding: "16px 0", fontSize: "13px", color: "#FAFAF8", textAlign: "right" }}>
                      {item.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "13px", color: "#9CA3AF", textAlign: "right" }}>
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#FAFAF8", fontWeight: "600" }}>Total</td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#22C55E", textAlign: "right", fontWeight: "600" }}>
                    {summary.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "16px 0", fontSize: "14px", color: "#9CA3AF", textAlign: "right" }}>100%</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: "32px", padding: "16px", background: "#07070E", borderRadius: "4px" }}>
              <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>DATA QUALITY SNAPSHOT</div>
              <div style={{ fontSize: "14px", color: summary.anomalyCount > 0 ? "#F59E0B" : "#22C55E" }}>
                {summary.anomalyCount > 0
                  ? `${summary.anomalyCount} anomalies need review`
                  : "No anomalies flagged in this FY"}
              </div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px" }}>
                {summary.readingCount} readings | Avg trust score{" "}
                {summary.avgTrustScore == null ? "-" : summary.avgTrustScore.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
