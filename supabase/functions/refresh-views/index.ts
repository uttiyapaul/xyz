import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Called by Supabase Cron (scheduled) or manually from admin panel.
// Refreshes all 4 materialized views concurrently.

serve(async (req: Request) => {
  // Security: only allow calls with service role authorization
  const authHeader = req.headers.get("Authorization");
  const expectedKey = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;

  if (authHeader !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { error } = await supabase.rpc("refresh_dashboard_views");

  if (error) {
    console.error("refresh-views error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      refreshed_at: new Date().toISOString(),
      views: [
        "mv_org_annual_emissions",
        "mv_site_emissions",
        "mv_ai_validation_summary",
        "mv_targets_progress",
      ],
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});