"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/features/org/facilities/OrganizationFacilitiesView.module.css";
import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { usePermission } from "@/lib/hooks/usePermission";
import { supabase } from "@/lib/supabase/client";

interface OrganizationProfile {
  id: string;
  legal_name: string;
  trade_name: string | null;
  subscription_tier: string | null;
}

interface LegalEntity {
  id: string;
  entity_name: string;
  cin: string | null;
  entity_type: string | null;
  country: string | null;
  is_in_boundary: boolean;
}

interface FacilitySite {
  id: string;
  legal_entity_id: string | null;
  site_name: string;
  site_code: string | null;
  site_type: string | null;
  city: string;
  state: string;
  grid_zone: string | null;
  has_captive_solar: boolean | null;
  has_dg_set: boolean | null;
  is_in_boundary: boolean;
  included_from_fy: string | null;
  is_active: boolean | null;
}

interface FacilityMessage {
  tone: "info" | "warning" | "success";
  text: string;
}

const INITIAL_FORM = {
  siteName: "",
  siteCode: "",
  city: "",
  state: "",
  siteType: "",
  legalEntityId: "",
  gridZone: "",
  includedFromFy: "",
  isInBoundary: true,
  hasCaptiveSolar: false,
  hasDgSet: false,
};

function matchesLegalEntityScope(site: FacilitySite, legalEntityScopeIds: readonly string[]): boolean {
  if (legalEntityScopeIds.length === 0) {
    return true;
  }

  if (!site.legal_entity_id) {
    return true;
  }

  return legalEntityScopeIds.includes(site.legal_entity_id);
}

/**
 * Organization structure workspace for legal entities and sites.
 *
 * This replaces the old skeleton route with a scope-aware site directory and
 * a guarded create flow based on the current org assignment.
 */
