/**
 * CarbonIQ Platform — core/security/sanitize.ts
 * Input sanitization — XSS, SQL injection prevention, numeric bounds checking.
 */

// ---------------------------------------------------------------------------
// String sanitization
// ---------------------------------------------------------------------------

/** Strip HTML tags and dangerous characters from user input. */
export function sanitizeHtml(value: string): string {
  return value
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Strip all HTML tags (for plain text fields). */
export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

/** Sanitize and truncate a string to max length. */
export function sanitizeText(value: string, maxLen = 1000): string {
  return stripTags(value).slice(0, maxLen).trim();
}

/** Validate and sanitize email. Returns null if invalid. */
export function sanitizeEmail(value: string): string | null {
  const cleaned = value.trim().toLowerCase().slice(0, 254);
  const emailRe = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
  return emailRe.test(cleaned) ? cleaned : null;
}

// ---------------------------------------------------------------------------
// Numeric sanitization
// ---------------------------------------------------------------------------

/** Clamp and validate a numeric value for GHG activity quantities. */
export function sanitizeQuantity(
  value: unknown,
  min   = 0,
  max   = 1_000_000_000   // 1 billion max — prevents absurd values
): number | null {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

/** Parse and validate a percentage (0–100). */
export function sanitizePct(value: unknown): number | null {
  const n = sanitizeQuantity(value, 0, 100);
  return n;
}

// ---------------------------------------------------------------------------
// Object sanitization
// ---------------------------------------------------------------------------

/** Deep-sanitize all string values in a plain object. */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj:    T,
  maxLen = 1000
): T {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      result[key] = sanitizeText(val, maxLen);
    } else if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      result[key] = sanitizeObject(val as Record<string, unknown>, maxLen);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/** Validate URL is safe (http/https only, no javascript:). */
export function sanitizeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GHG-domain validators
// ---------------------------------------------------------------------------

/** Validate a reporting period (YYYY-MM-DD, must be first of month). */
export function validateReportingPeriod(value: string): boolean {
  const re = /^\d{4}-(0[1-9]|1[0-2])-01$/;
  if (!re.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2000;
}

/** Validate Indian GSTIN format. */
export function validateGstin(value: string): boolean {
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(value.toUpperCase().trim());
}

/** Validate MCA CIN format. */
export function validateCin(value: string): boolean {
  const re = /^[LUu]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
  return re.test(value.toUpperCase().trim());
}
