"use server";

import { createServerSupabaseClient } from "@/lib/supabase/client";

interface RoleAssignmentRow {
    user_id: string;
    is_active: boolean | null;
    organization_id: string | null;
    platform_roles: {
        role_name: string;
    } | {
        role_name: string;
    }[] | null;
}

interface OrganizationRow {
    id: string;
    legal_name: string | null;
}

function getRoleName(platformRole: RoleAssignmentRow["platform_roles"] | undefined): string | null {
    if (!platformRole) {
        return null;
    }

    return Array.isArray(platformRole)
        ? platformRole[0]?.role_name ?? null
        : platformRole.role_name;
}

export async function fetchAdminUsers() {
    const supabaseAdmin = createServerSupabaseClient();

    // Fetch users from auth.users (requires service role)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error("Failed to fetch auth users:", authError);
        return { error: "Failed to fetch users" };
    }

    // Fetch roles from user_organization_roles without joining client_orgs dynamically
    const { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_organization_roles")
        .select("user_id, is_active, organization_id, platform_roles(role_name)");

    if (roleError) {
        console.error("Failed to fetch roles:", roleError);
        return { error: "Failed to fetch user roles" };
    }

    // Fetch orgs separately
    const { data: orgData } = await supabaseAdmin
        .from("client_organizations")
        .select("id, legal_name");

    const roleRows = (roleData ?? []) as RoleAssignmentRow[];
    const organizationRows = (orgData ?? []) as OrganizationRow[];

    // Merge the data
    const merged = authData.users.map((u) => {
        const roleRecord = roleRows.find((r) => r.user_id === u.id);
        const orgRecord = organizationRows.find((o) => o.id === roleRecord?.organization_id);

        return {
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || "-",
            last_sign_in_at: u.last_sign_in_at,
            created_at: u.created_at,
            role: getRoleName(roleRecord?.platform_roles) || "pending_approval",
            org_name: orgRecord?.legal_name || "-",
            is_active: roleRecord?.is_active ?? false,
        };
    });

    return { data: merged };
}

export async function approveLead(userId: string, orgId: string, roleId: string) {
    const supabaseAdmin = createServerSupabaseClient();

    // Verify if they already have a pending role
    const { data: existing } = await supabaseAdmin
        .from("user_organization_roles")
        .select("id")
        .eq("user_id", userId)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existing) {
        // Update existing role
        const { error } = await supabaseAdmin
            .from("user_organization_roles")
            .update({
                organization_id: orgId,
                role_id: roleId,
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .eq("id", existing.id);

        if (error) return { error: error.message };
    } else {
        // Insert new role
        const { error } = await supabaseAdmin
            .from("user_organization_roles")
            .insert({
                user_id: userId,
                organization_id: orgId,
                role_id: roleId,
                is_active: true
            });

        if (error) return { error: error.message };
    }

    return { success: true };
}
