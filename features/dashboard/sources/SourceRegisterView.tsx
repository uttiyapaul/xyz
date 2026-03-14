"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

/**
 * This view is the working source-register editor for the live GHG schema.
 * Route files should stay thin while the feature owns the register-specific
 * data loading, inserts, and display behavior.
 */

interface Site {
  id: string;
  site_name: string;
  city: string;
}

interface EmissionSource {
  id: string;
  source_name: string;
  scope: number;
  source_category: string;
  site_id: string | null;
  site_name: string;
  fy_year: string;
}

interface SourceRow {
  id: string;
  source_name: string;
  scope: number;
  source_category: string;
  site_id: string | null;
  fy_year: string;
}

function getCurrentFiscalYearLabel(date = new Date()): string {
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const endYear = String(startYear + 1).slice(-2);
  return `${startYear}-${endYear}`;
}

function getScopeLabel(scope: number): string {
  return `Scope ${scope}`;
}

/**
 * The register needs stable, machine-safe keys because downstream mapping
 * logic references them across activity capture and review flows.
 */
function buildFieldKey(sourceName: string, scope: number): string {
  const slug = sourceName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `scope_${scope}_${slug || "source"}`;
}

export function SourceRegisterView() {
  const { primaryOrgId, siteScopeIds, user, isLoading: authLoading } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [form, setForm] = useState({
    source_name: "",
    scope: "1",
    category: "",
    site_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const orgId = primaryOrgId ?? "";

  useEffect(() => {
    if (authLoading || !orgId) {
      return;
    }

    void loadData(orgId);
  }, [authLoading, orgId]);

  async function loadData(activeOrgId: string) {
    setLoading(true);

    try {
      const [siteResponse, sourceResponse] = await Promise.all([
        supabase
          .from("v_active_sites")
          .select("id, site_name, city")
          .eq("organization_id", activeOrgId)
          .order("site_name"),
        supabase
          .from("ghg_emission_source_register")
          .select("id, source_name, scope, source_category, site_id, fy_year")
          .eq("organization_id", activeOrgId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      ]);

      if (siteResponse.error) {
        throw siteResponse.error;
      }

      if (sourceResponse.error) {
        throw sourceResponse.error;
      }

      const nextSites = filterRowsByScopeId((siteResponse.data ?? []) as Site[], siteScopeIds, (site) => site.id);
      const siteMap = new Map(nextSites.map((site) => [site.id, site]));
      const nextSources = filterRowsByScopeId(
        ((sourceResponse.data ?? []) as SourceRow[]).map((source) => ({
          ...source,
          site_name: source.site_id ? siteMap.get(source.site_id)?.site_name ?? "Unassigned" : "Unassigned",
        })),
        siteScopeIds,
        (source) => source.site_id,
        { includeRowsWithoutScope: true },
      );

      setSites(nextSites);
      setSources(nextSources);
    } catch (error) {
      console.error("Error loading source register:", error);
      setSites([]);
      setSources([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orgId || !user || !form.source_name.trim()) {
      return;
    }

    setSaving(true);

    try {
      const scope = Number(form.scope);
      const { error } = await supabase.from("ghg_emission_source_register").insert({
        organization_id: orgId,
        site_id: form.site_id || null,
        fy_year: getCurrentFiscalYearLabel(),
        source_name: form.source_name.trim(),
        source_description: form.source_name.trim(),
        source_category: form.category.trim() || "general",
        scope,
        gases_emitted: ["CO2"],
        is_included: true,
        materiality_assessment: "pending_review",
        data_collection_method: "manual_frontend_entry",
        field_key: buildFieldKey(form.source_name, scope),
        created_by: user.id,
      });

      if (error) {
        throw error;
      }

      setForm({ source_name: "", scope: "1", category: "", site_id: "" });
      await loadData(orgId);
    } catch (error) {
      console.error("Error creating source register entry:", error);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || (orgId && loading)) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
        Loading source register...
      </div>
    );
  }

  if (!orgId) {
    return (
      <div style={{ padding: "32px", color: "#E8E6DE", minHeight: "100vh", background: "#050508" }}>
        <div
          style={{ padding: "24px", background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px" }}
        >
          <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: "0 0 8px" }}>Emission Sources</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
            No organization is available in your current session scope yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", background: "#050508", color: "#E8E6DE", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid #111120", background: "#07070E" }}>
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Emission Sources</h1>
      </div>

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>New Source</h2>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 0, marginBottom: "16px" }}>
              Entries now write to the live GHG source register for {getCurrentFiscalYearLabel()}.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  SOURCE NAME
                </label>
                <input
                  type="text"
                  value={form.source_name}
                  onChange={(event) => setForm({ ...form, source_name: event.target.value })}
                  placeholder="e.g. Natural Gas Boiler"
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#07070E",
                    border: "1px solid #1A1A24",
                    borderRadius: "4px",
                    color: "#FAFAF8",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  SCOPE
                </label>
                <select
                  value={form.scope}
                  onChange={(event) => setForm({ ...form, scope: event.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#07070E",
                    border: "1px solid #1A1A24",
                    borderRadius: "4px",
                    color: "#FAFAF8",
                    fontSize: "14px",
                  }}
                >
                  <option value="1">Scope 1 - Direct</option>
                  <option value="2">Scope 2 - Purchased energy</option>
                  <option value="3">Scope 3 - Value chain</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  CATEGORY
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="e.g. Stationary combustion"
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#07070E",
                    border: "1px solid #1A1A24",
                    borderRadius: "4px",
                    color: "#FAFAF8",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  SITE (OPTIONAL)
                </label>
                <select
                  value={form.site_id}
                  onChange={(event) => setForm({ ...form, site_id: event.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#07070E",
                    border: "1px solid #1A1A24",
                    borderRadius: "4px",
                    color: "#FAFAF8",
                    fontSize: "14px",
                  }}
                >
                  <option value="">None</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.site_name} - {site.city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#F59E0B",
                  border: "none",
                  borderRadius: "4px",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Add Source"}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A24" }}>
              <h2 style={{ fontSize: "16px", color: "#FAFAF8", margin: 0 }}>Active Source Register</h2>
            </div>
            <div style={{ padding: "20px" }}>
              {[1, 2, 3].map((scope) => {
                const scopeSources = sources.filter((source) => source.scope === scope);
                if (scopeSources.length === 0) {
                  return null;
                }

                return (
                  <div key={scope} style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        color: scope === 1 ? "#EF4444" : scope === 2 ? "#F59E0B" : "#06B6D4",
                        marginBottom: "12px",
                      }}
                    >
                      {getScopeLabel(scope)}
                    </h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {scopeSources.map((source) => (
                        <div
                          key={source.id}
                          style={{
                            background: "#07070E",
                            border: "1px solid #1A1A24",
                            borderRadius: "4px",
                            padding: "12px",
                          }}
                        >
                          <div style={{ fontSize: "14px", color: "#FAFAF8", marginBottom: "4px" }}>
                            {source.source_name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6B7280" }}>
                            <span>{source.source_category || "General"}</span>
                            <span> | Site: {source.site_name}</span>
                            <span> | FY: {source.fy_year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {sources.length === 0 && (
                <div style={{ color: "#6B7280", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                  No sources found in the live register yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
