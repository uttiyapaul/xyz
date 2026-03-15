import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchOrganizationTeamData } from "@/features/org/users/actions";
import {
  getDashboardProfile,
  type DashboardProfile,
} from "@/lib/auth/dashboardRegistry";
import {
  canAccessPlatformAdmin,
  getUserPrimaryRole,
  type PlatformRole,
} from "@/lib/auth/roles";
import { getPatchedUserFromSession } from "@/lib/auth/sessionClaims";
import { buildSessionScope, filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { createServerSupabaseClient } from "@/lib/supabase/admin";
import { createRequestSupabaseClient } from "@/lib/supabase/server";

export type DashboardSignalTone = "info" | "warning" | "success" | "danger";

export interface DashboardHomeMetric {
  label: string;
  value: string;
  hint: string;
}

export interface DashboardHomeSignal {
  title: string;
  meta: string;
  badge: string;
  tone: DashboardSignalTone;
}

export interface DashboardHomeSnapshot {
  role: PlatformRole;
  profile: DashboardProfile;
  orgCount: number;
  siteScopeCount: number;
  legalEntityScopeCount: number;
  organizationNames: string[];
  metrics: DashboardHomeMetric[];
  signals: DashboardHomeSignal[];
  queue: DashboardHomeSignal[];
  dataMessage: string | null;
}

interface DashboardLoadContext {
  role: PlatformRole;
  profile: DashboardProfile;
  userId: string;
  orgIds: string[];
  primaryOrgId: string | null;
  siteScopeIds: string[];
  legalEntityScopeIds: string[];
}

interface DashboardContent {
  metrics: DashboardHomeMetric[];
  signals: DashboardHomeSignal[];
  queue: DashboardHomeSignal[];
  dataMessage: string | null;
}

interface SiteRow {
  id: string;
  site_name: string;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function humanizeToken(value: string): string {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toneForStatus(value: string | null | undefined): DashboardSignalTone {
  const normalized = (value ?? "").toLowerCase();

  if (["accepted", "submitted", "verified", "resolved", "active", "completed"].includes(normalized)) {
    return "success";
  }

  if (["rejected", "failed", "error", "blocked"].includes(normalized)) {
    return "danger";
  }

  if (["pending", "flagged", "draft", "warning"].includes(normalized)) {
    return "warning";
  }

  return "info";
}

function buildFallbackMetrics(context: DashboardLoadContext, organizationNames: string[]): DashboardHomeMetric[] {
  return [
    {
      label: "Organizations",
      value: formatNumber(organizationNames.length || context.orgIds.length),
      hint: "Organizations attached to the current authenticated scope.",
    },
    {
      label: "Site Scope",
      value: context.siteScopeIds.length === 0 ? "All" : formatNumber(context.siteScopeIds.length),
      hint: "Site constraints applied to this current session.",
    },
    {
      label: "Entity Scope",
      value: context.legalEntityScopeIds.length === 0 ? "All" : formatNumber(context.legalEntityScopeIds.length),
      hint: "Legal-entity scope applied to this current session.",
    },
    {
      label: "Primary Route",
      value: context.profile.preferredPath,
      hint: "Primary route registered for this role in the dashboard map.",
    },
  ];
}

async function loadScopedOrganizations(
  requestClient: SupabaseClient,
  scopedOrgIds: readonly string[],
): Promise<string[]> {
  if (scopedOrgIds.length === 0) {
    return [];
  }

  const { data, error } = await requestClient
    .from("v_active_organizations")
    .select("legal_name")
    .in("id", [...scopedOrgIds])
    .order("legal_name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{ legal_name: string }>).map((row) => row.legal_name);
}

async function loadPlatformContent(context: DashboardLoadContext, organizationNames: string[]): Promise<DashboardContent> {
  if (!canAccessPlatformAdmin(context.role)) {
    return {
      metrics: buildFallbackMetrics(context, organizationNames),
      signals: [
        {
          title: "Shared platform workspace",
          meta: "This platform role stays on the shared home until its dedicated workspace is fully built.",
          badge: "Shared lane",
          tone: "info",
        },
      ],
      queue: organizationNames.slice(0, 5).map((name) => ({
        title: name,
        meta: "Visible through the current authenticated scope.",
        badge: "Scoped org",
        tone: "info",
      })),
      dataMessage:
        context.orgIds.length === 0
          ? "No organization-scoped data is attached to this platform role right now."
          : null,
    };
  }

  const admin = createServerSupabaseClient();
  const [orgResponse, assignmentResponse, submissionResponse, webhookResponse] = await Promise.all([
    admin.from("client_organizations").select("id", { count: "exact", head: true }).is("deleted_at", null),
    admin.from("user_organization_roles").select("user_id, is_active, expires_at, platform_roles(role_name)"),
    admin.from("ghg_submissions").select("status, updated_at").order("updated_at", { ascending: false }).limit(120),
    admin.from("webhook_subscriptions").select("failure_count, last_status_code, updated_at").order("updated_at", { ascending: false }).limit(120),
  ]);

  if (orgResponse.error || assignmentResponse.error || submissionResponse.error || webhookResponse.error) {
    throw new Error("Platform control metrics are unavailable.");
  }

  const assignmentRows = (assignmentResponse.data ?? []) as Array<{
    user_id: string;
    is_active: boolean | null;
    expires_at: string | null;
    platform_roles: { role_name: string } | { role_name: string }[] | null;
  }>;
  const totalUsers = new Set(assignmentRows.map((row) => row.user_id)).size;
  const activeUsers = new Set(assignmentRows.filter((row) => row.is_active).map((row) => row.user_id)).size;
  const pendingUsers = new Set(
    assignmentRows
      .filter((row) => {
        const joined = Array.isArray(row.platform_roles) ? row.platform_roles[0]?.role_name : row.platform_roles?.role_name;
        return joined === "pending_approval";
      })
      .map((row) => row.user_id),
  ).size;
  const expiringAssignments = assignmentRows.filter((row) => {
    if (!row.expires_at) {
      return false;
    }

    const expiry = new Date(row.expires_at).getTime();
    const now = Date.now();
    return expiry >= now && expiry <= now + 30 * 24 * 60 * 60 * 1000;
  }).length;
  const draftSubmissions = ((submissionResponse.data ?? []) as Array<{ status: string }>).filter((row) => row.status === "draft").length;
  const webhookAlerts = ((webhookResponse.data ?? []) as Array<{ failure_count: number | null; last_status_code: number | null; updated_at: string | null }>)
    .filter((row) => (row.failure_count ?? 0) > 0 || (row.last_status_code ?? 200) >= 400);

  return {
    metrics: [
      { label: "Organizations", value: formatNumber(orgResponse.count ?? 0), hint: "Tenant footprint visible to the control plane." },
      { label: "Active Users", value: formatNumber(activeUsers), hint: "Users with active role assignments." },
      { label: "Pending Approvals", value: formatNumber(pendingUsers), hint: "Users still waiting for lifecycle approval." },
      { label: "Webhook Alerts", value: formatNumber(webhookAlerts.length), hint: "Subscriptions carrying retry or failure pressure." },
    ],
    signals: [
      {
        title: "Assignment posture",
        meta: `${formatNumber(totalUsers)} total user(s) and ${formatNumber(expiringAssignments)} assignment(s) expiring within 30 days.`,
        badge: "Assignments",
        tone: expiringAssignments > 0 ? "warning" : "info",
      },
      {
        title: "Reporting freshness",
        meta: `${formatNumber(draftSubmissions)} draft submission(s) remain visible in the platform-wide snapshot.`,
        badge: "Pipeline",
        tone: draftSubmissions > 0 ? "warning" : "success",
      },
    ],
    queue: webhookAlerts.slice(0, 5).map((row) => ({
      title: "Webhook retry pressure",
      meta: `Latest status ${row.last_status_code ?? "n/a"} | updated ${formatDate(row.updated_at)}`,
      badge: "Needs follow-up",
      tone: "warning",
    })),
    dataMessage: null,
  };
}

async function loadConsultingContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  const scopedOrgIds = context.orgIds.length > 0 ? context.orgIds : context.primaryOrgId ? [context.primaryOrgId] : [];

  if (scopedOrgIds.length === 0) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [
        {
          title: "No consulting scope visible",
          meta: "Assign one or more client organizations before portfolio analytics can load here.",
          badge: "Awaiting assignment",
          tone: "warning",
        },
      ],
      queue: [],
      dataMessage: "No client organizations are attached to the current consulting session.",
    };
  }

  const [orgResponse, siteResponse, scenarioResponse, targetResponse] = await Promise.all([
    requestClient.from("client_organizations").select("id, legal_name, trade_name, country, erp_sync_enabled").in("id", scopedOrgIds).eq("is_active", true),
    requestClient.from("v_active_sites").select("organization_id").in("organization_id", scopedOrgIds),
    requestClient.from("ghg_scenarios").select("organization_id, is_approved_for_display, ai_confidence_score").in("organization_id", scopedOrgIds),
    requestClient.from("mv_targets_progress").select("organization_id, is_on_track").in("organization_id", scopedOrgIds),
  ]);

  if (orgResponse.error || siteResponse.error || scenarioResponse.error || targetResponse.error) {
    throw new Error("Consulting portfolio data is unavailable.");
  }

  const organizations = (orgResponse.data ?? []) as Array<{ id: string; legal_name: string; trade_name: string | null; country: string | null; erp_sync_enabled: boolean | null }>;
  const sites = (siteResponse.data ?? []) as Array<{ organization_id: string }>;
  const scenarios = (scenarioResponse.data ?? []) as Array<{ organization_id: string; is_approved_for_display: boolean | null; ai_confidence_score: number | null }>;
  const targets = (targetResponse.data ?? []) as Array<{ organization_id: string; is_on_track: boolean | null }>;
  const confidenceScores = scenarios
    .map((row) => (row.ai_confidence_score == null ? null : row.ai_confidence_score <= 1 ? row.ai_confidence_score * 100 : row.ai_confidence_score))
    .filter((score): score is number => score != null);

  return {
    metrics: [
      { label: "Assigned Clients", value: formatNumber(organizations.length), hint: "Client organizations attached to this consulting session." },
      { label: "Active Sites", value: formatNumber(sites.length), hint: "Visible site footprint across assigned clients." },
      { label: "Scenario Models", value: formatNumber(scenarios.length), hint: "Scenario rows currently visible to this advisor." },
      { label: "Approved Displays", value: formatNumber(scenarios.filter((row) => row.is_approved_for_display).length), hint: "Scenario outputs already approved for display." },
    ],
    signals: [
      {
        title: "AI confidence posture",
        meta: confidenceScores.length > 0 ? `Average visible scenario confidence is ${formatDecimal(confidenceScores.reduce((sum, value) => sum + value, 0) / confidenceScores.length)}%.` : "No scenario confidence scores are visible yet.",
        badge: "AI models",
        tone: confidenceScores.length > 0 ? "info" : "warning",
      },
      {
        title: "Target follow-through",
        meta: `${formatNumber(targets.filter((row) => row.is_on_track).length)} target row(s) are currently on track across assigned clients.`,
        badge: "Targets",
        tone: targets.some((row) => row.is_on_track) ? "success" : "warning",
      },
    ],
    queue: organizations.slice(0, 5).map((organization) => ({
      title: organization.trade_name?.trim() || organization.legal_name,
      meta: `${organization.country ?? "Unspecified"} | ERP sync ${organization.erp_sync_enabled ? "enabled" : "pending"}`,
      badge: "Client portfolio",
      tone: organization.erp_sync_enabled ? "success" : "info",
    })),
    dataMessage: null,
  };
}

async function loadOrganizationContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  const teamResult = await fetchOrganizationTeamData();

  if ("error" in teamResult || !teamResult.data) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [{ title: "Organization team data unavailable", meta: teamResult.error ?? "The team roster could not be loaded.", badge: "Access check", tone: "warning" }],
      queue: [],
      dataMessage: teamResult.error ?? "Organization team data is unavailable.",
    };
  }

  const { data } = teamResult;
  const [apiKeyResponse, webhookResponse] = await Promise.all([
    requestClient.from("api_keys").select("status").eq("organization_id", data.organizationId).limit(40),
    requestClient.from("webhook_subscriptions").select("failure_count, last_status_code").eq("organization_id", data.organizationId).limit(40),
  ]);

  const apiKeys = apiKeyResponse.error ? [] : (apiKeyResponse.data ?? []) as Array<{ status: string }>;
  const webhooks = webhookResponse.error ? [] : (webhookResponse.data ?? []) as Array<{ failure_count: number | null; last_status_code: number | null }>;
  const activeAssignments = data.teamMembers.reduce((count, member) => count + member.activeAssignmentCount, 0);
  const scopedAssignments = data.teamMembers.reduce((count, member) => count + member.assignments.filter((assignment) => assignment.siteScopeSummary !== "All sites" || assignment.legalEntityScopeSummary !== "All legal entities").length, 0);
  const sodAlerts = data.teamMembers.reduce((count, member) => count + member.sodAlerts.length, 0);

  return {
    metrics: [
      { label: "Team Members", value: formatNumber(data.teamMembers.length), hint: "Users visible in the active organization roster." },
      { label: "Active Assignments", value: formatNumber(activeAssignments), hint: "Role assignments currently active in this organization." },
      { label: "Scoped Assignments", value: formatNumber(scopedAssignments), hint: "Assignments constrained to sites or legal entities." },
      { label: "Integrations", value: formatNumber(apiKeys.filter((key) => key.status !== "revoked").length + webhooks.length), hint: "API key and webhook surfaces visible to this org-admin session." },
    ],
    signals: [
      { title: "SoD posture", meta: `${formatNumber(sodAlerts)} separation-of-duties warning(s) are visible across the current team roster.`, badge: "SoD", tone: sodAlerts > 0 ? "warning" : "success" },
      { title: "Webhook hygiene", meta: `${formatNumber(webhooks.filter((row) => (row.failure_count ?? 0) > 0 || (row.last_status_code ?? 200) >= 400).length)} webhook subscription(s) need follow-up because failures are visible.`, badge: "Webhooks", tone: webhooks.some((row) => (row.failure_count ?? 0) > 0 || (row.last_status_code ?? 200) >= 400) ? "warning" : "success" },
    ],
    queue: data.teamMembers.slice(0, 5).map((member) => ({
      title: member.fullName,
      meta: `${member.primaryRoleLabel} | ${formatNumber(member.assignmentCount)} assignment(s) | ${formatNumber(member.sodAlerts.length)} SoD alert(s)`,
      badge: member.sodAlerts.length > 0 ? "Needs review" : "Stable",
      tone: member.sodAlerts.length > 0 ? "warning" : "info",
    })),
    dataMessage: data.primaryContactName || data.primaryContactEmail ? `Primary contact: ${data.primaryContactName ?? "Not configured"} | ${data.primaryContactEmail ?? "No email configured"}.` : null,
  };
}

