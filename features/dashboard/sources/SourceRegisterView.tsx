"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import viewStyles from "@/features/dashboard/shared/DashboardWorkspace.module.css";
import shellStyles from "@/features/portal/WorkspaceShell.module.css";
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
  const [message, setMessage] = useState<{ tone: "success" | "warning" | "danger"; text: string } | null>(null);
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
      setMessage(null);
    } catch (error) {
      console.error("Error loading source register:", error);
      setSites([]);
      setSources([]);
      setMessage({
        tone: "danger",
        text: "Source register data could not be loaded right now.",
      });
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
    setMessage(null);

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
      setMessage({
        tone: "success",
        text: `Source saved to the live register for ${getCurrentFiscalYearLabel()}.`,
      });
      await loadData(orgId);
    } catch (error) {
      console.error("Error creating source register entry:", error);
      setMessage({
        tone: "danger",
        text: "The source could not be created. Check the current scope and required fields, then try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  const scopeOneCount = sources.filter((source) => source.scope === 1).length;
  const scopeTwoCount = sources.filter((source) => source.scope === 2).length;
  const scopeThreeCount = sources.filter((source) => source.scope === 3).length;

  if (authLoading || (orgId && loading)) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Data Input Workspace</p>
          <h1 className={shellStyles.title}>Loading source register...</h1>
        </header>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Data Input Workspace</p>
          <h1 className={shellStyles.title}>Emission Sources</h1>
          <p className={shellStyles.subtitle}>No organization is available in your current session scope yet.</p>
        </header>
      </div>
    );
  }

  return (
    <div className={shellStyles.page}>
      <header className={shellStyles.header}>
        <p className={shellStyles.eyebrow}>Data Input Workspace</p>
        <div className={shellStyles.headerRow}>
          <div className={shellStyles.titleBlock}>
            <h1 className={shellStyles.title}>Emission Sources</h1>
            <p className={shellStyles.subtitle}>
              The working source register writes to the live schema and keeps scope, site, and fiscal-year context
              visible for downstream activity capture.
            </p>
          </div>
        </div>
      </header>

      <main className={shellStyles.body}>
        {message ? (
          <div className={shellStyles.alert} data-tone={message.tone}>
            {message.text}
          </div>
        ) : null}

        <section className={shellStyles.metricsGrid}>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Register Rows</p>
            <p className={shellStyles.metricValue}>{sources.length}</p>
            <p className={shellStyles.metricHint}>Source rows visible to the current site and organization scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Scope 1</p>
            <p className={shellStyles.metricValue}>{scopeOneCount}</p>
            <p className={shellStyles.metricHint}>Direct-emission sources currently in scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Scope 2</p>
            <p className={shellStyles.metricValue}>{scopeTwoCount}</p>
            <p className={shellStyles.metricHint}>Purchased-energy sources currently in scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Scope 3</p>
            <p className={shellStyles.metricValue}>{scopeThreeCount}</p>
            <p className={shellStyles.metricHint}>Value-chain sources currently in scope.</p>
          </article>
        </section>

        <section className={viewStyles.twoColumn}>
          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>New Source</h2>
                <p className={shellStyles.cardDescription}>
                  Entries here write directly to the live GHG source register for the active organization.
                </p>
              </div>
            </div>
            <div className={shellStyles.cardSection}>
              <form className={viewStyles.sectionStack} onSubmit={handleSubmit}>
                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="source-name">
                    Source name
                  </label>
                  <input
                    id="source-name"
                    className={viewStyles.input}
                    type="text"
                    value={form.source_name}
                    onChange={(event) => setForm({ ...form, source_name: event.target.value })}
                    placeholder="e.g. Natural Gas Boiler"
                    required
                  />
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="source-scope">
                    Scope
                  </label>
                  <select
                    id="source-scope"
                    className={viewStyles.select}
                    value={form.scope}
                    onChange={(event) => setForm({ ...form, scope: event.target.value })}
                  >
                    <option value="1">Scope 1 - Direct</option>
                    <option value="2">Scope 2 - Purchased energy</option>
                    <option value="3">Scope 3 - Value chain</option>
                  </select>
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="source-category">
                    Category
                  </label>
                  <input
                    id="source-category"
                    className={viewStyles.input}
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    placeholder="e.g. Stationary combustion"
                  />
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="source-site">
                    Site (optional)
                  </label>
                  <select
                    id="source-site"
                    className={viewStyles.select}
                    value={form.site_id}
                    onChange={(event) => setForm({ ...form, site_id: event.target.value })}
                  >
                    <option value="">None</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.site_name} - {site.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={viewStyles.buttonRow}>
                  <button type="submit" disabled={saving} className={viewStyles.submitButton}>
                    {saving ? "Saving..." : "Add source"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Active Source Register</h2>
                <p className={shellStyles.cardDescription}>
                  Grouped by scope so teams can confirm coverage before entering activity data.
                </p>
              </div>
            </div>
            <div className={shellStyles.cardSection}>
              {sources.length === 0 ? (
                <div className={shellStyles.emptyState}>
                  <h3 className={shellStyles.emptyTitle}>No sources found in the live register yet.</h3>
                  <p className={shellStyles.emptyDescription}>
                    Add the first source to start activity capture and reporting alignment.
                  </p>
                </div>
              ) : (
                <div className={viewStyles.sectionStack}>
                  {[1, 2, 3].map((scope) => {
                    const scopeSources = sources.filter((source) => source.scope === scope);
                    if (scopeSources.length === 0) {
                      return null;
                    }

                    return (
                      <section key={scope} className={viewStyles.scopeSection} data-scope={scope}>
                        <h3 className={viewStyles.scopeHeading}>{getScopeLabel(scope)}</h3>
                        <div className={viewStyles.sourceList}>
                          {scopeSources.map((source) => (
                            <article key={source.id} className={viewStyles.sourceCard}>
                              <h4 className={viewStyles.sourceTitle}>{source.source_name}</h4>
                              <p className={viewStyles.sourceMeta}>
                                {source.source_category || "General"} | Site: {source.site_name} | FY: {source.fy_year}
                              </p>
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
