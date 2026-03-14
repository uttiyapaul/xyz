"use client";

import { useEffect, useState } from "react";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CarbonAccountantDashboard } from "@/components/dashboard/roles/CarbonAccountantDashboard";
import { ClientAdminDashboard } from "@/components/dashboard/roles/ClientAdminDashboard";
import { ConsultantDashboard } from "@/components/dashboard/roles/ConsultantDashboard";
import { DataEntryDashboard } from "@/components/dashboard/roles/DataEntryDashboard";
import { ExecutiveDashboard } from "@/components/dashboard/roles/ExecutiveDashboard";
import { PlatformAdminDashboard } from "@/components/dashboard/roles/PlatformAdminDashboard";
import { SustainabilityDashboard } from "@/components/dashboard/roles/SustainabilityDashboard";
import { VerifierDashboard } from "@/components/dashboard/roles/VerifierDashboard";
import { useAuth } from "@/context/AuthContext";
import {
  CARBON_ACCOUNTING_WORKSPACE_ROLES,
  CLIENT_ADMIN_WORKSPACE_ROLES,
  CONSULTANT_WORKSPACE_ROLES,
  DATA_PIPELINE_WORKSPACE_ROLES,
  EXECUTIVE_WORKSPACE_ROLES,
  getUserPrimaryRole,
  isLifecycleRole,
  isNonInteractiveRole,
  PLATFORM_WORKSPACE_ROLES,
  SUSTAINABILITY_WORKSPACE_ROLES,
  VERIFICATION_WORKSPACE_ROLES,
  type PlatformRole,
} from "@/lib/auth/roles";

/**
 * This feature module is the working dashboard switchboard for the app shell.
 * The role architecture has 58 roles, but the current UI only has a smaller set
 * of shared workspaces. We classify every role here on purpose so routing stays
 * explicit until each domain gets its own dedicated dashboard.
 */

function roleInGroup(role: PlatformRole, roles: readonly PlatformRole[]): boolean {
  return roles.includes(role);
}

function DashboardUnavailableNotice({
  role,
  title = "Welcome to your Dashboard",
  description = "Specific tools for your role are under construction or not yet assigned.",
}: {
  role: PlatformRole;
  title?: string;
  description?: string;
}) {
  return (
    <div
      style={{
        padding: "32px",
        color: "#E8E6DE",
        fontFamily: "system-ui",
        background: "#050508",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid #111120",
          background: "#07070E",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>
          You are currently logged in with the <strong>{role.replace(/_/g, " ")}</strong> role.
        </p>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>{description}</p>
      </div>
    </div>
  );
}

/**
 * Board recipients are intentionally excluded from the interactive dashboard.
 * They should consume packaged board materials, not the live operational UI.
 */
function BoardReportRecipientNotice() {
  return (
    <DashboardUnavailableNotice
      role="board_report_recipient"
      title="Board Materials Access"
      description="Board report recipients are configured for non-interactive access and should receive curated reports instead of the live dashboard workspace."
    />
  );
}

function AutomationAccountNotice({ role }: { role: PlatformRole }) {
  return (
    <DashboardUnavailableNotice
      role={role}
      title="Automation Access Only"
      description="This role is provisioned for API, webhook, or service access and should not be routed into the interactive dashboard."
    />
  );
}

function LifecycleRoleNotice({ role }: { role: PlatformRole }) {
  return (
    <DashboardUnavailableNotice
      role={role}
      title="Account Provisioning In Progress"
      description="This role represents an account state, so the interactive workspace stays unavailable until onboarding or review is complete."
    />
  );
}

export function DashboardHomeView() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <DashboardSkeleton />;
  }

  const primaryRole = getUserPrimaryRole(user);

  if (primaryRole === "board_report_recipient") {
    return <BoardReportRecipientNotice />;
  }

  if (isNonInteractiveRole(primaryRole)) {
    return <AutomationAccountNotice role={primaryRole} />;
  }

  if (isLifecycleRole(primaryRole)) {
    return <LifecycleRoleNotice role={primaryRole} />;
  }

  if (roleInGroup(primaryRole, PLATFORM_WORKSPACE_ROLES)) {
    return <PlatformAdminDashboard />;
  }

  if (roleInGroup(primaryRole, CARBON_ACCOUNTING_WORKSPACE_ROLES)) {
    return <CarbonAccountantDashboard />;
  }

  if (roleInGroup(primaryRole, SUSTAINABILITY_WORKSPACE_ROLES)) {
    return <SustainabilityDashboard />;
  }

  if (roleInGroup(primaryRole, CLIENT_ADMIN_WORKSPACE_ROLES)) {
    return <ClientAdminDashboard />;
  }

  if (roleInGroup(primaryRole, CONSULTANT_WORKSPACE_ROLES)) {
    return <ConsultantDashboard />;
  }

  if (roleInGroup(primaryRole, DATA_PIPELINE_WORKSPACE_ROLES)) {
    return <DataEntryDashboard />;
  }

  if (roleInGroup(primaryRole, EXECUTIVE_WORKSPACE_ROLES)) {
    return <ExecutiveDashboard />;
  }

  if (roleInGroup(primaryRole, VERIFICATION_WORKSPACE_ROLES)) {
    return <VerifierDashboard />;
  }

  return (
    <DashboardUnavailableNotice
      role={primaryRole}
      title="Role Mapping Needed"
      description="This role exists in the catalog but is not yet mapped to a working dashboard surface."
    />
  );
}
