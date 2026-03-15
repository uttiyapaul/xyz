/**
 * A2Z Carbon Solutions - lib/auth/roles.ts
 * Canonical frontend role catalog aligned to the 14 March 2026 role architecture.
 *
 * Why this file exists:
 * - The dashboard, sidebar, auth flows, and role-aware UI all need one source of truth.
 * - The live database remains authoritative for enforcement, but the frontend still needs
 *   a complete catalog so it can route and label roles intentionally instead of drifting.
 */

import type { User } from "@supabase/supabase-js";

export type PlatformRole =
  | "platform_superadmin"
  | "platform_admin"
  | "platform_developer"
  | "platform_auditor"
  | "digital_twin_engineer"
  | "platform_crm"
  | "platform_sales"
  | "platform_finance"
  | "platform_data_scientist"
  | "platform_support"
  | "dpo"
  | "grievance_officer"
  | "consultant_lead"
  | "consultant_senior"
  | "consultant_analyst"
  | "consultant_viewer"
  | "consultant_trainee"
  | "subsidiary_admin"
  | "group_sustainability_head"
  | "group_consolidator"
  | "country_manager"
  | "regional_analyst"
  | "client_superadmin"
  | "client_admin"
  | "client_it_admin"
  | "sustainability_head"
  | "cbam_compliance_officer"
  | "esg_manager"
  | "carbon_accountant"
  | "regulatory_filing_agent"
  | "supply_chain_analyst"
  | "data_reviewer"
  | "data_approver"
  | "iot_device_manager"
  | "data_entry_operator"
  | "facility_manager"
  | "cfo_viewer"
  | "finance_analyst"
  | "carbon_credit_trader"
  | "executive_viewer"
  | "board_report_recipient"
  | "verifier_lead"
  | "verifier_approver"
  | "verifier_iso"
  | "cbam_verifier"
  | "verifier_reviewer"
  | "regulatory_inspector"
  | "investor_viewer"
  | "lender_viewer"
  | "supply_chain_reporter"
  | "api_key_manager"
  | "erp_service_account"
  | "readonly_api_user"
  | "webhook_consumer"
  | "pending_approval"
  | "invited_unaccepted"
  | "suspended"
  | "offboarded";

export const PLATFORM_STAFF_ROLES: PlatformRole[] = [
  "platform_superadmin",
  "platform_admin",
  "platform_developer",
  "platform_auditor",
  "digital_twin_engineer",
  "platform_crm",
  "platform_sales",
  "platform_finance",
  "platform_data_scientist",
  "platform_support",
  "dpo",
  "grievance_officer",
];

/**
 * Platform control routes are narrower than the full platform staff category.
 * These are the roles that should reach `/admin/*` while other platform staff
 * continue using shared workspace dashboards until their dedicated surfaces exist.
 */
export const PLATFORM_CONTROL_ROLES: PlatformRole[] = [
  "platform_superadmin",
  "platform_admin",
];

export const CONSULTANT_ROLES: PlatformRole[] = [
  "consultant_lead",
  "consultant_senior",
  "consultant_analyst",
  "consultant_viewer",
  "consultant_trainee",
];

export const GROUP_CONGLOMERATE_ROLES: PlatformRole[] = [
  "subsidiary_admin",
  "group_sustainability_head",
  "group_consolidator",
  "country_manager",
  "regional_analyst",
];

export const CLIENT_ADMINISTRATION_ROLES: PlatformRole[] = [
  "client_superadmin",
  "client_admin",
  "client_it_admin",
];

export const SUSTAINABILITY_COMPLIANCE_ROLES: PlatformRole[] = [
  "sustainability_head",
  "cbam_compliance_officer",
  "esg_manager",
  "carbon_accountant",
  "regulatory_filing_agent",
  "supply_chain_analyst",
];

export const DATA_OPERATIONS_ROLES: PlatformRole[] = [
  "data_reviewer",
  "data_approver",
  "iot_device_manager",
  "data_entry_operator",
  "facility_manager",
];

export const FINANCE_CARBON_MARKET_ROLES: PlatformRole[] = [
  "cfo_viewer",
  "finance_analyst",
  "carbon_credit_trader",
];

export const EXECUTIVE_BOARD_ROLES: PlatformRole[] = [
  "executive_viewer",
  "board_report_recipient",
];

export const THIRD_PARTY_VERIFIER_ROLES: PlatformRole[] = [
  "verifier_lead",
  "verifier_approver",
  "verifier_iso",
  "cbam_verifier",
  "verifier_reviewer",
  "regulatory_inspector",
];

export const EXTERNAL_STAKEHOLDER_ROLES: PlatformRole[] = [
  "investor_viewer",
  "lender_viewer",
  "supply_chain_reporter",
];

export const SYSTEM_API_ROLES: PlatformRole[] = [
  "api_key_manager",
  "erp_service_account",
  "readonly_api_user",
  "webhook_consumer",
];

export const LIFECYCLE_ROLES: PlatformRole[] = [
  "pending_approval",
  "invited_unaccepted",
  "suspended",
  "offboarded",
];

