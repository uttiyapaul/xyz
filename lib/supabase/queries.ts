import { supabase } from "./client";

// ═══════════════════════════════════════════════════════════════════
// ORGANISATIONS — use v_active_organizations (hides soft-deleted rows)
// ═══════════════════════════════════════════════════════════════════

export async function getActiveOrganizations() {
  return supabase
    .from("v_active_organizations")
    .select("id, legal_name, trade_name, industry_segment_id, erp_system_type, plan_tier")
    .order("legal_name");
}

export async function getOrganizationById(id: string) {
  return supabase
    .from("v_active_organizations")
    .select("*")
    .eq("id", id)
    .single();
}

// Soft delete (never hard delete — your DB trigger will block it anyway)
export async function softDeleteOrganization(id: string, userId: string) {
  return supabase
    .from("client_organizations")
    .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
    .eq("id", id);
}

export async function restoreOrganization(id: string) {
  return supabase
    .from("client_organizations")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", id);
}

// ═══════════════════════════════════════════════════════════════════
// SITES — use v_active_sites
// ═══════════════════════════════════════════════════════════════════

export async function getActiveSites(orgId: string) {
  return supabase
    .from("v_active_sites")
    .select("id, site_name, site_type, state, grid_zone, is_headquarters")
    .eq("organization_id", orgId)
    .order("site_name");
}

export async function softDeleteSite(id: string, userId: string) {
  return supabase
    .from("client_sites")
    .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
    .eq("id", id);
}

// ═══════════════════════════════════════════════════════════════════
// FLEET — use v_active_fleet
// ═══════════════════════════════════════════════════════════════════

export async function getActiveFleet(orgId: string) {
  return supabase
    .from("v_active_fleet")
    .select("*")
    .eq("organization_id", orgId)
    .order("registration_number");
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD — materialized views (fast, pre-computed)
// RLS enforced via get_my_annual_emissions() wrapper function
// ═══════════════════════════════════════════════════════════════════

export async function getMyAnnualEmissions(orgId?: string, fyYear?: string) {
  // This calls your DB function get_my_annual_emissions() which
  // enforces org-scoping via my_org_ids() — safe to call directly
  let query = supabase.rpc("get_my_annual_emissions");
  // Note: rpc() returns all rows the function returns; filter client-side
  const { data, error } = await query;
  if (error) throw error;

  let results = data ?? [];
  if (orgId) results = results.filter((r: any) => r.organization_id === orgId);
  if (fyYear) results = results.filter((r: any) => r.fy_year === fyYear);
  return results;
}

export async function getSiteEmissions(orgId: string, fyYear: string) {
  return supabase
    .from("mv_site_emissions")
    .select("*")
    .eq("organization_id", orgId)
    .eq("fy_year", fyYear);
}

export async function getTargetsProgress(orgId: string) {
  return supabase
    .from("mv_targets_progress")
    .select("*")
    .eq("organization_id", orgId);
}

export async function getAIValidationSummary(orgId: string) {
  return supabase
    .from("mv_ai_validation_summary")
    .select("*")
    .eq("organization_id", orgId);
}

// ═══════════════════════════════════════════════════════════════════
// AI MODELS — use safe view (hides deployment_url from frontend)
// ═══════════════════════════════════════════════════════════════════

export async function getAIModels() {
  // v_ai_models_safe intentionally excludes deployment_url
  return supabase
    .from("v_ai_models_safe")
    .select("*")
    .eq("is_active", true);
}

// ═══════════════════════════════════════════════════════════════════
// SIGNOFF — calls DB function for HMAC signature
// ═══════════════════════════════════════════════════════════════════

export async function generateSignoffSignature(
  userId: string,
  submissionId: string,
  declarationText: string,
  timestamp: string
): Promise<string> {
  const { data, error } = await supabase.rpc("generate_signoff_signature", {
    p_user_id: userId,
    p_submission_id: submissionId,
    p_declaration: declarationText,
    p_timestamp: timestamp,
  });
  if (error) throw new Error(`Signature generation failed: ${error.message}`);
  return data as string;
}

export async function insertSignoff(payload: {
  organization_id: string;
  submission_id: string;
  signoff_stage: string;
  signed_by_user_id: string;
  signed_by_name: string;
  signed_by_designation: string;
  signed_by_role: string;
  signed_at: string;
  ip_address?: string;
  declaration_text: string;
  signature_hash: string;
}) {
  return supabase.from("ghg_signoff_chain").insert(payload);
}

// ═══════════════════════════════════════════════════════════════════
// FEATURE FLAGS — check if feature is enabled for org
// ═══════════════════════════════════════════════════════════════════

export async function isFeatureEnabled(
  flagKey: string,
  orgId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_feature_enabled", {
    p_flag_key: flagKey,
    p_org_id: orgId ?? null,
  });
  if (error) return false;
  return Boolean(data);
}

// ═══════════════════════════════════════════════════════════════════
// PERMISSIONS — check specific permission for org
// ═══════════════════════════════════════════════════════════════════

export async function checkPermission(
  orgId: string,
  permission: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_permission", {
    p_org_id: orgId,
    p_permission: permission,
  });
  if (error) return false;
  return Boolean(data);
}

// Call this after saving readings, submissions, or targets
export async function refreshDashboard() {
  const { error } = await supabase.rpc("refresh_dashboard_views");
  if (error) console.warn("View refresh failed:", error.message);
  // Non-critical — app works fine even if this fails
}