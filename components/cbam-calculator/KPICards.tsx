"use client";

import { AnimNum } from "./AnimNum";
import styles from "./CBAMCalculator.module.css";

interface KPICardsProps {
  cost2026: number;
  cost2030: number;
  cost2034: number;
  inrRate: number;
}

export function KPICards({ cost2026, cost2030, cost2034, inrRate }: KPICardsProps) {
  const cards = [
    { label: "2026 (2.5%)", value: cost2026, inrValue: cost2026 * inrRate, tag: "First year", tone: "amber" },
    { label: "2030 (48.5%)", value: cost2030, inrValue: cost2030 * inrRate, tag: "Mid-point", tone: "orange" },
    { label: "2034 (100%)", value: cost2034, inrValue: cost2034 * inrRate, tag: "Full CBAM", tone: "red" },
  ] as const;

  return (
    <section>
      <p className={styles.sectionEyebrow}>Annual CBAM Exposure - India Default Values</p>
      <div className={styles.kpiGrid}>
        {cards.map((card) => (
          <article key={card.label} className={styles.kpiCard} data-tone={card.tone}>
            <p className={styles.kpiLabel} data-tone={card.tone}>
              {card.label}
            </p>
            <div className={styles.kpiValue}>
              <AnimNum value={card.value} prefix="EUR " />
            </div>
            <div className={styles.kpiSecondary} data-tone={card.tone}>
              <AnimNum value={card.inrValue} prefix="INR " />
            </div>
            <div className={styles.kpiHint}>{card.tag}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
