"use client";

import { useAuth } from "@/context/AuthContext";
import { PlatformRole, getUserPrimaryRole } from "@/lib/auth/roles";
import { useEffect, useState } from "react";

// Import roles dashboards
import { PlatformAdminDashboard } from "@/components/dashboard/roles/PlatformAdminDashboard";
import { CarbonAccountantDashboard } from "@/components/dashboard/roles/CarbonAccountantDashboard";
import { ClientAdminDashboard } from "@/components/dashboard/roles/ClientAdminDashboard";
import { ConsultantDashboard } from "@/components/dashboard/roles/ConsultantDashboard";
import { DataEntryDashboard } from "@/components/dashboard/roles/DataEntryDashboard";
import { ExecutiveDashboard } from "@/components/dashboard/roles/ExecutiveDashboard";
import { SustainabilityDashboard } from "@/components/dashboard/roles/SustainabilityDashboard";
import { VerifierDashboard } from "@/components/dashboard/roles/VerifierDashboard";

// Fallback Dashboard
function FallbackDashboard({ role }: { role: string }) {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "system-ui", background: "#050508", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E", borderRadius: "8px" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Welcome to your Dashboard</h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>
          You are currently logged in with the <strong>{role.replace(/_/g, " ")}</strong> role.
        </p>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
          Specific tools for your role are under construction or not yet assigned.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "#6B7280", fontFamily: "system-ui", background: "#050508", minHeight: "100vh" }}>
        <div className="spinner" style={{ margin: "0 auto 16px", width: "24px", height: "24px", border: "2px solid #1A1A24", borderTopColor: "#06B6D4", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ fontSize: "14px" }}>Loading Dashboard Profile...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const primaryRole = getUserPrimaryRole(user);

  switch (primaryRole) {
    // Platform Administration Roles
    case "platform_superadmin":
    case "platform_admin":
    case "platform_developer":
    case "platform_support":
      return <PlatformAdminDashboard />;

    // Carbon & Sustainability Management
    case "carbon_accountant":
      return <CarbonAccountantDashboard />;

    case "sustainability_head":
    case "esg_manager":
    case "group_sustainability_head":
      return <SustainabilityDashboard />;

    // Client Administration
    case "client_superadmin":
    case "client_admin":
    case "client_it_admin":
    case "subsidiary_admin":
      return <ClientAdminDashboard />;

    // Consultants
    case "consultant_lead":
    case "consultant_senior":
    case "consultant_analyst":
    case "consultant_viewer":
    case "consultant_trainee":
      return <ConsultantDashboard />;

    // Data Entry and Ground Level
    case "data_entry_operator":
    case "facility_manager":
      return <DataEntryDashboard />;

    // Executives and Finance
    case "executive_viewer":
    case "board_report_recipient":
    case "cfo_viewer":
    case "finance_analyst":
    case "investor_viewer":
    case "lender_viewer":
      return <ExecutiveDashboard />;

    // Verifiers and Auditors
    case "verifier_lead":
    case "verifier_reviewer":
    case "verifier_approver":
    case "verifier_iso":
    case "cbam_verifier":
    case "regulatory_inspector":
    case "platform_auditor":
      return <VerifierDashboard />;

    // Fallback Unmapped Roles
    default:
      return <FallbackDashboard role={primaryRole} />;
  }
}
