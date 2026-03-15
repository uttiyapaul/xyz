import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/shared/AdminWorkspace.module.css";
import { requirePlatformAdminActor } from "@/features/admin/shared/platformAdminAccess";

interface RoleRow {
  id: string;
  role_name: string;
  display_name: string | null;
  role_category: string;
  role_level: string;
  description: string | null;
  tier_rank: number;
  requires_mfa: boolean;
  requires_accreditation: boolean;
  max_concurrent_assignments: number | null;
  expiry_days: number | null;
  is_active: boolean;
  is_lifecycle_role: boolean;
  is_system_role: boolean;
}

interface PermissionRow {
  id: string;
  permission_code: string;
  category: string;
}

interface RolePermissionRow {
  role_id: string;
  permission_id: string;
}

interface AssignmentRow {
  role_id: string;
  is_active: boolean | null;
  expires_at: string | null;
}

interface SodRuleRow {
  id: string;
  role_name_a: string;
  role_name_b: string;
  rule_reason: string;
  framework_ref: string | null;
}

interface MfaConfigRow {
  role_name: string;
  mfa_required: boolean;
  grace_period_days: number;
  bypass_allowed: boolean;
}

/**
 * Platform RBAC review surface.
 *
 * This keeps role design, SoD rules, and assignment pressure visible in one
 * place so frontend routing and admin operations stay aligned.
 */
