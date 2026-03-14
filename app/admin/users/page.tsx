import { UsersClient } from "@/features/admin/users/UsersClient";
import { fetchAdminUsers } from "@/features/admin/users/actions";
import { createServerSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const { data: users, error } = await fetchAdminUsers();

  const supabaseAdmin = createServerSupabaseClient();

  const [orgsRes, rolesRes] = await Promise.all([
    supabaseAdmin
      .from("client_organizations")
      .select("id, legal_name")
      .is("deleted_at", null)
      .order("legal_name"),
    supabaseAdmin.from("platform_roles").select("id, role_name").order("role_name"),
  ]);

  const orgs = orgsRes.data || [];
  const roles = rolesRes.data || [];

  return (
    <div style={{ padding: "32px", color: "#FAFAF8" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
          Manage Users & Leads
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
          Verify pending registrations and manage existing platform access.
        </p>
      </div>

      {error ? (
        <div
          style={{
            color: "#FF3B30",
            background: "rgba(255, 59, 48, 0.1)",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      ) : (
        <UsersClient
          users={(users || []).map((user) => ({
            ...user,
            email: user.email || "",
            last_sign_in_at: user.last_sign_in_at || null,
          }))}
          organizations={orgs}
          roles={roles}
        />
      )}
    </div>
  );
}
