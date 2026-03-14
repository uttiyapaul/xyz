"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "@/features/portal/WorkspaceShell.module.css";
import { useAuditRfisData } from "@/features/audit/useAuditWorkspaceData";

export function AuditRfisView() {
  const { roles } = useAuth();
  const { loading, error, findings, activeVerifications, openFindings, waitingForClient, closedFindings } =
    useAuditRfisData();
  const role = roles[0] ?? "verifier_reviewer";

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Verification Workspace</p>
          <h1 className={styles.title}>Loading RFI queue...</h1>
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
            <h1 className={styles.title}>Active RFIs</h1>
            <p className={styles.subtitle}>
              Findings, clarification posture, and response density across the current verification scope.
            </p>
          </div>
        </div>
        <div className={styles.scopeNote}>
          <span className={styles.emphasis}>{role.replace(/_/g, " ")}</span> stays read-only here on purpose. Client
          remediation and verifier acceptance remain separate concerns.
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
            <p className={styles.metricLabel}>Active Engagements</p>
            <p className={styles.metricValue}>{activeVerifications}</p>
            <p className={styles.metricHint}>Verification engagements visible inside the current organization and site scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Open Findings</p>
            <p className={styles.metricValue}>{openFindings}</p>
            <p className={styles.metricHint}>Findings still waiting on remediation, evidence, or verifier closure.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Awaiting Client</p>
            <p className={styles.metricValue}>{waitingForClient}</p>
            <p className={styles.metricHint}>Open findings that still have no recorded client response.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Closed / Progressed</p>
            <p className={styles.metricValue}>{closedFindings}</p>
            <p className={styles.metricHint}>Findings already progressed beyond the initial open state.</p>
          </article>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Findings Queue</h2>
              <p className={styles.cardDescription}>
                Findings are grouped with response counts so verifier teams can see whether the client side has already
                engaged the issue.
              </p>
            </div>
          </div>

          {findings.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No findings are visible in the current audit scope.</h3>
              <p className={styles.emptyDescription}>
                Either the engagement queue is clear, or the current assignment scope does not expose findings.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {findings.map((finding) => (
                <article key={finding.id} className={styles.listItem}>
                  <div className={styles.splitRow}>
                    <div>
                      <h3 className={styles.rowTitle}>{finding.findingRef}</h3>
                      <p className={styles.rowMeta}>
                        {finding.verifierOrganization} | FY {finding.fyYear} | {finding.findingType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span
                        className={styles.badge}
                        data-tone={finding.severity === "critical" || finding.severity === "major" ? "danger" : "warning"}
                      >
                        {finding.severity}
                      </span>
                      <span className={styles.badge} data-tone={finding.status === "open" ? "warning" : "success"}>
                        {finding.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowMeta}>{finding.description}</div>
                  <div className={styles.rowMeta}>
                    Scope affected: {finding.scopeAffected ?? "n/a"} | Estimated impact:{" "}
                    {finding.impactTco2e == null
                      ? "not stated"
                      : `${finding.impactTco2e.toLocaleString("en-IN", { maximumFractionDigits: 2 })} tCO2e`}
                  </div>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge} data-tone={finding.responseCount > 0 ? "info" : "warning"}>
                      {finding.responseCount} response{finding.responseCount === 1 ? "" : "s"}
                    </span>
                    {finding.waitingForClient ? (
                      <span className={styles.badge} data-tone="danger">
                        waiting for client
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
