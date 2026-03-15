import styles from "@/components/ai/AIDataPoint.module.css";

export type AIConfidenceLevel = "high" | "medium" | "low";
export type AIReviewState = "reviewed" | "pending";

interface AIDataPointProps {
  label: string;
  value: string;
  confidence: AIConfidenceLevel;
  source: string;
  reviewState: AIReviewState;
  description: string;
}

function getConfidenceClass(confidence: AIConfidenceLevel): string {
  if (confidence === "high") {
    return styles.confidenceHigh;
  }

  if (confidence === "medium") {
    return styles.confidenceMedium;
  }

  return styles.confidenceLow;
}

/**
 * Shared AI disclosure primitive required by the 2026 audit report.
 *
 * Every AI-assisted value should state:
 * - what the model produced
 * - confidence level
 * - where the signal came from
 * - whether a human has reviewed it yet
 */
export function AIDataPoint({
  label,
  value,
  confidence,
  source,
  reviewState,
  description,
}: AIDataPointProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={styles.metaRow}>
          <span className={`${styles.badge} ${getConfidenceClass(confidence)}`.trim()}>
            {confidence} confidence
          </span>
          <span className={`${styles.badge} ${reviewState === "reviewed" ? styles.reviewed : styles.pending}`.trim()}>
            {reviewState === "reviewed" ? "human reviewed" : "awaiting review"}
          </span>
        </div>
      </div>

      <p className={styles.value}>{value}</p>
      <p className={styles.description}>{description}</p>
      <div className={styles.source}>Source attribution: {source}</div>
    </div>
  );
}
