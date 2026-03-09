/**
 * CarbonIQ Platform — core/security/csrf.ts
 * Client-side CSRF utilities — double-submit cookie pattern.
 */

/**
 * Read the CSRF token from the cookie set by middleware.
 * Returns null if not found (SSR or not yet set).
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("__csrf_token="))
      ?.split("=")[1] ?? null
  );
}

/**
 * Return headers object with CSRF + JSON content type.
 * Attach this to every fetch/XHR mutating request.
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  };
  if (token) base["x-csrf-token"] = token;
  return base;
}

/**
 * Verify that the CSRF token cookie matches the header value.
 * Used in API routes (server-side).
 */
export function verifyCsrfToken(cookieValue: string | undefined, headerValue: string | undefined): boolean {
  if (!cookieValue || !headerValue) return false;
  // Constant-time comparison to prevent timing attacks
  if (cookieValue.length !== headerValue.length) return false;
  let diff = 0;
  for (let i = 0; i < cookieValue.length; i++) {
    diff |= cookieValue.charCodeAt(i) ^ headerValue.charCodeAt(i);
  }
  return diff === 0;
}
