"use client";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { useAuditVaultData } from "@/features/audit/useAuditWorkspaceData";

export function AuditVaultView() {
  const { loading, error, statements, finalStatements, verifiedSubmissions, lockedSubmissions, signoffEvents } =
    useAuditVaultData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Verification Workspace</p>
          <h1 className={styles.title}>Loading assurance vault...</h1>
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
            <h1 className={styles.title}>Assurance Vault</h1>
            <p className={styles.subtitle}>
              Live submission, verification, and signoff posture for the current assurance scope.
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
            <p className={styles.metricLabel}>Final Statements</p>
            <p className={styles.metricValue}>{finalStatements}</p>
            <p className={styles.metricHint}>Verification rows that already include a final statement date.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Verified Submissions</p>
            <p className={styles.metricValue}>{verifiedSubmissions}</p>
            <p className={styles.metricHint}>Submissions with a recorded verified timestamp in the live schema.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Locked Submissions</p>
            <p className={styles.metricValue}>{lockedSubmissions}</p>
            <p className={styles.metricHint}>Locked submissions already preserved from further edits.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Signoff Events</p>
            <p className={styles.metricValue}>{signoffEvents}</p>
            <p className={styles.metricHint}>Signature-chain events visible for the current assurance scope.</p>
          </article>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Statements & Signoff Chain</h2>
              <p className={styles.cardDescription}>
                This vault ties together the verification row, submission lock state, and accumulated signoff events
                without bypassing the underlying DB-controlled immutability.
              </p>
            </div>
          </div>

          {statements.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No assurance records are visible in the current scope.</h3>
              <p className={styles.emptyDescription}>
                Either verification has not started yet or the current assignment scope does not expose the vault rows.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Submission</th>
                    <th className={styles.tableHeaderCell}>Verification</th>
                    <th className={styles.tableHeaderCell}>Vault Posture</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement) => (
                    <tr key={statement.id}>
                      <td className={styles.tableCell}>
                        <div className={styles.rowTitle}>FY {statement.fyYear}</div>
                        <div className={styles.rowMeta}>Submission status: {statement.submissionStatus}</div>
                        <div className={styles.rowMeta}>
                          Locked at: {statement.lockedAt ?? "Not locked"} | Verified at: {statement.verifiedAt ?? "Pending"}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.rowTitle}>{statement.verificationStatus}</div>
                        <div className={styles.rowMeta}>Opinion: {statement.opinion}</div>
                        <div className={styles.rowMeta}>
                          Final statement: {statement.finalStatementDate ?? "Pending finalization"}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.badgeRow}>
                          <span className={styles.badge} data-tone={statement.signoffCount > 0 ? "success" : "warning"}>
                            {statement.signoffCount} signoff{statement.signoffCount === 1 ? "" : "s"}
                          </span>
                          <span className={styles.badge} data-tone={statement.documentCount > 0 ? "info" : "warning"}>
                            {statement.documentCount} document{statement.documentCount === 1 ? "" : "s"}
                          </span>
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
