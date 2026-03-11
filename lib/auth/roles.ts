/**
 * A2Z Carbon Solutions — lib/auth/roles.ts
 * Central role definition and utility functions
 */

import type { User } from "@supabase/supabase-js";

export type PlatformRole =
    | "platform_superadmin" | "platform_admin" | "platform_developer" | "platform_support"
    | "platform_auditor" | "platform_sales" | "platform_finance" | "platform_data_scientist"
    | "consultant_lead" | "consultant_senior" | "consultant_analyst" | "consultant_viewer" | "consultant_trainee"
    | "verifier_lead" | "verifier_reviewer" | "verifier_approver" | "verifier_iso" | "cbam_verifier" | "regulatory_inspector"
    | "client_superadmin" | "client_admin" | "client_it_admin"
    | "sustainability_head" | "esg_manager" | "cbam_compliance_officer" | "carbon_accountant"
    | "data_entry_operator" | "facility_manager" | "data_reviewer" | "data_approver"
    | "cfo_viewer" | "finance_analyst"
    | "executive_viewer" | "board_report_recipient"
    | "supply_chain_reporter" | "lender_viewer" | "investor_viewer"
    | "group_sustainability_head" | "group_consolidator" | "subsidiary_admin" | "country_manager" | "regional_analyst"
    | "api_key_manager" | "erp_service_account" | "webhook_consumer" | "readonly_api_user"
    | "pending_approval" | "invited_unaccepted" | "suspended" | "offboarded";

export const LIFECYCLE_ROLES: PlatformRole[] = [
    "pending_approval",
    "invited_unaccepted",
    "suspended",
    "offboarded",
];

export function getUserPrimaryRole(user: User | null): PlatformRole {
    if (!user) return "pending_approval";

    const meta = user.app_metadata ?? {};
    const roles = Array.isArray(meta.roles) ? meta.roles : [];

    return (roles[0] as PlatformRole) ?? "pending_approval";
}

export function isLifecycleRole(role: PlatformRole): boolean {
    return LIFECYCLE_ROLES.includes(role);
}

export function isEmailVerified(user: User | null): boolean {
    if (!user) return false;
    return user.email_confirmed_at != null;
}

export function getRoleRoute(role: PlatformRole): string {
    if (role === "pending_approval") return "/auth/pending-approval";
    if (role === "invited_unaccepted") return "/auth/invited";
    if (role === "suspended") return "/auth/suspended";
    if (role === "offboarded") return "/auth/offboarded";
    return "/dashboard";
}
