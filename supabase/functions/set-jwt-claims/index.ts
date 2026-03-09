import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// THIS FUNCTION IS CALLED AUTOMATICALLY BY SUPABASE ON EVERY LOGIN.
// It reads the user's org memberships and injects them into the JWT.
// The JWT is then used by my_org_ids() in every RLS policy — no DB query needed.

serve(async (req: Request) => {
  try {
    const webhookSecret = Deno.env.get("HOOK_SECRET") ?? "";
    const signature = req.headers.get("x-supabase-signature") ?? "";
    const body = await req.json();
    const user = body?.user;

    if (!user?.id) {
      // Return empty claims — Supabase Auth Hook requires a valid response
      return new Response(JSON.stringify({ app_metadata: {} }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Use service role — this function runs server-side only
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Query user's active org memberships + roles
    // Table: public.user_organization_roles (confirmed in your schema)
    const { data: roles, error } = await supabase
      .from("user_organization_roles")
      .select(`
        organization_id,
        role_id,
        platform_roles ( role_name, role_level )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      console.error("set-jwt-claims error:", error.message);
      return new Response(JSON.stringify({ app_metadata: {} }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Deduplicate org IDs (user may have multiple roles in one org)
    const orgIds = [...new Set(roles?.map((r: any) => r.organization_id) ?? [])];

    // Collect all role names (can have multiple across orgs)
    const roleNames = [
      ...new Set(
        roles
          ?.map((r: any) => r.platform_roles?.role_name)
          .filter(Boolean) ?? []
      ),
    ];

    const isPlatformAdmin = roleNames.includes("platform_admin");
    const isConsultant = roleNames.includes("consultant");

    return new Response(
      JSON.stringify({
        app_metadata: {
          org_ids: orgIds,           // ← read by my_org_ids() in all RLS policies
          roles: roleNames,
          is_platform_admin: isPlatformAdmin,
          is_consultant: isConsultant,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("set-jwt-claims fatal:", err);
    return new Response(JSON.stringify({ app_metadata: {} }), {
      headers: { "Content-Type": "application/json" },
      status: 200, // Must return 200 or Auth Hook breaks login
    });
  }
});