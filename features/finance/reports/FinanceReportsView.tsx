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

/**
 * Board and investor reporting workspace.
 *
 * This page turns the live reporting data into a finance-friendly briefing
 * view without generating downloadable artifacts before that workflow is ready.
 */
export function FinanceReportsView() {
  const { primaryOrgId, isLoading: authLoading } = useAuth();
  const [annualEmissions, setAnnualEmissions] = useState<AnnualEmissionRow[]>([]);
  const [targetProgress, setTargetProgress] = useState<TargetProgressRow[]>([]);
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tone: "info" | "warning"; text: string } | null>(null);

  async function loadFinanceReportsView() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [emissionsResponse, targetResponse, filingResponse, paymentResponse] = await Promise.all([
      supabase.rpc("get_my_annual_emissions"),
      supabase.from("mv_targets_progress").select("target_name, achieved_reduction_pct, is_on_track").eq("organization_id", primaryOrgId),
      supabase.from("regulatory_filings").select("filing_type, status, due_date").eq("organization_id", primaryOrgId).order("due_date"),
      supabase.from("payment_transactions").select("transaction_type, amount_inr, status").eq("organization_id", primaryOrgId).order("created_at", { ascending: false }),
    ]);

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

    setAnnualEmissions(((emissionsResponse.data ?? []) as AnnualEmissionRow[]).filter((row) => row.organization_id === primaryOrgId));
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
  }, [authLoading, primaryOrgId]);

  const latestEmissionRow = annualEmissions
    .slice()
    .sort((left, right) => right.fy_year.localeCompare(left.fy_year))[0];
  const completedFinanceOutflow = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount_inr ?? 0), 0);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Finance Workspace</p>
        <h1 className={styles.title}>Board Material Generation</h1>
        <p className={styles.subtitle}>
          Use this summary board to brief finance, executive, and investor audiences with live emissions, target, filing,
          and finance posture before formal report generation is introduced.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Latest FY tCO2e</p><p className={styles.metricValue}>{latestEmissionRow ? Number(latestEmissionRow.tco2e_total).toFixed(1) : "0.0"}</p><p className={styles.metricHint}>Current annual emissions total from the reporting function.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>On-Track Targets</p><p className={styles.metricValue}>{targetProgress.filter((target) => target.is_on_track).length}</p><p className={styles.metricHint}>Targets whose achieved reduction currently matches the expected glidepath.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Closed Filings</p><p className={styles.metricValue}>{filings.filter((filing) => filing.status === "submitted" || filing.status === "accepted").length}</p><p className={styles.metricHint}>Regulatory rows already beyond review or pending stages.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Completed Outflow</p><p className={styles.metricValue}>{completedFinanceOutflow.toFixed(0)}</p><p className={styles.metricHint}>Completed finance transaction value currently recorded in INR.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Narrative Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">Board-facing narratives should separate measured performance from estimates, AI-supported analysis, and unresolved filing items.</div>
              <div className={styles.alert} data-tone="info">This view is intentionally live and read-only. Formal PDFs and one-click board packs should be added only after the export workflow is ready.</div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Briefing Snapshot</h2>
            <div className={styles.metaList}>
              <p className={styles.detailText}>Emission rows visible: {annualEmissions.length}</p>
              <p className={styles.detailText}>Targets tracked: {targetProgress.length}</p>
              <p className={styles.detailText}>Filing rows tracked: {filings.length}</p>
              <p className={styles.detailText}>Finance transaction rows tracked: {payments.length}</p>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Finance Reporting Board</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading finance reporting board...</div>
          ) : annualEmissions.length === 0 ? (
            <div className={styles.emptyState}>No annual emissions rows are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>FY / Scope</th>
                    <th className={styles.tableHeaderCell}>Emissions</th>
                    <th className={styles.tableHeaderCell}>Target Posture</th>
                    <th className={styles.tableHeaderCell}>Compliance / Finance</th>
                  </tr>
                </thead>
                <tbody>
                  {annualEmissions.map((row) => (
                    <tr key={`${row.fy_year}-${row.scope}`}>
                      <td className={styles.tableCell}>
                        <div className={styles.name}>{row.fy_year}</div>
                        <div className={styles.meta}>Scope {row.scope}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Total: {Number(row.tco2e_total).toFixed(2)} tCO2e</div>
                        <div className={styles.meta}>Readings: {row.reading_count}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>On-track targets: {targetProgress.filter((target) => target.is_on_track).length}</div>
                        <div className={styles.meta}>Average achieved reduction: {targetProgress.length > 0 ? (targetProgress.reduce((sum, target) => sum + Number(target.achieved_reduction_pct ?? 0), 0) / targetProgress.length).toFixed(1) : "0.0"}%</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Open filings: {filings.filter((filing) => filing.status !== "submitted" && filing.status !== "accepted").length}</div>
                        <div className={styles.meta}>Completed finance outflow: INR {completedFinanceOutflow.toFixed(0)}</div>
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
