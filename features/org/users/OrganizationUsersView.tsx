import styles from "@/features/org/users/OrganizationUsersView.module.css";
import type { OrganizationTeamData } from "@/features/org/users/actions";

function countMembersWithMfa(teamMembers: OrganizationTeamData["teamMembers"]): number {
  return teamMembers.filter((member) => member.hasVerifiedMfa).length;
}

function countScopedAssignments(teamMembers: OrganizationTeamData["teamMembers"]): number {
  return teamMembers.reduce((count, member) => {
    const scopedAssignments = member.assignments.filter(
      (assignment) =>
        assignment.siteScopeSummary !== "All sites" ||
        assignment.legalEntityScopeSummary !== "All legal entities",
    );

    return count + scopedAssignments.length;
  }, 0);
}

function countSodAlerts(teamMembers: OrganizationTeamData["teamMembers"]): number {
  return teamMembers.reduce((count, member) => count + member.sodAlerts.length, 0);
}

/**
 * Organization-scoped team directory.
 *
 * This replaces the old org/users skeleton with a real view of roster posture,
 * assignment scope, MFA state, and SoD warnings inside the active org boundary.
 */
export function OrganizationUsersView({ data }: { data: OrganizationTeamData }) {
  const mfaVerifiedCount = countMembersWithMfa(data.teamMembers);
  const scopedAssignmentCount = countScopedAssignments(data.teamMembers);
  const sodAlertCount = countSodAlerts(data.teamMembers);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Organization Workspace</p>
        <h1 className={styles.title}>Team & User Management</h1>
        <p className={styles.subtitle}>
          Review the active team roster, assignment scope, and security posture for{" "}
          <strong>{data.organizationName}</strong>. This screen stays inside the current organization boundary and keeps
          separation-of-duties warnings visible instead of hidden in role metadata.
        </p>
      </header>

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Team Members</p>
          <p className={styles.metricValue}>{data.teamMembers.length}</p>
          <p className={styles.metricHint}>Users with at least one assignment in the active organization.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>MFA Verified</p>
          <p className={styles.metricValue}>{mfaVerifiedCount}</p>
          <p className={styles.metricHint}>Current active-session MFA status visible in the team roster.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Scoped Assignments</p>
          <p className={styles.metricValue}>{scopedAssignmentCount}</p>
          <p className={styles.metricHint}>Assignments constrained to specific sites or legal entities.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>SoD Alerts</p>
          <p className={styles.metricValue}>{sodAlertCount}</p>
          <p className={styles.metricHint}>Warnings where role combinations deserve immediate review.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Guardrails</h2>
            <p className={styles.cardText}>
              Organization user management must stay within the active tenant, preserve SoD boundaries, and keep MFA or
              accreditation requirements visible before any assignment change is approved.
            </p>
            <div className={styles.alert} data-tone="info">
              Current roles in session: {data.currentRoleNames.join(", ")}.
            </div>
            <div className={styles.alert} data-tone="warning">
              Reviewer, approver, DPO, and verifier independence warnings shown here are compliance checks, not cosmetic hints.
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Organization Contacts</h2>
            <div className={styles.contactList}>
              <div>
                <div className={styles.contactLabel}>Primary contact</div>
                <div className={styles.contactValue}>{data.primaryContactName ?? "Not configured"}</div>
              </div>
              <div>
                <div className={styles.contactLabel}>Contact email</div>
                <div className={styles.contactValue}>{data.primaryContactEmail ?? "Not configured"}</div>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Active Team Directory</h2>

          {data.teamMembers.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No assigned users found</h3>
              <p>This organization does not have active user assignments visible to the current session.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>User</th>
                    <th className={styles.tableHeaderCell}>Primary Role</th>
                    <th className={styles.tableHeaderCell}>Security</th>
                    <th className={styles.tableHeaderCell}>Assignments</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td className={styles.tableCell}>
                        <div className={styles.nameCell}>
                          <span className={styles.name}>{member.fullName}</span>
                          <span className={styles.email}>{member.email || "No email visible"}</span>
                          <span className={styles.email}>
                            Last sign-in: {member.lastSignInAt ? new Date(member.lastSignInAt).toLocaleString("en-IN") : "Never"}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.stackedBadges}>
                          <span className={styles.badge} data-tone="info">
                            {member.primaryRoleLabel}
                          </span>
                          <span className={styles.badge} data-tone="warning">
                            {member.assignmentCount} assignment(s)
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.stackedBadges}>
                          <span className={styles.badge} data-tone={member.hasVerifiedMfa ? "success" : "warning"}>
                            {member.hasVerifiedMfa ? "MFA verified" : "MFA pending"}
                          </span>
                          {member.accreditationNo ? (
                            <span className={styles.badge} data-tone="info">
                              Accreditation ready
                            </span>
                          ) : null}
                        </div>

                        {member.sodAlerts.length > 0 ? (
                          <div className={styles.sodList}>
                            {member.sodAlerts.map((alert) => (
                              <div key={alert} className={styles.alert} data-tone="warning">
                                {alert}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.assignmentList}>
                          {member.assignments.map((assignment) => (
                            <article key={assignment.id} className={styles.assignmentItem}>
                              <p className={styles.assignmentTitle}>{assignment.roleLabel}</p>
                              <p className={styles.assignmentMeta}>
                                Site scope: {assignment.siteScopeSummary}
                                <br />
                                Legal entities: {assignment.legalEntityScopeSummary}
                                <br />
                                Assigned: {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString("en-IN") : "Unknown"}
                                {assignment.expiresAt
                                  ? ` | Expires ${new Date(assignment.expiresAt).toLocaleDateString("en-IN")}`
                                  : " | No expiry set"}
                                <br />
                                Reason: {assignment.assignedReason?.trim() || "Not recorded"}
                              </p>
                            </article>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
