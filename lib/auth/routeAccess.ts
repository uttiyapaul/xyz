/**
 * A2Z Carbon Solutions - lib/auth/routeAccess.ts
 *
 * This file keeps route-level access decisions in one place so the request
 * proxy, sidebar, and future tests all answer the same question:
 * "Which roles should reach this part of the app?"
 *
 * The database remains authoritative for row-level permissions. This matrix is
 * only the frontend shell contract for routing and navigation.
 */

import {
  CARBON_ACCOUNTING_WORKSPACE_ROLES,
  CLIENT_ADMIN_WORKSPACE_ROLES,
  CONSULTANT_WORKSPACE_ROLES,
  DATA_PIPELINE_WORKSPACE_ROLES,
  EXECUTIVE_WORKSPACE_ROLES,
  GOVERNANCE_WORKSPACE_ROLES,
  INTERACTIVE_DASHBOARD_ROLES,
  PLATFORM_CONTROL_ROLES,
  SUSTAINABILITY_WORKSPACE_ROLES,
  VERIFICATION_WORKSPACE_ROLES,
  canAccessPlatformAdmin,
  isLifecycleRole,
  isNonInteractiveRole,
  type PlatformRole,
} from "@/lib/auth/roles";

export interface RouteAccessRule {
  prefix: string;
  description: string;
  allowedRoles: readonly PlatformRole[];
}

const ORG_MANAGEMENT_ROLES: PlatformRole[] = CLIENT_ADMIN_WORKSPACE_ROLES.filter(
  (role) => role !== "api_key_manager",
);

const ORG_INTEGRATION_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...CLIENT_ADMIN_WORKSPACE_ROLES,
    "iot_device_manager",
  ]),
);

const ACCOUNTING_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...CARBON_ACCOUNTING_WORKSPACE_ROLES,
    "data_reviewer",
    "data_approver",
  ]),
);

const DATA_ENTRY_ROUTE_ROLES: PlatformRole[] = DATA_PIPELINE_WORKSPACE_ROLES.filter(
  (role) => role !== "data_reviewer" && role !== "data_approver" && role !== "iot_device_manager",
);

const DASHBOARD_ACTIVITY_ROUTE_ROLES: PlatformRole[] = [
  "data_entry_operator",
  "facility_manager",
];

const PLATFORM_OPERATIONS_ROUTE_ROLES: PlatformRole[] = [
  "platform_developer",
  "platform_support",
];

const PLATFORM_COMMERCIAL_ROUTE_ROLES: PlatformRole[] = [
  "platform_crm",
  "platform_sales",
  "platform_finance",
];

const PLATFORM_MODELS_ROUTE_ROLES: PlatformRole[] = [
  "digital_twin_engineer",
  "platform_data_scientist",
];

const PLATFORM_SHARED_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...PLATFORM_OPERATIONS_ROUTE_ROLES,
    ...PLATFORM_COMMERCIAL_ROUTE_ROLES,
    ...PLATFORM_MODELS_ROUTE_ROLES,
  ]),
);

const DASHBOARD_SOURCE_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...ORG_MANAGEMENT_ROLES,
    "facility_manager",
    "carbon_accountant",
    "sustainability_head",
    "esg_manager",
    "cbam_compliance_officer",
  ]),
);

const DASHBOARD_REPORT_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...SUSTAINABILITY_WORKSPACE_ROLES,
    ...CARBON_ACCOUNTING_WORKSPACE_ROLES,
    ...EXECUTIVE_WORKSPACE_ROLES,
    ...ORG_MANAGEMENT_ROLES,
    ...CONSULTANT_WORKSPACE_ROLES,
  ]),
);

const GOVERNANCE_PRIVACY_ROUTE_ROLES: PlatformRole[] = ["dpo"];

const GOVERNANCE_GRIEVANCE_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>(["grievance_officer", "dpo"]),
);

