/**
 * CarbonIQ Platform — store/middleware/audit.middleware.ts
 *
 * Redux middleware that creates an immutable audit trail of all
 * state mutations. Required for ISO 14064-3 verification and
 * banking-grade regulatory compliance.
 *
 * In production: ship audit events to Supabase ghg_audit_log table.
 */

import type { Middleware, AnyAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// Actions that produce an audit event
const AUDITED_ACTIONS = new Set([
  "ghg/createReading/fulfilled",
  "ghg/updateReading",
  "ghg/removeReading",
  "ai/triggerValidation/fulfilled",
  "auth/signOut/fulfilled",
]);

// Actions that should NEVER appear in logs (security / PII)
const REDACTED_ACTIONS = new Set([
  "auth/setSession",
  "auth/setCsrfToken",
]);

interface AuditEvent {
  id:          string;
  timestamp:   string;
  action:      string;
  userId:      string | null;
  payload:     unknown;
  traceId:     string | null;
}

// Lightweight in-memory buffer (flush to Supabase in batches)
const auditBuffer: AuditEvent[] = [];
let   flushTimer: ReturnType<typeof setTimeout> | null = null;

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function flushAuditBuffer(userId: string | null): Promise<void> {
  if (auditBuffer.length === 0) return;
  const events = auditBuffer.splice(0, auditBuffer.length);

  if (typeof window === "undefined") return; // SSR guard
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)  return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ghg_audit_log is INSERT-ONLY — gaps in bigserial = tamper alert
    await sb.from("ghg_audit_log").insert(
      events.map((e) => ({
        actor_id:     e.userId ?? "system",
        action_type:  e.action,
        action_detail: e.payload,
        trace_id:     e.traceId,
        created_at:   e.timestamp,
      }))
    );
  } catch (err) {
    // Restore events on failure — retry on next flush
    auditBuffer.unshift(...events);
    if (process.env.NODE_ENV === "development") {
      console.warn("[AuditMiddleware] Flush failed, buffering:", err);
    }
  }
}

export const auditMiddleware: Middleware<Record<string, never>, RootState> =
  (store) => (next) => (action: any) => {
    // Skip redacted actions
    if (REDACTED_ACTIONS.has(action.type)) return next(action);

    // Process action first
    const result = next(action);

    // Create audit event for monitored actions
    if (AUDITED_ACTIONS.has(action.type)) {
      const state   = store.getState();
      const userId  = state.auth?.user?.id ?? null;
      const traceId = typeof window !== "undefined"
        ? (document.querySelector("meta[name='x-trace-id']") as HTMLMetaElement)?.content ?? null
        : null;

      const event: AuditEvent = {
        id:        generateId(),
        timestamp: new Date().toISOString(),
        action:    action.type,
        userId,
        traceId,
        payload:   sanitizePayload(action.payload),
      };

      auditBuffer.push(event);

      if (process.env.NODE_ENV === "development") {
        console.group(`[Audit] ${action.type}`);
        console.log("User:", userId);
        console.log("Payload:", event.payload);
        console.groupEnd();
      }

      // Schedule flush
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(() => flushAuditBuffer(userId), 3000);
    }

    return result;
  };

/**
 * Remove sensitive fields before logging.
 * Extend this list as the schema grows.
 */
function sanitizePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const SENSITIVE = new Set(["password", "token", "secret", "key", "ssn", "pan", "aadhaar"]);
  const cleaned = { ...(payload as Record<string, unknown>) };
  for (const key of Object.keys(cleaned)) {
    if (SENSITIVE.has(key.toLowerCase())) cleaned[key] = "[REDACTED]";
  }
  return cleaned;
}
