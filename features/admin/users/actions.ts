"use server";

import { revalidatePath } from "next/cache";

import {
  getAssignmentConflicts,
  getAssignableRoles,
  getEffectiveAssignments,
  getRoleHolderCount,
  hasReachedMaxConcurrentAssignments,
  roleRequiresMfa,
} from "@/lib/auth/assignmentRules";
import {
  canAccessPlatformAdmin,
  getUserRoles,
  isPlatformRole,
} from "@/lib/auth/roles";
import { buildSessionScope } from "@/lib/auth/sessionScope";
import { createServerSupabaseClient } from "@/lib/supabase/admin";
import { createRequestSupabaseClient } from "@/lib/supabase/server";
import type {
  CurrentAdminContext,
  ManagedLegalEntity,
  ManagedMfaRule,
  ManagedOrganization,
  ManagedRole,
  ManagedSite,
  ManagedUserAssignment,
  ManagedUserRow,
  SaveUserAssignmentInput,
  UserManagementPageData,
} from "@/features/admin/users/types";

/**
 * Server-side user-management data and mutation layer.
 *
 * Important:
 * - Reads use the service role because this screen spans multiple tenants.
 * - Writes still derive the acting admin from the request cookies so tier
 *   checks, scope checks, and `assigned_by` remain tied to the real actor.
 * - The mutation path intentionally mirrors the wizard validations instead of
 *   trusting the client, because SoD and verifier independence are compliance
 *   rules, not optional UI niceties.
 */

interface AuthAdminUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    full_name?: string;
  } | null;
}

interface RoleJoinRow {
  role_name: string;
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

interface AssignmentQueryRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  role_id: string;
  is_active: boolean | null;
  assigned_at: string | null;
  assigned_reason: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  scope_site_ids: string[] | null;
  scope_legal_entity_ids: string[] | null;
  mfa_verified_at: string | null;
  accreditation_verified_at: string | null;
  platform_roles: RoleJoinRow | RoleJoinRow[] | null;
}

interface OrganizationRow {
  id: string;
  legal_name: string | null;
}

interface SiteRow {
  id: string;
  organization_id: string;
  legal_entity_id: string | null;
  site_name: string;
  site_code: string | null;
  city: string;
}

interface LegalEntityRow {
  id: string;
  organization_id: string;
  entity_name: string;
  cin: string | null;
}

interface MfaRuleRow {
  role_name: string;
  mfa_required: boolean;
  grace_period_days: number;
  bypass_allowed: boolean;
}

interface SessionRow {
  user_id: string;
  mfa_verified: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

interface VerifierRow {
  user_id: string | null;
  accreditation_no: string | null;
  is_active: boolean | null;
}

function toRoleLabel(roleName: string, displayName: string | null): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName.trim();
  }

  return roleName
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function unwrapRoleJoin(roleJoin: AssignmentQueryRow["platform_roles"]): RoleJoinRow | null {
  if (!roleJoin) {
    return null;
  }

  return Array.isArray(roleJoin) ? (roleJoin[0] ?? null) : roleJoin;
}

function normalizeRoleRow(row: RoleJoinRow & { id: string }): ManagedRole | null {
  if (!isPlatformRole(row.role_name)) {
    return null;
  }

  return {
    id: row.id,
    role_name: row.role_name,
    display_name: row.display_name,
    description: row.description,
    role_level: row.role_level,
    role_category: row.role_category,
    tier_rank: row.tier_rank,
    requires_mfa: row.requires_mfa,
    requires_accreditation: row.requires_accreditation,
    max_concurrent_assignments: row.max_concurrent_assignments,
    expiry_days: row.expiry_days,
    is_active: row.is_active,
    can_be_self_assigned: row.can_be_self_assigned,
    is_lifecycle_role: row.is_lifecycle_role,
    is_system_role: row.is_system_role,
  };
}

