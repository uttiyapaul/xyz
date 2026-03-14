"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

/**
 * This remains a lightweight platform snapshot until the fuller role-aware
 * admin surface is built. The feature owns the dashboard data loading so the
 * route entry can stay focused on routing only.
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

  useEffect(() => {
    void loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
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
      const activeUsers = new Set(
        roleRows.filter((row) => row.is_active === true).map((row) => row.user_id),
      );
      const pendingUsers = new Set(
        roleRows
          .filter((row) => getRoleName(row.platform_roles) === "pending_approval")
          .map((row) => row.user_id),
      );

      setUserStats({
        total: totalUsers.size,
        active: activeUsers.size,
        pending: pendingUsers.size,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setOrgs([]);
      setOrganizationCount(0);
      setUserStats({ total: 0, active: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: "#9CA3AF" }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#050508" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#FAFAF8", marginBottom: "8px" }}>
          Platform Super Admin
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
          Manage all organizations, users, and platform settings
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>ORGANIZATIONS</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#FAFAF8" }}>{organizationCount}</div>
        </div>

        <div
          style={{
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>TOTAL USERS</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#FAFAF8" }}>{userStats.total}</div>
        </div>

        <div
          style={{
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>ACTIVE USERS</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#10B981" }}>{userStats.active}</div>
        </div>

        <div
          style={{
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>PENDING APPROVAL</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#F59E0B" }}>{userStats.pending}</div>
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#FAFAF8", marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard/organizations"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "#F59E0B",
              color: "#000",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Manage Organizations
          </Link>
          <Link
            href="/dashboard/access-control"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "rgba(245,158,11,0.1)",
              color: "#F59E0B",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Access Control
          </Link>
          <Link
            href="/dashboard/reports"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "rgba(245,158,11,0.1)",
              color: "#F59E0B",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            View Reports
          </Link>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#FAFAF8", marginBottom: "16px" }}>
          Recent Organizations
        </h2>
        <div
          style={{
            background: "#0D0D14",
            border: "1px solid #1A1A24",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {orgs.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9CA3AF" }}>No organizations found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1A1A24" }}>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontWeight: "600",
                    }}
                  >
                    NAME
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontWeight: "600",
                    }}
                  >
                    INDUSTRY
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontWeight: "600",
                    }}
                  >
                    COUNTRY
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "12px",
                      color: "#9CA3AF",
                      fontWeight: "600",
                    }}
                  >
                    CREATED
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} style={{ borderBottom: "1px solid #1A1A24" }}>
                    <td style={{ padding: "16px", color: "#FAFAF8" }}>{org.legal_name}</td>
                    <td style={{ padding: "16px", color: "#9CA3AF" }}>{org.industry_segment_id || "-"}</td>
                    <td style={{ padding: "16px", color: "#9CA3AF" }}>{org.country || "-"}</td>
                    <td style={{ padding: "16px", color: "#9CA3AF" }}>
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
