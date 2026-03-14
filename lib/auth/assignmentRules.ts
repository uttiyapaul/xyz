import {
  CLIENT_ADMINISTRATION_ROLES,
  DATA_OPERATIONS_ROLES,
  EXECUTIVE_BOARD_ROLES,
  FINANCE_CARBON_MARKET_ROLES,
  GROUP_CONGLOMERATE_ROLES,
  SUSTAINABILITY_COMPLIANCE_ROLES,
  THIRD_PARTY_VERIFIER_ROLES,
  type PlatformRole,
} from "@/lib/auth/roles";

/**
 * Shared assignment-rule layer for the admin role-assignment workflow.
 *
 * Why this file matters:
 * - The assignment UI and its server action both need the same SoD logic.
 * - Role metadata such as MFA, accreditation, tier rank, and concurrent caps
 *   should be interpreted once, not re-implemented differently in each screen.
 * - Keeping these helpers here makes it much easier for the next developer or
 *   agent to extend the role model without hunting through UI code first.
 */

export interface AssignmentRoleDefinition {
  id: string;
  role_name: PlatformRole;
  display_name: string | null;
  description: string | null;
  role_level: string;
  role_category: string;
  tier_rank: number;
  requires_mfa: boolean;
  requires_accreditation: boolean;
  max_concurrent_assignments: number | null;
  expiry_days: number | null;
  is_active: boolean;
  can_be_self_assigned: boolean;
  is_lifecycle_role: boolean;
  is_system_role: boolean;
}

export interface AssignmentMfaRule {
  role_name: PlatformRole;
  mfa_required: boolean;
  grace_period_days: number;
  bypass_allowed: boolean;
}

export interface AssignmentRecord {
  id: string;
  user_id: string;
  organization_id: string | null;
  role_id: string;
  role_name: PlatformRole;
  display_name: string | null;
  is_active: boolean | null;
  assigned_at: string | null;
  assigned_reason: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  scope_site_ids: string[];
  scope_legal_entity_ids: string[];
  mfa_verified_at: string | null;
  accreditation_verified_at: string | null;
}

export interface AssignmentConflict {
  code: string;
  conflictingRole: PlatformRole;
  message: string;
  frameworkReference: string;
}

const CLIENT_OPERATIONAL_ROLE_SET = new Set<PlatformRole>([
  ...CLIENT_ADMINISTRATION_ROLES,
  ...GROUP_CONGLOMERATE_ROLES,
  ...SUSTAINABILITY_COMPLIANCE_ROLES,
  ...DATA_OPERATIONS_ROLES,
  ...FINANCE_CARBON_MARKET_ROLES,
  ...EXECUTIVE_BOARD_ROLES.filter((role) => role !== "board_report_recipient"),
]);

const VERIFIER_ROLE_SET = new Set<PlatformRole>(THIRD_PARTY_VERIFIER_ROLES);

export function isAssignmentEffective(
  assignment: Pick<AssignmentRecord, "is_active" | "revoked_at" | "expires_at">,
  now = new Date(),
): boolean {
  if (!assignment.is_active || assignment.revoked_at) {
    return false;
  }

  if (!assignment.expires_at) {
    return true;
  }

  return new Date(assignment.expires_at) > now;
}

export function getEffectiveAssignments<T extends AssignmentRecord>(
  assignments: readonly T[],
  now = new Date(),
): T[] {
  return assignments
    .filter((assignment) => isAssignmentEffective(assignment, now))
    .sort((left, right) => {
      const leftStamp = left.assigned_at ? Date.parse(left.assigned_at) : 0;
      const rightStamp = right.assigned_at ? Date.parse(right.assigned_at) : 0;
      return rightStamp - leftStamp;
    });
}

export function isVerifierRole(role: PlatformRole): boolean {
  return VERIFIER_ROLE_SET.has(role);
}

export function isClientOperationalRole(role: PlatformRole): boolean {
  return CLIENT_OPERATIONAL_ROLE_SET.has(role);
}

export function roleRequiresMfa(
  role: AssignmentRoleDefinition,
  rules: readonly AssignmentMfaRule[],
): boolean {
  if (role.requires_mfa) {
    return true;
  }

  const override = rules.find((rule) => rule.role_name === role.role_name);
  return override?.mfa_required ?? false;
}

export function getAssignableRoles(
  roles: readonly AssignmentRoleDefinition[],
  actorMinTierRank: number | null,
): AssignmentRoleDefinition[] {
  return roles.filter((role) => {
    if (!role.is_active || role.is_system_role || role.is_lifecycle_role) {
      return false;
    }

    if (actorMinTierRank == null) {
      return true;
    }

    return role.tier_rank >= actorMinTierRank;
  });
}

export function buildDefaultExpiryValue(
  expiryDays: number | null,
  baseDate = new Date(),
): string {
  if (!expiryDays) {
    return "";
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + expiryDays);
  return formatDateTimeLocal(nextDate);
}

