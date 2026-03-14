"use client";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { useSubmissionHistoryData } from "@/features/data/useSubmissionHistoryData";

function getTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "accepted") {
    return "success";
  }

  if (status === "pending" || status === "validated") {
    return "warning";
  }

  if (status === "rejected" || status === "failed") {
    return "danger";
  }

  return "info";
}

export function DataHistoryView() {
  const { loading, error, activities, documents, openItems, acceptedItems } = useSubmissionHistoryData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Data Input Workspace</p>
          <h1 className={styles.title}>Loading submission history...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Data Input Workspace</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Submission History</h1>
            <p className={styles.subtitle}>
              Personal activity and evidence history scoped to the current user and the active organization assignment.
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
            <p className={styles.metricLabel}>My Activities</p>
            <p className={styles.metricValue}>{activities.length}</p>
            <p className={styles.metricHint}>Activity rows created by the active user in the current assignment scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>My Documents</p>
            <p className={styles.metricValue}>{documents.length}</p>
            <p className={styles.metricHint}>Evidence uploads recorded against the active user in the live schema.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Open Items</p>
            <p className={styles.metricValue}>{openItems}</p>
            <p className={styles.metricHint}>Rows or documents that are still progressing through review.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Accepted Items</p>
            <p className={styles.metricValue}>{acceptedItems}</p>
            <p className={styles.metricHint}>Records that already reached accepted status in the current history view.</p>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Activity Records</h2>
                <p className={styles.cardDescription}>
                  This table is intentionally personal. It shows only activity rows created by the active user.
                </p>
              </div>
            </div>
            {activities.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No personal activity rows were found.</h3>
                <p className={styles.emptyDescription}>
                  Activity rows appear here after you create them inside the scoped data-entry workspace.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {activities.map((activity) => (
                  <article key={activity.id} className={styles.listItem}>
                    <div className={styles.splitRow}>
                      <div>
                        <h3 className={styles.rowTitle}>{activity.activityType}</h3>
                        <p className={styles.rowMeta}>
                          {activity.reportingPeriod} | {activity.siteName} | FY {activity.fyYear ?? "Unassigned"}
                        </p>
                      </div>
                      <span className={styles.badge} data-tone={getTone(activity.status)}>
                        {activity.status}
                      </span>
                    </div>
                    <div className={styles.rowMeta}>{activity.quantityLabel}</div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.sidebarStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Evidence Uploads</h2>
                  <p className={styles.cardDescription}>
                    Evidence history stays personal too, which makes it easier to track response and review status.
                  </p>
                </div>
              </div>
              {documents.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3 className={styles.emptyTitle}>No personal evidence uploads yet.</h3>
                  <p className={styles.emptyDescription}>
                    Uploaded documents show up here when they are recorded against the active user.
                  </p>
                </div>
              ) : (
                <div className={styles.list}>
                  {documents.map((document) => (
                    <div key={document.id} className={styles.listItem}>
                      <div className={styles.splitRow}>
                        <div>
                          <div className={styles.rowTitle}>{document.fileName}</div>
                          <div className={styles.rowMeta}>
                            {document.siteName} | {document.documentType}
                          </div>
                        </div>
                        <span className={styles.badge} data-tone={getTone(document.reviewStatus)}>
                          {document.reviewStatus}
                        </span>
                      </div>
                      <div className={styles.rowMeta}>Uploaded {document.uploadedAt}</div>
                      {document.verifierComment ? (
                        <div className={styles.alert} data-tone="info">
                          Verifier note: {document.verifierComment}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
