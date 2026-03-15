/**
 * Shared calculator formatting helpers.
 *
 * Why this exists:
 * - The public calculator repeats the same EUR/INR formatting across KPI
 *   cards, charts, tables, and lead-capture summaries.
 * - Centralizing that formatting keeps the public estimate language
 *   consistent and easier to audit.
 */

export function formatRounded(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

export function formatEur(value: number): string {
  return `EUR ${formatRounded(value)}`;
}

export function formatInr(value: number): string {
  return `INR ${formatRounded(value)}`;
}

export function formatLakhs(value: number, decimals = 1): string {
  return `${(value / 100000).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} lakh`;
}
