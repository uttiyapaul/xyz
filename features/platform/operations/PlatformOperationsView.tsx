import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/platform/shared/PlatformWorkspace.module.css";
import { requirePlatformStaffActor } from "@/features/platform/shared/platformWorkspaceAccess";

interface FeatureFlagRow {
  flag_key: string;
  enabled_globally: boolean | null;
  rollout_pct: number | null;
  updated_at: string | null;
}

interface RateLimitRow {
  endpoint_pattern: string;
  limit_per_minute: number;
  limit_per_hour: number;
  burst_allowance: number | null;
  is_active: boolean | null;
}

interface BackupPolicyRow {
  policy_name: string;
  scope: string;
  backup_frequency: string;
  retention_days: number;
  is_active: boolean;
}

interface SessionRow {
  is_active: boolean | null;
  mfa_verified: boolean | null;
  last_active_at: string | null;
  risk_score: number | null;
}

interface DeliveryRow {
  succeeded: boolean | null;
  next_retry_at: string | null;
  delivered_at: string | null;
}

interface AuditRow {
  result: string | null;
  event_timestamp: string | null;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Platform operations workspace for developer and support staff.
 *
 * Why this route exists:
 * - The shared dashboard home was truthful, but it did not give engineering
 *   and support staff a dedicated control surface.
 * - This page keeps the lane read-first and audit-safe while still reflecting
 *   live rollout, session, retry, and audit pressure from the current schema.
 */
export async function PlatformOperationsView() {
  let errorMessage: string | null = null;
  let featureFlags: FeatureFlagRow[] = [];
  let rateLimits: RateLimitRow[] = [];
  let backupPolicies: BackupPolicyRow[] = [];
  let sessions: SessionRow[] = [];
  let deliveries: DeliveryRow[] = [];
  let auditEvents: AuditRow[] = [];

  try {
    await requirePlatformStaffActor(["platform_developer", "platform_support"]);

    const admin = createServerSupabaseClient();
    const [
      featureFlagResponse,
      rateLimitResponse,
      backupPolicyResponse,
      sessionResponse,
      deliveryResponse,
      auditResponse,
    ] = await Promise.all([
      admin
        .from("feature_flags")
        .select("flag_key, enabled_globally, rollout_pct, updated_at")
        .order("updated_at", { ascending: false })
        .limit(40),
      admin
        .from("rate_limit_config")
        .select("endpoint_pattern, limit_per_minute, limit_per_hour, burst_allowance, is_active")
        .order("endpoint_pattern"),
      admin
        .from("backup_policy")
        .select("policy_name, scope, backup_frequency, retention_days, is_active")
        .order("policy_name"),
      admin
        .from("user_sessions")
        .select("is_active, mfa_verified, last_active_at, risk_score")
        .eq("is_active", true)
        .order("last_active_at", { ascending: false })
        .limit(200),
      admin
        .from("webhook_delivery_log")
        .select("succeeded, next_retry_at, delivered_at")
        .order("delivered_at", { ascending: false })
        .limit(200),
      admin
        .from("ghg_audit_log")
        .select("result, event_timestamp")
        .order("event_timestamp", { ascending: false })
        .limit(200),
    ]);

    if (
      featureFlagResponse.error ||
      rateLimitResponse.error ||
      backupPolicyResponse.error ||
      sessionResponse.error ||
      deliveryResponse.error ||
      auditResponse.error
    ) {
      throw new Error("PLATFORM_OPERATIONS_DATA_UNAVAILABLE");
    }

    featureFlags = (featureFlagResponse.data ?? []) as FeatureFlagRow[];
    rateLimits = (rateLimitResponse.data ?? []) as RateLimitRow[];
    backupPolicies = (backupPolicyResponse.data ?? []) as BackupPolicyRow[];
    sessions = (sessionResponse.data ?? []) as SessionRow[];
    deliveries = (deliveryResponse.data ?? []) as DeliveryRow[];
    auditEvents = (auditResponse.data ?? []) as AuditRow[];
  } catch (error) {
    console.error("Failed to load platform operations workspace:", error);
    errorMessage =
      "Platform operations data is unavailable right now. Verify service-role access and reload the page.";
  }

  const activeFlags = featureFlags.filter((flag) => flag.enabled_globally).length;
  const targetedFlags = featureFlags.filter((flag) => !flag.enabled_globally).length;
  const activeRateLimits = rateLimits.filter((row) => row.is_active !== false).length;
  const backupCoverage = backupPolicies.filter((row) => row.is_active).length;
  const highRiskSessions = sessions.filter((row) => (row.risk_score ?? 0) >= 0.7).length;
  const mfaCoverage =
    sessions.length === 0
      ? 0
      : Math.round((sessions.filter((row) => row.mfa_verified).length / sessions.length) * 100);
  const retryQueue = deliveries.filter((row) => row.succeeded === false && row.next_retry_at != null);
  const negativeAuditEvents = auditEvents.filter((row) =>
    ["FAILURE", "BLOCKED", "ERROR"].includes((row.result ?? "").toUpperCase()),
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Operations</p>
        <h1 className={styles.title}>Engineering And Support Control Board</h1>
        <p className={styles.subtitle}>
          Review live rollout posture, session risk, retry pressure, and audit outcomes without stepping into
          superadmin-only control-plane mutation routes. This workspace is read-first by design and keeps support,
          engineering, and security signals visible in one place.
        </p>
      </header>

      {errorMessage ? (
        <div className={styles.alert} data-tone="warning">
          {errorMessage}
        </div>
      ) : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Global Flags</p>
          <p className={styles.metricValue}>{activeFlags}</p>
          <p className={styles.metricHint}>Feature flags enabled for full-platform rollout.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active Throttles</p>
          <p className={styles.metricValue}>{activeRateLimits}</p>
          <p className={styles.metricHint}>Endpoint throttle rules currently active in the platform schema.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>High-Risk Sessions</p>
          <p className={styles.metricValue}>{highRiskSessions}</p>
          <p className={styles.metricHint}>Active sessions carrying a risk score of 0.7 or higher.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Retry Queue</p>
          <p className={styles.metricValue}>{retryQueue.length}</p>
          <p className={styles.metricHint}>Webhook delivery failures still queued for another attempt.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Security And Frontend Posture</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Session coverage</p>
                <p className={styles.ruleMeta}>
                  {sessions.length} active session(s) are visible and MFA coverage is {mfaCoverage}% in the current
                  snapshot.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Audit pressure</p>
                <p className={styles.ruleMeta}>
                  {negativeAuditEvents.length} recent audit event(s) were recorded as failure, blocked, or error.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Frontend guardrail</p>
                <p className={styles.ruleMeta}>
                  This lane stays read-first, avoids raw provider errors, and leaves privileged configuration changes in
                  the admin-only control plane.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Backup And Rollout Baseline</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Backup policies</p>
                <p className={styles.ruleMeta}>
                  {backupCoverage} active backup policy row(s) are visible to the current platform staff snapshot.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Targeted rollouts</p>
                <p className={styles.ruleMeta}>
                  {targetedFlags} flag(s) currently remain targeted instead of globally enabled.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Delivery And Audit Queue</h2>
            {retryQueue.length === 0 && negativeAuditEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No elevated platform pressure is visible.</h3>
                <p className={styles.emptyCopy}>
                  The latest delivery and audit snapshot does not currently show retry backlog or negative audit events.
                </p>
              </div>
            ) : (
              <div className={styles.tableStack}>
                {retryQueue.length > 0 ? (
                  <div className={styles.ruleList}>
                    {retryQueue.slice(0, 6).map((row, index) => (
                      <div key={`retry-${index}`} className={styles.ruleItem}>
                        <div className={styles.stackedBadges}>
                          <span className={styles.badge} data-tone="warning">
                            Retry queued
                          </span>
                        </div>
                        <p className={styles.ruleMeta}>
                          Last delivery {formatDateTime(row.delivered_at)}. Next retry {formatDateTime(row.next_retry_at)}.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {negativeAuditEvents.length > 0 ? (
                  <div className={styles.ruleList}>
                    {negativeAuditEvents.slice(0, 6).map((row, index) => (
                      <div key={`audit-${index}`} className={styles.ruleItem}>
                        <div className={styles.stackedBadges}>
                          <span className={styles.badge} data-tone="danger">
                            {row.result ?? "Audit event"}
                          </span>
                        </div>
                        <p className={styles.ruleMeta}>Recorded {formatDateTime(row.event_timestamp)}.</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Configuration Registry</h2>
            {rateLimits.length === 0 && backupPolicies.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No configuration rows are visible.</h3>
                <p className={styles.emptyCopy}>
                  Rate-limit and backup-policy records are not available in the current environment snapshot.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Control Surface</th>
                      <th className={styles.tableHeaderCell}>Current Posture</th>
                      <th className={styles.tableHeaderCell}>Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.slice(0, 6).map((row) => (
                      <tr key={row.endpoint_pattern}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>{row.endpoint_pattern}</p>
                          <p className={styles.tableMeta}>Rate limit rule</p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {row.limit_per_minute}/min | {row.limit_per_hour}/hr | burst {row.burst_allowance ?? 0}
                          </p>
                          <div className={styles.stackedBadges}>
                            <span className={styles.badge} data-tone={row.is_active !== false ? "success" : "neutral"}>
                              {row.is_active !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            Keeps public and privileged surfaces resilient without silently weakening abuse controls.
                          </p>
                        </td>
                      </tr>
                    ))}
                    {backupPolicies.slice(0, 4).map((row) => (
                      <tr key={row.policy_name}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>{row.policy_name}</p>
                          <p className={styles.tableMeta}>{row.scope}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {row.backup_frequency} | retention {row.retention_days} day(s)
                          </p>
                          <div className={styles.stackedBadges}>
                            <span className={styles.badge} data-tone={row.is_active ? "success" : "neutral"}>
                              {row.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            Demonstrates recovery posture without exposing secret or infrastructure-level mutation flows.
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
