import type { PlatformRole } from "@/lib/auth/roles";

/**
 * Canonical role-to-dashboard registry.
 *
 * Why this exists:
 * - The platform has 58 roles and they should all land intentionally.
 * - A single registry prevents the dashboard hub, future redirects, and tests
 *   from each keeping a different partial map.
 * - The database remains authoritative for access control; this registry is the
 *   frontend navigation contract for where each role should begin work.
 */

export type DashboardFamily =
  | "platform"
  | "consulting"
  | "organization"
  | "sustainability"
  | "accounting"
  | "data_entry"
  | "executive"
  | "verification"
  | "external"
  | "automation"
  | "lifecycle";

export interface DashboardProfile {
  role: PlatformRole;
  title: string;
  summary: string;
  preferredPath: string;
  family: DashboardFamily;
  interactive: boolean;
  guardrail: string;
}

export interface DashboardShortcut {
  label: string;
  href: string;
  description: string;
}

export const DASHBOARD_PROFILES: Record<PlatformRole, DashboardProfile> = {
  platform_superadmin: {
    role: "platform_superadmin",
    title: "Platform superadmin",
    summary: "Global platform oversight across tenants, controls, and operational health.",
    preferredPath: "/admin",
    family: "platform",
    interactive: true,
    guardrail: "Must stay isolated from operational client roles to preserve control-plane separation.",
  },
  platform_admin: {
    role: "platform_admin",
    title: "Platform admin",
    summary: "Platform-wide administration, tenancy, and operational support controls.",
    preferredPath: "/admin",
    family: "platform",
    interactive: true,
    guardrail: "Admin rights are broad, but still narrower than platform_superadmin.",
  },
  platform_developer: {
    role: "platform_developer",
    title: "Platform developer",
    summary: "Shared platform engineering workspace for feature delivery and systems maintenance.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Use the shared platform workspace until dedicated engineering surfaces are built.",
  },
  platform_auditor: {
    role: "platform_auditor",
    title: "Platform auditor",
    summary: "Audit-focused platform oversight with access to assurance-oriented views.",
    preferredPath: "/audit/rfis",
    family: "verification",
    interactive: true,
    guardrail: "Audit visibility stays read-focused and independent from client operations.",
  },
  digital_twin_engineer: {
    role: "digital_twin_engineer",
    title: "Digital twin engineer",
    summary: "Platform engineering workspace for scenario, modeling, and simulation functions.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Modeling access should stay separate from approval-grade compliance actions.",
  },
  platform_crm: {
    role: "platform_crm",
    title: "Platform CRM",
    summary: "Commercial relationship and platform engagement workspace.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Commercial access should not bypass tenant-scoped operational controls.",
  },
  platform_sales: {
    role: "platform_sales",
    title: "Platform sales",
    summary: "Sales-oriented platform workspace for pipeline and account support.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Sales visibility remains commercial and should not expose client operations beyond need.",
  },
  platform_finance: {
    role: "platform_finance",
    title: "Platform finance",
    summary: "Platform revenue and billing oversight within the shared control workspace.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Platform finance is separate from client carbon-finance decision flows.",
  },
  platform_data_scientist: {
    role: "platform_data_scientist",
    title: "Platform data scientist",
    summary: "AI and data-quality exploration workspace for platform-level modeling.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Analytical access should support the pipeline, not overrule verified data states.",
  },
  platform_support: {
    role: "platform_support",
    title: "Platform support",
    summary: "Short-lived operational support workspace for troubleshooting and guidance.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Support access is time-boxed and should be treated as a temporary operational window.",
  },
  dpo: {
    role: "dpo",
    title: "Data protection officer",
    summary: "Privacy and regulatory oversight workspace.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "The DPO must remain independent from the same organisation's access administration.",
  },
  grievance_officer: {
    role: "grievance_officer",
    title: "Grievance officer",
    summary: "Compliance and grievance management workspace.",
    preferredPath: "/dashboard",
    family: "platform",
    interactive: true,
    guardrail: "Issue-handling oversight should remain independent from data approval actions.",
  },
  consultant_lead: {
    role: "consultant_lead",
    title: "Consultant lead",
    summary: "Consulting portfolio and client engagement leadership workspace.",
    preferredPath: "/consulting/portfolio",
    family: "consulting",
    interactive: true,
    guardrail: "Consulting insight does not replace formal approval or verifier independence requirements.",
  },
  consultant_senior: {
    role: "consultant_senior",
    title: "Consultant senior",
    summary: "Senior consulting delivery workspace across client portfolios.",
    preferredPath: "/consulting/portfolio",
    family: "consulting",
    interactive: true,
    guardrail: "Client support should not blur into final signoff authority.",
  },
  consultant_analyst: {
    role: "consultant_analyst",
    title: "Consultant analyst",
    summary: "Analytical consulting workspace for client delivery and scenario support.",
    preferredPath: "/consulting/scenario",
    family: "consulting",
    interactive: true,
    guardrail: "Analyst recommendations remain advisory and must not bypass regulated workflows.",
  },
  consultant_viewer: {
    role: "consultant_viewer",
    title: "Consultant viewer",
    summary: "Read-oriented consulting workspace.",
    preferredPath: "/consulting/portfolio",
    family: "consulting",
    interactive: true,
    guardrail: "Viewer access remains read-focused and should not mutate regulated records.",
  },
  consultant_trainee: {
    role: "consultant_trainee",
    title: "Consultant trainee",
    summary: "Time-boxed trainee workspace within consulting.",
    preferredPath: "/consulting/portfolio",
    family: "consulting",
    interactive: true,
    guardrail: "This role is expiry-limited and should remain closely supervised.",
  },
  subsidiary_admin: {
    role: "subsidiary_admin",
    title: "Subsidiary admin",
    summary: "Organization management workspace for subsidiary-level administration.",
    preferredPath: "/org/users",
    family: "organization",
    interactive: true,
    guardrail: "Org administration must still honor assignment scope and tier restrictions.",
  },
  group_sustainability_head: {
    role: "group_sustainability_head",
    title: "Group sustainability head",
    summary: "Group-wide sustainability planning and consolidated oversight workspace.",
    preferredPath: "/sustainability/targets",
    family: "sustainability",
    interactive: true,
    guardrail: "Group oversight should not override site- and legal-entity-scoped access rules.",
  },
  group_consolidator: {
    role: "group_consolidator",
    title: "Group consolidator",
    summary: "Group consolidation workspace for aggregated sustainability reporting.",
    preferredPath: "/sustainability/targets",
    family: "sustainability",
    interactive: true,
    guardrail: "Consolidation remains downstream of review and approval controls.",
  },
  country_manager: {
    role: "country_manager",
    title: "Country manager",
    summary: "Regional sustainability and reporting workspace at the country level.",
    preferredPath: "/sustainability/targets",
    family: "sustainability",
    interactive: true,
    guardrail: "Country views must still respect the assignment scope inherited from org roles.",
  },
  regional_analyst: {
    role: "regional_analyst",
    title: "Regional analyst",
    summary: "Regional analysis workspace for consolidated climate reporting.",
    preferredPath: "/dashboard/reports",
    family: "sustainability",
    interactive: true,
    guardrail: "Regional analysis remains read-heavy and should not bypass approval workflows.",
  },
  client_superadmin: {
    role: "client_superadmin",
    title: "Client superadmin",
    summary: "Top-level organization administration for users, facilities, and integrations.",
    preferredPath: "/org/users",
    family: "organization",
    interactive: true,
    guardrail: "Client administration must still respect SoD and verification independence rules.",
  },
  client_admin: {
    role: "client_admin",
    title: "Client admin",
    summary: "Organization administration across users and operational structure.",
    preferredPath: "/org/users",
    family: "organization",
    interactive: true,
    guardrail: "Client admin cannot be combined with DPO for the same organization.",
  },
  client_it_admin: {
    role: "client_it_admin",
    title: "Client IT admin",
    summary: "Organization integration and systems administration workspace.",
    preferredPath: "/org/integrations",
    family: "organization",
    interactive: true,
    guardrail: "Integration access still stays inside the assigned organization boundary.",
  },
  sustainability_head: {
    role: "sustainability_head",
    title: "Sustainability head",
    summary: "Sustainability oversight, target management, and submission preparation workspace.",
    preferredPath: "/sustainability/targets",
    family: "sustainability",
    interactive: true,
    guardrail: "Final submission actions remain downstream of review, approval, and signoff checks.",
  },
  cbam_compliance_officer: {
    role: "cbam_compliance_officer",
    title: "CBAM compliance officer",
    summary: "CBAM-specific compliance and reporting workspace.",
    preferredPath: "/sustainability/cbam-reports",
    family: "sustainability",
    interactive: true,
    guardrail: "CBAM views should stay limited to the relevant embedded-emissions workflow.",
  },
  esg_manager: {
    role: "esg_manager",
    title: "ESG manager",
    summary: "ESG planning and disclosure workspace.",
    preferredPath: "/sustainability/targets",
    family: "sustainability",
    interactive: true,
    guardrail: "ESG oversight should consume approved data, not short-circuit accounting controls.",
  },
  carbon_accountant: {
    role: "carbon_accountant",
    title: "Carbon accountant",
    summary: "Accounting workspace for review, factor oversight, and emissions control.",
    preferredPath: "/accounting/approvals",
    family: "accounting",
    interactive: true,
    guardrail: "Preparation and approval duties remain segregated from final signoff.",
  },
  regulatory_filing_agent: {
    role: "regulatory_filing_agent",
    title: "Regulatory filing agent",
    summary: "Regulatory filing and disclosure workspace.",
    preferredPath: "/sustainability/cbam-reports",
    family: "sustainability",
    interactive: true,
    guardrail: "Filing access depends on already-approved disclosure data.",
  },
  supply_chain_analyst: {
    role: "supply_chain_analyst",
    title: "Supply chain analyst",
    summary: "Supply-chain analysis workspace for upstream/downstream emissions insights.",
    preferredPath: "/dashboard/reports",
    family: "sustainability",
    interactive: true,
    guardrail: "Analytical access should remain downstream of validated activity data.",
  },
  data_reviewer: {
    role: "data_reviewer",
    title: "Data reviewer",
    summary: "First-line review workspace for pending activity records and evidence.",
    preferredPath: "/accounting/approvals",
    family: "accounting",
    interactive: true,
    guardrail: "Reviewers cannot also act as final approvers in the same organization.",
  },
  data_approver: {
    role: "data_approver",
    title: "Data approver",
    summary: "Final approval workspace for reviewed emissions records.",
    preferredPath: "/accounting/approvals",
    family: "accounting",
    interactive: true,
    guardrail: "Four-eyes control applies: approvers must stay separate from reviewers and originators.",
  },
  iot_device_manager: {
    role: "iot_device_manager",
    title: "IoT device manager",
    summary: "Device and ingestion support workspace for telemetry-backed data capture.",
    preferredPath: "/org/integrations",
    family: "organization",
    interactive: true,
    guardrail: "Operational device access does not imply authority to approve emissions data.",
  },
  data_entry_operator: {
    role: "data_entry_operator",
    title: "Data entry operator",
    summary: "Daily data-capture workspace for manual and assisted submissions.",
    preferredPath: "/dashboard/activity",
    family: "data_entry",
    interactive: true,
    guardrail: "Operators capture data but should not review or finally approve their own work.",
  },
  facility_manager: {
    role: "facility_manager",
    title: "Facility manager",
    summary: "Facility-scoped operational workspace for site-level data capture and follow-up.",
    preferredPath: "/dashboard/activity",
    family: "data_entry",
    interactive: true,
    guardrail: "Facility views must stay inside site scope and cannot bypass review controls.",
  },
  cfo_viewer: {
    role: "cfo_viewer",
    title: "CFO viewer",
    summary: "Executive finance workspace for liabilities, reports, and strategic review.",
    preferredPath: "/finance/reports",
    family: "executive",
    interactive: true,
    guardrail: "Executive visibility remains read-oriented and should not alter controlled records.",
  },
  finance_analyst: {
    role: "finance_analyst",
    title: "Finance analyst",
    summary: "Analytical finance workspace for exposure, liability, and board reporting.",
    preferredPath: "/finance/liability",
    family: "executive",
    interactive: true,
    guardrail: "Financial analysis uses approved emissions data and does not replace approval controls.",
  },
  carbon_credit_trader: {
    role: "carbon_credit_trader",
    title: "Carbon credit trader",
    summary: "Carbon-market workspace for credit position monitoring and execution support.",
    preferredPath: "/finance/carbon-credits",
    family: "executive",
    interactive: true,
    guardrail: "Own-trade approvals still require a second authorized user.",
  },
  executive_viewer: {
    role: "executive_viewer",
    title: "Executive viewer",
    summary: "Executive reporting workspace for high-level climate performance monitoring.",
    preferredPath: "/finance/reports",
    family: "executive",
    interactive: true,
    guardrail: "Executive dashboards should stay read-heavy and grounded in approved data.",
  },
  board_report_recipient: {
    role: "board_report_recipient",
    title: "Board report recipient",
    summary: "Curated board-report delivery role with no live operational dashboard.",
    preferredPath: "/dashboard",
    family: "external",
    interactive: false,
    guardrail: "Board recipients consume packaged reports instead of the interactive operational UI.",
  },
  verifier_lead: {
    role: "verifier_lead",
    title: "Verifier lead",
    summary: "Lead verifier workspace for RFIs, evidence review, and engagement oversight.",
    preferredPath: "/audit/rfis",
    family: "verification",
    interactive: true,
    guardrail: "Verifier roles must remain independent from client operational roles in the same organization.",
  },
  verifier_approver: {
    role: "verifier_approver",
    title: "Verifier approver",
    summary: "Final verifier opinion workspace with strict independence and step-up expectations.",
    preferredPath: "/audit/vault",
    family: "verification",
    interactive: true,
    guardrail: "Final approval requires verifier independence and step-up re-authentication on opinion actions.",
  },
  verifier_iso: {
    role: "verifier_iso",
    title: "Verifier ISO specialist",
    summary: "Verification workspace focused on ISO-aligned assurance review.",
    preferredPath: "/audit/sampling",
    family: "verification",
    interactive: true,
    guardrail: "ISO verifier duties remain fully separated from client operational roles.",
  },
  cbam_verifier: {
    role: "cbam_verifier",
    title: "CBAM verifier",
    summary: "CBAM verification workspace for product and embedded-emissions assurance.",
    preferredPath: "/audit/rfis",
    family: "verification",
    interactive: true,
    guardrail: "CBAM verification requires accreditation-backed independence.",
  },
  verifier_reviewer: {
    role: "verifier_reviewer",
    title: "Verifier reviewer",
    summary: "Review-stage assurance workspace for findings and evidence follow-up.",
    preferredPath: "/audit/rfis",
    family: "verification",
    interactive: true,
    guardrail: "Reviewer duties remain separate from client operational activities.",
  },
  regulatory_inspector: {
    role: "regulatory_inspector",
    title: "Regulatory inspector",
    summary: "Time-boxed inspection workspace for regulatory evidence review.",
    preferredPath: "/audit/vault",
    family: "verification",
    interactive: true,
    guardrail: "Inspector access is time-boxed and must remain read-controlled.",
  },
  investor_viewer: {
    role: "investor_viewer",
    title: "Investor viewer",
    summary: "External investor reporting workspace.",
    preferredPath: "/finance/reports",
    family: "external",
    interactive: true,
    guardrail: "Investor access should stay limited to approved and published reporting surfaces.",
  },
  lender_viewer: {
    role: "lender_viewer",
    title: "Lender viewer",
    summary: "External lender reporting workspace for controlled disclosures.",
    preferredPath: "/finance/reports",
    family: "external",
    interactive: true,
    guardrail: "Lender access remains limited and should not expand into broader operational data.",
  },
  supply_chain_reporter: {
    role: "supply_chain_reporter",
    title: "Supply chain reporter",
    summary: "External supply-chain reporting workspace for focused disclosure tasks.",
    preferredPath: "/data/history",
    family: "external",
    interactive: true,
    guardrail: "Supply-chain reporting should stay constrained to the assigned disclosure scope.",
  },
  api_key_manager: {
    role: "api_key_manager",
    title: "API key manager",
    summary: "Organization integration role for credential and automation support.",
    preferredPath: "/org/integrations",
    family: "organization",
    interactive: true,
    guardrail: "Integration credentials do not expand business-data approval authority.",
  },
  erp_service_account: {
    role: "erp_service_account",
    title: "ERP service account",
    summary: "Service role for ERP synchronization and machine-to-machine access.",
    preferredPath: "/dashboard",
    family: "automation",
    interactive: false,
    guardrail: "This is a machine account and should never use the interactive portal.",
  },
  readonly_api_user: {
    role: "readonly_api_user",
    title: "Read-only API user",
    summary: "Machine role for controlled read-only API access.",
    preferredPath: "/dashboard",
    family: "automation",
    interactive: false,
    guardrail: "This is a machine account and should never use the interactive portal.",
  },
  webhook_consumer: {
    role: "webhook_consumer",
    title: "Webhook consumer",
    summary: "Machine role for event delivery and integration callbacks.",
    preferredPath: "/dashboard",
    family: "automation",
    interactive: false,
    guardrail: "This is a machine account and should never use the interactive portal.",
  },
  pending_approval: {
    role: "pending_approval",
    title: "Pending approval",
    summary: "Lifecycle role while the account waits for review and assignment.",
    preferredPath: "/dashboard",
    family: "lifecycle",
    interactive: false,
    guardrail: "No operational workspace should open until approval is complete.",
  },
  invited_unaccepted: {
    role: "invited_unaccepted",
    title: "Invited, unaccepted",
    summary: "Lifecycle role while the invitation is still pending acceptance.",
    preferredPath: "/dashboard",
    family: "lifecycle",
    interactive: false,
    guardrail: "No operational workspace should open until the invitation is accepted.",
  },
  suspended: {
    role: "suspended",
    title: "Suspended account",
    summary: "Lifecycle role for a suspended user account.",
    preferredPath: "/dashboard",
    family: "lifecycle",
    interactive: false,
    guardrail: "Suspended accounts must not access operational tooling.",
  },
  offboarded: {
    role: "offboarded",
    title: "Offboarded account",
    summary: "Lifecycle role for a user who has been removed from active access.",
    preferredPath: "/dashboard",
    family: "lifecycle",
    interactive: false,
    guardrail: "Offboarded accounts must not access operational tooling.",
  },
};

