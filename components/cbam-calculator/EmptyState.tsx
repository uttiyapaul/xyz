"use client";

import styles from "./CBAMCalculator.module.css";

export function EmptyState() {
  return (
    <section className={styles.emptyState}>
      <p className={styles.emptyEyebrow}>Enter export volume to calculate</p>
      <h2 className={styles.emptyTitle}>How much will CBAM cost your EU exports?</h2>
      <div className={styles.emptyMeta}>
        <div>Based on EU Commission Regulation 2025/2620.</div>
        <div>Product defaults and benchmark references come from the live catalog.</div>
        <div>Phase-in trajectory 2026 to 2034.</div>
      </div>
    </section>
  );
}
