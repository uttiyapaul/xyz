"use client";

import styles from "./CBAMCalculator.module.css";

/**
 * Public calculator header.
 *
 * Why this exists:
 * - Frames the calculator as a regulation-aware estimate rather than a generic
 *   marketing widget.
 * - Keeps the data source and phase-in assumptions visible before the user
 *   reads any projected cost.
 */
export function CBAMHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerCopy}>
        <p className={styles.headerEyebrow}>CBAM Exposure Calculator - EU Regulation 2023/956</p>
        <h1 className={styles.headerTitle}>India Export Carbon Cost</h1>
        <p className={styles.headerBody}>
          Estimate exposure from CBAM-covered exports using the live product catalog, the published phase-in schedule,
          and a verified-emissions comparison lane.
        </p>
      </div>

      <div className={styles.headerMeta}>
        <div>Data source: EU Commission default values 2026 and Regulation 2025/2620</div>
        <div>Phase-in: 2.5% (2026) to 100% (2034)</div>
        <div className={styles.headerMetaAccent}>Free public estimate - no account required</div>
      </div>
    </header>
  );
}
