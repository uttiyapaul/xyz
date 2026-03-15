/**
 * Frontend security timing constants extracted from the 2026 audit report.
 *
 * These values stay centralized so session-lock behavior and secret-handling
 * helpers do not drift across screens.
 */
export const SESSION_LOCK_TIMEOUT_MS = 15 * 60 * 1000;
export const SECRET_CLIPBOARD_CLEAR_MS = 60 * 1000;

export function formatMinutesFromMilliseconds(durationMs: number): number {
  return Math.round(durationMs / 60_000);
}
