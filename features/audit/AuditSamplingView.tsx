"use client";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { useAuditSamplingData } from "@/features/audit/useAuditWorkspaceData";

export function AuditSamplingView() {
  const {
    loading,
    error,
    samplingRows,
    activeEngagements,
    visitedSites,
    candidateRecords,
    evidenceDocuments,
    unreviewedEvidence,
  } = useAuditSamplingData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Verification Workspace</p>
          <h1 className={styles.title}>Loading sampling plan...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Verification Workspace</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Cryptographic Data Sampling</h1>
            <p className={styles.subtitle}>
              Evidence density, site visit coverage, and candidate record volume for the current verification scope.
            </p>
          </div>
        </div>
      </header>

      <main className={styles.body}>
        {error ? (
          <div className={styles.alert} data-tone="danger">
            {error}
          </div>
        ) : null}

        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Engagements</p>
            <p className={styles.metricValue}>{activeEngagements}</p>
            <p className={styles.metricHint}>Verification rows currently visible in the active scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Visited Sites</p>
            <p className={styles.metricValue}>{visitedSites}</p>
            <p className={styles.metricHint}>Total site-visit references logged across active engagements.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Candidate Records</p>
            <p className={styles.metricValue}>{candidateRecords}</p>
            <p className={styles.metricHint}>Validated or accepted activity rows available for sampling review.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Evidence Docs</p>
            <p className={styles.metricValue}>{evidenceDocuments}</p>
            <p className={styles.metricHint}>Documents already attached to active submission and verification scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Unreviewed Evidence</p>
            <p className={styles.metricValue}>{unreviewedEvidence}</p>
            <p className={styles.metricHint}>Evidence documents still missing verifier review acknowledgement.</p>
          </article>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Sampling Coverage</h2>
              <p className={styles.cardDescription}>
                This view does not invent synthetic sample pools. It surfaces the live evidence density and site
                coverage the verifier team can use for manual sampling decisions.
              </p>
            </div>
          </div>

          {samplingRows.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No sampling engagements are visible right now.</h3>
              <p className={styles.emptyDescription}>
                Either verification has not started yet or the current scope does not expose active engagements.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Engagement</th>
                    <th className={styles.tableHeaderCell}>Site Coverage</th>
                    <th className={styles.tableHeaderCell}>Sample Density</th>
                    <th className={styles.tableHeaderCell}>Assurance Pressure</th>
                  </tr>
                </thead>
                <tbody>
                  {samplingRows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.tableCell}>
                        <div className={styles.rowTitle}>{row.verifierOrganization}</div>
                        <div className={styles.rowMeta}>
                          FY {row.fyYear} | {row.status} | {row.assuranceLevel.replace(/_/g, " ")}
                        </div>
                        <div className={styles.rowMeta}>
                          Materiality {row.materialityThresholdPct}% | {row.scopesVerifiedLabel}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.rowTitle}>{row.siteVisitCount} visited site(s)</div>
                        <div className={styles.rowMeta}>{row.sitesVisitedLabel}</div>
                        <div className={styles.rowMeta}>
                          Latest visit:{" "}
                          {row.latestVisitDate
                            ? new Date(row.latestVisitDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                            : "not recorded"}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.rowMeta}>
                          Candidate records: <span className={styles.emphasis}>{row.candidateRecordCount}</span>
                        </div>
                        <div className={styles.rowMeta}>
                          Evidence docs: <span className={styles.emphasis}>{row.evidenceDocumentCount}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.badgeRow}>
                          <span className={styles.badge} data-tone={row.unreviewedEvidenceCount > 0 ? "warning" : "success"}>
                            {row.unreviewedEvidenceCount} unreviewed
                          </span>
                          {row.materialMisstatementFound ? (
                            <span className={styles.badge} data-tone="danger">
                              misstatement flagged
                            </span>
                          ) : (
                            <span className={styles.badge} data-tone="success">
                              no misstatement flag
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
