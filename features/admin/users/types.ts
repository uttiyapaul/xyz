import type {
  AssignmentMfaRule,
  AssignmentRecord,
  AssignmentRoleDefinition,
} from "@/lib/auth/assignmentRules";
import type { PlatformRole } from "@/lib/auth/roles";

export interface ManagedUserAssignment extends AssignmentRecord {
  organization_name: string | null;
}

export interface ManagedUserRow {
  id: string;
  email: string;
  full_name: string;
  last_sign_in_at: string | null;
  created_at: string;
  role: PlatformRole;
  role_display_name: string;
  org_name: string;
  is_active: boolean;
  has_verified_mfa: boolean;
  verifier_accreditation_no: string | null;
  assignments: ManagedUserAssignment[];
}

export interface ManagedOrganization {
  id: string;
  legal_name: string;
}

export interface ManagedSite {
  id: string;
  organization_id: string;
  legal_entity_id: string | null;
  site_name: string;
  site_code: string | null;
  city: string;
}

export interface ManagedLegalEntity {
  id: string;
  organization_id: string;
  entity_name: string;
  cin: string | null;
}

export interface ManagedRole extends AssignmentRoleDefinition {}

export interface ManagedMfaRule extends AssignmentMfaRule {}

export interface CurrentAdminContext {
  userId: string;
  roleNames: PlatformRole[];
  minTierRank: number | null;
  primaryOrgId: string | null;
  siteScopeIds: string[];
  legalEntityScopeIds: string[];
}

export interface UserManagementPageData {
  users: ManagedUserRow[];
  organizations: ManagedOrganization[];
  roles: ManagedRole[];
  sites: ManagedSite[];
  legalEntities: ManagedLegalEntity[];
  mfaRules: ManagedMfaRule[];
  currentAdmin: CurrentAdminContext;
}

export interface SaveUserAssignmentInput {
  userId: string;
  organizationId: string;
  roleId: string;
  assignedReason: string;
  expiresAt: string | null;
  scopeSiteIds: string[];
  scopeLegalEntityIds: string[];
  mfaVerified: boolean;
  accreditationVerified: boolean;
  confirmationChecked: boolean;
}

export interface AssignmentDraft {
  organizationId: string;
  roleId: string;
  assignedReason: string;
  expiresAt: string;
  scopeSiteIds: string[];
  scopeLegalEntityIds: string[];
  mfaVerified: boolean;
  accreditationVerified: boolean;
  confirmationChecked: boolean;
}