const SUSTAINABILITY_OFFSET_ROUTE_ROLES: PlatformRole[] = Array.from(
  new Set<PlatformRole>([
    ...SUSTAINABILITY_WORKSPACE_ROLES,
    "carbon_accountant",
    "cfo_viewer",
    "finance_analyst",
    "carbon_credit_trader",
  ]),
);

const FINANCE_REPORT_ROUTE_ROLES: PlatformRole[] = [
  "cfo_viewer",
  "finance_analyst",
  "carbon_credit_trader",
  "executive_viewer",
  "investor_viewer",
  "lender_viewer",
];

const FINANCE_LIABILITY_ROUTE_ROLES: PlatformRole[] = [
  "cfo_viewer",
  "finance_analyst",
  "carbon_credit_trader",
  "executive_viewer",
];

const FINANCE_MARKET_ROUTE_ROLES: PlatformRole[] = [
  "carbon_credit_trader",
  "finance_analyst",
  "cfo_viewer",
];

/**
 * Route rules are ordered from most specific to least specific so narrow paths
 * like `/dashboard/platform-superadmin` win before the general `/dashboard`
 * workspace fallback.
 */
export const APP_ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  {
    prefix: "/admin",
    description: "Platform control center for superadmin and platform admin users.",
    allowedRoles: PLATFORM_CONTROL_ROLES,
  },
  {
    prefix: "/dashboard/platform-superadmin",
    description: "Platform operations dashboard used by the control-plane roles.",
    allowedRoles: PLATFORM_CONTROL_ROLES,
  },
  {
    prefix: "/dashboard/platform/operations",
    description: "Platform engineering and support workspace for rollout, retry, and session posture.",
    allowedRoles: PLATFORM_OPERATIONS_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/platform/commercial",
    description: "Platform commercial workspace for lead, tenant, and subscription posture.",
    allowedRoles: PLATFORM_COMMERCIAL_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/platform/models",
    description: "Platform modeling workspace for digital twin and AI validation posture.",
    allowedRoles: PLATFORM_MODELS_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/platform",
    description: "Dedicated platform-staff workspace umbrella outside control-plane admin routes.",
    allowedRoles: PLATFORM_SHARED_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/activity",
    description: "Operational activity capture workspace for scoped data-entry roles.",
    allowedRoles: DASHBOARD_ACTIVITY_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/sources",
    description: "Source register workspace for scoped facility, accounting, sustainability, and org-admin roles.",
    allowedRoles: DASHBOARD_SOURCE_ROUTE_ROLES,
  },
  {
    prefix: "/dashboard/reports",
    description: "Annual emissions reporting workspace for approved strategy, accounting, and executive audiences.",
    allowedRoles: DASHBOARD_REPORT_ROUTE_ROLES,
  },
  {
    prefix: "/org/users",
    description: "Organization team and role assignment surfaces.",
    allowedRoles: ORG_MANAGEMENT_ROLES,
  },
  {
    prefix: "/org/facilities",
    description: "Organization site and facility administration.",
    allowedRoles: ORG_MANAGEMENT_ROLES,
  },
  {
    prefix: "/org/integrations",
    description: "Organization integration setup for admins and device operators.",
    allowedRoles: ORG_INTEGRATION_ROLES,
  },
  {
    prefix: "/org",
    description: "Organization management workspace umbrella.",
    allowedRoles: Array.from(new Set<PlatformRole>([...ORG_MANAGEMENT_ROLES, ...ORG_INTEGRATION_ROLES])),
  },
  {
    prefix: "/sustainability/offsets",
    description: "Offset portfolio workspace shared between sustainability ownership and tightly scoped finance roles.",
    allowedRoles: SUSTAINABILITY_OFFSET_ROUTE_ROLES,
  },
  {
    prefix: "/sustainability/disclosures",
    description: "Framework disclosure workspace for ESG, filing, and sustainability oversight roles.",
    allowedRoles: SUSTAINABILITY_WORKSPACE_ROLES,
  },
  {
    prefix: "/sustainability",
    description: "Targets, CBAM, and sustainability planning workspace.",
    allowedRoles: SUSTAINABILITY_WORKSPACE_ROLES,
  },
  {
    prefix: "/governance/privacy",
    description: "Privacy governance workspace for DSAR, ROPA, DPIA, consent, and transfer oversight.",
    allowedRoles: GOVERNANCE_PRIVACY_ROUTE_ROLES,
  },
  {
    prefix: "/governance/grievances",
    description: "Incident escalation and grievance oversight workspace for governance roles.",
    allowedRoles: GOVERNANCE_GRIEVANCE_ROUTE_ROLES,
  },
  {
    prefix: "/governance",
    description: "Governance workspace umbrella for privacy and grievance response roles.",
    allowedRoles: GOVERNANCE_WORKSPACE_ROLES,
  },
  {
    prefix: "/accounting",
    description: "Approval, anomaly, and factor workflows for accounting and review roles.",
    allowedRoles: ACCOUNTING_ROUTE_ROLES,
  },
  {
    prefix: "/data",
    description: "Operational data capture tools for active data-entry users.",
    allowedRoles: DATA_ENTRY_ROUTE_ROLES,
  },
  {
    prefix: "/finance/carbon-credits",
    description: "Carbon-credit transaction and portfolio lane for tightly scoped finance roles.",
    allowedRoles: FINANCE_MARKET_ROUTE_ROLES,
  },
  {
    prefix: "/finance/liability",
    description: "Carbon-liability forecasting lane for internal executive and finance roles.",
    allowedRoles: FINANCE_LIABILITY_ROUTE_ROLES,
  },
  {
    prefix: "/finance/reports",
    description: "Curated reporting surface for executive and external audiences.",
    allowedRoles: FINANCE_REPORT_ROUTE_ROLES,
  },
  {
    prefix: "/finance",
    description: "Executive finance and board-reporting workspace.",
    allowedRoles: Array.from(
      new Set<PlatformRole>([
        ...FINANCE_REPORT_ROUTE_ROLES,
        ...FINANCE_LIABILITY_ROUTE_ROLES,
        ...FINANCE_MARKET_ROUTE_ROLES,
      ]),
    ),
  },
  {
    prefix: "/audit",
    description: "Verifier and assurance workspace.",
    allowedRoles: VERIFICATION_WORKSPACE_ROLES,
  },
  {
    prefix: "/consulting",
    description: "Consulting portfolio and scenario workspace.",
    allowedRoles: CONSULTANT_WORKSPACE_ROLES,
  },
  {
    prefix: "/dashboard",
    description: "Shared interactive dashboard shell for currently supported app roles.",
    allowedRoles: INTERACTIVE_DASHBOARD_ROLES,
  },
];

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getRouteAccessRule(pathname: string): RouteAccessRule | null {
  const normalizedPath = normalizePathname(pathname);

  return APP_ROUTE_ACCESS_RULES.find((rule) => matchesRoutePrefix(normalizedPath, rule.prefix)) ?? null;
}

/**
 * Lifecycle and non-interactive roles can still reach `/dashboard` because the
 * dashboard home intentionally renders status notices for them. All other
 * workspace routes stay blocked until those dedicated experiences exist.
 */
export function canRoleAccessPath(role: PlatformRole, pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  if (isLifecycleRole(role) || isNonInteractiveRole(role)) {
    return normalizedPath === "/dashboard";
  }

  if (canAccessPlatformAdmin(role)) {
    return true;
  }

  const rule = getRouteAccessRule(normalizedPath);

  if (!rule) {
    return true;
  }

  return rule.allowedRoles.includes(role);
}

export function canAnyRoleAccessPath(roles: readonly PlatformRole[], pathname: string): boolean {
  return roles.some((role) => canRoleAccessPath(role, pathname));
}
