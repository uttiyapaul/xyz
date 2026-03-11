/**
 * A2Z Carbon Solutions — lib/auth/role-routing.ts
 * Central role extraction and dashboard route mapping
 */

import type { User } from "@supabase/supabase-js";

export type PlatformRole =
  | "platform_superadmin" | "platform_admin" | "platform_developer" | "platform_support"
  | "platform_auditor" | "platform_sales" | "platform_finance" | "platform_data_scientist"
  | "consultant_lead" | "consultant_senior" | "consultant_analyst" | "consultant_viewer" | "consultant_trainee"
  | "verifier_lead" | "verifier_reviewer" | "verifier_approver" | "verifier_iso" | "cbam_verifier" | "regulatory_inspector"
  | "client_superadmin" | "client_admin" | "client_it_admin"
  | "sustainability_head" | "esg_manager" | "cbam_compliance_officer" | "carbon_accountant"
  | "data_entry_operator" | "facility_manager" | "data_reviewer" | "data_approver"
  | "cfo_viewer" | "finance_analyst"
  | "executive_viewer" | "board_report_recipient"
  | "supply_chain_reporter" | "lender_viewer" | "investor_viewer"
  | "group_sustainability_head" | "group_consolidator" | "subsidiary_admin" | "country_manager" | "regional_analyst"
  | "api_key_manager" | "erp_service_account" | "webhook_consumer" | "readonly_api_user"
  | "pending_approval" | "invited_unaccepted" | "suspended" | "offboarded";

const DASHBOARD_ROUTE_BY_ROLE: Record<PlatformRole, string> = {
  platform_superadmin: "/dashboard/platform-superadmin",
  platform_admin: "/dashboard/platform-admin",
  platform_developer: "/dashboard/platform-developer",
  platform_support: "/dashboard/platform-support",
  platform_auditor: "/dashboard/platform-auditor",
  platform_sales: "/dashboard/platform-sales",
  platform_finance: "/dashboard/platform-finance",
  platform_data_scientist: "/dashboard/platform-data-scientist",
  consultant_lead: "/dashboard/consultant-lead",
  consultant_senior: "/dashboard/consultant",
  consultant_analyst: "/dashboard/consultant",
  consultant_viewer: "/dashboard/consultant-viewer",
  consultant_trainee: "/dashboard/consultant-trainee",
  verifier_lead: "/dashboard/verifier-lead",
  verifier_reviewer: "/dashboard/verifier",
  verifier_approver: "/dashboard/verifier",
  verifier_iso: "/dashboard/verifier",
  cbam_verifier: "/dashboard/cbam-verifier",
  regulatory_inspector: "/dashboard/regulatory-inspector",
  client_superadmin: "/dashboard/client-admin",
  client_admin: "/dashboard/client-admin",
  client_it_admin: "/dashboard/client-it-admin",
  sustainability_head: "/dashboard/sustainability",
  esg_manager: "/dashboard/esg",
  cbam_compliance_officer: "/dashboard/cbam",
  carbon_accountant: "/dashboard/carbon-accountant",
  data_entry_operator: "/dashboard/data-entry",
  facility_manager: "/dashboard/facility",
  data_reviewer: "/dashboard/data-reviewer",
  data_approver: "/dashboard/data-approver",
  cfo_viewer: "/dashboard/finance",
  finance_analyst: "/dashboard/finance",
  executive_viewer: "/dashboard/executive",
  board_report_recipient: "/dashboard/executive",
  supply_chain_reporter: "/dashboard/supply-chain",
  lender_viewer: "/dashboard/lender",
  investor_viewer: "/dashboard/investor",
  group_sustainability_head: "/dashboard/group-sustainability",
  group_consolidator: "/dashboard/group-consolidator",
  subsidiary_admin: "/dashboard/subsidiary-admin",
  country_manager: "/dashboard/country-manager",
  regional_analyst: "/dashboard/regional-analyst",
  api_key_manager: "/dashboard/api-manager",
  erp_service_account: "/dashboard",
  webhook_consumer: "/dashboard",
  readonly_api_user: "/dashboard",
  pending_approval: "/auth/pending-approval",
  invited_unaccepted: "/auth/invited",
  suspended: "/auth/suspended",
  offboarded: "/auth/offboarded",
};

const FALLBACK_ROUTE = "/dashboard";

const LIFECYCLE_ROLES: PlatformRole[] = [
  "pending_approval",
  "invited_unaccepted",
  "suspended",
  "offboarded",
];

export function getUserPrimaryRole(user: User | null): PlatformRole {
  if (!user) return "pending_approval";
  
  const meta = user.app_metadata ?? {};
  const roles = Array.isArray(meta.roles) ? meta.roles : [];
  
  return (roles[0] as PlatformRole) ?? "pending_approval";
}

export function resolveDashboardRouteForRole(role: PlatformRole): string {
  return DASHBOARD_ROUTE_BY_ROLE[role] ?? FALLBACK_ROUTE;
}

export function isLifecycleRole(role: PlatformRole): boolean {
  return LIFECYCLE_ROLES.includes(role);
}

export function isEmailVerified(user: User | null): boolean {
  if (!user) return false;
  return user.email_confirmed_at != null;
}