async function loadSustainabilityContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  const scopedOrgIds = context.orgIds.length > 0 ? context.orgIds : context.primaryOrgId ? [context.primaryOrgId] : [];

  if (scopedOrgIds.length === 0) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [{ title: "No sustainability scope visible", meta: "Attach one or more organizations before target and filing metrics can load here.", badge: "No org scope", tone: "warning" }],
      queue: [],
      dataMessage: "No organization scope is attached to the current sustainability session.",
    };
  }

  const [targetResponse, filingResponse, emissionsResponse, productResponse] = await Promise.all([
    requestClient.from("mv_targets_progress").select("target_name, is_on_track, is_sbti_aligned, achieved_reduction_pct, target_year").in("organization_id", scopedOrgIds),
    requestClient.from("regulatory_filings").select("filing_type, status, due_date").in("organization_id", scopedOrgIds).order("due_date"),
    requestClient.rpc("get_my_annual_emissions"),
    requestClient.from("product_emissions").select("organization_id, reporting_period, exported_to_eu, default_value_used, ai_calculated").in("organization_id", scopedOrgIds).order("reporting_period", { ascending: false }).limit(120),
  ]);

  if (targetResponse.error || filingResponse.error || emissionsResponse.error || productResponse.error) {
    throw new Error("Sustainability dashboard data is unavailable.");
  }

  const targets = (targetResponse.data ?? []) as Array<{ target_name: string; is_on_track: boolean | null; is_sbti_aligned: boolean | null; achieved_reduction_pct: number | null; target_year: number }>;
  const filings = (filingResponse.data ?? []) as Array<{ filing_type: string; status: string; due_date: string }>;
  const emissions = ((emissionsResponse.data ?? []) as Array<{ organization_id: string; fy_year: string; tco2e_total: number }>).filter((row) => scopedOrgIds.includes(row.organization_id));
  const productRows = (productResponse.data ?? []) as Array<{ reporting_period: string; exported_to_eu: boolean | null; default_value_used: boolean | null; ai_calculated: boolean | null }>;
  const latestEmission = emissions.slice().sort((left, right) => right.fy_year.localeCompare(left.fy_year))[0];
  const openFilings = filings.filter((filing) => !["submitted", "accepted"].includes(filing.status));
  const offTrackTargets = targets.filter((target) => target.is_on_track === false);

  return {
    metrics: [
      { label: "Targets", value: formatNumber(targets.length), hint: "Target progress rows visible to this role." },
      { label: "On Track", value: formatNumber(targets.filter((target) => target.is_on_track).length), hint: "Targets currently meeting the glidepath." },
      { label: "Open Filings", value: formatNumber(openFilings.length), hint: "Regulatory filing rows not yet closed or accepted." },
      { label: "EU Export Rows", value: formatNumber(productRows.filter((row) => row.exported_to_eu).length), hint: "Product-emission rows marked as exported to the EU." },
    ],
    signals: [
      { title: "Annual emissions baseline", meta: latestEmission ? `${latestEmission.fy_year} currently stands at ${formatDecimal(Number(latestEmission.tco2e_total))} tCO2e.` : "No annual emissions baseline is visible yet.", badge: latestEmission?.fy_year ?? "No baseline", tone: latestEmission ? "info" : "warning" },
      { title: "SBTi posture", meta: `${formatNumber(targets.filter((target) => target.is_sbti_aligned).length)} target(s) are marked SBTi aligned in the visible scope.`, badge: "SBTi", tone: targets.some((target) => target.is_sbti_aligned) ? "success" : "info" },
    ],
    queue: (offTrackTargets.length > 0 ? offTrackTargets : targets).slice(0, 5).map((target) => ({
      title: target.target_name,
      meta: `Target year ${target.target_year} | achieved reduction ${formatDecimal(Number(target.achieved_reduction_pct ?? 0))}%`,
      badge: target.is_on_track ? "On track" : "Needs action",
      tone: target.is_on_track ? "success" : "warning",
    })),
    dataMessage: null,
  };
}

