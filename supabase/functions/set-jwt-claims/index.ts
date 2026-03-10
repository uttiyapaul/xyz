import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PlatformRole {
  role_name: string | null;
  role_level: string | null;
}

interface OrgRoleRow {
  organization_id: string;
  role_id: string;
  platform_roles: PlatformRole | null;
}

serve(async (req: Request) => {
  try {
    // Validate the hook authorization header
    const hookSecret = Deno.env.get("HOOK_SECRET") ?? "";
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (hookSecret && token !== hookSecret) {
      return new Response(JSON.stringify({ claims: {} }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

     const body = await req.json() as { user?: { id?: string } };
    const userId = body?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ claims: {} }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: rows, error } = await supabase
      .from("user_organization_roles")
      .select(`
        organization_id,
        role_id,
        platform_roles ( role_name, role_level )
      `)
      .eq("user_id", userId)
      .eq("is_active", true) as { data: OrgRoleRow[] | null; error: { message: string } | null };

    if (error) {
      console.error("set-jwt-claims DB error:", error.message);
      return new Response(JSON.stringify({ claims: {} }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const safeRows: OrgRoleRow[] = rows ?? [];

    const orgIds: string[] = [
      ...new Set(
        safeRows
          .map((r: OrgRoleRow) => r.organization_id)
          .filter((id: string) => typeof id === "string")
      ),
    ];

    const roleNames: string[] = [
      ...new Set(
        safeRows
          .map((r: OrgRoleRow) => r.platform_roles?.role_name ?? "")
          .filter((name: string) => name.length > 0)
      ),
    ];

    const isPlatformAdmin: boolean = roleNames.some((r: string) =>
      ["platform_superadmin", "platform_admin"].includes(r)
    );

    const isConsultant: boolean = roleNames.some((r: string) =>
      r.includes("consultant")
    );

    const primaryRole: string = roleNames[0] ?? "client_viewer";

    return new Response(
      JSON.stringify({
        claims: {
          org_ids:           orgIds,
          roles:             roleNames,
          is_platform_admin: isPlatformAdmin,
          is_consultant:     isConsultant,
          primary_role:      primaryRole,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("set-jwt-claims fatal:", String(err));
    return new Response(JSON.stringify({ claims: {} }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
});