export async function AdminRbacView() {
  let errorMessage: string | null = null;
  let roleRows: RoleRow[] = [];
  let roleSnapshots: Array<Record<string, string | number | boolean>> = [];
  let sodRules: SodRuleRow[] = [];

  try {
    await requirePlatformAdminActor();
    const admin = createServerSupabaseClient();
    const [roles, permissions, rolePermissions, assignments, rules, mfaConfig] = await Promise.all([
      admin.from("platform_roles").select("id, role_name, display_name, role_category, role_level, description, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, is_lifecycle_role, is_system_role").order("tier_rank"),
      admin.from("platform_permissions").select("id, permission_code, category").order("category").order("permission_code"),
      admin.from("role_permissions").select("role_id, permission_id"),
      admin.from("user_organization_roles").select("role_id, is_active, expires_at"),
      admin.from("role_sod_rules").select("id, role_name_a, role_name_b, rule_reason, framework_ref").order("role_name_a"),
      admin.from("mfa_enforcement_config").select("role_name, mfa_required, grace_period_days, bypass_allowed"),
    ]);

    if (roles.error || permissions.error || rolePermissions.error || assignments.error || rules.error || mfaConfig.error) {
      throw new Error("RBAC_DATA_UNAVAILABLE");
    }

    roleRows = (roles.data ?? []) as RoleRow[];
    const permissionRows = (permissions.data ?? []) as PermissionRow[];
    const rolePermissionRows = (rolePermissions.data ?? []) as RolePermissionRow[];
    const assignmentRows = (assignments.data ?? []) as AssignmentRow[];
    sodRules = (rules.data ?? []) as SodRuleRow[];
    const mfaRows = (mfaConfig.data ?? []) as MfaConfigRow[];
    const now = Date.now();

    const permissionById = new Map(permissionRows.map((permission) => [permission.id, permission]));
    const mfaByRole = new Map(mfaRows.map((row) => [row.role_name, row]));

    roleSnapshots = roleRows.map((role) => {
      const grantedPermissions = rolePermissionRows
        .filter((row) => row.role_id === role.id)
        .map((row) => permissionById.get(row.permission_id))
        .filter((row): row is PermissionRow => Boolean(row));
      const assignmentCount = assignmentRows.filter((row) => row.role_id === role.id && row.is_active !== false).length;
      const expiringSoonCount = assignmentRows.filter((row) => {
        if (row.role_id !== role.id || !row.expires_at) {
          return false;
        }

        const expiresAt = new Date(row.expires_at).getTime();
        return expiresAt >= now && expiresAt <= now + 1000 * 60 * 60 * 24 * 30;
      }).length;
      const permissionCategories = new Set(grantedPermissions.map((permission) => permission.category));
      const applicableSodRules = sodRules.filter(
        (rule) => rule.role_name_a === role.role_name || rule.role_name_b === role.role_name,
      );
      const mfaPolicy = mfaByRole.get(role.role_name);

      return {
        id: role.id,
        name: role.display_name ?? role.role_name,
        roleName: role.role_name,
        category: role.role_category,
        level: role.role_level,
        description: role.description ?? "No description recorded.",
        permissionCount: grantedPermissions.length,
        categoryCount: permissionCategories.size,
        assignmentCount,
        expiringSoonCount,
        requiresMfa: role.requires_mfa,
        requiresAccreditation: role.requires_accreditation,
        mfaGraceDays: mfaPolicy?.grace_period_days ?? 0,
        mfaBypassAllowed: mfaPolicy?.bypass_allowed ?? false,
        sodRuleCount: applicableSodRules.length,
        isLifecycle: role.is_lifecycle_role,
        isSystem: role.is_system_role,
        isActive: role.is_active,
        maxAssignments: role.max_concurrent_assignments ?? "n/a",
        expiryDays: role.expiry_days ?? "n/a",
      };
    });
  } catch (error) {
    console.error("Failed to load RBAC data:", error);
    errorMessage = "RBAC oversight is unavailable right now. Refresh after checking platform access and schema availability.";
  }

  const rolesRequiringMfa = roleSnapshots.filter((role) => role.requiresMfa === true).length;
  const activeRoleCount = roleSnapshots.filter((role) => role.isActive === true).length;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Control</p>
        <h1 className={styles.title}>Role-Based Access Control (RBAC)</h1>
        <p className={styles.subtitle}>
          Review role design, permission breadth, assignment pressure, and separation-of-duties safeguards from one
          place. This frontend surface stays read-only so privilege boundaries are not bypassed by convenience UI.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert} data-tone="warning">{errorMessage}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Active Roles</p><p className={styles.metricValue}>{activeRoleCount}</p><p className={styles.metricHint}>Role definitions currently marked active in the platform registry.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Permission Nodes</p><p className={styles.metricValue}>{new Set(roleSnapshots.map((role) => String(role.permissionCount))).size > -1 ? roleRows.length : 0}</p><p className={styles.metricHint}>Role catalog wired into the canonical permission model.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>SoD Rules</p><p className={styles.metricValue}>{sodRules.length}</p><p className={styles.metricHint}>Conflict rules the frontend must keep visible in assignment and approval UX.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Roles Requiring MFA</p><p className={styles.metricValue}>{rolesRequiringMfa}</p><p className={styles.metricHint}>Roles that should never be represented as low-friction access in the UI.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Guardrails</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>No silent privilege expansion</p><p className={styles.ruleMeta}>Frontend routes and assignment flows must use the canonical role matrix instead of ad hoc allowlists.</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>SoD stays visible</p><p className={styles.ruleMeta}>Reviewer, approver, verifier, DPO, and lifecycle conflicts must remain explicit in UI language.</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>MFA context matters</p><p className={styles.ruleMeta}>Privileged roles require clear step-up or blocked-state messaging, not optimistic access assumptions.</p></div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Active SoD Rules</h2>
            {sodRules.length === 0 ? (
              <div className={styles.emptyState}>No SoD rules are available in the current environment.</div>
            ) : (
              <div className={styles.ruleList}>
                {sodRules.slice(0, 8).map((rule) => (
                  <div key={rule.id} className={styles.ruleItem}>
                    <p className={styles.ruleTitle}>{rule.role_name_a} vs {rule.role_name_b}</p>
                    <p className={styles.ruleMeta}>{rule.rule_reason}{rule.framework_ref ? ` | ${rule.framework_ref}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Role Catalog</h2>
          {roleSnapshots.length === 0 ? (
            <div className={styles.emptyState}>No platform roles are available in the current environment.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Role</th>
                    <th className={styles.tableHeaderCell}>Controls</th>
                    <th className={styles.tableHeaderCell}>Assignments</th>
                    <th className={styles.tableHeaderCell}>Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {roleSnapshots.map((role) => (
                    <tr key={String(role.id)}>
                      <td className={styles.tableCell}>
                        <p className={styles.name}>{String(role.name)}</p>
                        <p className={styles.metaText}>{String(role.roleName)} | {String(role.category)} | {String(role.level)}</p>
                        <p className={styles.metaText}>{String(role.description)}</p>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.stackedBadges}>
                          <span className={styles.badge} data-tone="info">{Number(role.permissionCount)} permissions</span>
                          <span className={styles.badge} data-tone="neutral">{Number(role.categoryCount)} categories</span>
                          {role.requiresMfa ? <span className={styles.badge} data-tone="warning">MFA</span> : null}
                          {role.requiresAccreditation ? <span className={styles.badge} data-tone="warning">Accredited</span> : null}
                          {role.isLifecycle ? <span className={styles.badge} data-tone="warning">Lifecycle</span> : null}
                          {role.isSystem ? <span className={styles.badge} data-tone="neutral">System</span> : null}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <p className={styles.metaText}>{Number(role.assignmentCount)} active assignment(s)</p>
                        <p className={styles.metaText}>{Number(role.expiringSoonCount)} expiring within 30 days</p>
                        <p className={styles.metaText}>{Number(role.sodRuleCount)} SoD rule(s)</p>
                      </td>
                      <td className={styles.tableCell}>
                        <p className={styles.metaText}>Max concurrent: {String(role.maxAssignments)}</p>
                        <p className={styles.metaText}>Expiry days: {String(role.expiryDays)}</p>
                        <p className={styles.metaText}>MFA grace: {Number(role.mfaGraceDays)} day(s)</p>
                        <p className={styles.metaText}>MFA bypass: {role.mfaBypassAllowed ? "Allowed" : "Blocked"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