async function loadGovernanceContent(context: DashboardLoadContext, organizationNames: string[]): Promise<DashboardContent> {
  const admin = createServerSupabaseClient();
  const [dsarResponse, dpiaResponse, ropaResponse, transferResponse, incidentResponse, consentResponse] =
    await Promise.all([
      admin
        .from("data_subject_access_requests")
        .select(
          "id, requester_name, requester_email, request_type, status, due_at, requested_at, escalated_at, identity_verified",
        )
        .order("requested_at", { ascending: false })
        .limit(150),
      admin
        .from("dpia_register")
        .select(
          "id, processing_activity, risk_level, residual_risk, next_review_due, approved_at, dpia_required",
        )
        .order("updated_at", { ascending: false })
        .limit(120),
      admin
        .from("ropa_entries")
        .select(
          "id, activity_name, legal_basis, next_review_due, last_reviewed_at, automated_decision_making, profiling_involved, is_active",
        )
        .order("next_review_due", { ascending: true })
        .limit(120),
      admin
        .from("international_data_transfers")
        .select("id, transfer_name, data_importer_country, transfer_mechanism, tia_completed, next_review_due, is_active")
        .order("next_review_due", { ascending: true })
        .limit(120),
      admin
        .from("security_incidents")
        .select(
          "id, incident_ref, title, severity, status, detected_at, dpa_notification_required, dpa_notification_deadline, personal_data_involved",
        )
        .order("detected_at", { ascending: false })
        .limit(150),
      admin
        .from("consent_records")
        .select("id, consent_type, lawful_basis, consented_at, is_withdrawn, withdrawn_at")
        .order("updated_at", { ascending: false })
        .limit(150),
    ]);

  if (
    dsarResponse.error ||
    dpiaResponse.error ||
    ropaResponse.error ||
    transferResponse.error ||
    incidentResponse.error ||
    consentResponse.error
  ) {
    throw new Error("Governance dashboard data is unavailable.");
  }

  const dsars = (dsarResponse.data ?? []) as Array<{
    id: string;
    requester_name: string | null;
    requester_email: string;
    request_type: string;
    status: string;
    due_at: string | null;
    requested_at: string;
    escalated_at: string | null;
    identity_verified: boolean;
  }>;
  const dpias = (dpiaResponse.data ?? []) as Array<{
    id: string;
    processing_activity: string;
    risk_level: string;
    residual_risk: string | null;
    next_review_due: string | null;
    approved_at: string | null;
    dpia_required: boolean;
  }>;
  const ropaEntries = (ropaResponse.data ?? []) as Array<{
    id: string;
    activity_name: string;
    legal_basis: string;
    next_review_due: string | null;
    last_reviewed_at: string | null;
    automated_decision_making: boolean;
    profiling_involved: boolean;
    is_active: boolean;
  }>;
  const transfers = (transferResponse.data ?? []) as Array<{
    id: string;
    transfer_name: string;
    data_importer_country: string;
    transfer_mechanism: string;
    tia_completed: boolean;
    next_review_due: string | null;
    is_active: boolean;
  }>;
  const incidents = (incidentResponse.data ?? []) as Array<{
    id: string;
    incident_ref: string | null;
    title: string;
    severity: string;
    status: string;
    detected_at: string;
    dpa_notification_required: boolean;
    dpa_notification_deadline: string | null;
    personal_data_involved: boolean;
  }>;
  const consents = (consentResponse.data ?? []) as Array<{
    id: string;
    consent_type: string;
    lawful_basis: string;
    consented_at: string;
    is_withdrawn: boolean;
    withdrawn_at: string | null;
  }>;

  const now = Date.now();
  const activeDsars = dsars.filter((row) => !["fulfilled", "rejected", "withdrawn"].includes(row.status));
  const overdueDsars = activeDsars.filter((row) => row.due_at && new Date(row.due_at).getTime() < now);
  const reviewDueRopa = ropaEntries.filter((row) => row.is_active && row.next_review_due && new Date(row.next_review_due).getTime() <= now + 30 * 24 * 60 * 60 * 1000);
  const highRiskDpias = dpias.filter(
    (row) =>
      row.dpia_required &&
      (row.risk_level === "high" || row.residual_risk === "needs_review" || row.residual_risk === "unacceptable"),
  );
  const activeTransfers = transfers.filter((row) => row.is_active);
  const openIncidents = incidents.filter((row) => !["resolved", "closed", "false_positive"].includes(row.status));
  const privacyIncidents = openIncidents.filter((row) => row.personal_data_involved);
  const withdrawnConsents = consents.filter((row) => row.is_withdrawn);
  const escalatedDsars = activeDsars.filter((row) => row.escalated_at);
  const dpaDeadlineIncidents = privacyIncidents.filter(
    (row) => row.dpa_notification_required && row.dpa_notification_deadline && new Date(row.dpa_notification_deadline).getTime() < now + 72 * 60 * 60 * 1000,
  );

  if (context.role === "grievance_officer") {
    return {
      metrics: [
        { label: "Open Incidents", value: formatNumber(openIncidents.length), hint: "Incident rows still under active response or containment." },
        { label: "Critical Incidents", value: formatNumber(openIncidents.filter((row) => ["critical", "high"].includes(row.severity)).length), hint: "High-severity incidents currently visible in the governance queue." },
        { label: "Escalated DSARs", value: formatNumber(escalatedDsars.length), hint: "Data-subject requests escalated for governance follow-up." },
        { label: "Withdrawn Consents", value: formatNumber(withdrawnConsents.length), hint: "Consent records carrying a live withdrawal state." },
      ],
      signals: [
        {
          title: "Schema-backed grievance posture",
          meta: "A standalone grievance-case table is not in the live schema yet, so this workspace tracks incident, escalation, and consent-withdrawal pressure instead of fake case records.",
          badge: "Live schema",
          tone: "info",
        },
        {
          title: "Regulatory deadline pressure",
          meta: `${formatNumber(dpaDeadlineIncidents.length)} privacy incident(s) are nearing a DPA notification deadline and ${formatNumber(escalatedDsars.filter((row) => !row.identity_verified).length)} escalated DSAR(s) still lack identity verification.`,
          badge: "Needs follow-up",
          tone: dpaDeadlineIncidents.length > 0 ? "warning" : "success",
        },
      ],
      queue: (openIncidents.length > 0 ? openIncidents : escalatedDsars).slice(0, 5).map((row) => {
        if ("incident_ref" in row) {
          return {
            title: row.incident_ref?.trim() || row.title,
            meta: `${humanizeToken(row.status)} | ${humanizeToken(row.severity)} | detected ${formatDate(row.detected_at)}`,
            badge: "Incident",
            tone: toneForStatus(row.severity),
          };
        }

        return {
          title: row.requester_name?.trim() || row.requester_email,
          meta: `${humanizeToken(row.request_type)} | requested ${formatDate(row.requested_at)}`,
          badge: "Escalated DSAR",
          tone: row.identity_verified ? "info" : "warning",
        };
      }),
      dataMessage:
        openIncidents.length === 0 && escalatedDsars.length === 0 && withdrawnConsents.length === 0
          ? "No open incidents, escalated DSARs, or withdrawn consent records are visible in the governance schema right now."
          : organizationNames.length > 0
            ? `Current session is attached to ${formatNumber(organizationNames.length)} organization(s) while governance reporting remains platform-wide.`
            : null,
    };
  }

  return {
    metrics: [
      { label: "Open DSARs", value: formatNumber(activeDsars.length), hint: "Data-subject requests still awaiting fulfillment or closure." },
      { label: "Overdue DSARs", value: formatNumber(overdueDsars.length), hint: "Open requests that have already crossed their due date." },
      { label: "ROPA Reviews Due", value: formatNumber(reviewDueRopa.length), hint: "Active ROPA entries due for review within the next 30 days." },
      { label: "High-Risk DPIA", value: formatNumber(highRiskDpias.length), hint: "DPIA rows requiring heightened privacy attention." },
    ],
    signals: [
      {
        title: "Transfer registry posture",
        meta: `${formatNumber(activeTransfers.length)} active transfer(s) are visible and ${formatNumber(activeTransfers.filter((row) => !row.tia_completed).length)} still lack a completed transfer impact assessment.`,
        badge: "Transfers",
        tone: activeTransfers.some((row) => !row.tia_completed) ? "warning" : "success",
      },
      {
        title: "Privacy incident exposure",
        meta: `${formatNumber(privacyIncidents.length)} open incident(s) involve personal data and ${formatNumber(withdrawnConsents.length)} consent withdrawal(s) are already recorded in the live schema.`,
        badge: "Privacy risk",
        tone: privacyIncidents.length > 0 ? "warning" : "info",
      },
    ],
    queue: (overdueDsars.length > 0 ? overdueDsars : activeDsars.length > 0 ? activeDsars : reviewDueRopa).slice(0, 5).map((row) => {
      if ("requester_email" in row) {
        return {
          title: row.requester_name?.trim() || row.requester_email,
          meta: `${humanizeToken(row.request_type)} | due ${formatDate(row.due_at)}`,
          badge: humanizeToken(row.status),
          tone: row.due_at && new Date(row.due_at).getTime() < now ? "warning" : toneForStatus(row.status),
        };
      }

      return {
        title: row.activity_name,
        meta: `${humanizeToken(row.legal_basis)} | review due ${formatDate(row.next_review_due)}`,
        badge: row.automated_decision_making || row.profiling_involved ? "High scrutiny" : "ROPA review",
        tone: row.next_review_due && new Date(row.next_review_due).getTime() < now ? "warning" : "info",
      };
    }),
    dataMessage:
      activeDsars.length === 0 &&
      reviewDueRopa.length === 0 &&
      highRiskDpias.length === 0 &&
      activeTransfers.length === 0
        ? "No DSAR, ROPA, DPIA, or transfer records are visible in the live privacy schema right now."
        : organizationNames.length > 0
          ? `Current session is attached to ${formatNumber(organizationNames.length)} organization(s) while privacy oversight remains cross-platform.`
          : null,
  };
}

