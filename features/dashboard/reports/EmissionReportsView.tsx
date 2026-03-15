"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import viewStyles from "@/features/dashboard/shared/DashboardWorkspace.module.css";
import shellStyles from "@/features/portal/WorkspaceShell.module.css";
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
  const { primaryOrgId, isLoading: authLoading } = useAuth();
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
  const [message, setMessage] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";

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
        setMessage(null);

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
        setMessage("Emission reports could not be loaded from the annual reporting view right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, fyYear, orgId]);

  if (authLoading || (orgId && loading)) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Reporting Workspace</p>
          <h1 className={shellStyles.title}>Loading emission reports...</h1>
        </header>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Reporting Workspace</p>
          <h1 className={shellStyles.title}>Emission Reports</h1>
          <p className={shellStyles.subtitle}>No organization is available in your current session scope yet.</p>
        </header>
      </div>
    );
  }

  return (
    <div className={shellStyles.page}>
      <header className={shellStyles.header}>
        <p className={shellStyles.eyebrow}>Reporting Workspace</p>
        <div className={shellStyles.headerRow}>
          <div className={shellStyles.titleBlock}>
            <h1 className={shellStyles.title}>Emission Reports</h1>
            <p className={shellStyles.subtitle}>
              Annual inventory, scope split, and reporting-quality posture from the live emissions read model.
            </p>
          </div>
        </div>
      </header>

      <main className={shellStyles.body}>
        {message ? (
          <div className={shellStyles.alert} data-tone="danger">
            {message}
          </div>
        ) : null}

        <section className={shellStyles.metricsGrid}>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Total tCO2e</p>
            <p className={shellStyles.metricValue}>{summary.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
            <p className={shellStyles.metricHint}>Combined scope total for the selected fiscal year.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Readings</p>
            <p className={shellStyles.metricValue}>{summary.readingCount}</p>
            <p className={shellStyles.metricHint}>Monthly reading rows contributing to this annual view.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Anomalies</p>
            <p className={shellStyles.metricValue}>{summary.anomalyCount}</p>
            <p className={shellStyles.metricHint}>Flagged rows still needing human challenge or confirmation.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Avg Trust</p>
            <p className={shellStyles.metricValue}>{summary.avgTrustScore == null ? "-" : summary.avgTrustScore.toFixed(2)}</p>
            <p className={shellStyles.metricHint}>Average trust score across scoped reporting rows in the selected FY.</p>
          </article>
        </section>

        <section className={viewStyles.reportGrid}>
          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div className={viewStyles.summaryHeader}>
                <div>
                  <h2 className={viewStyles.summaryTitle}>{orgName}</h2>
                  <p className={viewStyles.summarySubtitle}>Annual inventory from live GHG readings</p>
                </div>
                <select
                  className={viewStyles.yearSelect}
                  value={fyYear}
                  onChange={(event) => setFyYear(event.target.value)}
                >
                  {availableYears.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={shellStyles.cardSection}>
              <p className={viewStyles.heroValue}>
                {summary.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p className={viewStyles.heroHint}>tCO2e in {fyYear}</p>

              <div className={viewStyles.progressList}>
                {data.map((item) => (
                  <div key={item.label} className={viewStyles.progressRow}>
                    <div className={viewStyles.progressLabels}>
                      <span className={viewStyles.progressLabel}>{item.label}</span>
                      <span className={viewStyles.progressValue}>
                        {item.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })} tCO2e
                      </span>
                    </div>
                    <progress className={viewStyles.progressTrack} data-scope={item.scope} value={item.percentage} max={100} />
                    <div className={viewStyles.progressLabels}>
                      <span className={viewStyles.progressLabel}>Share of total</span>
                      <span className={viewStyles.progressValue}>{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Breakdown by Scope</h2>
                <p className={shellStyles.cardDescription}>
                  Scope composition and quality posture for the selected fiscal year.
                </p>
              </div>
            </div>
            <div className={shellStyles.cardSection}>
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Scope</th>
                      <th className={shellStyles.tableHeaderCell}>Emissions</th>
                      <th className={shellStyles.tableHeaderCell}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.label}>
                        <td className={shellStyles.tableCell}>{item.label}</td>
                        <td className={shellStyles.tableCell}>
                          {item.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td className={shellStyles.tableCell}>{item.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr>
                      <td className={shellStyles.tableCell}>Total</td>
                      <td className={shellStyles.tableCell}>
                        {summary.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className={shellStyles.tableCell}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={viewStyles.qualityCard}>
                <p className={viewStyles.qualityLabel}>Data quality snapshot</p>
                <p
                  className={viewStyles.qualityValue}
                  data-tone={summary.anomalyCount > 0 ? "warning" : "success"}
                >
                  {summary.anomalyCount > 0
                    ? `${summary.anomalyCount} anomalies need review`
                    : "No anomalies flagged in this FY"}
                </p>
                <p className={shellStyles.rowMeta}>
                  {summary.readingCount} readings | Avg trust score{" "}
                  {summary.avgTrustScore == null ? "-" : summary.avgTrustScore.toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
