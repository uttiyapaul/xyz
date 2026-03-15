"use client";

import styles from "./CBAMCalculator.module.css";

const QUICK_PICKS = [500, 1000, 5000, 10000, 50000];

interface VolumeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function VolumeInput({ value, onChange }: VolumeInputProps) {
  return (
    <section>
      <p className={styles.sectionEyebrow}>03 / Annual Export Volume To EU</p>

      <div className={styles.inputWrap}>
        <label className={styles.visuallyHidden} htmlFor="cbam-annual-volume">
          Annual export volume to the EU in tonnes per year
        </label>
        <input
          id="cbam-annual-volume"
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. 5000"
          className={styles.volumeInput}
          inputMode="decimal"
        />
        <span className={styles.unitTag}>tonnes/yr</span>
      </div>

      <div className={styles.quickPickList}>
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick}
            type="button"
            onClick={() => onChange(String(pick))}
            className={`${styles.quickPickButton} ${parseFloat(value) === pick ? styles.quickPickActive : ""}`}
            aria-label={`Set annual export volume to ${pick.toLocaleString("en-IN")} tonnes`}
          >
            {pick >= 1000 ? `${pick / 1000}k` : pick}t
          </button>
        ))}
      </div>
    </section>
  );
}
