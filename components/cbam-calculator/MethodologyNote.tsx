"use client";

import styles from "./CBAMCalculator.module.css";

interface MethodologyNoteProps {
  indiaF: number;
}

export function MethodologyNote({ indiaF }: MethodologyNoteProps) {
  return (
    <section className={styles.noteCard}>
      <p className={styles.sectionEyebrow}>Methodology</p>
      <p className={styles.noteCopy}>
        CBAM certificates = CBAM factor x max(0, embedded emissions - CSCF x BMg_B) x tonnage. CSCF = 0.87. BMg_B
        values are drawn from Regulation 2025/2620 Column B. India defaults are estimated as world average x {indiaF}.
        <span className={styles.noteHighlight}> Illustrative only. Use a qualified CBAM advisor for formal declarations.</span>
      </p>
    </section>
  );
}
