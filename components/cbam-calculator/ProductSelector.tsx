"use client";

import type { Product, SectorData } from "@/lib/products";
import styles from "./CBAMCalculator.module.css";

interface ProductSelectorProps {
  sectorData: SectorData;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductSelector({ sectorData, selectedId, onSelect }: ProductSelectorProps) {
  return (
    <section>
      <p className={styles.sectionEyebrow}>02 / Product</p>
      <div className={styles.productList}>
        {sectorData.items.map((product: Product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product.id)}
            className={`${styles.productOption} ${selectedId === product.id ? styles.productOptionActive : ""}`}
            aria-pressed={selectedId === product.id}
          >
            <span className={styles.productRow}>
              <span>
                <span className={`${styles.productName} ${selectedId === product.id ? styles.productNameActive : ""}`}>
                  {product.label}
                </span>
                <span className={styles.productMeta}>CN {product.cn} - {product.route}</span>
              </span>

              <span>
                <span className={styles.productMetric}>{(product.worldDefault * product.indiaF).toFixed(2)}</span>
                <span className={styles.productMetricUnit}>tCO2e/t</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