async function loadOperationalContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  if (!context.primaryOrgId) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [{ title: "No operational scope visible", meta: "An active organization is required before live workflow metrics can load here.", badge: "No org scope", tone: "warning" }],
      queue: [],
      dataMessage: "No active organization scope is attached to this operational role.",
    };
  }

  const [siteResponse, sourceResponse, activityResponse, documentResponse, anomalyResponse] = await Promise.all([
    requestClient.from("v_active_sites").select("id, site_name").eq("organization_id", context.primaryOrgId).order("site_name"),
    requestClient.from("ghg_emission_source_register").select("id, site_id, emission_factor_id").eq("organization_id", context.primaryOrgId).is("deleted_at", null).limit(200),
    requestClient.from("activity_data").select("facility_id, activity_type, reporting_period, status, created_by, risk_level").eq("organization_id", context.primaryOrgId).order("reporting_period", { ascending: false }).limit(200),
    requestClient.from("ghg_documents").select("site_id, file_name, review_status, extraction_status, uploaded_at, uploaded_by").eq("organization_id", context.primaryOrgId).order("uploaded_at", { ascending: false }).limit(200),
    requestClient.from("ghg_anomaly_flags").select("anomaly_score, is_confirmed").eq("organization_id", context.primaryOrgId).limit(160),
  ]);

  if (siteResponse.error || sourceResponse.error || activityResponse.error || documentResponse.error || anomalyResponse.error) {
    throw new Error("Operational dashboard data is unavailable.");
  }

  const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], context.siteScopeIds, (site) => site.id);
  const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
  const sources = filterRowsByScopeId((sourceResponse.data ?? []) as Array<{ site_id: string | null; emission_factor_id: string | null }>, context.siteScopeIds, (row) => row.site_id, { includeRowsWithoutScope: true });
  const activities = filterRowsByScopeId((activityResponse.data ?? []) as Array<{ facility_id: string | null; activity_type: string; reporting_period: string; status: string; created_by: string; risk_level: string | null }>, context.siteScopeIds, (row) => row.facility_id, { includeRowsWithoutScope: true });
  const documents = filterRowsByScopeId((documentResponse.data ?? []) as Array<{ site_id: string | null; file_name: string; review_status: string | null; extraction_status: string | null; uploaded_at: string; uploaded_by: string }>, context.siteScopeIds, (row) => row.site_id, { includeRowsWithoutScope: true });
  const anomalies = (anomalyResponse.data ?? []) as Array<{ anomaly_score: number | null; is_confirmed: boolean }>;
  const personalLane = context.profile.family === "data_entry" && context.role === "data_entry_operator";
  const visibleActivities = personalLane ? activities.filter((row) => row.created_by === context.userId) : activities;
  const visibleDocuments = personalLane ? documents.filter((row) => row.uploaded_by === context.userId) : documents;

  if (context.profile.family === "accounting") {
    const validatedRows = visibleActivities.filter((row) => row.status === "validated");
    const selfApprovalBlocks = context.role === "data_approver" ? validatedRows.filter((row) => row.created_by === context.userId).length : 0;

    return {
      metrics: [
        { label: "Pending Queue", value: formatNumber(visibleActivities.filter((row) => ["pending", "flagged"].includes(row.status)).length), hint: "Pending or flagged records awaiting review or approval." },
        { label: "Validated Rows", value: formatNumber(validatedRows.length), hint: "Rows already validated and awaiting downstream action." },
        { label: "Open Anomalies", value: formatNumber(anomalies.filter((row) => !row.is_confirmed).length), hint: "Anomaly flags still waiting for closure." },
        { label: "Factor Gaps", value: formatNumber(sources.filter((row) => !row.emission_factor_id).length), hint: "Source rows still missing factor linkage." },
      ],
      signals: [
        { title: "SoD control", meta: context.role === "data_approver" ? `${formatNumber(selfApprovalBlocks)} validated row(s) originated by you would be blocked from final acceptance.` : "Reviewer, approver, and accountant lanes remain intentionally separate.", badge: "SoD", tone: selfApprovalBlocks > 0 ? "warning" : "info" },
        { title: "Risk posture", meta: `${formatNumber(visibleActivities.filter((row) => (row.risk_level ?? "").toLowerCase() === "high").length)} high-risk record(s) and ${formatNumber(anomalies.filter((row) => !row.is_confirmed).length)} unresolved anomaly flag(s) are visible.`, badge: "Risk", tone: anomalies.some((row) => !row.is_confirmed) ? "warning" : "success" },
      ],
      queue: visibleActivities.slice(0, 5).map((row) => ({
        title: humanizeToken(row.activity_type),
        meta: `${row.facility_id ? siteMap.get(row.facility_id) ?? "Unassigned" : "Unassigned"} | ${formatDate(row.reporting_period)}`,
        badge: humanizeToken(row.status),
        tone: toneForStatus(row.status),
      })),
      dataMessage: null,
    };
  }

  return {
    metrics: [
      { label: "Visible Sites", value: formatNumber(sites.length), hint: "Sites currently inside the session scope for activity capture." },
      { label: "Registered Sources", value: formatNumber(sources.length), hint: "Source-register rows visible to this session." },
      { label: "Open Records", value: formatNumber(visibleActivities.filter((row) => row.status !== "accepted").length), hint: "Activity rows not yet accepted." },
      { label: "Evidence Pending", value: formatNumber(visibleDocuments.filter((row) => row.review_status !== "accepted").length), hint: "Document uploads still waiting for review closure." },
    ],
    signals: [
      { title: "Extraction backlog", meta: `${formatNumber(visibleDocuments.filter((row) => (row.extraction_status ?? "pending") !== "completed").length)} document(s) still need extraction completion or human confirmation.`, badge: "Evidence", tone: visibleDocuments.some((row) => (row.extraction_status ?? "pending") !== "completed") ? "warning" : "success" },
      { title: "Role lane", meta: personalLane ? "This home focuses on the current operator's own records and evidence." : "Facility scope shows the full visible capture pipeline for the current site scope.", badge: humanizeToken(context.role), tone: "info" },
    ],
    queue: visibleActivities.slice(0, 5).map((row) => ({
      title: humanizeToken(row.activity_type),
      meta: `${row.facility_id ? siteMap.get(row.facility_id) ?? "Unassigned" : "Unassigned"} | ${formatDate(row.reporting_period)}`,
      badge: humanizeToken(row.status),
      tone: toneForStatus(row.status),
    })),
    dataMessage: null,
  };
}

