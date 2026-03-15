"use client";

import type { SectorData } from "@/lib/products";
import styles from "./CBAMCalculator.module.css";

interface SectorSelectorProps {
  products: Record<string, SectorData>;
  selected: string;
  onSelect: (key: string) => void;
}

export function SectorSelector({ products, selected, onSelect }: SectorSelectorProps) {
  return (
    <section>
      <p className={styles.sectionEyebrow}>01 / Sector</p>
      <div className={styles.selectorGrid}>
        {Object.entries(products).map(([key, sector]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`${styles.selectorButton} ${selected === key ? styles.selectorButtonActive : ""}`}
            aria-pressed={selected === key}
          >
            <span className={styles.selectorButtonIcon} aria-hidden="true">
              {sector.icon}
            </span>
            {sector.label}
          </button>
        ))}
      </div>
    </section>
  );
}