export function OrganizationFacilitiesView() {
  const { primaryOrgId, siteScopeIds, legalEntityScopeIds, user, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permissionLoading } = usePermission("users:manage", primaryOrgId);

  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [sites, setSites] = useState<FacilitySite[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<FacilityMessage | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const orgId = primaryOrgId ?? null;

  const visibleLegalEntities = useMemo(
    () =>
      filterRowsByScopeId(legalEntities, legalEntityScopeIds, (entity) => entity.id, {
        includeRowsWithoutScope: true,
      }),
    [legalEntities, legalEntityScopeIds],
  );

  const visibleSites = useMemo(() => {
    const scopedSites = filterRowsByScopeId(sites, siteScopeIds, (site) => site.id, {
      includeRowsWithoutScope: true,
    });

    return scopedSites.filter((site) => matchesLegalEntityScope(site, legalEntityScopeIds));
  }, [legalEntityScopeIds, siteScopeIds, sites]);

  const loadFacilitiesData = useCallback(async () => {
    if (!orgId) {
      return;
    }

    setLoading(true);

    const [organizationResponse, siteResponse, legalEntityResponse] = await Promise.all([
      supabase
        .from("client_organizations")
        .select("id, legal_name, trade_name, subscription_tier")
        .eq("id", orgId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("client_sites")
        .select(
          "id, legal_entity_id, site_name, site_code, site_type, city, state, grid_zone, has_captive_solar, has_dg_set, is_in_boundary, included_from_fy, is_active",
        )
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("site_name"),
      supabase
        .from("client_legal_entities")
        .select("id, entity_name, cin, entity_type, country, is_in_boundary")
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("entity_name"),
    ]);

    if (organizationResponse.error || siteResponse.error || legalEntityResponse.error) {
      setOrganization(null);
      setSites([]);
      setLegalEntities([]);
      setMessage({
        tone: "warning",
        text: "Facility structure data could not be loaded. Refresh the page or try again shortly.",
      });
      setLoading(false);
      return;
    }

    setOrganization((organizationResponse.data ?? null) as OrganizationProfile | null);
    setSites((siteResponse.data ?? []) as FacilitySite[]);
    setLegalEntities((legalEntityResponse.data ?? []) as LegalEntity[]);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (!authLoading && orgId) {
      queueMicrotask(() => {
        void loadFacilitiesData();
      });
    }
  }, [authLoading, loadFacilitiesData, orgId]);

  async function handleCreateSite() {
    if (!orgId || !user) {
      return;
    }

    if (!form.siteName.trim() || !form.city.trim() || !form.state.trim()) {
      setMessage({
        tone: "warning",
        text: "Site name, city, and state are required before a facility can be created.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("client_sites").insert({
      organization_id: orgId,
      legal_entity_id: form.legalEntityId || null,
      site_name: form.siteName.trim(),
      site_code: form.siteCode.trim() || null,
      site_type: form.siteType.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      grid_zone: form.gridZone.trim() || null,
      included_from_fy: form.includedFromFy.trim() || null,
      is_in_boundary: form.isInBoundary,
      has_captive_solar: form.hasCaptiveSolar,
      has_dg_set: form.hasDgSet,
      created_by: user.id,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "warning",
        text: "The facility could not be created. Check the details and try again.",
      });
      return;
    }

    setSaving(false);
    setForm(INITIAL_FORM);
    setMessage({
      tone: "success",
      text: "Facility added. Review the site boundary and source-register mapping next.",
    });
    await loadFacilitiesData();
  }

  if (!orgId) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Organization Workspace</p>
          <h1 className={styles.title}>Facilities unavailable</h1>
          <p className={styles.subtitle}>
            No organization is attached to the current session yet, so site and legal-entity administration cannot open.
          </p>
        </header>
      </section>
    );
  }

  if (authLoading || loading || permissionLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.alert} data-tone="info">
          Loading organization facilities workspace...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Organization Workspace</p>
        <h1 className={styles.title}>Facilities & Site Configuration</h1>
        <p className={styles.subtitle}>
          Maintain the legal-entity and site structure for{" "}
          <strong>{organization?.legal_name ?? "the active organization"}</strong>. This workspace stays inside the
          current session scope so org structure remains aligned to downstream activity, source, and review flows.
        </p>
      </header>

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Visible Sites</p>
          <p className={styles.metricValue}>{visibleSites.length}</p>
          <p className={styles.metricHint}>Facilities visible after site and legal-entity scope filters are applied.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Legal Entities</p>
          <p className={styles.metricValue}>{visibleLegalEntities.length}</p>
          <p className={styles.metricHint}>Active legal entities available to the current session.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Boundary Sites</p>
          <p className={styles.metricValue}>{visibleSites.filter((site) => site.is_in_boundary).length}</p>
          <p className={styles.metricHint}>Sites included inside the current GHG reporting boundary.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Subscription</p>
          <p className={styles.metricValue}>{organization?.subscription_tier ?? "n/a"}</p>
          <p className={styles.metricHint}>Current tier visible from the organization record.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Guardrails</h2>
            <p className={styles.cardText}>
              Site structure affects activity capture, source mapping, and scoped access. Changes here should be
              deliberate and should not silently widen user scope.
            </p>
            <div className={styles.alert} data-tone="info">
              Trade name: {organization?.trade_name ?? "Not configured"}.
            </div>
            <div className={styles.alert} data-tone="warning">
              Empty scope arrays in later assignment workflows mean &quot;all allowed scope,&quot; not unrestricted platform access.
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Add new facility</h2>
            <p className={styles.cardText}>
              Create a new site only when it represents a real operational boundary used in reporting or evidence capture.
            </p>

            {message ? (
              <div className={styles.alert} data-tone={message.tone}>
                {message.text}
              </div>
            ) : null}

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-site-name">
                  Site name
                </label>
                <input
                  id="facility-site-name"
                  value={form.siteName}
                  onChange={(event) => setForm((current) => ({ ...current, siteName: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-site-code">
                  Site code
                </label>
                <input
                  id="facility-site-code"
                  value={form.siteCode}
                  onChange={(event) => setForm((current) => ({ ...current, siteCode: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-city">
                  City
                </label>
                <input
                  id="facility-city"
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-state">
                  State
                </label>
                <input
                  id="facility-state"
                  value={form.state}
                  onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-type">
                  Site type
                </label>
                <input
                  id="facility-type"
                  value={form.siteType}
                  onChange={(event) => setForm((current) => ({ ...current, siteType: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-entity">
                  Legal entity
                </label>
                <select
                  id="facility-entity"
                  value={form.legalEntityId}
                  onChange={(event) => setForm((current) => ({ ...current, legalEntityId: event.target.value }))}
                  className={styles.select}
                >
                  <option value="">No linked legal entity</option>
                  {visibleLegalEntities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.entity_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-grid-zone">
                  Grid zone
                </label>
                <input
                  id="facility-grid-zone"
                  value={form.gridZone}
                  onChange={(event) => setForm((current) => ({ ...current, gridZone: event.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="facility-fy">
                  Included from FY
                </label>
                <input
                  id="facility-fy"
                  value={form.includedFromFy}
                  onChange={(event) => setForm((current) => ({ ...current, includedFromFy: event.target.value }))}
                  className={styles.input}
                  placeholder="2026-27"
                />
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isInBoundary}
                  onChange={(event) => setForm((current) => ({ ...current, isInBoundary: event.target.checked }))}
                  className={styles.checkbox}
                />
                Included in reporting boundary
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.hasCaptiveSolar}
                  onChange={(event) => setForm((current) => ({ ...current, hasCaptiveSolar: event.target.checked }))}
                  className={styles.checkbox}
                />
                Captive solar available
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.hasDgSet}
                  onChange={(event) => setForm((current) => ({ ...current, hasDgSet: event.target.checked }))}
                  className={styles.checkbox}
                />
                DG set present
              </label>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => void handleCreateSite()}
                  disabled={!hasPermission || saving}
                  className={`${styles.button} ${styles.primaryButton}`.trim()}
                >
                  {saving ? "Saving..." : "Create facility"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(INITIAL_FORM)}
                  className={`${styles.button} ${styles.secondaryButton}`.trim()}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Site Directory</h2>

            {visibleSites.length === 0 ? (
              <div className={styles.emptyState}>No sites are visible in the current organization scope.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Site</th>
                      <th className={styles.tableHeaderCell}>Type</th>
                      <th className={styles.tableHeaderCell}>Boundary</th>
                      <th className={styles.tableHeaderCell}>Energy Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSites.map((site) => (
                      <tr key={site.id}>
                        <td className={styles.tableCell}>
                          <div className={styles.siteName}>{site.site_name}</div>
                          <div className={styles.siteMeta}>
                            {site.city}, {site.state}
                            {site.site_code ? ` | ${site.site_code}` : ""}
                            {site.grid_zone ? ` | Grid ${site.grid_zone}` : ""}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.badge} data-tone="info">
                            {site.site_type || "Unclassified"}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.badge} data-tone={site.is_in_boundary ? "success" : "warning"}>
                            {site.is_in_boundary ? "Included" : "Excluded"}
                          </span>
                          <div className={styles.siteMeta}>
                            {site.included_from_fy ? `From FY ${site.included_from_fy}` : "FY not recorded"}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.siteMeta}>
                            Solar: {site.has_captive_solar ? "Yes" : "No"}
                            <br />
                            DG set: {site.has_dg_set ? "Yes" : "No"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Legal Entity Coverage</h2>
            <p className={styles.cardText}>
              Legal-entity links matter for scoped approvals and verifier traceability, even when a site is reported at
              organization level.
            </p>

            {visibleLegalEntities.length === 0 ? (
              <div className={styles.emptyState}>No legal entities are visible in the current organization scope.</div>
            ) : (
              <div className={styles.list}>
                {visibleLegalEntities.map((entity) => (
                  <article key={entity.id} className={styles.listItem}>
                    <div className={styles.siteName}>{entity.entity_name}</div>
                    <div className={styles.siteMeta}>
                      {entity.entity_type || "Entity type not recorded"}
                      {entity.cin ? ` | CIN ${entity.cin}` : ""}
                      {entity.country ? ` | ${entity.country}` : ""}
                    </div>
                    <div className={styles.siteMeta}>
                      Boundary status: {entity.is_in_boundary ? "Included in reporting boundary" : "Excluded from boundary"}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
