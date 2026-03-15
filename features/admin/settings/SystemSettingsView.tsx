import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/shared/AdminWorkspace.module.css";
import { requirePlatformAdminActor } from "@/features/admin/shared/platformAdminAccess";

interface MfaConfigRow {
  role_name: string;
  mfa_required: boolean;
  grace_period_days: number;
  bypass_allowed: boolean;
  enforcement_start_dt: string | null;
}

interface SessionRow {
  is_active: boolean | null;
  mfa_verified: boolean | null;
  risk_score: number | null;
  last_active_at: string | null;
}

interface SecurityIncidentRow {
  title: string;
  severity: string;
  status: string;
  detected_at: string;
  dpa_notification_required: boolean;
  dpa_72h_sla_met: boolean | null;
}

interface BackupPolicyRow {
  policy_name: string;
  scope: string;
  backup_frequency: string;
  retention_days: number;
  encryption_required: boolean;
  restore_test_frequency_days: number;
  target_rto_hours: number | null;
  target_rpo_hours: number | null;
  is_active: boolean;
}

interface RateLimitRow {
  endpoint_pattern: string;
  limit_per_minute: number;
  limit_per_hour: number;
  limit_per_day: number;
  burst_allowance: number | null;
  is_active: boolean | null;
}

interface FeatureFlagRow {
  flag_key: string;
  enabled_globally: boolean | null;
  rollout_pct: number | null;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Platform system settings posture board.
 *
 * Why this route exists:
 * - The previous screen was a mocked save shell, which was no longer honest for
 *   pre-production demos or audit walkthroughs.
 * - This version stays live and read-only: it surfaces the settings posture
 *   already present in the schema without pretending mutation contracts exist.
 */
export async function SystemSettingsView() {
  let errorMessage: string | null = null;
  let mfaRows: MfaConfigRow[] = [];
  let sessions: SessionRow[] = [];
  let incidents: SecurityIncidentRow[] = [];
  let backupPolicies: BackupPolicyRow[] = [];
  let rateLimits: RateLimitRow[] = [];
  let featureFlags: FeatureFlagRow[] = [];

  try {
    await requirePlatformAdminActor();

    const admin = createServerSupabaseClient();
    const [
      mfaResponse,
      sessionResponse,
      incidentResponse,
      backupResponse,
      rateLimitResponse,
      featureFlagResponse,
    ] = await Promise.all([
      admin
        .from("mfa_enforcement_config")
        .select("role_name, mfa_required, grace_period_days, bypass_allowed, enforcement_start_dt")
        .order("role_name"),
      admin
        .from("user_sessions")
        .select("is_active, mfa_verified, risk_score, last_active_at")
        .eq("is_active", true)
        .order("last_active_at", { ascending: false })
        .limit(200),
      admin
        .from("security_incidents")
        .select("title, severity, status, detected_at, dpa_notification_required, dpa_72h_sla_met")
        .order("detected_at", { ascending: false })
        .limit(120),
      admin
        .from("backup_policy")
        .select("policy_name, scope, backup_frequency, retention_days, encryption_required, restore_test_frequency_days, target_rto_hours, target_rpo_hours, is_active")
        .order("policy_name"),
      admin
        .from("rate_limit_config")
        .select("endpoint_pattern, limit_per_minute, limit_per_hour, limit_per_day, burst_allowance, is_active")
        .order("endpoint_pattern"),
      admin
        .from("feature_flags")
        .select("flag_key, enabled_globally, rollout_pct")
        .order("flag_key")
        .limit(120),
    ]);

    if (
      mfaResponse.error ||
      sessionResponse.error ||
      incidentResponse.error ||
      backupResponse.error ||
      rateLimitResponse.error ||
      featureFlagResponse.error
    ) {
      throw new Error("SYSTEM_SETTINGS_DATA_UNAVAILABLE");
    }

    mfaRows = (mfaResponse.data ?? []) as MfaConfigRow[];
    sessions = (sessionResponse.data ?? []) as SessionRow[];
    incidents = (incidentResponse.data ?? []) as SecurityIncidentRow[];
    backupPolicies = (backupResponse.data ?? []) as BackupPolicyRow[];
    rateLimits = (rateLimitResponse.data ?? []) as RateLimitRow[];
    featureFlags = (featureFlagResponse.data ?? []) as FeatureFlagRow[];
  } catch (error) {
    console.error("Failed to load system settings posture:", error);
    errorMessage =
      "System-settings posture is unavailable right now. Verify platform access and reload the page.";
  }

  const enforcedRoles = mfaRows.filter((row) => row.mfa_required).length;
  const mfaCoverage =
    sessions.length === 0
      ? 0
      : Math.round((sessions.filter((row) => row.mfa_verified).length / sessions.length) * 100);
  const highRiskSessions = sessions.filter((row) => (row.risk_score ?? 0) >= 0.7).length;
  const openIncidents = incidents.filter((row) => !["resolved", "closed"].includes(row.status.toLowerCase())).length;
  const dpaDeadlinePressure = incidents.filter(
    (row) => row.dpa_notification_required && row.dpa_72h_sla_met === false,
  ).length;
  const activeBackups = backupPolicies.filter((row) => row.is_active).length;
  const activeRateLimits = rateLimits.filter((row) => row.is_active !== false).length;
  const globalFlags = featureFlags.filter((row) => row.enabled_globally).length;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Control</p>
        <h1 className={styles.title}>System Settings Posture</h1>
        <p className={styles.subtitle}>
          Live control-board view of security enforcement, incident pressure, backup posture, and rollout baselines.
          This route is intentionally read-only until backend mutation contracts and audit trails for settings changes
          are finalized.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert} data-tone="warning">{errorMessage}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Roles With MFA Policy</p>
          <p className={styles.metricValue}>{enforcedRoles}</p>
          <p className={styles.metricHint}>Roles currently carrying explicit MFA enforcement records.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>MFA Coverage</p>
          <p className={styles.metricValue}>{mfaCoverage}%</p>
          <p className={styles.metricHint}>Share of active sessions currently marked as MFA-verified.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Open Incidents</p>
          <p className={styles.metricValue}>{openIncidents}</p>
          <p className={styles.metricHint}>Security incident rows that are not yet resolved or closed.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active Backups</p>
          <p className={styles.metricValue}>{activeBackups}</p>
          <p className={styles.metricHint}>Backup-policy rows currently active in the live schema.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Authentication And Session Baseline</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>High-risk sessions</p>
                <p className={styles.ruleMeta}>
                  {highRiskSessions} active session(s) currently exceed the elevated-risk threshold.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Secrets stay masked</p>
                <p className={styles.ruleMeta}>
                  SMTP credentials, service keys, and other secret material remain server-side and are not surfaced in
                  this frontend route.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Mutation guardrail</p>
                <p className={styles.ruleMeta}>
                  This screen no longer fakes a save flow. It reads live settings posture only until audited mutation
                  contracts are available.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Configuration Pressure Signals</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>DPA deadline pressure</p>
                <p className={styles.ruleMeta}>
                  {dpaDeadlinePressure} incident(s) currently show missed 72-hour notification SLA posture.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Active rate limits</p>
                <p className={styles.ruleMeta}>
                  {activeRateLimits} rate-limit rule(s) are active and visible to the platform control plane.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Global flags</p>
                <p className={styles.ruleMeta}>
                  {globalFlags} feature flag(s) are fully enabled across the platform right now.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>MFA Policy Matrix</h2>
            {mfaRows.length === 0 ? (
              <div className={styles.emptyState}>No MFA policy rows are available in the current environment.</div>
            ) : (
              <div className={styles.ruleList}>
                {mfaRows.slice(0, 10).map((row) => (
                  <div key={row.role_name} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{row.role_name}</p>
                    <p className={styles.ruleMeta}>
                      {row.mfa_required ? "MFA required" : "MFA optional"} | grace {row.grace_period_days} day(s) |
                      bypass {row.bypass_allowed ? "allowed" : "blocked"} | starts {formatDateTime(row.enforcement_start_dt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.gridList}>
            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>Security Incidents</h2>
              <div className={styles.ruleList}>
                {incidents.slice(0, 6).map((row, index) => (
                  <div key={`${row.title}-${index}`} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{row.title}</p>
                    <p className={styles.ruleMeta}>
                      {row.severity} | {row.status} | detected {formatDateTime(row.detected_at)} | DPA{" "}
                      {row.dpa_notification_required ? "required" : "not required"}
                    </p>
                  </div>
                ))}
                {incidents.length === 0 ? (
                  <div className={styles.ruleItem}>
                    <p className={styles.ruleMeta}>No security incidents are visible in the current environment.</p>
                  </div>
                ) : null}
              </div>
            </article>

            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>Backup Policies</h2>
              <div className={styles.ruleList}>
                {backupPolicies.slice(0, 6).map((row) => (
                  <div key={row.policy_name} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{row.policy_name}</p>
                    <p className={styles.ruleMeta}>
                      {row.scope} | {row.backup_frequency} | retention {row.retention_days} day(s) | encryption{" "}
                      {row.encryption_required ? "required" : "optional"} | restore test every{" "}
                      {row.restore_test_frequency_days} day(s)
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>Rate Limits And Flags</h2>
              <div className={styles.ruleList}>
                {rateLimits.slice(0, 4).map((row) => (
                  <div key={row.endpoint_pattern} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{row.endpoint_pattern}</p>
                    <p className={styles.ruleMeta}>
                      {row.limit_per_minute}/min | {row.limit_per_hour}/hr | {row.limit_per_day}/day | burst{" "}
                      {row.burst_allowance ?? 0}
                    </p>
                  </div>
                ))}
                {featureFlags.slice(0, 3).map((row) => (
                  <div key={row.flag_key} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{row.flag_key}</p>
                    <p className={styles.ruleMeta}>
                      {row.enabled_globally ? "Global rollout" : "Scoped rollout"} | {row.rollout_pct ?? 0}% rollout
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}