function normalizeAssignmentRow(
  row: AssignmentQueryRow,
  organizationMap: ReadonlyMap<string, string>,
): ManagedUserAssignment | null {
  const roleRow = unwrapRoleJoin(row.platform_roles);

  if (!roleRow || !isPlatformRole(roleRow.role_name)) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    organization_id: row.organization_id,
    organization_name: row.organization_id
      ? (organizationMap.get(row.organization_id) ?? null)
      : null,
    role_id: row.role_id,
    role_name: roleRow.role_name,
    display_name: roleRow.display_name,
    is_active: row.is_active,
    assigned_at: row.assigned_at,
    assigned_reason: row.assigned_reason,
    expires_at: row.expires_at,
    revoked_at: row.revoked_at,
    scope_site_ids: row.scope_site_ids ?? [],
    scope_legal_entity_ids: row.scope_legal_entity_ids ?? [],
    mfa_verified_at: row.mfa_verified_at,
    accreditation_verified_at: row.accreditation_verified_at,
  };
}

async function listAllAuthUsers(): Promise<AuthAdminUser[]> {
  const supabaseAdmin = createServerSupabaseClient();
  const users: AuthAdminUser[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    users.push(...(data.users as AuthAdminUser[]));

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function getCurrentAdminContext(): Promise<CurrentAdminContext> {
  const authClient = await createRequestSupabaseClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage user assignments.");
  }

  const roleNames = getUserRoles(user);

  if (!roleNames.some((role) => canAccessPlatformAdmin(role))) {
    throw new Error("You do not have permission to manage platform assignments.");
  }

  const supabaseAdmin = createServerSupabaseClient();
  const { data: actorRoleRows, error: actorRoleError } = await supabaseAdmin
    .from("platform_roles")
    .select("id, role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role")
    .in("role_name", roleNames);

  if (actorRoleError) {
    throw new Error(actorRoleError.message);
  }

  const actorRoles = ((actorRoleRows ?? []) as Array<RoleJoinRow & { id: string }>)
    .map((row) => normalizeRoleRow(row))
    .filter((row): row is ManagedRole => row !== null);

  const minTierRank =
    actorRoles.length > 0
      ? actorRoles.reduce((best, role) => Math.min(best, role.tier_rank), Number.POSITIVE_INFINITY)
      : null;
  const scope = buildSessionScope((user.app_metadata as Record<string, unknown>) ?? {});

  return {
    userId: user.id,
    roleNames,
    minTierRank: minTierRank === Number.POSITIVE_INFINITY ? null : minTierRank,
    primaryOrgId: scope.primaryOrgId,
    siteScopeIds: scope.siteScopeIds,
    legalEntityScopeIds: scope.legalEntityScopeIds,
  };
}

function getPrimaryAssignment(assignments: readonly ManagedUserAssignment[]): ManagedUserAssignment | null {
  return getEffectiveAssignments(assignments)[0] ?? assignments[0] ?? null;
}

function toManagedOrganizations(rows: OrganizationRow[]): ManagedOrganization[] {
  return rows.map((row) => ({
    id: row.id,
    legal_name: row.legal_name ?? "Unnamed organization",
  }));
}

function toManagedSites(rows: SiteRow[]): ManagedSite[] {
  return rows.map((row) => ({
    id: row.id,
    organization_id: row.organization_id,
    legal_entity_id: row.legal_entity_id,
    site_name: row.site_name,
    site_code: row.site_code,
    city: row.city,
  }));
}

function toManagedLegalEntities(rows: LegalEntityRow[]): ManagedLegalEntity[] {
  return rows.map((row) => ({
    id: row.id,
    organization_id: row.organization_id,
    entity_name: row.entity_name,
    cin: row.cin,
  }));
}

function toManagedMfaRules(rows: MfaRuleRow[]): ManagedMfaRule[] {
  return rows
    .filter(
      (row): row is MfaRuleRow & { role_name: ManagedMfaRule["role_name"] } =>
        isPlatformRole(row.role_name),
    )
    .map((row) => ({
      role_name: row.role_name,
      mfa_required: row.mfa_required,
      grace_period_days: row.grace_period_days,
      bypass_allowed: row.bypass_allowed,
    }));
}

export async function fetchUserManagementData(): Promise<
  { data: UserManagementPageData; error?: undefined } | { data?: undefined; error: string }
> {
  try {
    const currentAdmin = await getCurrentAdminContext();
    const supabaseAdmin = createServerSupabaseClient();

    const [
      authUsers,
      assignmentsResponse,
      organizationsResponse,
      rolesResponse,
      sitesResponse,
      legalEntitiesResponse,
      mfaRulesResponse,
      sessionsResponse,
      verifiersResponse,
    ] = await Promise.all([
      listAllAuthUsers(),
      supabaseAdmin
        .from("user_organization_roles")
        .select(
          "id, user_id, organization_id, role_id, is_active, assigned_at, assigned_reason, expires_at, revoked_at, scope_site_ids, scope_legal_entity_ids, mfa_verified_at, accreditation_verified_at, platform_roles(role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role)",
        )
        .order("assigned_at", { ascending: false }),
      supabaseAdmin
        .from("client_organizations")
        .select("id, legal_name")
        .is("deleted_at", null)
        .order("legal_name"),
      supabaseAdmin
        .from("platform_roles")
        .select(
          "id, role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role",
        )
        .eq("is_active", true)
        .order("tier_rank")
        .order("role_name"),
      supabaseAdmin
        .from("client_sites")
        .select("id, organization_id, legal_entity_id, site_name, site_code, city")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("site_name"),
      supabaseAdmin
        .from("client_legal_entities")
        .select("id, organization_id, entity_name, cin")
        .is("deleted_at", null)
        .order("entity_name"),
      supabaseAdmin
        .from("mfa_enforcement_config")
        .select("role_name, mfa_required, grace_period_days, bypass_allowed"),
      supabaseAdmin
        .from("user_sessions")
        .select("user_id, mfa_verified, is_active, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("verifiers")
        .select("user_id, accreditation_no, is_active")
        .eq("is_active", true)
        .is("deleted_at", null),
    ]);

    if (assignmentsResponse.error) {
      throw new Error(assignmentsResponse.error.message);
    }

    if (organizationsResponse.error) {
      throw new Error(organizationsResponse.error.message);
    }

    if (rolesResponse.error) {
      throw new Error(rolesResponse.error.message);
    }

    if (sitesResponse.error) {
      throw new Error(sitesResponse.error.message);
    }

    if (legalEntitiesResponse.error) {
      throw new Error(legalEntitiesResponse.error.message);
    }

    if (mfaRulesResponse.error) {
      throw new Error(mfaRulesResponse.error.message);
    }

    if (sessionsResponse.error) {
      throw new Error(sessionsResponse.error.message);
    }

    if (verifiersResponse.error) {
      throw new Error(verifiersResponse.error.message);
    }

    const organizations = toManagedOrganizations((organizationsResponse.data ?? []) as OrganizationRow[]);
    const organizationMap = new Map(organizations.map((organization) => [organization.id, organization.legal_name]));
    const roles = ((rolesResponse.data ?? []) as Array<RoleJoinRow & { id: string }>)
      .map((row) => normalizeRoleRow(row))
      .filter((row): row is ManagedRole => row !== null);
    const sites = toManagedSites((sitesResponse.data ?? []) as SiteRow[]);
    const legalEntities = toManagedLegalEntities((legalEntitiesResponse.data ?? []) as LegalEntityRow[]);
    const mfaRules = toManagedMfaRules((mfaRulesResponse.data ?? []) as MfaRuleRow[]);
    const roleCatalog = getAssignableRoles(roles, currentAdmin.minTierRank);

    const assignmentRows = ((assignmentsResponse.data ?? []) as AssignmentQueryRow[])
      .map((row) => normalizeAssignmentRow(row, organizationMap))
      .filter((row): row is ManagedUserAssignment => row !== null);

    const assignmentsByUser = new Map<string, ManagedUserAssignment[]>();

    assignmentRows.forEach((assignment) => {
      const currentRows = assignmentsByUser.get(assignment.user_id) ?? [];
      currentRows.push(assignment);
      assignmentsByUser.set(assignment.user_id, currentRows);
    });

    const latestMfaStatusByUser = new Map<string, boolean>();

    ((sessionsResponse.data ?? []) as SessionRow[]).forEach((sessionRow) => {
      if (!latestMfaStatusByUser.has(sessionRow.user_id)) {
        latestMfaStatusByUser.set(sessionRow.user_id, Boolean(sessionRow.mfa_verified));
      }
    });

    const verifierByUser = new Map<string, string>();

    ((verifiersResponse.data ?? []) as VerifierRow[]).forEach((verifier) => {
      if (verifier.user_id && verifier.accreditation_no) {
        verifierByUser.set(verifier.user_id, verifier.accreditation_no);
      }
    });

    const users: ManagedUserRow[] = authUsers.map((user) => {
      const assignments = assignmentsByUser.get(user.id) ?? [];
      const primaryAssignment = getPrimaryAssignment(assignments);
      const isActive = getEffectiveAssignments(assignments).length > 0;
      const role = primaryAssignment?.role_name ?? "pending_approval";
      const roleDisplayName = primaryAssignment
        ? toRoleLabel(primaryAssignment.role_name, primaryAssignment.display_name)
        : "Pending approval";

      return {
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name?.trim() || "-",
        last_sign_in_at: user.last_sign_in_at ?? null,
        created_at: user.created_at,
        role,
        role_display_name: roleDisplayName,
        org_name: primaryAssignment?.organization_name ?? "-",
        is_active: isActive,
        has_verified_mfa: latestMfaStatusByUser.get(user.id) ?? false,
        verifier_accreditation_no: verifierByUser.get(user.id) ?? null,
        assignments,
      };
    });

    return {
      data: {
        users,
        organizations,
        roles: roleCatalog,
        sites,
        legalEntities,
        mfaRules,
        currentAdmin,
      },
    };
  } catch (error) {
    console.error("Failed to build user management data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to load user management data.",
    };
  }
}

function toIsoTimestamp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function ensureSubset(candidateIds: readonly string[], allowedIds: ReadonlySet<string>): boolean {
  return candidateIds.every((id) => allowedIds.has(id));
}

export async function saveUserAssignment(
  input: SaveUserAssignmentInput,
): Promise<{ success: true } | { error: string }> {
  try {
    const currentAdmin = await getCurrentAdminContext();
    const supabaseAdmin = createServerSupabaseClient();

    const [
      organizationResponse,
      roleResponse,
      mfaRuleResponse,
      targetAssignmentsResponse,
      orgSitesResponse,
      orgLegalEntitiesResponse,
    ] = await Promise.all([
      supabaseAdmin
        .from("client_organizations")
        .select("id, legal_name")
        .eq("id", input.organizationId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabaseAdmin
        .from("platform_roles")
        .select(
          "id, role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role",
        )
        .eq("id", input.roleId)
        .maybeSingle(),
      supabaseAdmin
        .from("mfa_enforcement_config")
        .select("role_name, mfa_required, grace_period_days, bypass_allowed")
        .limit(500),
      supabaseAdmin
        .from("user_organization_roles")
        .select(
          "id, user_id, organization_id, role_id, is_active, assigned_at, assigned_reason, expires_at, revoked_at, scope_site_ids, scope_legal_entity_ids, mfa_verified_at, accreditation_verified_at, platform_roles(role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role)",
        )
        .eq("user_id", input.userId)
        .order("assigned_at", { ascending: false }),
      supabaseAdmin
        .from("client_sites")
        .select("id, organization_id")
        .eq("organization_id", input.organizationId)
        .eq("is_active", true)
        .is("deleted_at", null),
      supabaseAdmin
        .from("client_legal_entities")
        .select("id, organization_id")
        .eq("organization_id", input.organizationId)
        .is("deleted_at", null),
    ]);

    if (organizationResponse.error) {
      throw new Error(organizationResponse.error.message);
    }

    if (roleResponse.error) {
      throw new Error(roleResponse.error.message);
    }

    if (mfaRuleResponse.error) {
      throw new Error(mfaRuleResponse.error.message);
    }

    if (targetAssignmentsResponse.error) {
      throw new Error(targetAssignmentsResponse.error.message);
    }

    if (orgSitesResponse.error) {
      throw new Error(orgSitesResponse.error.message);
    }

    if (orgLegalEntitiesResponse.error) {
      throw new Error(orgLegalEntitiesResponse.error.message);
    }

    if (!organizationResponse.data) {
      return { error: "The selected organization does not exist or is no longer active." };
    }

    const role = roleResponse.data
      ? normalizeRoleRow(roleResponse.data as RoleJoinRow & { id: string })
      : null;

    if (!role) {
      return { error: "The selected role does not exist in the current role catalog." };
    }

    if (!role.is_active || role.is_system_role || role.is_lifecycle_role) {
      return { error: "This role cannot be assigned from the admin UI." };
    }

    if (currentAdmin.minTierRank != null && role.tier_rank < currentAdmin.minTierRank) {
      return {
        error:
          "Privilege escalation blocked: you cannot assign a role that has a higher privilege tier than your own.",
      };
    }

    if (input.userId === currentAdmin.userId && !role.can_be_self_assigned) {
      return { error: "This role cannot be self-assigned." };
    }

    if (!input.assignedReason.trim()) {
      return { error: "Assignment reason is required for auditability." };
    }

    if (!input.confirmationChecked) {
      return {
        error:
          "Confirm that the assignment complies with organizational access policy before saving.",
      };
    }

    const orgNameMap = new Map([[organizationResponse.data.id, organizationResponse.data.legal_name ?? ""]]);
    const targetAssignments = ((targetAssignmentsResponse.data ?? []) as AssignmentQueryRow[])
      .map((row) => normalizeAssignmentRow(row, orgNameMap))
      .filter((row): row is ManagedUserAssignment => row !== null);
    const conflicts = getAssignmentConflicts(role.role_name, input.organizationId, targetAssignments);

    if (conflicts.length > 0) {
      const topConflict = conflicts[0];
      return {
        error: `${topConflict.message} (${topConflict.frameworkReference})`,
      };
    }

    const mfaRules = toManagedMfaRules((mfaRuleResponse.data ?? []) as MfaRuleRow[]);

    if (roleRequiresMfa(role, mfaRules) && !input.mfaVerified) {
      return {
        error:
          "This role requires MFA confirmation. Verify the user's MFA status before assigning it.",
      };
    }

    if (role.requires_accreditation) {
      const { data: verifierRow, error: verifierError } = await supabaseAdmin
        .from("verifiers")
        .select("user_id, accreditation_no, is_active")
        .eq("user_id", input.userId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .maybeSingle();

      if (verifierError) {
        throw new Error(verifierError.message);
      }

      if (!verifierRow?.accreditation_no) {
        return {
          error:
            "This verifier role requires an active verifier record with accreditation_no before it can be assigned.",
        };
      }

      if (!input.accreditationVerified) {
        return {
          error:
            "Accreditation confirmation is required before assigning verifier-bound roles.",
        };
      }
    }

    const organizationSiteIds = new Set(
      ((orgSitesResponse.data ?? []) as Array<{ id: string }>).map((site) => site.id),
    );
    const organizationLegalEntityIds = new Set(
      ((orgLegalEntitiesResponse.data ?? []) as Array<{ id: string }>).map((entity) => entity.id),
    );

    const effectiveScopeSiteIds =
      input.scopeSiteIds.length > 0
        ? input.scopeSiteIds
        : currentAdmin.siteScopeIds.filter((siteId) => organizationSiteIds.has(siteId));
    const effectiveScopeLegalEntityIds =
      input.scopeLegalEntityIds.length > 0
        ? input.scopeLegalEntityIds
        : currentAdmin.legalEntityScopeIds.filter((entityId) =>
            organizationLegalEntityIds.has(entityId),
          );

    if (!ensureSubset(effectiveScopeSiteIds, organizationSiteIds)) {
      return { error: "One or more selected site scopes do not belong to the chosen organization." };
    }

    if (!ensureSubset(effectiveScopeLegalEntityIds, organizationLegalEntityIds)) {
      return {
        error: "One or more selected legal-entity scopes do not belong to the chosen organization.",
      };
    }

    if (
      currentAdmin.siteScopeIds.length > 0 &&
      !ensureSubset(effectiveScopeSiteIds, new Set(currentAdmin.siteScopeIds))
    ) {
      return { error: "You cannot assign site scope outside your own permitted site scope." };
    }

    if (
      currentAdmin.legalEntityScopeIds.length > 0 &&
      !ensureSubset(effectiveScopeLegalEntityIds, new Set(currentAdmin.legalEntityScopeIds))
    ) {
      return {
        error:
          "You cannot assign legal-entity scope outside your own permitted legal-entity scope.",
      };
    }

    const { data: allAssignmentsForRole, error: allAssignmentsForRoleError } = await supabaseAdmin
      .from("user_organization_roles")
      .select(
        "id, user_id, organization_id, role_id, is_active, assigned_at, assigned_reason, expires_at, revoked_at, scope_site_ids, scope_legal_entity_ids, mfa_verified_at, accreditation_verified_at, platform_roles(role_name, display_name, description, role_level, role_category, tier_rank, requires_mfa, requires_accreditation, max_concurrent_assignments, expiry_days, is_active, can_be_self_assigned, is_lifecycle_role, is_system_role)",
      )
      .eq("role_id", role.id)
      .order("assigned_at", { ascending: false });

    if (allAssignmentsForRoleError) {
      throw new Error(allAssignmentsForRoleError.message);
    }

    const roleAssignments = ((allAssignmentsForRole ?? []) as AssignmentQueryRow[])
      .map((row) => normalizeAssignmentRow(row, orgNameMap))
      .filter((row): row is ManagedUserAssignment => row !== null);

    if (hasReachedMaxConcurrentAssignments(role, roleAssignments, input.userId)) {
      const currentHolders = getRoleHolderCount(role.id, roleAssignments);
      return {
        error: `The ${toRoleLabel(role.role_name, role.display_name)} role is capped at ${role.max_concurrent_assignments} concurrent assignments and already has ${currentHolders} active holder(s).`,
      };
    }

    const expiresAt = toIsoTimestamp(input.expiresAt);

    if (input.expiresAt && !expiresAt) {
      return { error: "The selected expiry date is invalid." };
    }

    const existingExactAssignment = getEffectiveAssignments(targetAssignments).find(
      (assignment) =>
        assignment.organization_id === input.organizationId && assignment.role_id === role.id,
    );
    const nowIso = new Date().toISOString();

    const assignmentPayload = {
      organization_id: input.organizationId,
      role_id: role.id,
      is_active: true,
      assigned_reason: input.assignedReason.trim(),
      expires_at: expiresAt,
      revoked_at: null,
      revoked_by: null,
      revoked_reason: null,
      scope_site_ids: effectiveScopeSiteIds.length > 0 ? effectiveScopeSiteIds : null,
      scope_legal_entity_ids:
        effectiveScopeLegalEntityIds.length > 0 ? effectiveScopeLegalEntityIds : null,
      mfa_verified_at: roleRequiresMfa(role, mfaRules) ? nowIso : null,
      accreditation_verified_at: role.requires_accreditation ? nowIso : null,
      assigned_by: currentAdmin.userId,
      updated_at: nowIso,
    };

    if (existingExactAssignment) {
      const { error: updateError } = await supabaseAdmin
        .from("user_organization_roles")
        .update(assignmentPayload)
        .eq("id", existingExactAssignment.id);

      if (updateError) {
        return { error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("user_organization_roles")
        .insert({
          user_id: input.userId,
          ...assignmentPayload,
        });

      if (insertError) {
        return { error: insertError.message };
      }
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to save user assignment:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to save the requested role assignment.",
    };
  }
}
