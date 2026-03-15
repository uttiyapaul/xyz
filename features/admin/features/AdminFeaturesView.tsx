import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/shared/AdminWorkspace.module.css";
import { requirePlatformAdminActor } from "@/features/admin/shared/platformAdminAccess";

interface FeatureFlagRow {
  id: string;
  flag_key: string;
  description: string;
  enabled_globally: boolean | null;
  enabled_for_plan_tiers: string[] | null;
  enabled_for_org_ids: string[] | null;
  enabled_for_user_ids: string[] | null;
  rollout_pct: number | null;
  updated_at: string | null;
}

interface MfaConfigRow {
  role_name: string;
  mfa_required: boolean;
  grace_period_days: number;
}

interface RateLimitRow {
  endpoint_pattern: string;
  limit_per_minute: number;
  limit_per_hour: number;
  limit_per_day: number;
  burst_allowance: number | null;
  is_active: boolean | null;
}

interface BackupPolicyRow {
  id: string;
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

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not updated yet";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const FRONTEND_GUARDRAILS = [
  { name: "Proxy request guard", detail: "Privileged routes depend on proxy-enforced auth instead of client-only checks." },
  { name: "No inline CSS in touched sectors", detail: "New admin, auth, org, and dashboard surfaces use CSS modules or shared tokenized styles." },
  { name: "Secret masking UI", detail: "Sensitive integration credentials stay masked until explicit reveal intent is captured." },
  { name: "AI disclosure primitives", detail: "AI-assisted surfaces show confidence, review context, and attribution cues instead of silent automation." },
  { name: "Session lock shell", detail: "The frontend shell is prepared for inactivity lock and re-auth flows ahead of final backend enforcement." },
];

/**
 * Platform feature posture surface.
 *
 * This combines DB-backed feature flags with frontend guardrails from the
 * current audit so platform admins can see both rollout state and UI posture.
 */