async function loadExecutiveContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  if (context.role === "supply_chain_reporter") {
    return loadOperationalContent(requestClient, { ...context, profile: { ...context.profile, family: "data_entry" } });
  }

  const scopedOrgIds = context.orgIds.length > 0 ? context.orgIds : context.primaryOrgId ? [context.primaryOrgId] : [];

  if (scopedOrgIds.length === 0) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [{ title: "No reporting scope visible", meta: "Attach one or more organizations before live reporting metrics can load here.", badge: "No org scope", tone: "warning" }],
      queue: [],
      dataMessage: "No organization scope is attached to the current reporting session.",
    };
  }

  const [emissionsResponse, filingResponse, paymentResponse, productResponse] = await Promise.all([
    requestClient.rpc("get_my_annual_emissions"),
    requestClient.from("regulatory_filings").select("filing_type, status, due_date").in("organization_id", scopedOrgIds).order("due_date"),
    requestClient.from("payment_transactions").select("amount_inr, status, created_at").in("organization_id", scopedOrgIds).order("created_at", { ascending: false }).limit(120),
    requestClient.from("product_emissions").select("reporting_period, exported_to_eu, default_value_used, ai_calculated, is_verified").in("organization_id", scopedOrgIds).order("reporting_period", { ascending: false }).limit(120),
  ]);

  if (emissionsResponse.error || filingResponse.error || paymentResponse.error || productResponse.error) {
    throw new Error("Executive reporting data is unavailable.");
  }

  const emissions = ((emissionsResponse.data ?? []) as Array<{ organization_id: string; fy_year: string; tco2e_total: number }>).filter((row) => scopedOrgIds.includes(row.organization_id));
  const filings = (filingResponse.data ?? []) as Array<{ filing_type: string; status: string; due_date: string }>;
  const payments = (paymentResponse.data ?? []) as Array<{ amount_inr: number | null; status: string; created_at: string }>;
  const productRows = (productResponse.data ?? []) as Array<{ reporting_period: string; exported_to_eu: boolean | null; default_value_used: boolean | null; ai_calculated: boolean | null; is_verified: boolean | null }>;
  const latestEmission = emissions.slice().sort((left, right) => right.fy_year.localeCompare(left.fy_year))[0];
  const openFilings = filings.filter((filing) => !["submitted", "accepted"].includes(filing.status));
  const completedOutflow = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount_inr ?? 0), 0);
  const exportRows = productRows.filter((row) => row.exported_to_eu);

  return {
    metrics: [
      { label: "Latest FY tCO2e", value: latestEmission ? formatDecimal(Number(latestEmission.tco2e_total)) : "0", hint: "Latest annual emissions total visible to this audience." },
      { label: "Open Filings", value: formatNumber(openFilings.length), hint: "Regulatory filing rows not yet closed or accepted." },
      { label: "Completed Outflow", value: formatNumber(Math.round(completedOutflow)), hint: "Completed finance outflow recorded in INR." },
      { label: "Verified Exports", value: formatNumber(exportRows.filter((row) => row.is_verified).length), hint: "EU-export product rows already carrying verification status." },
    ],
    signals: [
      { title: "Disclosure quality", meta: `${formatNumber(exportRows.filter((row) => row.default_value_used).length)} export row(s) still rely on default values and ${formatNumber(exportRows.filter((row) => row.ai_calculated).length)} are AI calculated.`, badge: "Quality", tone: exportRows.some((row) => row.default_value_used || row.ai_calculated) ? "warning" : "success" },
      { title: "Audience posture", meta: context.profile.family === "external" ? "This role is limited to approved, read-only reporting surfaces." : "Executive visibility remains downstream of review, approval, and verifier workflows.", badge: "Read focused", tone: "info" },
    ],
    queue: (openFilings.length > 0 ? openFilings : productRows).slice(0, 5).map((row) => {
      if ("filing_type" in row) {
        return { title: humanizeToken(row.filing_type), meta: `Due ${formatDate(row.due_date)} | ${humanizeToken(row.status)}`, badge: "Filing", tone: toneForStatus(row.status) };
      }

      return { title: `Export row ${formatDate(row.reporting_period)}`, meta: `${row.is_verified ? "Verified" : "Unverified"} | ${row.default_value_used ? "Default value" : "Source data"}`, badge: "Product emissions", tone: row.is_verified ? "success" : "warning" };
    }),
    dataMessage: null,
  };
}

