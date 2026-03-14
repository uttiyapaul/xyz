"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  buildDefaultExpiryValue,
  formatDateTimeLocal,
  getAssignmentConflicts,
  getAssignableRoles,
  getEffectiveAssignments,
  getRoleHolderCount,
  hasReachedMaxConcurrentAssignments,
  roleRequiresMfa,
} from "@/lib/auth/assignmentRules";
import { saveUserAssignment } from "@/features/admin/users/actions";
import styles from "@/features/admin/users/UsersManagement.module.css";
import type {
  AssignmentDraft,
  CurrentAdminContext,
  ManagedLegalEntity,
  ManagedMfaRule,
  ManagedOrganization,
  ManagedRole,
  ManagedSite,
  ManagedUserAssignment,
  ManagedUserRow,
} from "@/features/admin/users/types";

interface UsersClientProps {
  users: ManagedUserRow[];
  organizations: ManagedOrganization[];
  roles: ManagedRole[];
  sites: ManagedSite[];
  legalEntities: ManagedLegalEntity[];
  mfaRules: ManagedMfaRule[];
  currentAdmin: CurrentAdminContext;
}

const EMPTY_DRAFT: AssignmentDraft = {
  organizationId: "",
  roleId: "",
  assignedReason: "",
  expiresAt: "",
  scopeSiteIds: [],
  scopeLegalEntityIds: [],
  mfaVerified: false,
  accreditationVerified: false,
  confirmationChecked: false,
};

function getStatusLabel(user: ManagedUserRow): "pending" | "active" | "inactive" {
  if (user.role === "pending_approval") {
    return "pending";
  }

  return user.is_active ? "active" : "inactive";
}

function getRoleLabel(role: ManagedRole | ManagedUserAssignment | null): string {
  if (!role) {
    return "Pending approval";
  }

  return role.display_name?.trim() || role.role_name.replace(/_/g, " ");
}

function buildInitialDraft(
  user: ManagedUserRow,
  organizations: readonly ManagedOrganization[],
  currentAdmin: CurrentAdminContext,
): AssignmentDraft {
  const primaryAssignment = getEffectiveAssignments(user.assignments)[0] ?? user.assignments[0] ?? null;
  const defaultOrganizationId =
    primaryAssignment?.organization_id ??
    currentAdmin.primaryOrgId ??
    (organizations.length === 1 ? organizations[0].id : "");

  return {
    organizationId: defaultOrganizationId,
    roleId: primaryAssignment?.role_id ?? "",
    assignedReason: primaryAssignment?.assigned_reason ?? "",
    expiresAt: formatDateTimeLocal(primaryAssignment?.expires_at ?? ""),
    scopeSiteIds: primaryAssignment?.scope_site_ids ?? [],
    scopeLegalEntityIds: primaryAssignment?.scope_legal_entity_ids ?? [],
    mfaVerified: Boolean(primaryAssignment?.mfa_verified_at) || user.has_verified_mfa,
    accreditationVerified:
      Boolean(primaryAssignment?.accreditation_verified_at) ||
      Boolean(user.verifier_accreditation_no),
    confirmationChecked: false,
  };
}

function formatScopeSummary(scopedIds: readonly string[]): string {
  return scopedIds.length === 0 ? "All in scope" : `${scopedIds.length} selected`;
}

/**
 * Feature-owned user-management client.
 *
 * This component intentionally keeps the table, assignment modal, and local
 * wizard state together because the admin needs to compare existing assignments
 * against the pending mutation while they make decisions. The actual access
 * rules still live in the shared helper + server action layers so this file
 * stays focused on rendering and form state.
 */
