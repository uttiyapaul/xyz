"use client";

import styles from "./CBAMCalculator.module.css";
import { formatEur } from "./formatters";

interface YearRow {
  year: number;
  costDefault: number;
  costActual: number;
  saving: number;
}

interface TrajectoryChartProps {
  data: YearRow[];
  inrRate: number;
}

/**
 * Visual comparison between default and verified annual CBAM exposure.
 *
 * Why this exists:
 * - Uses SVG width attributes for the computed bars so the chart remains free
 *   of inline CSS even though bar lengths are data-driven.
 * - Keeps the chart readable with or without the inline value label depending
 *   on available bar width.
 */
export function TrajectoryChart({ data, inrRate }: TrajectoryChartProps) {
  const maxCost = Math.max(...data.map((row) => row.costDefault));

  if (maxCost === 0) {
    return <div className={styles.trajectoryEmpty}>Enter export volume to see the yearly cost projection.</div>;
  }

  return (
    <div>
      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatchDefault} aria-hidden="true" />
          India default values
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatchActual} aria-hidden="true" />
          Verified actual emissions
        </span>
      </div>

      <div className={styles.trajectoryList}>
        {data.map((row) => {
          const defaultWidth = (row.costDefault / maxCost) * 100;
          const actualWidth = (row.costActual / maxCost) * 100;
          const isKeyYear = row.year === 2026 || row.year === 2030 || row.year === 2034;
          const labelX = Math.min(Math.max(defaultWidth - 2, 18), 97);

          return (
            <div key={row.year} className={styles.trajectoryRow}>
              <span className={`${styles.trajectoryYear} ${isKeyYear ? styles.trajectoryYearKey : ""}`}>
                {row.year}
              </span>

              <div className={styles.trajectoryTrack}>
                <svg
                  className={styles.trajectorySvg}
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  aria-label={`Projected default cost ${formatEur(row.costDefault)} and verified cost ${formatEur(row.costActual)} for ${row.year}`}
                >
                  <rect
                    className={`${styles.trajectoryDefaultBar} ${isKeyYear ? styles.trajectoryDefaultBarKey : ""}`}
                    x="0"
                    y="0"
                    width={defaultWidth}
                    height="24"
                    rx="3"
                    ry="3"
                  />
                  <rect className={styles.trajectoryActualBar} x="0" y="6" width={actualWidth} height="12" rx="2" ry="2" />
                  {defaultWidth > 28 ? (
                    <text className={styles.trajectoryInlineValue} x={labelX} y="15">
                      {formatEur(row.costDefault)}
                    </text>
                  ) : null}
                </svg>
              </div>

              <span className={styles.trajectorySave}>
                {row.saving > 0
                  ? `save INR ${Math.round((row.saving * inrRate) / 100000).toLocaleString("en-IN")}L`
                  : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
