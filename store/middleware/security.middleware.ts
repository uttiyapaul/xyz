/**
 * CarbonIQ Platform — store/middleware/security.middleware.ts
 *
 * Security middleware — intercepts all Redux actions to:
 *   1. Sanitize string payloads (prevent XSS via state poisoning)
 *   2. Block suspicious action patterns (prototype pollution)
 *   3. Enforce payload size limits (DoS prevention)
 *   4. Log security events
 */

import type { Middleware, AnyAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

const MAX_PAYLOAD_SIZE = 512 * 1024; // 512KB per action payload

// Patterns that indicate prototype pollution / injection attempts
const DANGEROUS_PATTERNS = [
  /__proto__/,
  /constructor\[/,
  /prototype\./,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,     // event handlers: onclick=, onload=
];

function getPayloadSize(payload: unknown): number {
  try {
    return JSON.stringify(payload).length;
  } catch {
    return 0;
  }
}

function containsDangerousPattern(value: string): boolean {
  return DANGEROUS_PATTERNS.some((p) => p.test(value));
}

function sanitizeString(value: string): string {
  // Strip null bytes and control characters
  return value.replace(/\0/g, "").replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function sanitizeDeep(value: unknown, depth = 0): unknown {
  if (depth > 10) return "[MAX_DEPTH]";  // Prevent infinite recursion

  if (typeof value === "string") {
    if (containsDangerousPattern(value)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[SecurityMiddleware] Dangerous pattern detected in payload:", value.slice(0, 100));
      }
      return "[SANITIZED]";
    }
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeDeep(v, depth + 1));
  }

  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Block prototype pollution keys
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        console.error("[SecurityMiddleware] BLOCKED prototype pollution attempt:", key);
        continue;
      }
      cleaned[key] = sanitizeDeep(val, depth + 1);
    }
    return cleaned;
  }

  return value;
}

export const securityMiddleware: Middleware<Record<string, never>, RootState> =
  () => (next) => (action: AnyAction) => {
    // 1. Payload size check
    if (action.payload !== undefined) {
      const size = getPayloadSize(action.payload);
      if (size > MAX_PAYLOAD_SIZE) {
        console.error(
          `[SecurityMiddleware] BLOCKED oversized payload: ${action.type} (${size} bytes)`
        );
        return; // Drop the action
      }
    }

    // 2. Sanitize payload strings
    const sanitizedAction: AnyAction = {
      ...action,
      payload: action.payload !== undefined
        ? sanitizeDeep(action.payload)
        : undefined,
    };

    return next(sanitizedAction);
  };
