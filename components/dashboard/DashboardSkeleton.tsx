import styles from "@/components/dashboard/DashboardSkeleton.module.css";

/**
 * Shared dashboard loading shell used by the hub and dashboard route loading
 * state. Keeping it in CSS avoids reintroducing inline styles or transient
 * style tags during auth-driven loading.
 */
export function DashboardSkeleton() {
  return (
    <div className={styles.page}>
      <div className={`${styles.header} ${styles.pulse}`.trim()}>
        <div>
          <div className={`${styles.block} ${styles.titleBlock}`.trim()} />
          <div className={`${styles.block} ${styles.subtitleBlock}`.trim()} />
        </div>
        <div className={`${styles.block} ${styles.actionBlock}`.trim()} />
      </div>

      <div className={`${styles.metricsGrid} ${styles.pulse}`.trim()}>
        {[1, 2, 3].map((index) => (
          <div key={index} className={styles.metricCard}>
            <div className={`${styles.block} ${styles.metricLabel}`.trim()} />
            <div className={`${styles.block} ${styles.metricValue}`.trim()} />
            <div className={`${styles.block} ${styles.metricHint}`.trim()} />
          </div>
        ))}
      </div>

      <div className={`${styles.contentGrid} ${styles.pulse}`.trim()}>
        <div className={styles.panel}>
          <div className={`${styles.block} ${styles.panelTitle}`.trim()} />
          <div className={`${styles.block} ${styles.panelBody}`.trim()} />
        </div>
        <div className={styles.panel}>
          <div className={`${styles.block} ${styles.panelTitleShort}`.trim()} />
          <div className={styles.stack}>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className={`${styles.block} ${styles.row}`.trim()} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
