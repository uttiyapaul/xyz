"use client";

import styles from "./CBAMCalculator.module.css";

interface MarketParametersProps {
  euaPrice: number;
  inrRate: number;
  onEuaChange: (value: number) => void;
  onInrChange: (value: number) => void;
}

export function MarketParameters({ euaPrice, inrRate, onEuaChange, onInrChange }: MarketParametersProps) {
  return (
    <section>
      <p className={styles.sectionEyebrow}>04 / Market Parameters</p>

      <div className={styles.rangeBlock}>
        <div className={styles.rangeRow}>
          <label className={styles.rangeLabel} htmlFor="cbam-eua-price">
            EU ETS Carbon Price
          </label>
          <span className={styles.rangeValue}>EUR {euaPrice}/tCO2e</span>
        </div>
        <input
          id="cbam-eua-price"
          type="range"
          min={30}
          max={150}
          step={1}
          value={euaPrice}
          onChange={(event) => onEuaChange(Number(event.target.value))}
          className={styles.rangeInput}
        />
        <div className={styles.rangeHints}>
          <span>EUR 30 low</span>
          <span>EUR 65 current</span>
          <span>EUR 150 high</span>
        </div>
      </div>

      <div>
        <div className={styles.rangeRow}>
          <label className={styles.rangeLabel} htmlFor="cbam-inr-rate">
            INR / EUR rate
          </label>
          <span className={styles.rangeValue}>INR {inrRate}/EUR</span>
        </div>
        <input
          id="cbam-inr-rate"
          type="range"
          min={80}
          max={110}
          step={1}
          value={inrRate}
          onChange={(event) => onInrChange(Number(event.target.value))}
          className={styles.rangeInput}
        />
        <div className={styles.rangeHints}>
          <span>INR 80</span>
          <span>INR {inrRate}</span>
          <span>INR 110</span>
        </div>
      </div>
    </section>
  );
}
