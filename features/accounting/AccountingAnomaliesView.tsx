"use client";

import { AIDataPoint, type AIConfidenceLevel } from "@/components/ai/AIDataPoint";
import styles from "@/features/portal/WorkspaceShell.module.css";
import { useAccountingAnomaliesData } from "@/features/accounting/useAccountingWorkspaceData";

function formatRange(low: number | null, high: number | null): string {
  if (low == null || high == null) {
    return "Expected range unavailable";
  }

  return `${low.toLocaleString("en-IN", { maximumFractionDigits: 2 })} - ${high.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getConfidenceLevel(score: number | null): AIConfidenceLevel {
  if (score == null || score < 0.6) {
    return "low";
  }

  if (score < 0.85) {
    return "medium";
  }

  return "high";
}

export function AccountingAnomaliesView() {
  const { loading, error, anomalies, unresolvedCount, confirmedCount, criticalCount } = useAccountingAnomaliesData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Accounting Workspace</p>
          <h1 className={styles.title}>Loading anomalies...</h1>
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
            <h1 className={styles.title}>AI Anomaly Detection</h1>
            <p className={styles.subtitle}>
              Live anomaly flags from the current organization scope, tied back to the related activity rows and
              expected value range.
            </p>
          </div>
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.alert} data-tone="info">
          AI anomaly flags are advisory signals only. Each score below includes confidence, source attribution, and
          human-review status so accounting teams do not mistake model output for a final compliance decision.
        </div>

        {error ? (
          <div className={styles.alert} data-tone="danger">
            {error}
          </div>
        ) : null}

        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Open Flags</p>
            <p className={styles.metricValue}>{unresolvedCount}</p>
            <p className={styles.metricHint}>Flags still awaiting confirmation or resolution.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Confirmed</p>
            <p className={styles.metricValue}>{confirmedCount}</p>
            <p className={styles.metricHint}>Flags already confirmed and moved into remediation history.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Critical Signals</p>
            <p className={styles.metricValue}>{criticalCount}</p>
            <p className={styles.metricHint}>High-score anomalies that deserve priority review in the accounting flow.</p>
          </article>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Flagged Records</h2>
              <p className={styles.cardDescription}>
                Each anomaly is shown with the linked activity posture so review teams can understand both outlier
                severity and workflow impact.
              </p>
            </div>
          </div>

          {anomalies.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No anomalies are visible in the current scope.</h3>
              <p className={styles.emptyDescription}>
                Either the queue is clear or the current assignment scope does not expose flagged records.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {anomalies.map((anomaly) => (
                <article key={anomaly.id} className={styles.listItem}>
                  <div className={styles.splitRow}>
                    <div>
                      <h3 className={styles.rowTitle}>{anomaly.sourceName}</h3>
                      <p className={styles.rowMeta}>
                        {anomaly.siteName} | Field key {anomaly.fieldKey} | Detected {anomaly.detectedAt}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span className={styles.badge} data-tone={anomaly.isConfirmed ? "success" : "warning"}>
                        {anomaly.isConfirmed ? "confirmed" : "open"}
                      </span>
                      <span className={styles.badge} data-tone={anomaly.relatedRiskLevel === "high" ? "danger" : "info"}>
                        {anomaly.relatedRiskLevel}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowMeta}>
                    Score {anomaly.anomalyScore == null ? "Not scored" : anomaly.anomalyScore.toFixed(3)} | Flagged
                    value {anomaly.flaggedValue == null ? " n/a" : ` ${anomaly.flaggedValue.toLocaleString("en-IN")}`} |
                    Expected {formatRange(anomaly.expectedRangeLow, anomaly.expectedRangeHigh)}
                  </div>
                  <div className={styles.rowMeta}>
                    Activity workflow status: <span className={styles.emphasis}>{anomaly.relatedActivityStatus}</span>
                  </div>
                  <div className={styles.stack}>
                    <AIDataPoint
                      label="Anomaly model signal"
                      value={anomaly.anomalyScore == null ? "Not scored yet" : anomaly.anomalyScore.toFixed(3)}
                      confidence={getConfidenceLevel(anomaly.anomalyScore)}
                      source="Historical activity baseline, expected-range model, and current-period variance checks."
                      reviewState={anomaly.isConfirmed ? "reviewed" : "pending"}
                      description={`Flagged value ${anomaly.flaggedValue == null ? "not available" : anomaly.flaggedValue.toLocaleString("en-IN")} against expected range ${formatRange(anomaly.expectedRangeLow, anomaly.expectedRangeHigh)}.`}
                    />
                  </div>
                  {anomaly.resolution ? (
                    <div className={styles.alert} data-tone="info">
                      Resolution note: {anomaly.resolution}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