export function getDashboardProfile(role: PlatformRole): DashboardProfile {
  return DASHBOARD_PROFILES[role];
}

export function getPreferredDashboardPath(role: PlatformRole): string {
  return getDashboardProfile(role).preferredPath;
}

export function getDashboardShortcutCards(role: PlatformRole): DashboardShortcut[] {
  const profile = getDashboardProfile(role);

  if (role === "api_key_manager" || role === "iot_device_manager") {
    return [
      {
        label: "Integrations",
        href: "/org/integrations",
        description: "Manage API, ERP, webhook, and device posture inside the assigned organization scope.",
      },
      {
        label: "Account Settings",
        href: "/dashboard/settings",
        description: "Review account and session posture without expanding into broader admin flows.",
      },
    ];
  }

  if (role === "supply_chain_reporter") {
    return [
      {
        label: "My Submissions",
        href: "/data/history",
        description: "Track supplier-facing submissions and evidence inside the active assignment scope.",
      },
      {
        label: "Dashboard Home",
        href: "/dashboard",
        description: "Return to the scoped launchpad for the current reporting task.",
      },
    ];
  }

  switch (profile.family) {
    case "platform":
      return profile.role === "platform_superadmin" || profile.role === "platform_admin"
        ? [
            {
              label: "Tenant Control",
              href: "/admin/tenants",
              description: "Manage tenant posture, platform administration, and control-plane oversight.",
            },
            {
              label: "Audit Logs",
              href: "/admin/logs",
              description: "Inspect platform-wide audit trails and control changes.",
            },
            {
              label: "System Health",
              href: "/admin/health",
              description: "Monitor platform runtime, jobs, and operational readiness.",
            },
          ]
        : [
            {
              label: "Dashboard Home",
              href: "/dashboard",
              description: "Use the shared platform launchpad while dedicated role routes are phased in.",
            },
            {
              label: "Account Settings",
              href: "/dashboard/settings",
              description: "Review account, session, and personal workspace posture.",
            },
          ];
    case "organization":
      return [
        {
          label: "Team Management",
          href: "/org/users",
          description: "Assign scoped roles without breaking tier, scope, or SoD boundaries.",
        },
        {
          label: "Facilities & Sites",
          href: "/org/facilities",
          description: "Maintain site structure and facility context used by scoped operational flows.",
        },
        {
          label: "Integrations",
          href: "/org/integrations",
          description: "Review API, ERP, and device posture for the current organization.",
        },
      ];
    case "sustainability":
      return [
        {
          label: "Targets",
          href: "/sustainability/targets",
          description: "Track targets and strategy inside the organizations and entities assigned to you.",
        },
        {
          label: "CBAM Reports",
          href: "/sustainability/cbam-reports",
          description: "Prepare declarations and regulated disclosures from scoped, approved data.",
        },
        {
          label: "Annual Emissions",
          href: "/dashboard/reports",
          description: "Review the live annual emissions model feeding disclosures and executive reporting.",
        },
      ];
    case "accounting":
      return [
        {
          label: "Approval Queue",
          href: "/accounting/approvals",
          description: "Work the review or approval queue with SoD-aware actions.",
        },
        {
          label: "Anomalies",
          href: "/accounting/anomalies",
          description: "Inspect anomaly flags and the related activity posture inside the active scope.",
        },
        {
          label: "Factor Coverage",
          href: "/accounting/factors",
          description: "Check whether active sources already have factor coverage or need follow-up.",
        },
      ];
    case "data_entry":
      return [
        {
          label: "Activity Entry",
          href: "/dashboard/activity",
          description: "Enter scoped activity records tied to the live source register.",
        },
        {
          label: "Source Register",
          href: "/dashboard/sources",
          description: "Review source coverage and site mapping before data is captured.",
        },
        {
          label: "My Submissions",
          href: "/data/history",
          description: "Track your own activity and evidence history inside the active scope.",
        },
      ];
    case "executive":
      return [
        {
          label: "Finance Liability",
          href: "/finance/liability",
          description: "Review carbon liability posture for the organizations visible to your session.",
        },
        {
          label: "Reports",
          href: "/finance/reports",
          description: "Consume curated executive and stakeholder reporting surfaces.",
        },
        {
          label: "Annual Emissions",
          href: "/dashboard/reports",
          description: "Inspect the live annual emissions roll-up behind executive reporting.",
        },
      ];
    case "verification":
      return [
        {
          label: "RFI Queue",
          href: "/audit/rfis",
          description: "Track findings, client response posture, and clarifications across assigned engagements.",
        },
        {
          label: "Sampling",
          href: "/audit/sampling",
          description: "Review site coverage, evidence density, and candidate record pools for sampling.",
        },
        {
          label: "Assurance Vault",
          href: "/audit/vault",
          description: "Inspect statements, signoff chain posture, and locked submission evidence.",
        },
      ];
    case "consulting":
      return [
        {
          label: "Client Portfolio",
          href: "/consulting/portfolio",
          description: "Navigate assigned client workstreams and engagement posture.",
        },
        {
          label: "Scenario Modeler",
          href: "/consulting/scenario",
          description: "Review modeled pathways without bypassing operational approvals.",
        },
        {
          label: "Annual Emissions",
          href: "/dashboard/reports",
          description: "Use the live annual inventory as a baseline for advisory work.",
        },
      ];
    case "external":
      return [
        {
          label: "Reports",
          href: "/finance/reports",
          description: "Consume curated reporting surfaces approved for external audiences.",
        },
      ];
    case "automation":
    case "lifecycle":
      return [];
    default:
      return [];
  }
}
