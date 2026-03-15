"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface ProductEmissionRow {
  id: string;
  fy_year: string;
  reporting_period: string;
  embedded_emissions: number;
  total_emissions: number | null;
  cn_code: string | null;
  exported_to_eu: boolean | null;
  cbam_year: number | null;
  default_value_used: boolean | null;
  is_verified: boolean | null;
  ai_calculated: boolean | null;
  confidence: number | null;
}

interface PaymentRow {
  id: string;
  transaction_type: string;
  amount_inr: number | null;
  amount_eur: number | null;
  status: string;
  created_at: string;
  regulatory_filing_id: string | null;
}

interface FilingRow {
  id: string;
  filing_type: string;
  due_date: string;
  status: string;
}

/**
 * Finance liability workspace.
 *
 * This surface stays forecasting-oriented: it combines CBAM-facing product
 * emissions, filing obligations, and transaction posture without pretending to
 * replace a full treasury or ERP liability engine.
 */
export function FinanceLiabilityView() {
  const { primaryOrgId, isLoading: authLoading } = useAuth();
  const [productEmissions, setProductEmissions] = useState<ProductEmissionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tone: "info" | "warning"; text: string } | null>(null);

  async function loadLiabilityView() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [productResponse, paymentResponse, filingResponse] = await Promise.all([
      supabase
        .from("product_emissions")
        .select(
          "id, fy_year, reporting_period, embedded_emissions, total_emissions, cn_code, exported_to_eu, cbam_year, default_value_used, is_verified, ai_calculated, confidence",
        )
        .eq("organization_id", primaryOrgId)
        .order("reporting_period", { ascending: false }),
      supabase
        .from("payment_transactions")
        .select("id, transaction_type, amount_inr, amount_eur, status, created_at, regulatory_filing_id")
        .eq("organization_id", primaryOrgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("regulatory_filings")
        .select("id, filing_type, due_date, status")
        .eq("organization_id", primaryOrgId)
        .order("due_date"),
    ]);

    if (productResponse.error || paymentResponse.error || filingResponse.error) {
      setProductEmissions([]);
      setPayments([]);
      setFilings([]);
      setMessage({
        tone: "warning",
        text: "Liability forecasting data is unavailable right now. Refresh the page or verify finance read access for this organization.",
      });
      setLoading(false);
      return;
    }

    setProductEmissions((productResponse.data ?? []) as ProductEmissionRow[]);
    setPayments((paymentResponse.data ?? []) as PaymentRow[]);
    setFilings((filingResponse.data ?? []) as FilingRow[]);
    setLoading(false);
  }

  const scheduleLiabilityLoad = useEffectEvent(() => {
    void loadLiabilityView();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleLiabilityLoad);
    }
  }, [authLoading, primaryOrgId]);

  const exportedRows = productEmissions.filter((row) => row.exported_to_eu);
  const verifiedExports = exportedRows.filter((row) => row.is_verified).length;
  const liabilityPayments = payments.filter((payment) => payment.transaction_type === "regulatory_filing_fee");
  const completedLiabilityInr = liabilityPayments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount_inr ?? 0), 0);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Finance Workspace</p>
        <h1 className={styles.title}>Carbon Liability Forecasting</h1>
        <p className={styles.subtitle}>
          Monitor CBAM-relevant product emissions, filing obligations, and finance transactions together so exposure is
          visible before declaration windows and fee events arrive.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>EU Export Rows</p><p className={styles.metricValue}>{exportedRows.length}</p><p className={styles.metricHint}>Product-emissions rows currently marked as exported to the EU.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Verified Export Rows</p><p className={styles.metricValue}>{verifiedExports}</p><p className={styles.metricHint}>CBAM-facing product rows already carrying verification status.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Filing Fees Paid</p><p className={styles.metricValue}>{completedLiabilityInr.toFixed(0)}</p><p className={styles.metricHint}>Completed regulatory filing fee outflow recorded in INR.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Open Filings</p><p className={styles.metricValue}>{filings.filter((filing) => filing.status !== "submitted" && filing.status !== "accepted").length}</p><p className={styles.metricHint}>Tracked filing obligations not yet closed or accepted.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Finance Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">Liability visibility is not filing approval authority. Reviewer, approver, and verifier lanes remain separate.</div>
              <div className={styles.alert} data-tone="info">Default-value product rows and low-confidence estimates should be challenged before any board-facing exposure number is treated as final.</div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Exposure Snapshot</h2>
            <div className={styles.metaList}>
              <p className={styles.detailText}>Embedded emissions across EU-export rows: {exportedRows.reduce((sum, row) => sum + Number(row.embedded_emissions ?? 0), 0).toFixed(2)}</p>
              <p className={styles.detailText}>Rows using default values: {exportedRows.filter((row) => row.default_value_used).length}</p>
              <p className={styles.detailText}>AI-calculated rows: {exportedRows.filter((row) => row.ai_calculated).length}</p>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>CBAM Exposure Board</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading liability forecast workspace...</div>
          ) : exportedRows.length === 0 ? (
            <div className={styles.emptyState}>No CBAM-facing product emissions are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Period</th>
                    <th className={styles.tableHeaderCell}>Embedded Emissions</th>
                    <th className={styles.tableHeaderCell}>CN / CBAM</th>
                    <th className={styles.tableHeaderCell}>Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {exportedRows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.tableCell}>
                        <div className={styles.name}>{row.fy_year}</div>
                        <div className={styles.meta}>{new Date(row.reporting_period).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Embedded: {row.embedded_emissions}</div>
                        <div className={styles.meta}>Total: {row.total_emissions ?? "n/a"}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>CN code: {row.cn_code ?? "n/a"}</div>
                        <div className={styles.meta}>CBAM year: {row.cbam_year ?? "n/a"}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.badgeGroup}>
                          <span className={styles.badge} data-tone={row.is_verified ? "success" : "warning"}>{row.is_verified ? "Verified" : "Unverified"}</span>
                          <span className={styles.badge} data-tone={row.default_value_used ? "warning" : "neutral"}>{row.default_value_used ? "Default value" : "Source data"}</span>
                          {row.ai_calculated ? <span className={styles.badge} data-tone="info">AI calculated</span> : null}
                        </div>
                        <div className={styles.meta}>Confidence: {row.confidence ?? "n/a"}</div>
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
