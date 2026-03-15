"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface AnnualEmissionRow {
  organization_id: string;
  fy_year: string;
  scope: number;
  tco2e_total: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e: number;
  reading_count: number;
}

interface TargetProgressRow {
  target_name: string;
  achieved_reduction_pct: number | null;
  is_on_track: boolean | null;
}

interface FilingRow {
  filing_type: string;
  status: string;
  due_date: string;
}

interface PaymentRow {
  transaction_type: string;
  amount_inr: number | null;
  status: string;
}

interface MetricCard {
  label: string;
  value: string;
  hint: string;
}

/**
 * Board and external reporting workspace.
 *
 * The route stays audience-aware on purpose: internal finance roles can review
 * broader reporting posture, while investor and lender audiences get a tighter,
 * curated slice that avoids exposing deeper finance internals.
 */
export function FinanceReportsView() {
  const { primaryOrgId, roles, isLoading: authLoading } = useAuth();
  const [annualEmissions, setAnnualEmissions] = useState<AnnualEmissionRow[]>([]);
  const [targetProgress, setTargetProgress] = useState<TargetProgressRow[]>([]);
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tone: "info" | "warning"; text: string } | null>(null);

  const isInvestorAudience = roles.includes("investor_viewer");
  const isLenderAudience = roles.includes("lender_viewer");
  const isTraderAudience = roles.includes("carbon_credit_trader");
  const isExternalAudience = isInvestorAudience || isLenderAudience;
  const showTargetPosture = !isLenderAudience;
  const showFinanceOutflow = roles.some((role) =>
    ["cfo_viewer", "finance_analyst", "executive_viewer"].includes(role),
  );
  const audienceLabel = isLenderAudience
    ? "Lender Reporting"
    : isInvestorAudience
      ? "Investor Reporting"
      : isTraderAudience
        ? "Market Reporting"
      : "Board Material Generation";
  const audienceGuardrail = isLenderAudience
    ? "Lender viewers only receive controlled reporting posture and must stay outside liability settlement or market execution routes."
    : isInvestorAudience
      ? "Investor viewers receive curated reporting grounded in approved data, without access to internal finance settlement detail."
      : isTraderAudience
        ? "Carbon-credit traders use this report lane for approved market context only. Trade execution, offset inventory, and settlement remain separate controlled workflows."
      : "Board-facing narratives should separate measured performance from estimates, AI-supported analysis, and unresolved filing items.";

  async function loadFinanceReportsView() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const requests = [
      supabase.rpc("get_my_annual_emissions"),
      showTargetPosture
        ? supabase
            .from("mv_targets_progress")
            .select("target_name, achieved_reduction_pct, is_on_track")
            .eq("organization_id", primaryOrgId)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("regulatory_filings")
        .select("filing_type, status, due_date")
        .eq("organization_id", primaryOrgId)
        .order("due_date"),
      showFinanceOutflow
        ? supabase
            .from("payment_transactions")
            .select("transaction_type, amount_inr, status")
            .eq("organization_id", primaryOrgId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ] as const;

    const [emissionsResponse, targetResponse, filingResponse, paymentResponse] = await Promise.all(requests);

    if (emissionsResponse.error || targetResponse.error || filingResponse.error || paymentResponse.error) {
      setAnnualEmissions([]);
      setTargetProgress([]);
      setFilings([]);
      setPayments([]);
      setMessage({
        tone: "warning",
        text: "Board-report data is unavailable right now. Refresh the page or confirm reporting access for the active organization.",
      });
      setLoading(false);
      return;
    }

    setAnnualEmissions(
      ((emissionsResponse.data ?? []) as AnnualEmissionRow[]).filter((row) => row.organization_id === primaryOrgId),
    );
    setTargetProgress((targetResponse.data ?? []) as TargetProgressRow[]);
    setFilings((filingResponse.data ?? []) as FilingRow[]);
    setPayments((paymentResponse.data ?? []) as PaymentRow[]);
    setLoading(false);
  }

  const scheduleFinanceReportsLoad = useEffectEvent(() => {
    void loadFinanceReportsView();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleFinanceReportsLoad);
    }
  }, [authLoading, primaryOrgId, showFinanceOutflow, showTargetPosture]);

  const sortedEmissionRows = annualEmissions
    .slice()
    .sort((left, right) => right.fy_year.localeCompare(left.fy_year) || left.scope - right.scope);
  const latestEmissionRow = sortedEmissionRows[0];
  const completedFinanceOutflow = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount_inr ?? 0), 0);
  const averageAchievedReduction =
    targetProgress.length > 0
      ? (
          targetProgress.reduce((sum, target) => sum + Number(target.achieved_reduction_pct ?? 0), 0) /
          targetProgress.length
        ).toFixed(1)
      : "0.0";
  const openFilings = filings.filter((filing) => filing.status !== "submitted" && filing.status !== "accepted");
  const reportingYears = new Set(annualEmissions.map((row) => row.fy_year)).size;
  const metricCards: MetricCard[] = [
    {
      label: "Latest FY tCO2e",
      value: latestEmissionRow ? Number(latestEmissionRow.tco2e_total).toFixed(1) : "0.0",
      hint: "Current annual emissions total from the reporting function.",
    },
    showTargetPosture
      ? {
          label: "On-Track Targets",
          value: String(targetProgress.filter((target) => target.is_on_track).length),
          hint: "Targets whose achieved reduction currently matches the expected glidepath.",
        }
      : {
          label: "Reporting Years",
          value: String(reportingYears),
          hint: "Financial years currently visible in the approved reporting inventory.",
        },
    {
      label: "Closed Filings",
      value: String(filings.filter((filing) => filing.status === "submitted" || filing.status === "accepted").length),
      hint: "Regulatory rows already beyond review or pending stages.",
    },
    showFinanceOutflow
      ? {
          label: "Completed Outflow",
          value: completedFinanceOutflow.toFixed(0),
          hint: "Completed finance transaction value currently recorded in INR.",
        }
      : {
          label: "Open Filings",
          value: String(openFilings.length),
          hint: "Outstanding filing obligations still visible in the curated audience view.",
        },
  ];

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Finance Workspace</p>
        <h1 className={styles.title}>{audienceLabel}</h1>
        <p className={styles.subtitle}>
          Use this summary board to brief finance, executive, investor, and lender audiences with live emissions and
          filing posture while preserving audience-appropriate data minimization.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        {metricCards.map((card) => (
          <article key={card.label} className={styles.metricCard}>
            <p className={styles.metricLabel}>{card.label}</p>
            <p className={styles.metricValue}>{card.value}</p>
            <p className={styles.metricHint}>{card.hint}</p>
          </article>
        ))}
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Narrative Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">{audienceGuardrail}</div>
              <div className={styles.alert} data-tone="info">
                This view is intentionally live and read-only. Formal PDFs and one-click board packs should be added
                only after the export workflow is ready and the audience-specific export controls are finalized.
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Audience Snapshot</h2>
            <div className={styles.metaList}>
              <p className={styles.detailText}>
                Audience mode: {isExternalAudience ? "External curated" : isTraderAudience ? "Internal market context" : "Internal executive"}
              </p>
              <p className={styles.detailText}>Emission rows visible: {annualEmissions.length}</p>
              <p className={styles.detailText}>Targets tracked: {showTargetPosture ? targetProgress.length : 0}</p>
              <p className={styles.detailText}>Filing rows tracked: {filings.length}</p>
              <p className={styles.detailText}>Finance transaction rows tracked: {showFinanceOutflow ? payments.length : 0}</p>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Reporting Board</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading reporting board...</div>
          ) : annualEmissions.length === 0 ? (
            <div className={styles.emptyState}>No annual emissions rows are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>FY / Scope</th>
                    <th className={styles.tableHeaderCell}>Emissions</th>
                    {showTargetPosture ? (
                      <th className={styles.tableHeaderCell}>Target Posture</th>
                    ) : (
                      <th className={styles.tableHeaderCell}>Reporting Coverage</th>
                    )}
                    <th className={styles.tableHeaderCell}>
                      {showFinanceOutflow ? "Compliance / Finance" : "Compliance / Assurance"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEmissionRows.map((row) => (
                    <tr key={`${row.fy_year}-${row.scope}`}>
                      <td className={styles.tableCell}>
                        <div className={styles.name}>{row.fy_year}</div>
                        <div className={styles.meta}>Scope {row.scope}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Total: {Number(row.tco2e_total).toFixed(2)} tCO2e</div>
                        <div className={styles.meta}>Readings: {row.reading_count}</div>
                      </td>
                      {showTargetPosture ? (
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>
                            On-track targets: {targetProgress.filter((target) => target.is_on_track).length}
                          </div>
                          <div className={styles.meta}>Average achieved reduction: {averageAchievedReduction}%</div>
                        </td>
                      ) : (
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>Reporting years visible: {reportingYears}</div>
                          <div className={styles.meta}>Latest FY in view: {latestEmissionRow?.fy_year ?? "n/a"}</div>
                        </td>
                      )}
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Open filings: {openFilings.length}</div>
                        {showFinanceOutflow ? (
                          <div className={styles.meta}>Completed finance outflow: INR {completedFinanceOutflow.toFixed(0)}</div>
                        ) : (
                          <div className={styles.meta}>
                            Audience mode: {isLenderAudience ? "Lender-controlled" : "Investor-curated"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
