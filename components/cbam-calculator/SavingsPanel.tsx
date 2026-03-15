"use client";

import { AnimNum } from "./AnimNum";
import styles from "./CBAMCalculator.module.css";
import { formatLakhs } from "./formatters";

interface SavingsPanelProps {
  saving2034: number;
  cumulativeSaving: number;
  indiaDefault: number;
  actualVerified: number;
  inrRate: number;
}

export function SavingsPanel({
  saving2034,
  cumulativeSaving,
  indiaDefault,
  actualVerified,
  inrRate,
}: SavingsPanelProps) {
  if (saving2034 <= 0) {
    return null;
  }

  return (
    <section className={styles.savingsPanel}>
      <article className={styles.savingsColumn}>
        <div className={styles.savingsEyebrow}>Annual Saving In 2034</div>
        <div className={`${styles.savingsValue} ${styles.savingsValueSuccess}`}>
          <AnimNum value={saving2034 * inrRate / 100000} prefix="INR " suffix=" lakh" decimals={1} />
        </div>
        <div className={styles.savingsMeta}>
          <AnimNum value={saving2034} prefix="EUR " />
        </div>
      </article>

      <article className={styles.savingsColumn}>
        <div className={styles.savingsEyebrow}>8-Year Cumulative Saving</div>
        <div className={styles.savingsValue}>
          <AnimNum value={cumulativeSaving * inrRate / 100000} prefix="INR " suffix=" lakh" />
        </div>
        <div className={styles.savingsMeta}>2026 to 2034 total</div>
      </article>

      <article className={styles.savingsNarrative}>
        <div className={styles.savingsNarrativeTitle}>By switching to</div>
        <div className={styles.savingsNarrativeCopy}>
          Verified actual emissions instead of the India default penalty estimate.
        </div>
        <div className={styles.savingsNarrativeMeta}>
          {indiaDefault.toFixed(2)} to {actualVerified.toFixed(2)} tCO2e/t. That gap drives the estimated saving lane
          of {formatLakhs(saving2034 * inrRate)}.
        </div>
      </article>
    </section>
  );
}
