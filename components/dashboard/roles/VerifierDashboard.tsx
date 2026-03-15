"use client";

import { AlertTriangle, CheckCircle2, Download, FileSearch, Search, ShieldCheck } from "lucide-react";

import styles from "@/components/dashboard/roles/VerifierDashboard.module.css";

const MOCK_METRICS = [
  { label: "Verification Progress", value: "45%", subtext: null, tone: "info", color: "var(--status-info)", icon: ShieldCheck },
  { label: "Active RFIs", value: "4", subtext: "Pending client response", tone: "warning", color: "var(--status-warning)", icon: AlertTriangle },
  { label: "Sample Coverage (Scope 2)", value: "12.5%", subtext: "Target >10%", tone: "success", color: "var(--status-success)", icon: FileSearch },
] as const;

const MOCK_AUDIT_SAMPLE = [
  { id: "SMP-101", metric: "Site B - Electricity", period: "Jan 2026", hash: "0x8F9...2A1", status: "Verified" },
  { id: "SMP-102", metric: "Fleet Diesel Log", period: "Jan 2026", hash: "0x4B2...9C3", status: "Needs RFI" },
  { id: "SMP-103", metric: "Site A - Nat Gas", period: "Feb 2026", hash: "0x1A7...5E8", status: "Pending" },
  { id: "SMP-104", metric: "Travel - Flights", period: "Q1 2026", hash: "0x9D5...4F4", status: "Pending" },
] as const;

function getStatusTone(status: (typeof MOCK_AUDIT_SAMPLE)[number]["status"]) {
  if (status === "Verified") {
    return "verified";
  }

  if (status === "Needs RFI") {
    return "rfi";
  }

  return "pending";
}

/**
 * The verifier shell stays read-only and evidence-first. It intentionally keeps
 * RFI, sampling, and document handling separate from operational review lanes.
 */
export function VerifierDashboard() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Independent Verification Space</h1>
          <p className={styles.subtitle}>ISO 14064-3 / CBAM third-party auditor view. Read-only access.</p>
        </div>
        <button type="button" className={styles.heroAction}>
          Raise RFI
        </button>
      </header>

      <div className={styles.metricsGrid}>
        {MOCK_METRICS.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <metric.icon size={48} color={metric.color} />
            </div>
            <p className={styles.metricLabel}>{metric.label}</p>
            <p className={styles.metricValue} data-tone={metric.tone}>
              {metric.value}
            </p>
            {metric.subtext ? <p className={styles.metricSubtext}>{metric.subtext}</p> : null}
          </article>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Active Sampling Pool</h2>
              <p className={styles.cardText}>
                Evidence review stays read-only here. Verifiers can inspect hashes and raise RFIs without crossing into
                client approval controls.
              </p>
            </div>
            <div className={styles.searchShell}>
              <Search size={14} className={styles.searchIcon} />
              <input type="text" placeholder="Search invoices..." className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Sample ID</th>
                  <th className={styles.tableHeaderCell}>Data Point</th>
                  <th className={styles.tableHeaderCell}>Period</th>
                  <th className={styles.tableHeaderCell}>Audit Hash</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_SAMPLE.map((sample) => (
                  <tr key={sample.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.monoText}`}>{sample.id}</td>
                    <td className={styles.tableCell}>{sample.metric}</td>
                    <td className={`${styles.tableCell} ${styles.metaText}`}>{sample.period}</td>
                    <td className={styles.tableCell}>
                      <button type="button" className={styles.hashButton}>
                        {sample.hash}
                      </button>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.badge} data-tone={getStatusTone(sample.status)}>
                        {sample.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className={styles.stack}>
          <div className={styles.notice}>
            Verification roles remain independent from operational approval surfaces. This dashboard supports evidence
            inspection, sampling, and RFIs only.
          </div>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Verification Documents</h2>
            <p className={styles.cardText}>
              Upload your verified methodology and final ISO 14064-3 statements here when document workflows are fully connected.
            </p>

            <div className={styles.documentList}>
              <div className={styles.documentRow}>
                <div className={styles.documentMeta}>
                  <CheckCircle2 size={16} color="var(--status-success)" />
                  <span className={styles.documentName}>Audit Plan 2026.pdf</span>
                </div>
                <button type="button" className={styles.hashButton}>
                  <Download size={16} />
                </button>
              </div>

              <div className={styles.documentRow}>
                <div className={styles.documentMeta}>
                  <FileSearch size={16} color="rgba(191, 196, 255, 0.94)" />
                  <span className={styles.documentName}>Final verification report</span>
                </div>
                <button type="button" className={styles.ghostAction}>
                  Upload report
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
