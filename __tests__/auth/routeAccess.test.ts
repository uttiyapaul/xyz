/**
 * __tests__/auth/routeAccess.test.ts
 *
 * Focused coverage for the frontend route-access contract.
 * These tests protect the shared matrix used by both the request proxy and the
 * sidebar so future refactors do not silently reopen or hide routes.
 */

import {
  canAnyRoleAccessPath,
  canRoleAccessPath,
  getRouteAccessRule,
} from "@/lib/auth/routeAccess";
import type { PlatformRole } from "@/lib/auth/roles";

describe("route access matrix", () => {
  it("prefers the most specific dashboard rule before the generic dashboard fallback", () => {
    expect(getRouteAccessRule("/dashboard/platform-superadmin")?.prefix).toBe(
      "/dashboard/platform-superadmin",
    );
  });

  it("allows platform control roles to bypass route-specific workspace fences", () => {
    expect(canRoleAccessPath("platform_superadmin", "/admin/logs")).toBe(true);
    expect(canRoleAccessPath("platform_admin", "/consulting/portfolio")).toBe(true);
  });

  it("keeps client admins inside organization management and out of platform admin routes", () => {
    expect(canRoleAccessPath("client_admin", "/org/users")).toBe(true);
    expect(canRoleAccessPath("client_admin", "/admin/logs")).toBe(false);
  });

  it("treats api key managers as integration operators rather than org administrators", () => {
    expect(canRoleAccessPath("api_key_manager", "/org/integrations")).toBe(true);
    expect(canRoleAccessPath("api_key_manager", "/org/users")).toBe(false);
  });

  it("blocks non-interactive roles from live workspaces while keeping the dashboard notice reachable", () => {
    expect(canRoleAccessPath("board_report_recipient", "/dashboard")).toBe(true);
    expect(canRoleAccessPath("board_report_recipient", "/finance/reports")).toBe(false);
  });

  it("keeps lifecycle roles on the dashboard notice instead of operational tools", () => {
    expect(canRoleAccessPath("pending_approval", "/dashboard")).toBe(true);
    expect(canRoleAccessPath("pending_approval", "/data/upload")).toBe(false);
  });

  it("allows any granted role on a multi-role account to unlock a route", () => {
    const roles: PlatformRole[] = ["api_key_manager", "client_admin"];

    expect(canAnyRoleAccessPath(roles, "/org/users")).toBe(true);
  });

  it("keeps dashboard activity entry limited to scoped data-entry roles", () => {
    expect(canRoleAccessPath("data_entry_operator", "/dashboard/activity")).toBe(true);
    expect(canRoleAccessPath("data_approver", "/dashboard/activity")).toBe(false);
    expect(canRoleAccessPath("executive_viewer", "/dashboard/activity")).toBe(false);
  });

  it("allows annual emissions reports to strategy and advisory roles but not raw supplier-facing roles", () => {
    expect(canRoleAccessPath("consultant_lead", "/dashboard/reports")).toBe(true);
    expect(canRoleAccessPath("sustainability_head", "/dashboard/reports")).toBe(true);
    expect(canRoleAccessPath("supply_chain_reporter", "/dashboard/reports")).toBe(false);
  });

  it("keeps governance routes fenced to governance roles while still letting platform admins inspect them", () => {
    expect(canRoleAccessPath("dpo", "/governance/privacy")).toBe(true);
    expect(canRoleAccessPath("grievance_officer", "/governance/privacy")).toBe(false);
    expect(canRoleAccessPath("grievance_officer", "/governance/grievances")).toBe(true);
    expect(canRoleAccessPath("platform_admin", "/governance/privacy")).toBe(true);
    expect(canRoleAccessPath("client_admin", "/governance/grievances")).toBe(false);
  });
});
