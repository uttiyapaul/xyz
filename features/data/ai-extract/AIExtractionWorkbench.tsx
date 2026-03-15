"use client";

import { AIDataPoint, type AIConfidenceLevel, type AIReviewState } from "@/components/ai/AIDataPoint";
import styles from "@/features/data/ai-extract/AIExtractionWorkbench.module.css";
import {
  useAIExtractionWorkspaceData,
  type AIExtractionReadingItem,
} from "@/features/data/ai-extract/useAIExtractionWorkspaceData";

const REVIEW_GUARDRAILS = [
  {
    label: "No silent posting",
    copy: "AI-suggested values remain in a review lane until a human confirms them against evidence and route scope.",
  },
  {
    label: "No hidden provenance",
    copy: "Document extraction status, justified fields, and validation pressure stay visible before downstream use.",
  },
  {
    label: "No raw provider errors",
    copy: "Users should receive safe workflow guidance, not parser internals or provider exception text.",
  },
] as const;

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatPeriod(value: string | null): string {
  if (!value) {
    return "Period not recorded";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function humanizeToken(value: string): string {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getConfidenceLevel(trustScore: number | null): AIConfidenceLevel {
  const normalized = trustScore == null ? 0 : trustScore <= 1 ? trustScore : trustScore / 100;

  if (normalized >= 0.85) {
    return "high";
  }

  if (normalized >= 0.6) {
    return "medium";
  }

  return "low";
}

function getReviewState(row: AIExtractionReadingItem): AIReviewState {
  return row.humanReviewed ? "reviewed" : "pending";
}

/**
 * Live AI extraction workbench.
 *
 * This route now uses the current evidence and validation schema instead of a
 * future-state placeholder. The UI keeps the audit-required disclosure pattern
 * visible while grounding the page in live document, reading, and validation
 * rows.
 */
export function AIExtractionWorkbench() {
  const { loading, error, evidence, readings, validationSummary } = useAIExtractionWorkspaceData();
  const aiReadings = readings.filter((reading) => reading.isAiGenerated);
  const topAiReadings = aiReadings.slice(0, 3);
  const pendingExtraction = evidence.filter((document) => document.extractionStatus !== "completed").length;
  const pendingHumanReview = aiReadings.filter((reading) => !reading.humanReviewed).length;
  const lowTrustSuggestions = aiReadings.filter((reading) => {
    const normalized = reading.trustScore == null ? 0 : reading.trustScore <= 1 ? reading.trustScore : reading.trustScore / 100;
    return normalized < 0.6;
  }).length;
  const flaggedValidationRows = validationSummary.reduce((sum, row) => sum + row.flaggedCount, 0);

  if (loading) {
    return (
      <section className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>AI Intake Workspace</p>
          <h1 className={styles.title}>Loading AI extraction board...</h1>
          <p className={styles.subtitle}>
            Reading live document extraction posture, AI-generated review rows, and validation signals for the current
            organization scope.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>AI Intake Workspace</p>
        <h1 className={styles.title}>AI Invoice Parsing</h1>
        <p className={styles.subtitle}>
          Review live extraction posture from evidence documents, AI-generated reading rows, and validation pressure
          before any suggestion is trusted downstream. This route stays disclosure-first and human-review controlled by
          design.
        </p>
      </header>

      {error ? (
        <div className={styles.alert} data-tone="warning">
          {error}
        </div>
      ) : (
        <div className={styles.alert}>
          AI extraction suggestions are never authoritative by default. Confidence, source attribution, and review state
          stay visible until a human reviewer confirms the proposal.
        </div>
      )}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pending Extraction</p>
          <p className={styles.metricValue}>{pendingExtraction}</p>
          <p className={styles.metricHint}>`ghg_documents` rows whose extraction has not yet completed.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pending Human Review</p>
          <p className={styles.metricValue}>{pendingHumanReview}</p>
          <p className={styles.metricHint}>AI-generated monthly reading rows still waiting for human confirmation.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Low-Trust Suggestions</p>
          <p className={styles.metricValue}>{lowTrustSuggestions}</p>
          <p className={styles.metricHint}>AI suggestions whose trust score currently sits below the 0.6 caution line.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Flagged Validation Rows</p>
          <p className={styles.metricValue}>{flaggedValidationRows}</p>
          <p className={styles.metricHint}>Rows currently flagged in the AI validation summary view.</p>
        </article>
      </section>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Extraction Ledger</h2>
            <p className={styles.cardDescription}>
              Current evidence rows tied to document extraction. This stays read-only and truthfully reflects the live
              document ledger instead of inventing a future upload queue.
            </p>

            {evidence.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No evidence documents are visible yet.</h3>
                <p className={styles.emptyDescription}>
                  The AI intake lane is live, but this organization scope is not carrying `ghg_documents` rows yet.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Document</th>
                      <th className={styles.tableHeaderCell}>Extraction</th>
                      <th className={styles.tableHeaderCell}>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.slice(0, 8).map((document) => (
                      <tr key={document.id}>
                        <td className={styles.tableCell}>
                          <p className={styles.primaryText}>{document.fileName}</p>
                          <p className={styles.metaText}>
                            {humanizeToken(document.documentType)} | {document.siteName}
                          </p>
                          <p className={styles.metaText}>Uploaded {formatDateTime(document.uploadedAt)}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.badge} data-tone={document.extractionStatus === "completed" ? "success" : "warning"}>
                            {humanizeToken(document.extractionStatus)}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.metaText}>Review: {humanizeToken(document.reviewStatus)}</p>
                          <p className={styles.metaText}>Justified fields: {document.justifiedFieldCount}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Live AI Suggestions</h2>
            <p className={styles.cardDescription}>
              The disclosure card below now reflects live AI-generated reading rows instead of a static example.
            </p>

            {topAiReadings.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No AI-generated reading rows are visible.</h3>
                <p className={styles.emptyDescription}>
                  This scope is currently not carrying `is_ai_generated` monthly reading rows for review.
                </p>
              </div>
            ) : (
              <div className={styles.stack}>
                {topAiReadings.map((reading) => (
                  <AIDataPoint
                    key={reading.id}
                    label={`${reading.siteName} reading`}
                    value={formatPeriod(reading.reportingPeriod)}
                    confidence={getConfidenceLevel(reading.trustScore)}
                    source="ghg_monthly_readings trust score, anomaly flag, and current review state"
                    reviewState={getReviewState(reading)}
                    description={`Status ${humanizeToken(reading.status)}.${reading.anomalyFlag ? " Anomaly flag raised." : " No anomaly flag raised."} Updated ${formatDateTime(reading.updatedAt)}.`}
                  />
                ))}
              </div>
            )}
          </article>
        </div>

        <div className={styles.stack}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>AI Validation Summary</h2>
            <p className={styles.cardDescription}>
              Platform validation posture for the current organization, grounded in `mv_ai_validation_summary`.
            </p>

            {validationSummary.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No validation summary rows are visible.</h3>
                <p className={styles.emptyDescription}>
                  The organization scope is not currently returning AI validation summary data.
                </p>
              </div>
            ) : (
              <div className={styles.stack}>
                {validationSummary.slice(0, 6).map((row) => (
                  <div key={`${row.tableName}-${row.validationStatus}`} className={styles.listItem}>
                    <div className={styles.listHeader}>
                      <p className={styles.primaryText}>{row.tableName}</p>
                      <span
                        className={styles.badge}
                        data-tone={row.validationStatus === "passed" ? "success" : row.flaggedCount > 0 ? "warning" : "info"}
                      >
                        {humanizeToken(row.validationStatus)}
                      </span>
                    </div>
                    <p className={styles.metaText}>
                      {row.recordCount} row(s) | avg trust {row.avgTrust != null ? row.avgTrust.toFixed(2) : "n/a"} |
                      flagged {row.flaggedCount}
                    </p>
                    <p className={styles.metaText}>Risk level: {row.riskLevel ? humanizeToken(row.riskLevel) : "Not scored"}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Human Review Guardrails</h2>
            <p className={styles.cardDescription}>
              These controls must remain visible even as the upload and parser backend matures.
            </p>

            <ul className={styles.list}>
              {REVIEW_GUARDRAILS.map((guardrail) => (
                <li key={guardrail.label} className={styles.listItem}>
                  <span className={styles.listLabel}>{guardrail.label}</span>
                  <span className={styles.listCopy}>{guardrail.copy}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
