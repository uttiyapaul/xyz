"use client";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { useAccountingApprovalsData } from "@/features/accounting/useAccountingWorkspaceData";

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getStatusTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "accepted" || status === "validated") {
    return "success";
  }

  if (status === "flagged" || status === "pending") {
    return "warning";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "info";
}

/**
 * This queue is intentionally role-aware.
 * - reviewers can validate, flag, or reject candidate records
 * - approvers can accept or reject validated records, but not self-originated ones
 * - carbon accountants get a live oversight queue without collapsing the SoD boundary
 */
export function AccountingApprovalsView() {
  const {
    loading,
    error,
    role,
    queueItems,
    queueLabel,
    pendingCount,
    flaggedCount,
    blockedCount,
    savingId,
    updateActivityStatus,
  } = useAccountingApprovalsData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Accounting Workspace</p>
          <h1 className={styles.title}>Loading approval queue...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Accounting Workspace</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Data Approval Queue</h1>
            <p className={styles.subtitle}>
              Live queue for {queueLabel} duties. The view honors organization and site scope, and the action buttons
              keep final acceptance separate from originators.
            </p>
          </div>
        </div>
        <div className={styles.scopeNote}>
          <span className={styles.emphasis}>{role.replace(/_/g, " ")}</span> is constrained by SoD rules here. Final
          acceptance is available only to approvers and is blocked on self-originated records.
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
            <p className={styles.metricLabel}>Queue Items</p>
            <p className={styles.metricValue}>{queueItems.length}</p>
            <p className={styles.metricHint}>Records currently visible within your active org and site scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Pending</p>
            <p className={styles.metricValue}>{pendingCount}</p>
            <p className={styles.metricHint}>Records still waiting for first-line validation.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Flagged</p>
            <p className={styles.metricValue}>{flaggedCount}</p>
            <p className={styles.metricHint}>Records that need further review before they can proceed.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>SoD Holds</p>
            <p className={styles.metricValue}>{blockedCount}</p>
            <p className={styles.metricHint}>Approval actions blocked because the current user also originated the row.</p>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <aside className={styles.sidebarStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Role Protocol</h2>
                  <p className={styles.cardDescription}>
                    This queue keeps review and acceptance separated so the same user does not silently complete both
                    stages.
                  </p>
                </div>
              </div>
              <div className={styles.cardSection}>
                <div className={styles.stack}>
                  <div className={styles.alert} data-tone="info">
                    Reviewers validate or flag records, while approvers perform the final accept or reject step.
                  </div>
                  <div className={styles.alert} data-tone="warning">
                    If a row was created by the active user, acceptance stays blocked to preserve separation of duties.
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Live Queue</h2>
                <p className={styles.cardDescription}>
                  Activity rows, linked evidence, and submission posture are shown together so decisions stay grounded
                  in the current record context.
                </p>
              </div>
            </div>

            {queueItems.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No records are waiting in your queue.</h3>
                <p className={styles.emptyDescription}>
                  Either the queue is clear for your role, or the current session scope does not expose additional rows.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Period</th>
                      <th className={styles.tableHeaderCell}>Source</th>
                      <th className={styles.tableHeaderCell}>Evidence</th>
                      <th className={styles.tableHeaderCell}>Quality</th>
                      <th className={styles.tableHeaderCell}>Submission</th>
                      <th className={joinClasses(styles.tableHeaderCell, styles.tableCellNumeric)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.tableCell}>
                          <div className={styles.rowTitle}>{item.reportingPeriod}</div>
                          <div className={styles.rowMeta}>
                            {item.siteName} | {item.fyYear ?? "Unassigned FY"}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.rowTitle}>{item.sourceName}</div>
                          <div className={styles.rowMeta}>
                            {item.activityType.replace(/_/g, " ")} | {item.quantity.toLocaleString("en-IN")} {item.unit}
                          </div>
                          <div className={styles.badgeRow}>
                            <span className={styles.badge} data-tone={getStatusTone(item.status)}>
                              {item.status}
                            </span>
                            {item.sourceScope ? (
                              <span className={styles.badge} data-tone="info">
                                Scope {item.sourceScope}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.rowTitle}>{item.evidenceLabel}</div>
                          <div className={styles.rowMeta}>Review status: {item.evidenceStatus}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.rowMeta}>Risk: {item.riskLevel}</div>
                          <div className={styles.rowMeta}>
                            Trust score: {item.trustScore == null ? "Not scored" : item.trustScore.toFixed(3)}
                          </div>
                          {item.sodBlockReason ? (
                            <div className={styles.badgeRow}>
                              <span className={styles.badge} data-tone="danger">
                                SoD hold
                              </span>
                            </div>
                          ) : null}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.rowTitle}>{item.submissionStatus}</div>
                          <div className={styles.rowMeta}>
                            Approval stage reflects both activity status and the enclosing submission posture.
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.tableCellActions}>
                            {(role === "data_reviewer" || role === "carbon_accountant") && (
                              <>
                                <button
                                  type="button"
                                  className={joinClasses(styles.button, styles.buttonPrimary)}
                                  onClick={() => updateActivityStatus(item, "validated")}
                                  disabled={savingId === item.id}
                                >
                                  Validate
                                </button>
                                <button
                                  type="button"
                                  className={joinClasses(styles.button, styles.buttonWarning)}
                                  onClick={() => updateActivityStatus(item, "flagged")}
                                  disabled={savingId === item.id}
                                >
                                  Flag
                                </button>
                                <button
                                  type="button"
                                  className={joinClasses(styles.button, styles.buttonDanger)}
                                  onClick={() => updateActivityStatus(item, "rejected")}
                                  disabled={savingId === item.id}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {role === "data_approver" && (
                              <>
                                <button
                                  type="button"
                                  className={joinClasses(styles.button, styles.buttonPrimary)}
                                  onClick={() => updateActivityStatus(item, "accepted")}
                                  disabled={savingId === item.id || item.sodBlockReason != null || item.status !== "validated"}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className={joinClasses(styles.button, styles.buttonDanger)}
                                  onClick={() => updateActivityStatus(item, "rejected")}
                                  disabled={savingId === item.id || item.sodBlockReason != null}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                          {item.sodBlockReason ? <div className={styles.rowMeta}>{item.sodBlockReason}</div> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
