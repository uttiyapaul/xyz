"use client";

import styles from "./CBAMCalculator.module.css";
import { formatEur, formatInr } from "./formatters";

interface YearRow {
  year: number;
  factor: number;
  costDefault: number;
  costActual: number;
  saving: number;
}

interface YearTableProps {
  data: YearRow[];
  inrRate: number;
}

const HEADERS = ["Year", "Phase-in", "Default (EUR)", "Verified (EUR)", "Annual saving (INR)"];

export function YearTable({ data, inrRate }: YearTableProps) {
  return (
    <section className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {HEADERS.map((header) => (
                <th key={header} className={styles.tableHeader}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isKeyYear = row.year === 2026 || row.year === 2030 || row.year === 2034;

              return (
                <tr key={row.year} className={`${styles.tableRow} ${isKeyYear ? styles.tableRowKey : ""}`}>
                  <td className={`${styles.tableCell} ${styles.tableCellYear} ${isKeyYear ? styles.tableCellYearKey : ""}`}>
                    {row.year}
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellAmber}`}>{(row.factor * 100).toFixed(1)}%</td>
                  <td className={`${styles.tableCell} ${styles.tableCellRed}`}>{formatEur(row.costDefault)}</td>
                  <td className={`${styles.tableCell} ${styles.tableCellGreen}`}>{formatEur(row.costActual)}</td>
                  <td className={`${styles.tableCell} ${styles.tableCellGreen}`}>{formatInr(row.saving * inrRate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
