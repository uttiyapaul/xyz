/**
 * __tests__/auth/assignmentRules.test.ts
 *
 * These checks cover the shared assignment rule layer used by the new admin
 * assignment wizard and its server action. This is the fastest place to catch
 * regressions in tier filtering, SoD conflicts, and verifier/MFA rules before
 * they leak into the UI.
 */

import {
  getAssignableRoles,
  getAssignmentConflicts,
  getEffectiveAssignments,
  getRoleHolderCount,
  hasReachedMaxConcurrentAssignments,
  roleRequiresMfa,
  type AssignmentMfaRule,
  type AssignmentRecord,
  type AssignmentRoleDefinition,
} from "@/lib/auth/assignmentRules";

const baseRole: AssignmentRoleDefinition = {
  id: "role-base",
  role_name: "client_admin",
  display_name: "Client Admin",
  description: null,
  role_level: "client_admin",
  role_category: "client",
  tier_rank: 20,
  requires_mfa: false,
  requires_accreditation: false,
  max_concurrent_assignments: null,
  expiry_days: null,
  is_active: true,
  can_be_self_assigned: false,
  is_lifecycle_role: false,
  is_system_role: false,
};

function makeRole(
  overrides: Partial<AssignmentRoleDefinition>,
): AssignmentRoleDefinition {
  return {
    ...baseRole,
    ...overrides,
  };
}

function makeAssignment(
  overrides: Partial<AssignmentRecord>,
): AssignmentRecord {
  return {
    id: overrides.id ?? "assignment-1",
    user_id: overrides.user_id ?? "user-1",
    organization_id: overrides.organization_id ?? "org-1",
    role_id: overrides.role_id ?? "role-1",
    role_name: overrides.role_name ?? "client_admin",
    display_name: overrides.display_name ?? "Client Admin",
    is_active: overrides.is_active ?? true,
    assigned_at: overrides.assigned_at ?? "2026-03-15T08:00:00.000Z",
    assigned_reason: overrides.assigned_reason ?? "Audit test",
    expires_at: overrides.expires_at ?? null,
    revoked_at: overrides.revoked_at ?? null,
    scope_site_ids: overrides.scope_site_ids ?? [],
    scope_legal_entity_ids: overrides.scope_legal_entity_ids ?? [],
    mfa_verified_at: overrides.mfa_verified_at ?? null,
    accreditation_verified_at: overrides.accreditation_verified_at ?? null,
  };
}

describe("assignment rules", () => {
  it("keeps only active, non-revoked, non-expired assignments", () => {
    const assignments = [
      makeAssignment({ id: "active" }),
      makeAssignment({ id: "expired", expires_at: "2024-01-01T00:00:00.000Z" }),
      makeAssignment({ id: "revoked", revoked_at: "2026-03-15T09:00:00.000Z" }),
      makeAssignment({ id: "inactive", is_active: false }),
    ];

    expect(getEffectiveAssignments(assignments, new Date("2026-03-15T10:00:00.000Z"))).toEqual([
      assignments[0],
    ]);
  });

  it("filters assignable roles by actor tier while removing lifecycle and system roles", () => {
    const roles = [
      makeRole({ id: "role-1", role_name: "platform_admin", tier_rank: 5 }),
      makeRole({ id: "role-2", role_name: "client_admin", tier_rank: 20 }),
      makeRole({ id: "role-3", role_name: "pending_approval", tier_rank: 99, is_lifecycle_role: true }),
      makeRole({ id: "role-4", role_name: "readonly_api_user", tier_rank: 60, is_system_role: true }),
    ];

    expect(getAssignableRoles(roles, 10).map((role) => role.id)).toEqual(["role-2"]);
  });

  it("honors MFA enforcement config even when the role row itself is not flagged", () => {
    const role = makeRole({ role_name: "platform_support", requires_mfa: false });
    const rules: AssignmentMfaRule[] = [
      {
        role_name: "platform_support",
        mfa_required: true,
        grace_period_days: 7,
        bypass_allowed: false,
      },
    ];

    expect(roleRequiresMfa(role, rules)).toBe(true);
  });

  it("blocks reviewer and approver combinations within the same organization", () => {
    const conflicts = getAssignmentConflicts(
      "data_approver",
      "org-1",
      [makeAssignment({ role_name: "data_reviewer", display_name: "Data Reviewer" })],
    );

    expect(conflicts[0]?.code).toBe("reviewer_approver_split");
  });

  it("blocks verifier roles when the user already has a client operational role in that organization", () => {
    const conflicts = getAssignmentConflicts(
      "verifier_approver",
      "org-1",
      [makeAssignment({ role_name: "client_admin", display_name: "Client Admin" })],
    );

    expect(conflicts[0]?.code).toBe("verifier_independence");
  });

  it("counts unique role holders and blocks assignments beyond the configured cap", () => {
    const role = makeRole({
      id: "verifier-role",
      role_name: "verifier_approver",
      max_concurrent_assignments: 1,
    });
    const assignments = [
      makeAssignment({
        id: "holder-1",
        user_id: "user-a",
        role_id: "verifier-role",
        role_name: "verifier_approver",
      }),
    ];

    expect(getRoleHolderCount("verifier-role", assignments)).toBe(1);
    expect(hasReachedMaxConcurrentAssignments(role, assignments, "user-b")).toBe(true);
    expect(hasReachedMaxConcurrentAssignments(role, assignments, "user-a")).toBe(false);
  });
});
