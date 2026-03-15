"use client";

import type { Product } from "@/lib/products";
import styles from "./CBAMCalculator.module.css";

interface EmissionDataPanelProps {
  product: Product;
}

export function EmissionDataPanel({ product }: EmissionDataPanelProps) {
  const indiaDefault = product.worldDefault * product.indiaF;
  const actualVerified = product.worldDefault * 0.87;

  const rows = [
    { label: "World avg default", value: product.worldDefault.toFixed(2), toneClass: styles.toneMuted },
    { label: "India default (est.)", value: indiaDefault.toFixed(2), toneClass: styles.toneAmber },
    { label: "Actual verified (est.)", value: actualVerified.toFixed(2), toneClass: styles.toneGreen },
    { label: "EU Benchmark BMg (Col B)", value: product.bmgB.toFixed(3), toneClass: styles.toneIndigo },
  ];

  return (
    <section className={styles.panelCard}>
      <p className={styles.sectionEyebrow}>Emission Data</p>
      {rows.map((row) => (
        <div key={row.label} className={styles.panelRow}>
          <span className={styles.panelLabel}>{row.label}</span>
          <span className={`${styles.panelValue} ${row.toneClass}`}>{row.value} tCO2e/t</span>
        </div>
      ))}
    </section>
  );
}