export const ALL_PLATFORM_ROLES: PlatformRole[] = [
  ...PLATFORM_STAFF_ROLES,
  ...CONSULTANT_ROLES,
  ...GROUP_CONGLOMERATE_ROLES,
  ...CLIENT_ADMINISTRATION_ROLES,
  ...SUSTAINABILITY_COMPLIANCE_ROLES,
  ...DATA_OPERATIONS_ROLES,
  ...FINANCE_CARBON_MARKET_ROLES,
  ...EXECUTIVE_BOARD_ROLES,
  ...THIRD_PARTY_VERIFIER_ROLES,
  ...EXTERNAL_STAKEHOLDER_ROLES,
  ...SYSTEM_API_ROLES,
  ...LIFECYCLE_ROLES,
];

/**
 * Workspace groups map the 58-role catalog onto the dashboards that exist today.
 * These are temporary UI groupings, not the database access model.
 */
export const PLATFORM_WORKSPACE_ROLES: PlatformRole[] = [
  "platform_superadmin",
  "platform_admin",
  "platform_developer",
  "digital_twin_engineer",
  "platform_crm",
  "platform_sales",
  "platform_finance",
  "platform_data_scientist",
  "platform_support",
];

export const CARBON_ACCOUNTING_WORKSPACE_ROLES: PlatformRole[] = ["carbon_accountant"];

export const GOVERNANCE_WORKSPACE_ROLES: PlatformRole[] = [
  "dpo",
  "grievance_officer",
];

export const SUSTAINABILITY_WORKSPACE_ROLES: PlatformRole[] = [
  "sustainability_head",
  "cbam_compliance_officer",
  "esg_manager",
  "group_sustainability_head",
  "group_consolidator",
  "country_manager",
  "regional_analyst",
  "regulatory_filing_agent",
  "supply_chain_analyst",
];

export const CLIENT_ADMIN_WORKSPACE_ROLES: PlatformRole[] = [
  "client_superadmin",
  "client_admin",
  "client_it_admin",
  "subsidiary_admin",
  "api_key_manager",
];

export const CONSULTANT_WORKSPACE_ROLES: PlatformRole[] = [...CONSULTANT_ROLES];

export const DATA_PIPELINE_WORKSPACE_ROLES: PlatformRole[] = [
  "data_reviewer",
  "data_approver",
  "iot_device_manager",
  "data_entry_operator",
  "facility_manager",
  "supply_chain_reporter",
];

export const EXECUTIVE_WORKSPACE_ROLES: PlatformRole[] = [
  "executive_viewer",
  "cfo_viewer",
  "finance_analyst",
  "carbon_credit_trader",
  "investor_viewer",
  "lender_viewer",
];

export const VERIFICATION_WORKSPACE_ROLES: PlatformRole[] = [
  "platform_auditor",
  ...THIRD_PARTY_VERIFIER_ROLES,
];

export const NON_INTERACTIVE_ROLES: PlatformRole[] = [
  "board_report_recipient",
  "erp_service_account",
  "readonly_api_user",
  "webhook_consumer",
];

/**
 * These are the roles that should land in the interactive web app today.
 * Lifecycle and machine-only accounts are intentionally excluded.
 */
export const INTERACTIVE_DASHBOARD_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...PLATFORM_WORKSPACE_ROLES,
    ...GOVERNANCE_WORKSPACE_ROLES,
    ...CARBON_ACCOUNTING_WORKSPACE_ROLES,
    ...SUSTAINABILITY_WORKSPACE_ROLES,
    ...CLIENT_ADMIN_WORKSPACE_ROLES,
    ...CONSULTANT_WORKSPACE_ROLES,
    ...DATA_PIPELINE_WORKSPACE_ROLES,
    ...EXECUTIVE_WORKSPACE_ROLES,
    ...VERIFICATION_WORKSPACE_ROLES,
  ])
);

const ROLE_SET = new Set<PlatformRole>(ALL_PLATFORM_ROLES);

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === "string" && ROLE_SET.has(value as PlatformRole);
}

/**
 * Auth metadata can arrive either as a `roles` array or as a `primary_role`
 * string depending on whether we are reading the fresh JWT or a persisted user row.
 */
export function getUserRoles(user: User | null): PlatformRole[] {
  if (!user) {
    return [];
  }

  const meta = user.app_metadata ?? {};
  const rolesFromArray = Array.isArray(meta.roles)
    ? meta.roles.filter((role): role is PlatformRole => isPlatformRole(role))
    : [];
  const primaryRole = isPlatformRole(meta.primary_role) ? meta.primary_role : null;

  if (rolesFromArray.length > 0) {
    return rolesFromArray;
  }

  return primaryRole ? [primaryRole] : [];
}

export function getUserPrimaryRole(user: User | null): PlatformRole {
  if (!user) {
    return "pending_approval";
  }

  const roles = getUserRoles(user);
  const primaryRole = roles[0];

  return primaryRole ?? "pending_approval";
}

export function isLifecycleRole(role: PlatformRole): boolean {
  return LIFECYCLE_ROLES.includes(role);
}

export function isNonInteractiveRole(role: PlatformRole): boolean {
  return NON_INTERACTIVE_ROLES.includes(role);
}

export function canAccessPlatformAdmin(role: PlatformRole): boolean {
  return PLATFORM_CONTROL_ROLES.includes(role);
}

export function isEmailVerified(user: User | null): boolean {
  if (!user) {
    return false;
  }

  return user.email_confirmed_at != null;
}

export function getRoleRoute(_role: PlatformRole): string {
  /**
   * The current app shell has one interactive dashboard switchboard and does not
   * yet implement dedicated lifecycle status pages. Route everyone into the
   * dashboard until those pages are built for real.
   */
  return "/dashboard";
}