export async function AdminFeaturesView() {
  let errorMessage: string | null = null;
  let featureFlags: FeatureFlagRow[] = [];
  let mfaRows: MfaConfigRow[] = [];
  let rateLimits: RateLimitRow[] = [];
  let backupPolicies: BackupPolicyRow[] = [];

  try {
    await requirePlatformAdminActor();
    const admin = createServerSupabaseClient();
    const [featureFlagResponse, mfaResponse, rateLimitResponse, backupPolicyResponse] = await Promise.all([
      admin.from("feature_flags").select("id, flag_key, description, enabled_globally, enabled_for_plan_tiers, enabled_for_org_ids, enabled_for_user_ids, rollout_pct, updated_at").order("flag_key"),
      admin.from("mfa_enforcement_config").select("role_name, mfa_required, grace_period_days").order("role_name"),
      admin.from("rate_limit_config").select("endpoint_pattern, limit_per_minute, limit_per_hour, limit_per_day, burst_allowance, is_active").order("endpoint_pattern"),
      admin.from("backup_policy").select("id, policy_name, scope, backup_frequency, retention_days, encryption_required, restore_test_frequency_days, target_rto_hours, target_rpo_hours, is_active").order("policy_name"),
    ]);

    if (featureFlagResponse.error || mfaResponse.error || rateLimitResponse.error || backupPolicyResponse.error) {
      throw new Error("FEATURE_CONTROL_DATA_UNAVAILABLE");
    }

    featureFlags = (featureFlagResponse.data ?? []) as FeatureFlagRow[];
    mfaRows = (mfaResponse.data ?? []) as MfaConfigRow[];
    rateLimits = (rateLimitResponse.data ?? []) as RateLimitRow[];
    backupPolicies = (backupPolicyResponse.data ?? []) as BackupPolicyRow[];
  } catch (error) {
    console.error("Failed to load platform feature posture:", error);
    errorMessage = "Global configuration data is unavailable right now. Verify service-role access and reload the page.";
  }

  const activeFlags = featureFlags.filter((flag) => flag.enabled_globally).length;
  const targetedFlags = featureFlags.filter(
    (flag) =>
      (flag.enabled_for_plan_tiers?.length ?? 0) > 0 ||
      (flag.enabled_for_org_ids?.length ?? 0) > 0 ||
      (flag.enabled_for_user_ids?.length ?? 0) > 0,
  ).length;
  const activeRateLimits = rateLimits.filter((config) => config.is_active !== false).length;
  const enforcedMfaRoles = mfaRows.filter((config) => config.mfa_required).length;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Control</p>
        <h1 className={styles.title}>Global Configuration & Flags</h1>
        <p className={styles.subtitle}>
          Review platform rollouts, security baselines, and frontend compliance guardrails from one place. This keeps
          feature posture visible without exposing secret values or pretending backend mutations are ready.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert} data-tone="warning">{errorMessage}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Globally Enabled Flags</p><p className={styles.metricValue}>{activeFlags}</p><p className={styles.metricHint}>Feature flags fully active across the platform.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Targeted Rollouts</p><p className={styles.metricValue}>{targetedFlags}</p><p className={styles.metricHint}>Flags limited by tier, org, or user targeting.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>MFA Policies</p><p className={styles.metricValue}>{enforcedMfaRoles}</p><p className={styles.metricHint}>Roles with explicit MFA enforcement records.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Active Rate Limits</p><p className={styles.metricValue}>{activeRateLimits}</p><p className={styles.metricHint}>Endpoint-level throttle rules currently active in the platform schema.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Runtime Readiness</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Public Supabase URL</p><p className={styles.ruleMeta}>{process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing"}</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Public anon key</p><p className={styles.ruleMeta}>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Missing"}</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Service-role key</p><p className={styles.ruleMeta}>{process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Missing"}</p></div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Frontend Guardrails</h2>
            <div className={styles.ruleList}>
              {FRONTEND_GUARDRAILS.map((guardrail) => (
                <div key={guardrail.name} className={styles.ruleItem}>
                  <p className={styles.ruleTitle}>{guardrail.name}</p>
                  <p className={styles.ruleMeta}>{guardrail.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Feature Flag Registry</h2>
            {featureFlags.length === 0 ? (
              <div className={styles.emptyState}>No feature flags are available in the current environment.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Flag</th>
                      <th className={styles.tableHeaderCell}>Rollout</th>
                      <th className={styles.tableHeaderCell}>Targeting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureFlags.map((flag) => (
                      <tr key={flag.id}>
                        <td className={styles.tableCell}>
                          <p className={styles.name}>{flag.flag_key}</p>
                          <p className={styles.metaText}>{flag.description}</p>
                          <p className={styles.metaText}>Updated {formatDateTime(flag.updated_at)}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.stackedBadges}>
                            <span className={styles.badge} data-tone={flag.enabled_globally ? "success" : "warning"}>
                              {flag.enabled_globally ? "Global" : "Scoped"}
                            </span>
                            <span className={styles.badge} data-tone="info">{flag.rollout_pct ?? 0}% rollout</span>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.metaText}>Plan tiers: {flag.enabled_for_plan_tiers?.length ?? 0}</p>
                          <p className={styles.metaText}>Organizations: {flag.enabled_for_org_ids?.length ?? 0}</p>
                          <p className={styles.metaText}>Users: {flag.enabled_for_user_ids?.length ?? 0}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.gridList}>
            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>MFA Enforcement Roles</h2>
              <div className={styles.ruleList}>
                {mfaRows.slice(0, 8).map((config) => (
                  <div key={config.role_name} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{config.role_name}</p>
                    <p className={styles.ruleMeta}>
                      {config.mfa_required ? "MFA required" : "MFA optional"} | Grace {config.grace_period_days} day(s)
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>Backup Policies</h2>
              <div className={styles.ruleList}>
                {backupPolicies.slice(0, 6).map((policy) => (
                  <div key={policy.id} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{policy.policy_name}</p>
                    <p className={styles.ruleMeta}>
                      {policy.scope} | {policy.backup_frequency} | Retention {policy.retention_days} day(s)
                      <br />
                      Encryption {policy.encryption_required ? "required" : "not required"} | Restore test every{" "}
                      {policy.restore_test_frequency_days} day(s)
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panelCard}>
              <h2 className={styles.cardTitle}>Rate Limit Baselines</h2>
              <div className={styles.ruleList}>
                {rateLimits.slice(0, 6).map((config) => (
                  <div key={config.endpoint_pattern} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{config.endpoint_pattern}</p>
                    <p className={styles.ruleMeta}>
                      {config.limit_per_minute}/min | {config.limit_per_hour}/hr | {config.limit_per_day}/day | Burst{" "}
                      {config.burst_allowance ?? 0}
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
