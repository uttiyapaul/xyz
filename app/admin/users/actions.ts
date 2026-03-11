"use server";

import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function fetchAdminUsers() {
    const supabaseAdmin = createServerSupabaseClient();

    // Fetch users from auth.users (requires service role)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error("Failed to fetch auth users:", authError);
        return { error: "Failed to fetch users" };
    }

    // Fetch roles from user_organization_roles
    const { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_organization_roles")
        .select("user_id, is_active, platform_roles(role_name), client_organizations(legal_name)")
        .is("deleted_at", null);

    if (roleError) {
        console.error("Failed to fetch roles:", roleError);
        return { error: "Failed to fetch user roles" };
    }

    // Merge the data
    const merged = authData.users.map((u) => {
        const roleRecord = roleData.find((r: any) => r.user_id === u.id);
        return {
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || "—",
            last_sign_in_at: u.last_sign_in_at,
            created_at: u.created_at,
            role: roleRecord?.platform_roles?.role_name || "pending_approval",
            org_name: roleRecord?.client_organizations?.legal_name || "—",
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
        .single();

    if (existing) {
        // Update existing role
        const { error } = await supabaseAdmin
            .from("user_organization_roles")
            .update({
                organization_id: orgId,
                platform_role_id: roleId,
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
                platform_role_id: roleId,
                is_active: true
            });

        if (error) return { error: error.message };
    }

    return { success: true };
}