async function loadVerificationContent(requestClient: SupabaseClient, context: DashboardLoadContext): Promise<DashboardContent> {
  if (!context.primaryOrgId) {
    return {
      metrics: buildFallbackMetrics(context, []),
      signals: [{ title: "No assurance scope visible", meta: "An active organization is required before live verification metrics can load here.", badge: "No org scope", tone: "warning" }],
      queue: [],
      dataMessage: "No organization scope is attached to the current assurance session.",
    };
  }

  const [verificationResponse, findingResponse, documentResponse, signoffResponse] = await Promise.all([
    requestClient.from("ghg_verifications").select("id, fy_year, status, verification_opinion, final_statement_date").eq("organization_id", context.primaryOrgId).order("created_at", { ascending: false }).limit(120),
    requestClient.from("ghg_verification_findings").select("finding_ref, severity, status, finding_type, raised_at").eq("organization_id", context.primaryOrgId).order("raised_at", { ascending: false }).limit(120),
    requestClient.from("ghg_documents").select("site_id, verifier_reviewed").eq("organization_id", context.primaryOrgId).limit(200),
    requestClient.from("ghg_signoff_chain").select("signoff_stage, signed_at").eq("organization_id", context.primaryOrgId).order("signed_at", { ascending: false }).limit(160),
  ]);

  if (verificationResponse.error || findingResponse.error || documentResponse.error || signoffResponse.error) {
    throw new Error("Verification dashboard data is unavailable.");
  }

  const verifications = (verificationResponse.data ?? []) as Array<{ id: string; fy_year: string; status: string; verification_opinion: string | null; final_statement_date: string | null }>;
  const findings = (findingResponse.data ?? []) as Array<{ finding_ref: string; severity: string; status: string; finding_type: string; raised_at: string }>;
  const documents = filterRowsByScopeId((documentResponse.data ?? []) as Array<{ site_id: string | null; verifier_reviewed: boolean | null }>, context.siteScopeIds, (row) => row.site_id, { includeRowsWithoutScope: true });
  const signoffs = (signoffResponse.data ?? []) as Array<{ signoff_stage: string; signed_at: string }>;

  return {
    metrics: [
      { label: "Active Engagements", value: formatNumber(verifications.length), hint: "Verification rows visible in the current assurance scope." },
      { label: "Open Findings", value: formatNumber(findings.filter((row) => row.status === "open").length), hint: "Findings still awaiting response or closure." },
      { label: "Final Statements", value: formatNumber(verifications.filter((row) => row.final_statement_date != null).length), hint: "Verification rows already carrying a final statement date." },
      { label: "Signoff Events", value: formatNumber(signoffs.length), hint: "Signoff-chain events visible in the current assurance scope." },
    ],
    signals: [
      { title: "Client response pressure", meta: `${formatNumber(findings.filter((row) => row.status === "open").length)} open finding(s) remain visible and ${formatNumber(findings.filter((row) => row.status === "open" && row.severity.toLowerCase() === "high").length)} of them are high severity.`, badge: "Findings", tone: findings.some((row) => row.status === "open") ? "warning" : "success" },
      { title: "Evidence posture", meta: `${formatNumber(documents.filter((row) => row.verifier_reviewed).length)} evidence document(s) were already verifier-reviewed in the visible scope.`, badge: "Evidence", tone: documents.some((row) => row.verifier_reviewed) ? "info" : "warning" },
    ],
    queue: (findings.length > 0 ? findings : verifications).slice(0, 5).map((row) => {
      if ("finding_ref" in row) {
        return { title: row.finding_ref, meta: `${humanizeToken(row.finding_type)} | raised ${formatDate(row.raised_at)}`, badge: humanizeToken(row.severity), tone: toneForStatus(row.severity) };
      }

      return { title: `FY ${row.fy_year}`, meta: row.final_statement_date ? `Final statement ${formatDate(row.final_statement_date)}` : `Status ${humanizeToken(row.status)}`, badge: row.verification_opinion ?? humanizeToken(row.status), tone: row.final_statement_date ? "success" : toneForStatus(row.status) };
    }),
    dataMessage: null,
  };
}

