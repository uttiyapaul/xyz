"use server";

import {
  canAccessPlatformAdmin,
  getUserRoles,
  isPlatformRole,
  type PlatformRole,
} from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/admin";
import { createRequestSupabaseClient } from "@/lib/supabase/server";

interface AuthAdminUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    full_name?: string;
  } | null;
}

interface TeamRoleJoinRow {
  role_name: string;
  display_name: string | null;
  role_category: string;
  requires_mfa: boolean;
  requires_accreditation: boolean;
}

interface TeamAssignmentRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  is_active: boolean | null;
  assigned_at: string | null;
  assigned_reason: string | null;
  expires_at: string | null;
  scope_site_ids: string[] | null;
  scope_legal_entity_ids: string[] | null;
  platform_roles: TeamRoleJoinRow | TeamRoleJoinRow[] | null;
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

interface ScopeSiteRow {
  id: string;
  site_name: string;
}

interface ScopeLegalEntityRow {
  id: string;
  entity_name: string;
}

interface TeamMemberAssignment {
  id: string;
  roleName: PlatformRole;
  roleLabel: string;
  roleCategory: string;
  isActive: boolean;
  assignedAt: string | null;
  expiresAt: string | null;
  assignedReason: string | null;
  siteScopeSummary: string;
  legalEntityScopeSummary: string;
  requiresMfa: boolean;
  requiresAccreditation: boolean;
}

export interface OrganizationTeamMember {
  id: string;
  email: string;
  fullName: string;
  lastSignInAt: string | null;
  hasVerifiedMfa: boolean;
  accreditationNo: string | null;
  primaryRoleLabel: string;
  assignmentCount: number;
  activeAssignmentCount: number;
  assignments: TeamMemberAssignment[];
  sodAlerts: string[];
}

