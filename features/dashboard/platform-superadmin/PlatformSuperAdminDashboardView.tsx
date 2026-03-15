"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import styles from "@/features/dashboard/platform-superadmin/PlatformSuperAdminDashboardView.module.css";
import { supabase } from "@/lib/supabase/client";

/**
 * This remains a lightweight platform snapshot until the fuller role-aware
 * admin surface is built. The view now uses the shared frontend contract:
 * tokenized styling, safe error messaging, and thin route ownership.
 */

interface Organization {
  id: string;
  legal_name: string;
  industry_segment_id: string | null;
  country: string | null;
  created_at: string;
}

interface UserStats {
  total: number;
  active: number;
  pending: number;
}

interface RoleSummaryRow {
  user_id: string;
  is_active: boolean | null;
  platform_roles: { role_name: string } | { role_name: string }[] | null;
}

function getRoleName(platformRole: RoleSummaryRow["platform_roles"]): string | null {
  if (!platformRole) {
    return null;
  }

  return Array.isArray(platformRole) ? platformRole[0]?.role_name ?? null : platformRole.role_name;
}

export function PlatformSuperAdminDashboardView() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [organizationCount, setOrganizationCount] = useState(0);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, active: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoadFailed(false);

      const [recentOrganizationsResponse, organizationCountResponse, roleResponse] = await Promise.all([
        supabase
          .from("client_organizations")
          .select("id, legal_name, industry_segment_id, country, created_at")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("client_organizations").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("user_organization_roles").select("user_id, is_active, platform_roles(role_name)"),
      ]);

      if (recentOrganizationsResponse.error) {
        throw recentOrganizationsResponse.error;
      }

      if (organizationCountResponse.error) {
        throw organizationCountResponse.error;
      }

      if (roleResponse.error) {
        throw roleResponse.error;
      }

      const recentOrganizations = (recentOrganizationsResponse.data ?? []) as Organization[];
      const roleRows = (roleResponse.data ?? []) as RoleSummaryRow[];

      setOrgs(recentOrganizations);
      setOrganizationCount(organizationCountResponse.count ?? recentOrganizations.length);

      const totalUsers = new Set(roleRows.map((row) => row.user_id));
      const activeUsers = new Set(roleRows.filter((row) => row.is_active === true).map((row) => row.user_id));
      const pendingUsers = new Set(
        roleRows.filter((row) => getRoleName(row.platform_roles) === "pending_approval").map((row) => row.user_id),
      );

      setUserStats({
        total: totalUsers.size,
        active: activeUsers.size,
        pending: pendingUsers.size,
      });
    } catch (error) {
      console.error("Platform dashboard load failed:", error);
      setLoadFailed(true);
      setOrgs([]);
      setOrganizationCount(0);
      setUserStats({ total: 0, active: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboardData();
    });
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.alert} data-tone="info">
          Loading platform dashboard...
        </div>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Platform Super Admin</h1>
        <p className={styles.subtitle}>Manage organizations, users, and core platform operating controls.</p>
      </header>

      {loadFailed ? (
        <div className={styles.alert} data-tone="danger">
          Platform summary data could not be loaded right now. Refresh the page or try again shortly.
        </div>
      ) : null}

      <div className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Organizations</p>
          <p className={styles.metricValue}>{organizationCount}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Total Users</p>
          <p className={styles.metricValue}>{userStats.total}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active Users</p>
          <p className={styles.metricValue} data-tone="success">
            {userStats.active}
          </p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pending Approval</p>
          <p className={styles.metricValue} data-tone="warning">
            {userStats.pending}
          </p>
        </article>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionRow}>
          <Link href="/dashboard/organizations" className={styles.primaryLink}>
            Manage Organizations
          </Link>
          <Link href="/dashboard/access-control" className={styles.secondaryLink}>
            Access Control
          </Link>
          <Link href="/dashboard/reports" className={styles.secondaryLink}>
            View Reports
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Organizations</h2>
        <div className={styles.card}>
          {orgs.length === 0 ? (
            <div className={styles.emptyState}>No organizations found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Industry</th>
                  <th className={styles.tableHeaderCell}>Country</th>
                  <th className={styles.tableHeaderCell}>Created</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td className={styles.tableCell}>{org.legal_name}</td>
                    <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>{org.industry_segment_id || "-"}</td>
                    <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>{org.country || "-"}</td>
                    <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>
                      {new Date(org.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  );
}