async function loadFamilyContent(requestClient: SupabaseClient, context: DashboardLoadContext, organizationNames: string[]): Promise<DashboardContent> {
  switch (context.profile.family) {
    case "platform":
      return loadPlatformContent(context, organizationNames);
    case "governance":
      return loadGovernanceContent(context, organizationNames);
    case "consulting":
      return loadConsultingContent(requestClient, context);
    case "organization":
      return loadOrganizationContent(requestClient, context);
    case "sustainability":
      return loadSustainabilityContent(requestClient, context);
    case "accounting":
    case "data_entry":
      return loadOperationalContent(requestClient, context);
    case "executive":
    case "external":
      return loadExecutiveContent(requestClient, context);
    case "verification":
      return loadVerificationContent(requestClient, context);
    default:
      return { metrics: buildFallbackMetrics(context, organizationNames), signals: [], queue: [], dataMessage: null };
  }
}

/**
 * Server-rendered dashboard home state.
 *
 * This keeps the dashboard home tied to the request cookie session and live
 * database reads, so the first render is useful even before any client-side
 * hydration or follow-up navigation occurs.
 */
export async function loadDashboardHomeSnapshot(): Promise<DashboardHomeSnapshot> {
  const requestClient = await createRequestSupabaseClient();
  const { data: { session }, error } = await requestClient.auth.getSession();

  if (error || !session) {
    throw new Error("Dashboard session is unavailable.");
  }

  const patchedUser = getPatchedUserFromSession(session);
  const role = getUserPrimaryRole(patchedUser);
  const profile = getDashboardProfile(role);
  const scope = buildSessionScope((patchedUser.app_metadata ?? {}) as Record<string, unknown>);
  const scopedOrgIds = scope.orgIds.length > 0 ? scope.orgIds : scope.primaryOrgId ? [scope.primaryOrgId] : [];
  const organizationNames = await loadScopedOrganizations(requestClient, scopedOrgIds).catch((loadError) => {
    console.error("Failed to load scoped organizations for dashboard home:", loadError);
    return [];
  });
  const context: DashboardLoadContext = {
    role,
    profile,
    userId: patchedUser.id,
    orgIds: scope.orgIds,
    primaryOrgId: scope.primaryOrgId,
    siteScopeIds: scope.siteScopeIds,
    legalEntityScopeIds: scope.legalEntityScopeIds,
  };

  try {
    const content = await loadFamilyContent(requestClient, context, organizationNames);

    return {
      role,
      profile,
      orgCount: organizationNames.length || scopedOrgIds.length,
      siteScopeCount: scope.siteScopeIds.length,
      legalEntityScopeCount: scope.legalEntityScopeIds.length,
      organizationNames,
      metrics: content.metrics,
      signals: content.signals,
      queue: content.queue,
      dataMessage: content.dataMessage,
    };
  } catch (loadError) {
    console.error("Failed to load dashboard home snapshot:", loadError);

    return {
      role,
      profile,
      orgCount: organizationNames.length || scopedOrgIds.length,
      siteScopeCount: scope.siteScopeIds.length,
      legalEntityScopeCount: scope.legalEntityScopeIds.length,
      organizationNames,
      metrics: buildFallbackMetrics(context, organizationNames),
      signals: [
        {
          title: "Live dashboard data unavailable",
          meta: "The role home could not load its live summary right now. Use the route shortcuts below and try again shortly.",
          badge: "Temporary issue",
          tone: "warning",
        },
      ],
      queue: [],
      dataMessage: "Live dashboard data is temporarily unavailable for this role. Route access and scoped workspaces remain available.",
    };
  }
}
