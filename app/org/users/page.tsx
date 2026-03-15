import { fetchOrganizationTeamData } from "@/features/org/users/actions";
import { OrganizationUsersView } from "@/features/org/users/OrganizationUsersView";
import styles from "@/features/org/users/OrganizationUsersView.module.css";

export const dynamic = "force-dynamic";

/**
 * Route entry for the organization team workspace.
 *
 * The heavy data loading stays in the feature server action so this route
 * remains a thin handoff layer under the App Router contract.
 */
export default async function OrgUsersPage() {
  const result = await fetchOrganizationTeamData();

  if ("error" in result) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Organization Workspace</p>
          <h1 className={styles.title}>Team & User Management</h1>
          <div className={styles.alert} data-tone="warning">
            {result.error}
          </div>
        </div>
      </section>
    );
  }

  return <OrganizationUsersView data={result.data} />;
}