export function UsersClient({
  users,
  organizations,
  roles,
  sites,
  legalEntities,
  mfaRules,
  currentAdmin,
}: UsersClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [selectedUser, setSelectedUser] = useState<ManagedUserRow | null>(null);
  const [draft, setDraft] = useState<AssignmentDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const pendingCount = useMemo(
    () => users.filter((user) => user.role === "pending_approval").length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeTab === "pending") {
        return user.role === "pending_approval";
      }

      return user.role !== "pending_approval";
    });
  }, [activeTab, users]);

  const allAssignments = useMemo(
    () => users.flatMap((user) => user.assignments),
    [users],
  );

  const assignableRoles = useMemo(
    () => getAssignableRoles(roles, currentAdmin.minTierRank),
    [currentAdmin.minTierRank, roles],
  );

  const selectedRole = useMemo(
    () => assignableRoles.find((role) => role.id === draft.roleId) ?? null,
    [assignableRoles, draft.roleId],
  );

  const visibleSites = useMemo(() => {
    const orgSites = sites.filter((site) => site.organization_id === draft.organizationId);

    if (currentAdmin.siteScopeIds.length === 0) {
      return orgSites;
    }

    return orgSites.filter((site) => currentAdmin.siteScopeIds.includes(site.id));
  }, [currentAdmin.siteScopeIds, draft.organizationId, sites]);

  const visibleLegalEntities = useMemo(() => {
    const orgEntities = legalEntities.filter(
      (entity) => entity.organization_id === draft.organizationId,
    );

    if (currentAdmin.legalEntityScopeIds.length === 0) {
      return orgEntities;
    }

    return orgEntities.filter((entity) =>
      currentAdmin.legalEntityScopeIds.includes(entity.id),
    );
  }, [currentAdmin.legalEntityScopeIds, draft.organizationId, legalEntities]);

  const effectiveAssignments = useMemo(
    () => (selectedUser ? getEffectiveAssignments(selectedUser.assignments) : []),
    [selectedUser],
  );

  const roleConflicts = useMemo(() => {
    if (!selectedUser || !selectedRole || !draft.organizationId) {
      return [];
    }

    return getAssignmentConflicts(
      selectedRole.role_name,
      draft.organizationId,
      selectedUser.assignments,
    );
  }, [draft.organizationId, selectedRole, selectedUser]);

  const selectedRoleRequiresMfa = useMemo(() => {
    if (!selectedRole) {
      return false;
    }

    return roleRequiresMfa(selectedRole, mfaRules);
  }, [mfaRules, selectedRole]);

  const selectedRoleHolderCount = useMemo(() => {
    if (!selectedRole) {
      return 0;
    }

    return getRoleHolderCount(selectedRole.id, allAssignments);
  }, [allAssignments, selectedRole]);

  const maxConcurrentReached = useMemo(() => {
    if (!selectedRole || !selectedUser) {
      return false;
    }

    return hasReachedMaxConcurrentAssignments(selectedRole, allAssignments, selectedUser.id);
  }, [allAssignments, selectedRole, selectedUser]);

  useEffect(() => {
    const visibleSiteIds = new Set(visibleSites.map((site) => site.id));
    const visibleLegalEntityIds = new Set(visibleLegalEntities.map((entity) => entity.id));

    setDraft((currentDraft) => {
      const nextSiteIds = currentDraft.scopeSiteIds.filter((id) => visibleSiteIds.has(id));
      const nextLegalEntityIds = currentDraft.scopeLegalEntityIds.filter((id) =>
        visibleLegalEntityIds.has(id),
      );

      if (
        nextSiteIds.length === currentDraft.scopeSiteIds.length &&
        nextLegalEntityIds.length === currentDraft.scopeLegalEntityIds.length
      ) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        scopeSiteIds: nextSiteIds,
        scopeLegalEntityIds: nextLegalEntityIds,
      };
    });
  }, [visibleLegalEntities, visibleSites]);

  useEffect(() => {
    if (!selectedRole || draft.expiresAt || !selectedRole.expiry_days) {
      return;
    }

    setDraft((currentDraft) => {
      if (currentDraft.roleId !== selectedRole.id || currentDraft.expiresAt) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        expiresAt: buildDefaultExpiryValue(selectedRole.expiry_days),
      };
    });
  }, [draft.expiresAt, selectedRole]);

  useEffect(() => {
    if (!selectedRole || !selectedUser) {
      return;
    }

    setDraft((currentDraft) => {
      const nextDraft = { ...currentDraft };
      let changed = false;

      if (selectedRoleRequiresMfa && selectedUser.has_verified_mfa && !currentDraft.mfaVerified) {
        nextDraft.mfaVerified = true;
        changed = true;
      }

      if (
        selectedRole.requires_accreditation &&
        selectedUser.verifier_accreditation_no &&
        !currentDraft.accreditationVerified
      ) {
        nextDraft.accreditationVerified = true;
        changed = true;
      }

      return changed ? nextDraft : currentDraft;
    });
  }, [selectedRole, selectedRoleRequiresMfa, selectedUser]);

  function updateDraft<K extends keyof AssignmentDraft>(key: K, value: AssignmentDraft[K]) {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  }

  function toggleScopeValue(
    field: "scopeSiteIds" | "scopeLegalEntityIds",
    value: string,
  ) {
    setDraft((currentDraft) => {
      const currentValues = currentDraft[field];
      const exists = currentValues.includes(value);

      return {
        ...currentDraft,
        [field]: exists
          ? currentValues.filter((entry) => entry !== value)
          : [...currentValues, value],
      };
    });
  }

  function openWizard(user: ManagedUserRow) {
    setSelectedUser(user);
    setDraft(buildInitialDraft(user, organizations, currentAdmin));
    setError(null);
  }

  function closeWizard() {
    setSelectedUser(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  async function handleSave() {
    if (!selectedUser || !selectedRole) {
      setError("Select a user and role before saving.");
      return;
    }

    if (!draft.organizationId) {
      setError("Choose an organization before saving the assignment.");
      return;
    }

    if (!draft.assignedReason.trim()) {
      setError("Assignment reason is required so the next auditor understands why access was granted.");
      return;
    }

    if (roleConflicts.length > 0) {
      setError(`${roleConflicts[0].message} (${roleConflicts[0].frameworkReference})`);
      return;
    }

    if (selectedRoleRequiresMfa && !draft.mfaVerified) {
      setError("This role requires MFA confirmation before it can be assigned.");
      return;
    }

    if (selectedRole.requires_accreditation && !draft.accreditationVerified) {
      setError("This role requires verifier accreditation confirmation before saving.");
      return;
    }

    if (maxConcurrentReached) {
      setError(
        `${getRoleLabel(selectedRole)} is already at its maximum concurrent assignment limit.`,
      );
      return;
    }

    if (!draft.confirmationChecked) {
      setError("Confirm the access-policy review before saving the assignment.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const response = await saveUserAssignment({
      userId: selectedUser.id,
      organizationId: draft.organizationId,
      roleId: draft.roleId,
      assignedReason: draft.assignedReason,
      expiresAt: draft.expiresAt || null,
      scopeSiteIds: draft.scopeSiteIds,
      scopeLegalEntityIds: draft.scopeLegalEntityIds,
      mfaVerified: draft.mfaVerified,
      accreditationVerified: draft.accreditationVerified,
      confirmationChecked: draft.confirmationChecked,
    });

    setIsSaving(false);

    if ("error" in response) {
      setError(response.error);
      return;
    }

    closeWizard();
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <>
      {(currentAdmin.siteScopeIds.length > 0 || currentAdmin.legalEntityScopeIds.length > 0) && (
        <div className={styles.infoBanner}>
          <div className={styles.bannerTitle}>Scoped assignment mode</div>
          <div className={styles.hintText}>
            The picker options below are restricted to your current scope so you cannot grant
            access beyond the sites or legal entities already available to you.
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "active" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active users
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "pending" ? styles.tabButtonActive : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending leads
          {pendingCount > 0 && <span className={styles.tabBadge}>{pendingCount}</span>}
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                {[
                  "User",
                  "Organization",
                  "Current role",
                  "Status",
                  "Joined",
                  "Security",
                  "Actions",
                ].map((header) => (
                  <th key={header} className={styles.tableHeadCell}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No users found for this tab.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const status = getStatusLabel(user);

                  return (
                    <tr
                      key={user.id}
                      className={`${styles.tableRow} ${
                        index % 2 === 1 ? styles.tableRowAlt : ""
                      }`}
                    >
                      <td className={styles.tableCell}>
                        <div className={styles.userName}>{user.full_name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div>{user.org_name}</div>
                        <div className={styles.secondaryText}>
                          {user.assignments.length > 1
                            ? `${user.assignments.length} assignments on record`
                            : "Single assignment on record"}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.roleChip}>{user.role_display_name}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <span
                          className={`${styles.statusChip} ${
                            status === "pending"
                              ? styles.statusPending
                              : status === "active"
                                ? styles.statusActive
                                : styles.statusInactive
                          }`}
                        >
                          {status === "pending"
                            ? "Pending review"
                            : status === "active"
                              ? "Active"
                              : "Inactive"}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.monoText}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className={styles.secondaryText}>
                          Last sign-in:{" "}
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : "Never"}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.assignmentList}>
                          <span className={styles.detailChip}>
                            MFA {user.has_verified_mfa ? "verified" : "not seen"}
                          </span>
                          <span className={styles.detailChip}>
                            Accred. {user.verifier_accreditation_no ? "on file" : "none"}
                          </span>
                        </div>
                      </td>
                      <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                        <button
                          type="button"
                          className={
                            user.role === "pending_approval"
                              ? styles.buttonPrimary
                              : styles.buttonGhost
                          }
                          onClick={() => openWizard(user)}
                        >
                          {user.role === "pending_approval" ? "Review lead" : "Review assignment"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className={styles.modalBackdrop} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-role-title"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <h2 id="assign-role-title" className={styles.modalTitle}>
                  Assignment review for {selectedUser.full_name}
                </h2>
                <p className={styles.modalDescription}>
                  Capture the assignment reason, scope, and security confirmations now so the
                  next admin or auditor can understand exactly why this access exists.
                </p>
              </div>
              <button type="button" className={styles.buttonSecondary} onClick={closeWizard}>
                Close
              </button>
            </div>

            <div className={styles.modalBody}>
              {error && (
                <div className={styles.errorBanner}>
                  <div className={styles.bannerTitle}>Assignment blocked</div>
                  <div className={styles.hintText}>{error}</div>
                </div>
              )}

              <div className={styles.wizardGrid}>
                <div className={styles.wizardMain}>
                  <section className={styles.wizardSection}>
                    <div className={styles.wizardSectionHeader}>
                      <h3 className={styles.wizardSectionTitle}>1. User context</h3>
                      <p className={styles.wizardSectionDescription}>
                        Existing effective assignments are surfaced first so SoD conflicts can be
                        caught before we write anything to the database.
                      </p>
                    </div>
                    <div className={styles.assignmentList}>
                      {effectiveAssignments.length === 0 ? (
                        <span className={styles.detailChip}>No active assignments yet</span>
                      ) : (
                        effectiveAssignments.map((assignment) => (
                          <div key={assignment.id} className={styles.assignmentCard}>
                            <div className={styles.assignmentCardTitle}>
                              {getRoleLabel(assignment)}
                            </div>
                            <div className={styles.assignmentCardMeta}>
                              {assignment.organization_name ?? "Global assignment"}
                            </div>
                            <div className={styles.assignmentCardMeta}>
                              Scope: sites {formatScopeSummary(assignment.scope_site_ids)}, legal
                              entities {formatScopeSummary(assignment.scope_legal_entity_ids)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className={styles.wizardSection}>
                    <div className={styles.wizardSectionHeader}>
                      <h3 className={styles.wizardSectionTitle}>2. Role and organization</h3>
                      <p className={styles.wizardSectionDescription}>
                        Roles are filtered by your own tier rank, so this picker only shows roles
                        you are allowed to assign.
                      </p>
                    </div>
                    <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
                      <label className={styles.field}>
                        <span className={styles.label}>Organization</span>
                        <select
                          className={styles.control}
                          value={draft.organizationId}
                          onChange={(event) => updateDraft("organizationId", event.target.value)}
                        >
                          <option value="">Select an organization</option>
                          {organizations.map((organization) => (
                            <option key={organization.id} value={organization.id}>
                              {organization.legal_name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span className={styles.label}>Role</span>
                        <select
                          className={styles.control}
                          value={draft.roleId}
                          onChange={(event) => updateDraft("roleId", event.target.value)}
                        >
                          <option value="">Select a role</option>
                          {assignableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {getRoleLabel(role)} | Tier {role.tier_rank}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className={styles.field}>
                      <span className={styles.label}>Assignment reason</span>
                      <textarea
                        className={styles.textarea}
                        value={draft.assignedReason}
                        onChange={(event) => updateDraft("assignedReason", event.target.value)}
                        placeholder="Explain why this user needs this role, what decision or business need drove it, and any audit context worth preserving."
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>Expiry</span>
                      <input
                        className={styles.control}
                        type="datetime-local"
                        value={draft.expiresAt}
                        onChange={(event) => updateDraft("expiresAt", event.target.value)}
                      />
                    </label>
                  </section>

                  <section className={styles.wizardSection}>
                    <div className={styles.wizardSectionHeader}>
                      <h3 className={styles.wizardSectionTitle}>3. Scope configuration</h3>
                      <p className={styles.wizardSectionDescription}>
                        Leave a scope list empty to keep it organization-wide. Pick specific sites
                        or legal entities only when the assignment should be constrained.
                      </p>
                    </div>
                    <div className={styles.scopeGroup}>
                      <div className={styles.scopeHeader}>
                        <h4 className={styles.scopeTitle}>Site scope</h4>
                        <span className={styles.scopeHint}>
                          {draft.scopeSiteIds.length === 0
                            ? "Empty means all allowed sites"
                            : `${draft.scopeSiteIds.length} site(s) selected`}
                        </span>
                      </div>
                      <div className={styles.scopeList}>
                        {visibleSites.length === 0 ? (
                          <div className={styles.hintText}>
                            No active sites are available for the selected organization and your
                            current scope.
                          </div>
                        ) : (
                          visibleSites.map((site) => (
                            <label key={site.id} className={styles.scopeOption}>
                              <input
                                className={styles.checkbox}
                                type="checkbox"
                                checked={draft.scopeSiteIds.includes(site.id)}
                                onChange={() => toggleScopeValue("scopeSiteIds", site.id)}
                              />
                              <span className={styles.scopeOptionBody}>
                                <span className={styles.scopeOptionTitle}>{site.site_name}</span>
                                <span className={styles.scopeOptionMeta}>
                                  {site.city}
                                  {site.site_code ? ` | ${site.site_code}` : ""}
                                </span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <div className={styles.scopeGroup}>
                      <div className={styles.scopeHeader}>
                        <h4 className={styles.scopeTitle}>Legal-entity scope</h4>
                        <span className={styles.scopeHint}>
                          {draft.scopeLegalEntityIds.length === 0
                            ? "Empty means all allowed legal entities"
                            : `${draft.scopeLegalEntityIds.length} entity(ies) selected`}
                        </span>
                      </div>
                      <div className={styles.scopeList}>
                        {visibleLegalEntities.length === 0 ? (
                          <div className={styles.hintText}>
                            No active legal entities are available for the selected organization
                            and your current scope.
                          </div>
                        ) : (
                          visibleLegalEntities.map((entity) => (
                            <label key={entity.id} className={styles.scopeOption}>
                              <input
                                className={styles.checkbox}
                                type="checkbox"
                                checked={draft.scopeLegalEntityIds.includes(entity.id)}
                                onChange={() =>
                                  toggleScopeValue("scopeLegalEntityIds", entity.id)
                                }
                              />
                              <span className={styles.scopeOptionBody}>
                                <span className={styles.scopeOptionTitle}>
                                  {entity.entity_name}
                                </span>
                                <span className={styles.scopeOptionMeta}>
                                  {entity.cin ? `CIN ${entity.cin}` : "No CIN on file"}
                                </span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                <div className={styles.wizardSide}>
                  <section className={styles.wizardSection}>
                    <div className={styles.wizardSectionHeader}>
                      <h3 className={styles.wizardSectionTitle}>4. Security checks</h3>
                      <p className={styles.wizardSectionDescription}>
                        These confirmations write the DB-backed evidence fields that the role
                        architecture requires.
                      </p>
                    </div>
                    <div className={styles.detailsStack}>
                      {selectedRole && (
                        <>
                          <div className={styles.detailList}>
                            <span className={styles.detailChip}>Tier {selectedRole.tier_rank}</span>
                            <span className={styles.detailChip}>
                              Holders {selectedRoleHolderCount}
                              {selectedRole.max_concurrent_assignments != null
                                ? ` / ${selectedRole.max_concurrent_assignments}`
                                : ""}
                            </span>
                            <span className={styles.detailChip}>
                              {selectedRoleRequiresMfa ? "MFA required" : "MFA optional"}
                            </span>
                            <span className={styles.detailChip}>
                              {selectedRole.requires_accreditation
                                ? "Accreditation required"
                                : "No accreditation gate"}
                            </span>
                          </div>
                          {selectedRole.description && (
                            <div className={styles.hintText}>{selectedRole.description}</div>
                          )}
                        </>
                      )}

                      {maxConcurrentReached && (
                        <div className={styles.warningBanner}>
                          <div className={styles.bannerTitle}>Role capacity warning</div>
                          <div className={styles.hintText}>
                            This role is already at its configured concurrent holder limit. The
                            save action will be blocked unless you are updating an existing holder.
                          </div>
                        </div>
                      )}
                    </div>

                    <label className={styles.checkboxRow}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={draft.mfaVerified}
                        onChange={(event) => updateDraft("mfaVerified", event.target.checked)}
                        disabled={!selectedRoleRequiresMfa}
                      />
                      <span className={styles.checkboxBody}>
                        <span className={styles.checkboxTitle}>
                          MFA confirmation {selectedRoleRequiresMfa ? "required" : "not required"}
                        </span>
                        <span className={styles.checkboxDescription}>
                          {selectedRoleRequiresMfa
                            ? selectedUser.has_verified_mfa
                              ? "The user has an MFA-verified session on record. Keep this checked unless that evidence is no longer valid."
                              : "Confirm the user's MFA setup before saving. The assignment action writes mfa_verified_at when this is checked."
                            : "This role does not require an MFA confirmation for assignment."}
                        </span>
                      </span>
                    </label>

                    <label className={styles.checkboxRow}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={draft.accreditationVerified}
                        onChange={(event) =>
                          updateDraft("accreditationVerified", event.target.checked)
                        }
                        disabled={!selectedRole?.requires_accreditation}
                      />
                      <span className={styles.checkboxBody}>
                        <span className={styles.checkboxTitle}>
                          Accreditation confirmation{" "}
                          {selectedRole?.requires_accreditation ? "required" : "not required"}
                        </span>
                        <span className={styles.checkboxDescription}>
                          {selectedRole?.requires_accreditation
                            ? selectedUser.verifier_accreditation_no
                              ? `Verifier record found: ${selectedUser.verifier_accreditation_no}. Keep this checked only after confirming it is still valid.`
                              : "No verifier accreditation record is on file for this user yet. The server action will block the save until one exists."
                            : "This role does not require verifier accreditation evidence."}
                        </span>
                      </span>
                    </label>

                    <label className={styles.checkboxRow}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={draft.confirmationChecked}
                        onChange={(event) =>
                          updateDraft("confirmationChecked", event.target.checked)
                        }
                      />
                      <span className={styles.checkboxBody}>
                        <span className={styles.checkboxTitle}>Policy confirmation</span>
                        <span className={styles.checkboxDescription}>
                          I confirm this assignment complies with organizational access policy and
                          the applicable SoD rules for this role.
                        </span>
                      </span>
                    </label>
                  </section>

                  <section className={styles.wizardSection}>
                    <div className={styles.wizardSectionHeader}>
                      <h3 className={styles.wizardSectionTitle}>5. SoD and review summary</h3>
                      <p className={styles.wizardSectionDescription}>
                        The UI surfaces conflicts before submit, and the server action repeats the
                        same checks so the database is never relying on the UI alone.
                      </p>
                    </div>
                    {roleConflicts.length === 0 ? (
                      <div className={styles.infoBanner}>
                        <div className={styles.bannerTitle}>No visible SoD conflict</div>
                        <div className={styles.hintText}>
                          The selected role does not currently conflict with the user&apos;s active
                          assignments in this organization.
                        </div>
                      </div>
                    ) : (
                      <div className={styles.conflictList}>
                        {roleConflicts.map((conflict) => (
                          <div
                            key={`${conflict.code}-${conflict.conflictingRole}`}
                            className={styles.conflictCard}
                          >
                            <div className={styles.conflictTitle}>
                              Conflict with {conflict.conflictingRole}
                            </div>
                            <div className={styles.conflictMeta}>{conflict.message}</div>
                            <div className={styles.conflictMeta}>
                              Framework: {conflict.frameworkReference}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedRole && (
                      <div className={styles.detailsStack}>
                        <div className={styles.detailList}>
                          <span className={styles.detailChip}>
                            Role: {getRoleLabel(selectedRole)}
                          </span>
                          <span className={styles.detailChip}>
                            Scope: {formatScopeSummary(draft.scopeSiteIds)} /{" "}
                            {formatScopeSummary(draft.scopeLegalEntityIds)}
                          </span>
                        </div>
                        <div className={styles.hintText}>
                          Saving now will write assigned_reason, expires_at, scope_site_ids,
                          scope_legal_entity_ids, and the verification timestamps required by this
                          role.
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={closeWizard}
                disabled={isSaving || isRefreshing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={handleSave}
                disabled={isSaving || isRefreshing}
              >
                {isSaving ? "Saving assignment..." : "Save assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
