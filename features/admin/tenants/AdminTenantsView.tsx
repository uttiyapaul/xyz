import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/shared/AdminWorkspace.module.css";
import { requirePlatformAdminActor } from "@/features/admin/shared/platformAdminAccess";

interface OrganizationRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
  org_type: string;
  subscription_tier: string | null;
  is_active: boolean | null;
  onboarded_at: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  country: string | null;
  erp_sync_enabled: boolean | null;
  brsr_required: boolean | null;
  brsr_core_required: boolean | null;
}

interface CountRow {
  organization_id: string | null;
  is_active?: boolean | null;
  is_in_boundary?: boolean | null;
  is_active_session?: boolean | null;
  mfa_verified?: boolean | null;
  status?: string | null;
  last_status_code?: number | null;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

/**
 * Platform tenant oversight surface.
 *
 * This is read-only for now: it gives platform admins a grounded picture of
 * tenant readiness without pretending billing or lifecycle mutations are ready.
 */
export async function AdminTenantsView() {
  let errorMessage: string | null = null;
  let organizations: OrganizationRow[] = [];
  let tenantCards: Array<Record<string, string | number | boolean>> = [];

  try {
    await requirePlatformAdminActor();
    const admin = createServerSupabaseClient();
    const [orgs, sites, legalEntities, assignments, sessions, submissions, erpSystems, webhooks] = await Promise.all([
      admin
        .from("client_organizations")
        .select(
          "id, legal_name, trade_name, org_type, subscription_tier, is_active, onboarded_at, primary_contact_name, primary_contact_email, country, erp_sync_enabled, brsr_required, brsr_core_required",
        )
        .is("deleted_at", null)
        .order("legal_name"),
      admin.from("client_sites").select("organization_id, is_active, is_in_boundary").is("deleted_at", null),
      admin.from("client_legal_entities").select("organization_id, is_in_boundary").is("deleted_at", null),
      admin.from("user_organization_roles").select("organization_id, user_id, is_active, expires_at"),
      admin.from("user_sessions").select("organization_id, is_active, mfa_verified"),
      admin.from("ghg_submissions").select("organization_id, status, updated_at"),
      admin.from("erp_systems").select("organization_id, is_active, last_test_status"),
      admin.from("webhook_subscriptions").select("organization_id, is_active, last_status_code, failure_count"),
    ]);

    if (
      orgs.error ||
      sites.error ||
      legalEntities.error ||
      assignments.error ||
      sessions.error ||
      submissions.error ||
      erpSystems.error ||
      webhooks.error
    ) {
      throw new Error("TENANT_DATA_UNAVAILABLE");
    }

    organizations = (orgs.data ?? []) as OrganizationRow[];
    const siteRows = (sites.data ?? []) as CountRow[];
    const entityRows = (legalEntities.data ?? []) as CountRow[];
    const assignmentRows = (assignments.data ?? []) as Array<CountRow & { user_id: string; expires_at: string | null }>;
    const sessionRows = (sessions.data ?? []) as Array<CountRow & { organization_id: string | null }>;
    const submissionRows = (submissions.data ?? []) as Array<CountRow & { updated_at: string | null }>;
    const erpRows = (erpSystems.data ?? []) as Array<CountRow & { last_test_status: string | null }>;
    const webhookRows = (webhooks.data ?? []) as Array<CountRow & { failure_count: number | null }>;

    const now = Date.now();

    tenantCards = organizations.map((organization) => {
      const orgAssignments = assignmentRows.filter((row) => row.organization_id === organization.id);
      const activeAssignments = orgAssignments.filter((row) => {
        if (row.is_active === false) {
          return false;
        }

        if (!row.expires_at) {
          return true;
        }

        return new Date(row.expires_at).getTime() >= now;
      });

      const activeUsers = new Set(activeAssignments.map((row) => row.user_id)).size;
      const orgSessions = sessionRows.filter((row) => row.organization_id === organization.id && row.is_active !== false);
      const mfaCoverage = orgSessions.length === 0 ? 0 : Math.round((orgSessions.filter((row) => row.mfa_verified).length / orgSessions.length) * 100);
      const orgSubmissions = submissionRows.filter((row) => row.organization_id === organization.id);
      const latestSubmission = orgSubmissions
        .slice()
        .sort((left, right) => new Date(right.updated_at ?? 0).getTime() - new Date(left.updated_at ?? 0).getTime())[0];
      const failedWebhooks = webhookRows.filter(
        (row) => row.organization_id === organization.id && row.is_active !== false && (row.last_status_code ?? 200) >= 400,
      ).length;
      const erpConfigured = erpRows.some((row) => row.organization_id === organization.id && row.is_active !== false);

      return {
        id: organization.id,
        legalName: organization.legal_name,
        tradeName: organization.trade_name ?? "Not configured",
        orgType: organization.org_type,
        tier: organization.subscription_tier ?? "starter",
        country: organization.country ?? "Unknown",
        onboardedAt: formatDate(organization.onboarded_at),
        contactName: organization.primary_contact_name ?? "Not configured",
        contactEmail: organization.primary_contact_email ?? "Not configured",
        isActive: organization.is_active !== false,
        siteCount: siteRows.filter((row) => row.organization_id === organization.id).length,
        boundarySiteCount: siteRows.filter((row) => row.organization_id === organization.id && row.is_in_boundary).length,
        legalEntityCount: entityRows.filter((row) => row.organization_id === organization.id).length,
        activeUsers,
        mfaCoverage,
        latestSubmissionStatus: latestSubmission?.status ?? "no submission yet",
        failedWebhooks,
        erpConfigured,
        brsrRequired: organization.brsr_required === true,
        brsrCoreRequired: organization.brsr_core_required === true,
        erpSyncEnabled: organization.erp_sync_enabled === true,
      };
    });
  } catch (error) {
    console.error("Failed to load tenant oversight data:", error);
    errorMessage = "Tenant oversight is unavailable right now. Check platform access and Supabase configuration, then refresh.";
  }

  const activeOrganizations = tenantCards.filter((organization) => organization.isActive).length;
  const enterpriseOrganizations = tenantCards.filter((organization) => organization.tier === "enterprise" || organization.tier === "custom").length;
  const webhookRiskCount = tenantCards.filter((organization) => Number(organization.failedWebhooks) > 0).length;
  const erpReadyCount = tenantCards.filter((organization) => organization.erpConfigured === true).length;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Control</p>
        <h1 className={styles.title}>Tenants & Billing Management</h1>
        <p className={styles.subtitle}>
          Track tenant readiness across org structure, ERP posture, reporting activity, and session coverage. This page
          is intentionally read-only until billing and lifecycle mutations are finalized.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert} data-tone="warning">{errorMessage}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Active Tenants</p><p className={styles.metricValue}>{activeOrganizations}</p><p className={styles.metricHint}>Organizations currently marked active in the platform registry.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Enterprise / Custom</p><p className={styles.metricValue}>{enterpriseOrganizations}</p><p className={styles.metricHint}>Higher-touch tenants that usually need tighter platform oversight.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>ERP Ready</p><p className={styles.metricValue}>{erpReadyCount}</p><p className={styles.metricHint}>Organizations with at least one active ERP configuration.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Webhook Risk</p><p className={styles.metricValue}>{webhookRiskCount}</p><p className={styles.metricHint}>Tenants with active webhooks currently returning failure-class status codes.</p></article>
      </section>