export function formatDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getRoleHolderCount(
  roleId: string,
  assignments: readonly AssignmentRecord[],
): number {
  const activeHolders = new Set(
    getEffectiveAssignments(assignments)
      .filter((assignment) => assignment.role_id === roleId)
      .map((assignment) => assignment.user_id),
  );

  return activeHolders.size;
}

export function hasReachedMaxConcurrentAssignments(
  role: AssignmentRoleDefinition,
  assignments: readonly AssignmentRecord[],
  targetUserId: string,
): boolean {
  if (!role.max_concurrent_assignments) {
    return false;
  }

  const activeAssignments = getEffectiveAssignments(assignments);
  const currentHolders = new Set(
    activeAssignments
      .filter((assignment) => assignment.role_id === role.id)
      .map((assignment) => assignment.user_id),
  );

  if (currentHolders.has(targetUserId)) {
    return false;
  }

  return currentHolders.size >= role.max_concurrent_assignments;
}

export function getAssignmentConflicts(
  selectedRole: PlatformRole,
  organizationId: string,
  assignments: readonly AssignmentRecord[],
): AssignmentConflict[] {
  const effectiveAssignments = getEffectiveAssignments(assignments);
  const orgAssignments = effectiveAssignments.filter(
    (assignment) => assignment.organization_id === organizationId,
  );
  const conflicts: AssignmentConflict[] = [];

  const orgRoleNames = Array.from(new Set(orgAssignments.map((assignment) => assignment.role_name)));
  const allRoleNames = Array.from(new Set(effectiveAssignments.map((assignment) => assignment.role_name)));

  if (selectedRole === "platform_superadmin") {
    allRoleNames
      .filter((role) => role !== "platform_superadmin")
      .forEach((role) => {
        conflicts.push({
          code: "platform_superadmin_conflict",
          conflictingRole: role,
          message:
            "Platform superadmin must stay isolated from any other operational role to prevent unilateral control over regulated data.",
          frameworkReference: "SOC 2 CC6.1",
        });
      });
  }

  if (selectedRole !== "platform_superadmin" && allRoleNames.includes("platform_superadmin")) {
    conflicts.push({
      code: "platform_superadmin_conflict",
      conflictingRole: "platform_superadmin",
      message:
        "This user already holds platform_superadmin, so assigning another operational role would violate the superadmin isolation rule.",
      frameworkReference: "SOC 2 CC6.1",
    });
  }

  if (selectedRole === "data_reviewer" && orgRoleNames.includes("data_approver")) {
    conflicts.push({
      code: "reviewer_approver_split",
      conflictingRole: "data_approver",
      message:
        "data_reviewer and data_approver must remain separate within the same organization so one person cannot both review and finally approve the same emissions data.",
      frameworkReference: "SOC 2 CC6.3 / Four-eyes control",
    });
  }

  if (selectedRole === "data_approver" && orgRoleNames.includes("data_reviewer")) {
    conflicts.push({
      code: "reviewer_approver_split",
      conflictingRole: "data_reviewer",
      message:
        "data_approver cannot be assigned while the same user also holds data_reviewer in this organization.",
      frameworkReference: "SOC 2 CC6.3 / Four-eyes control",
    });
  }

  if (selectedRole === "dpo" && orgRoleNames.includes("client_admin")) {
    conflicts.push({
      code: "dpo_admin_conflict",
      conflictingRole: "client_admin",
      message:
        "The Data Protection Officer cannot simultaneously administer the same organization's user access.",
      frameworkReference: "GDPR Article 38(6)",
    });
  }

  if (selectedRole === "client_admin" && orgRoleNames.includes("dpo")) {
    conflicts.push({
      code: "dpo_admin_conflict",
      conflictingRole: "dpo",
      message:
        "client_admin cannot be combined with dpo in the same organization because privacy oversight must remain independent.",
      frameworkReference: "GDPR Article 38(6)",
    });
  }

  if (isVerifierRole(selectedRole)) {
    orgRoleNames.filter(isClientOperationalRole).forEach((role) => {
      conflicts.push({
        code: "verifier_independence",
        conflictingRole: role,
        message:
          "Verifier roles must remain independent from client operational roles within the organization being verified.",
        frameworkReference: "ISO 14064-3 Sections 6.2 and 6.3 / EU Reg 2023/1773 Article 8",
      });
    });
  }

  if (isClientOperationalRole(selectedRole)) {
    orgRoleNames.filter(isVerifierRole).forEach((role) => {
      conflicts.push({
        code: "verifier_independence",
        conflictingRole: role,
        message:
          "Client operational roles cannot be combined with verifier roles in the same organization because verifier independence must be absolute.",
        frameworkReference: "ISO 14064-3 Sections 6.2 and 6.3 / EU Reg 2023/1773 Article 8",
      });
    });
  }

  return conflicts.filter((conflict, index, allConflicts) => {
    return (
      allConflicts.findIndex(
        (candidate) =>
          candidate.code === conflict.code &&
          candidate.conflictingRole === conflict.conflictingRole,
      ) === index
    );
  });
}
