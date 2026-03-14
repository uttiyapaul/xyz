import { UsersClient } from "@/features/admin/users/UsersClient";
import { fetchUserManagementData } from "@/features/admin/users/actions";
import styles from "@/features/admin/users/UsersManagement.module.css";

export const dynamic = "force-dynamic";

/**
 * Route entry only.
 *
 * The heavy lifting for assignment data now lives in the feature action layer
 * so this page can stay thin and follow the app/route contract.
 */
export default async function ManageUsersPage() {
  const result = await fetchUserManagementData();

  if ("error" in result) {
    return (
      <section className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manage users and assignments</h1>
          <p className={styles.pageDescription}>
            Review pending registrations, maintain organization assignments, and keep SoD evidence
            aligned with the live role model.
          </p>
        </header>
        <div className={styles.errorBanner}>
          <div className={styles.bannerTitle}>User management data failed to load</div>
          <div className={styles.hintText}>{result.error}</div>
        </div>
      </section>
    );
  }

  const { users, organizations, roles, sites, legalEntities, mfaRules, currentAdmin } = result.data;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manage users and assignments</h1>
        <p className={styles.pageDescription}>
          Review pending registrations, manage active role assignments, and capture the scope,
          expiry, and verification evidence required by the updated role architecture.
        </p>
        <div className={styles.pageMeta}>
          <span className={styles.metaPill}>{users.length} user(s)</span>
          <span className={styles.metaPill}>{roles.length} assignable role(s)</span>
          <span className={styles.metaPill}>
            Admin tier {currentAdmin.minTierRank ?? "unresolved"}
          </span>
        </div>
      </header>

      <UsersClient
        users={users}
        organizations={organizations}
        roles={roles}
        sites={sites}
        legalEntities={legalEntities}
        mfaRules={mfaRules}
        currentAdmin={currentAdmin}
      />
    </section>
  );
}