      <section className={styles.gridList}>
        {tenantCards.length === 0 ? (
          <div className={styles.emptyState}>No tenant records are available in the current environment.</div>
        ) : (
          tenantCards.map((organization) => (
            <article key={String(organization.id)} className={styles.listItem}>
              <div className={styles.stackedBadges}>
                <span className={styles.badge} data-tone={organization.isActive ? "success" : "warning"}>{organization.isActive ? "Active" : "Inactive"}</span>
                <span className={styles.badge} data-tone="info">{String(organization.tier)}</span>
                <span className={styles.badge} data-tone="neutral">{String(organization.orgType)}</span>
              </div>
              <p className={styles.ruleTitle}>{String(organization.legalName)}</p>
              <p className={styles.metaText}>{String(organization.tradeName)} | {String(organization.country)} | Onboarded {String(organization.onboardedAt)}</p>
              <div className={styles.metaList}>
                <div><span className={styles.metaLabel}>Primary contact</span><div className={styles.metaValue}>{String(organization.contactName)} | {String(organization.contactEmail)}</div></div>
                <div><span className={styles.metaLabel}>Structure</span><div className={styles.metaValue}>{Number(organization.siteCount)} sites, {Number(organization.boundarySiteCount)} boundary sites, {Number(organization.legalEntityCount)} legal entities</div></div>
                <div><span className={styles.metaLabel}>Access posture</span><div className={styles.metaValue}>{Number(organization.activeUsers)} active users | MFA coverage {Number(organization.mfaCoverage)}%</div></div>
                <div><span className={styles.metaLabel}>Reporting</span><div className={styles.metaValue}>Latest submission: {String(organization.latestSubmissionStatus)}</div></div>
              </div>
              <div className={styles.stackedBadges}>
                <span className={styles.badge} data-tone={organization.erpConfigured ? "success" : "warning"}>{organization.erpConfigured ? "ERP configured" : "ERP pending"}</span>
                <span className={styles.badge} data-tone={organization.erpSyncEnabled ? "success" : "neutral"}>{organization.erpSyncEnabled ? "ERP sync enabled" : "ERP sync off"}</span>
                <span className={styles.badge} data-tone={organization.brsrRequired ? "warning" : "neutral"}>{organization.brsrRequired ? "BRSR required" : "BRSR optional"}</span>
                <span className={styles.badge} data-tone={Number(organization.failedWebhooks) > 0 ? "warning" : "success"}>{Number(organization.failedWebhooks)} webhook issue(s)</span>
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