export interface OrganizationTeamData {
  organizationId: string;
  organizationName: string;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  currentRoleNames: PlatformRole[];
  teamMembers: OrganizationTeamMember[];
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

function unwrapRoleJoin(roleJoin: TeamAssignmentRow["platform_roles"]): TeamRoleJoinRow | null {
  if (!roleJoin) {
    return null;
  }

  return Array.isArray(roleJoin) ? (roleJoin[0] ?? null) : roleJoin;
}

function formatScopeSummary(
  scopedIds: readonly string[],
  scopeMap: ReadonlyMap<string, string>,
  fallbackLabel: string,
): string {
  if (scopedIds.length === 0) {
    return `All ${fallbackLabel}`;
  }

  const labels = scopedIds.map((id) => scopeMap.get(id) ?? "Unknown");

  if (labels.length <= 2) {
    return labels.join(", ");
  }

  return `${labels.slice(0, 2).join(", ")} +${labels.length - 2} more`;
}

function buildSodAlerts(roleNames: readonly PlatformRole[]): string[] {
  const alerts: string[] = [];
  const roleSet = new Set(roleNames);

  if (roleSet.has("data_reviewer") && roleSet.has("data_approver")) {
    alerts.push("Reviewer and approver roles overlap for this user. SoD review is required.");
  }

  if (roleSet.has("client_admin") && roleSet.has("dpo")) {
    alerts.push("Client administration and DPO oversight overlap for this user.");
  }

  const hasVerifierRole = roleNames.some((role) => role.startsWith("verifier_") || role === "cbam_verifier");
  const hasClientOperationalRole = roleNames.some((role) =>
    ["client_admin", "client_superadmin", "facility_manager", "carbon_accountant", "data_entry_operator"].includes(role),
  );

  if (hasVerifierRole && hasClientOperationalRole) {
    alerts.push("Verifier independence risk detected alongside client operational access.");
  }

  return alerts;
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

export async function fetchOrganizationTeamData(): Promise<
  { data: OrganizationTeamData; error?: undefined } | { data?: undefined; error: string }
> {
  try {
    const authClient = await createRequestSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      throw new Error("You must be signed in to review organization team data.");
    }

    const currentRoleNames = getUserRoles(user);
    const organizationId =
      typeof user.app_metadata?.primary_org_id === "string"
        ? user.app_metadata.primary_org_id
        : Array.isArray(user.app_metadata?.org_ids)
          ? (user.app_metadata.org_ids[0] as string | undefined) ?? null
          : null;

    if (!organizationId) {
      throw new Error("No organization is attached to the current session.");
    }

    const canManageTeams = currentRoleNames.some((role) => canAccessPlatformAdmin(role))
      ? true
      : await authClient
          .rpc("has_permission", { p_org_id: organizationId, p_permission: "users:manage" })
          .then(({ data, error }) => {
            if (error) {
              throw error;
            }

            return Boolean(data);
          });

    if (!canManageTeams) {
      throw new Error("You do not have permission to review organization team data.");
    }

    const supabaseAdmin = createServerSupabaseClient();
    const [
      authUsers,
      organizationResponse,
      assignmentsResponse,
      sessionsResponse,
      verifiersResponse,
      scopeSitesResponse,
      scopeLegalEntitiesResponse,
    ] = await Promise.all([
      listAllAuthUsers(),
      supabaseAdmin
        .from("client_organizations")
        .select("id, legal_name, primary_contact_name, primary_contact_email")
        .eq("id", organizationId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabaseAdmin
        .from("user_organization_roles")
        .select(
          "id, user_id, organization_id, is_active, assigned_at, assigned_reason, expires_at, scope_site_ids, scope_legal_entity_ids, platform_roles(role_name, display_name, role_category, requires_mfa, requires_accreditation)",
        )
        .eq("organization_id", organizationId)
        .order("assigned_at", { ascending: false }),
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
      supabaseAdmin.from("client_sites").select("id, site_name").eq("organization_id", organizationId).is("deleted_at", null),
      supabaseAdmin
        .from("client_legal_entities")
        .select("id, entity_name")
        .eq("organization_id", organizationId)
        .is("deleted_at", null),
    ]);

    if (organizationResponse.error) {
      throw new Error(organizationResponse.error.message);
    }

    if (assignmentsResponse.error) {
      throw new Error(assignmentsResponse.error.message);
    }

    if (sessionsResponse.error) {
      throw new Error(sessionsResponse.error.message);
    }

    if (verifiersResponse.error) {
      throw new Error(verifiersResponse.error.message);
    }

    if (scopeSitesResponse.error) {
      throw new Error(scopeSitesResponse.error.message);
    }

    if (scopeLegalEntitiesResponse.error) {
      throw new Error(scopeLegalEntitiesResponse.error.message);
    }

    if (!organizationResponse.data) {
      throw new Error("The active organization is no longer available.");
    }

    const siteMap = new Map(
      ((scopeSitesResponse.data ?? []) as ScopeSiteRow[]).map((site) => [site.id, site.site_name]),
    );
    const legalEntityMap = new Map(
      ((scopeLegalEntitiesResponse.data ?? []) as ScopeLegalEntityRow[]).map((entity) => [entity.id, entity.entity_name]),
    );

    const assignmentsByUser = new Map<string, TeamMemberAssignment[]>();

    ((assignmentsResponse.data ?? []) as TeamAssignmentRow[]).forEach((assignment) => {
      const roleRow = unwrapRoleJoin(assignment.platform_roles);

      if (!roleRow || !isPlatformRole(roleRow.role_name)) {
        return;
      }

      const teamAssignment: TeamMemberAssignment = {
        id: assignment.id,
        roleName: roleRow.role_name,
        roleLabel: toRoleLabel(roleRow.role_name, roleRow.display_name),
        roleCategory: roleRow.role_category,
        isActive: assignment.is_active !== false,
        assignedAt: assignment.assigned_at,
        expiresAt: assignment.expires_at,
        assignedReason: assignment.assigned_reason,
        siteScopeSummary: formatScopeSummary(assignment.scope_site_ids ?? [], siteMap, "sites"),
        legalEntityScopeSummary: formatScopeSummary(
          assignment.scope_legal_entity_ids ?? [],
          legalEntityMap,
          "legal entities",
        ),
        requiresMfa: roleRow.requires_mfa,
        requiresAccreditation: roleRow.requires_accreditation,
      };

      const currentRows = assignmentsByUser.get(assignment.user_id) ?? [];
      currentRows.push(teamAssignment);
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

    const relevantUsers = authUsers
      .filter((authUser) => assignmentsByUser.has(authUser.id))
      .map((authUser) => {
        const assignments = assignmentsByUser.get(authUser.id) ?? [];
        const primaryRole = assignments[0];
        const roleNames = assignments.map((assignment) => assignment.roleName);

        return {
          id: authUser.id,
          email: authUser.email ?? "",
          fullName: authUser.user_metadata?.full_name?.trim() || "-",
          lastSignInAt: authUser.last_sign_in_at ?? null,
          hasVerifiedMfa: latestMfaStatusByUser.get(authUser.id) ?? false,
          accreditationNo: verifierByUser.get(authUser.id) ?? null,
          primaryRoleLabel: primaryRole?.roleLabel ?? "Pending approval",
          assignmentCount: assignments.length,
          activeAssignmentCount: assignments.filter((assignment) => assignment.isActive).length,
          assignments,
          sodAlerts: buildSodAlerts(roleNames),
        } satisfies OrganizationTeamMember;
      })
      .sort((left, right) => left.fullName.localeCompare(right.fullName));

    return {
      data: {
        organizationId,
        organizationName: organizationResponse.data.legal_name ?? "Unnamed organization",
        primaryContactName: organizationResponse.data.primary_contact_name ?? null,
        primaryContactEmail: organizationResponse.data.primary_contact_email ?? null,
        currentRoleNames,
        teamMembers: relevantUsers,
      },
    };
  } catch (error) {
    console.error("Failed to build organization team data:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to load organization team data.",
    };
  }
}
