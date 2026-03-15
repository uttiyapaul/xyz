"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import shellStyles from "@/features/portal/WorkspaceShell.module.css";
import viewStyles from "@/features/dashboard/shared/DashboardWorkspace.module.css";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

/**
 * Activity data entry is kept source-driven on purpose.
 * The selected emission source determines facility, field key, and activity
 * type so manual entries stay aligned with the live register schema.
 */

interface Site {
  id: string;
  site_name: string;
}

interface EmissionSource {
  id: string;
  source_name: string;
  scope: number;
  source_category: string;
  site_id: string | null;
  field_key: string | null;
}

interface ActivityRecord {
  id: string;
  quantity: number;
  unit: string;
  reporting_period: string;
  status: string;
  activity_type: string;
  source_name: string;
  site_name: string;
}

interface ActivityRow {
  id: string;
  quantity: number;
  unit: string;
  reporting_period: string;
  status: string;
  activity_type: string;
  facility_id: string | null;
  field_key: string | null;
  source_ref: string | null;
}

function getFiscalYearLabel(dateValue: string): string {
  const [yearText, monthText] = dateValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const startYear = month >= 4 ? year : year - 1;
  const endYear = String(startYear + 1).slice(-2);
  return `${startYear}-${endYear}`;
}

function getDateParts(dateValue: string): { month: number; year: number } {
  const [yearText, monthText] = dateValue.split("-");

  return {
    month: Number(monthText),
    year: Number(yearText),
  };
}

function buildFieldKey(sourceName: string): string {
  const slug = sourceName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || "activity_entry";
}

/**
 * This fallback keeps manual entry usable even when a source category is broad.
 * We only derive a coarse activity type here because the database is the long-term
 * source of truth for richer classification.
 */
function deriveActivityType(source: EmissionSource): string {
  const lookup = `${source.source_category} ${source.source_name}`.toLowerCase();

  if (lookup.includes("vehicle") || lookup.includes("fleet") || lookup.includes("mobile")) {
    return "mobile_combustion";
  }

  if (lookup.includes("fugitive") || lookup.includes("refrigerant")) {
    return "fugitive_emissions";
  }

  if (lookup.includes("process")) {
    return "process_emissions";
  }

  if (lookup.includes("steam") || lookup.includes("heat")) {
    return "purchased_heat_steam";
  }

  if (lookup.includes("cooling")) {
    return "purchased_cooling";
  }

  if (lookup.includes("travel")) {
    return "business_travel";
  }

  if (lookup.includes("commut")) {
    return "employee_commuting";
  }

  if (lookup.includes("waste")) {
    return "waste_operations";
  }

  if (lookup.includes("goods") || lookup.includes("procurement")) {
    return "purchased_goods_services";
  }

  if (lookup.includes("capital")) {
    return "capital_goods";
  }

  if (lookup.includes("transport")) {
    return "upstream_transport";
  }

  if (lookup.includes("electric") || source.scope === 2) {
    return "purchased_electricity";
  }

  if (source.scope === 3) {
    return "purchased_goods_services";
  }

  return "stationary_combustion";
}

function getDefaultReportingDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getStatusTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "accepted" || status === "approved" || status === "completed") {
    return "success";
  }

  if (status === "rejected" || status === "failed") {
    return "danger";
  }

  if (status === "pending" || status === "validated" || status === "under_review") {
    return "warning";
  }

  return "info";
}

export function ActivityDataView() {
  const { primaryOrgId, siteScopeIds, user, isLoading: authLoading } = useAuth();
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [message, setMessage] = useState<{ tone: "success" | "warning" | "danger"; text: string } | null>(null);
  const [form, setForm] = useState({
    source_id: "",
    quantity: "",
    unit: "kWh",
    reporting_period: getDefaultReportingDate(),
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
      const [siteResponse, sourceResponse, activityResponse] = await Promise.all([
        supabase
          .from("v_active_sites")
          .select("id, site_name")
          .eq("organization_id", activeOrgId),
        supabase
          .from("ghg_emission_source_register")
          .select("id, source_name, scope, source_category, site_id, field_key")
          .eq("organization_id", activeOrgId)
          .is("deleted_at", null)
          .order("source_name"),
        supabase
          .from("activity_data")
          .select(
            "id, quantity, unit, reporting_period, status, activity_type, facility_id, field_key, source_ref",
          )
          .eq("organization_id", activeOrgId)
          .order("reporting_period", { ascending: false })
          .limit(20),
      ]);

      if (siteResponse.error) {
        throw siteResponse.error;
      }

      if (sourceResponse.error) {
        throw sourceResponse.error;
      }

      if (activityResponse.error) {
        throw activityResponse.error;
      }

      const sites = filterRowsByScopeId((siteResponse.data ?? []) as Site[], siteScopeIds, (site) => site.id);
      const siteMap = new Map(sites.map((site) => [site.id, site]));
      const sourceRows = filterRowsByScopeId(
        (sourceResponse.data ?? []) as EmissionSource[],
        siteScopeIds,
        (source) => source.site_id,
        { includeRowsWithoutScope: true },
      );
      const sourceMap = new Map(sourceRows.map((source) => [source.id, source]));
      const activityRows = filterRowsByScopeId(
        (activityResponse.data ?? []) as ActivityRow[],
        siteScopeIds,
        (activity) => activity.facility_id,
        { includeRowsWithoutScope: true },
      );

      setSources(sourceRows);
      setActivities(
        activityRows.map((activity) => {
          const linkedSource =
            (activity.source_ref ? sourceMap.get(activity.source_ref) : undefined) ??
            sourceRows.find((source) => source.field_key && source.field_key === activity.field_key);

          return {
            id: activity.id,
            quantity: Number(activity.quantity),
            unit: activity.unit,
            reporting_period: activity.reporting_period,
            status: activity.status,
            activity_type: activity.activity_type,
            source_name: linkedSource?.source_name ?? activity.activity_type,
            site_name: activity.facility_id
              ? siteMap.get(activity.facility_id)?.site_name ?? "Unassigned"
              : "Unassigned",
          };
        }),
      );
      setMessage(null);
    } catch (error) {
      console.error("Error loading activity data:", error);
      setSources([]);
      setActivities([]);
      setMessage({
        tone: "danger",
        text: "Activity data could not be loaded from the live schema right now.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orgId || !user || !form.source_id || !form.quantity) {
      return;
    }

    const selectedSource = sources.find((source) => source.id === form.source_id);
    if (!selectedSource) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const dateParts = getDateParts(form.reporting_period);
      const { error } = await supabase.from("activity_data").insert({
        organization_id: orgId,
        facility_id: selectedSource.site_id,
        activity_type: deriveActivityType(selectedSource),
        field_key: selectedSource.field_key || buildFieldKey(selectedSource.source_name),
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        reporting_period: form.reporting_period,
        month: dateParts.month,
        year: dateParts.year,
        fy_year: getFiscalYearLabel(form.reporting_period),
        data_source: "manual_entry",
        source_ref: selectedSource.id,
        status: "pending",
        created_by: user.id,
      });

      if (error) {
        throw error;
      }

      setForm({
        source_id: "",
        quantity: "",
        unit: "kWh",
        reporting_period: getDefaultReportingDate(),
      });
      setMessage({
        tone: "success",
        text: "Activity entry saved. It is now waiting in the review queue with the source-derived field mapping.",
      });
      await loadData(orgId);
    } catch (error) {
      console.error("Error creating activity entry:", error);
      setMessage({
        tone: "danger",
        text: "The activity entry could not be saved. Check the source selection and current row-level access, then try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  const selectedSource = sources.find((source) => source.id === form.source_id);
  const pendingActivities = activities.filter((activity) => activity.status === "pending").length;

  if (authLoading || (orgId && loading)) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Data Input Workspace</p>
          <h1 className={shellStyles.title}>Loading activity data...</h1>
        </header>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Data Input Workspace</p>
          <h1 className={shellStyles.title}>Activity Data Entry</h1>
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
            <h1 className={shellStyles.title}>Activity Data Entry</h1>
            <p className={shellStyles.subtitle}>
              Manual entries stay source-driven so facility, field key, and activity type remain aligned with the live
              source register.
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
            <p className={shellStyles.metricLabel}>Available Sources</p>
            <p className={shellStyles.metricValue}>{sources.length}</p>
            <p className={shellStyles.metricHint}>Source rows visible to the current site and organization scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Recent Entries</p>
            <p className={shellStyles.metricValue}>{activities.length}</p>
            <p className={shellStyles.metricHint}>The most recent manual entries loaded from the live ledger.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Pending Review</p>
            <p className={shellStyles.metricValue}>{pendingActivities}</p>
            <p className={shellStyles.metricHint}>Entries still moving through review or approval.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Sites In Scope</p>
            <p className={shellStyles.metricValue}>{new Set(sources.map((source) => source.site_id).filter(Boolean)).size}</p>
            <p className={shellStyles.metricHint}>Distinct sites represented by the currently visible source rows.</p>
          </article>
        </section>

        <section className={viewStyles.twoColumn}>
          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>New Activity</h2>
                <p className={shellStyles.cardDescription}>
                  The selected source now drives facility, field key, and a compatible activity type automatically.
                </p>
              </div>
            </div>
            <div className={shellStyles.cardSection}>
              <form className={viewStyles.sectionStack} onSubmit={handleSubmit}>
                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="activity-source">
                    Source
                  </label>
                  <select
                    id="activity-source"
                    className={viewStyles.select}
                    value={form.source_id}
                    onChange={(event) => setForm({ ...form, source_id: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.source_name} (Scope {source.scope})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={viewStyles.derivedCard}>
                  <p className={viewStyles.derivedLabel}>Auto-derived type</p>
                  <p className={viewStyles.derivedValue}>
                    {selectedSource ? deriveActivityType(selectedSource).replace(/_/g, " ") : "Select a source"}
                  </p>
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="activity-quantity">
                    Quantity
                  </label>
                  <input
                    id="activity-quantity"
                    className={viewStyles.input}
                    type="number"
                    step="0.01"
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    required
                  />
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="activity-unit">
                    Unit
                  </label>
                  <select
                    id="activity-unit"
                    className={viewStyles.select}
                    value={form.unit}
                    onChange={(event) => setForm({ ...form, unit: event.target.value })}
                  >
                    <option value="kWh">kWh</option>
                    <option value="L">Liters</option>
                    <option value="m3">m3</option>
                    <option value="kg">kg</option>
                    <option value="tonnes">tonnes</option>
                  </select>
                </div>

                <div className={viewStyles.fieldGroup}>
                  <label className={viewStyles.label} htmlFor="activity-reporting-date">
                    Reporting date
                  </label>
                  <input
                    id="activity-reporting-date"
                    className={viewStyles.input}
                    type="date"
                    value={form.reporting_period}
                    onChange={(event) => setForm({ ...form, reporting_period: event.target.value })}
                    required
                  />
                </div>

                <div className={viewStyles.buttonRow}>
                  <button type="submit" disabled={saving} className={viewStyles.submitButton}>
                    {saving ? "Saving..." : "Add activity"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Recent Activities</h2>
                <p className={shellStyles.cardDescription}>
                  Recent rows stay visible here so operators can confirm the correct source mapping before the review
                  lane picks them up.
                </p>
              </div>
            </div>
            {activities.length === 0 ? (
              <div className={shellStyles.emptyState}>
                <h3 className={shellStyles.emptyTitle}>No activity entries found yet.</h3>
                <p className={shellStyles.emptyDescription}>
                  Once you submit activity rows they will appear here with the derived source and review status.
                </p>
              </div>
            ) : (
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Date</th>
                      <th className={shellStyles.tableHeaderCell}>Source</th>
                      <th className={shellStyles.tableHeaderCell}>Site</th>
                      <th className={shellStyles.tableHeaderCell}>Type</th>
                      <th className={shellStyles.tableHeaderCell}>Quantity</th>
                      <th className={shellStyles.tableHeaderCell}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className={shellStyles.tableCell}>{activity.reporting_period}</td>
                        <td className={shellStyles.tableCell}>{activity.source_name}</td>
                        <td className={shellStyles.tableCell}>{activity.site_name}</td>
                        <td className={shellStyles.tableCell}>{activity.activity_type.replace(/_/g, " ")}</td>
                        <td className={shellStyles.tableCell}>
                          {activity.quantity.toLocaleString("en-IN")} {activity.unit}
                        </td>
                        <td className={shellStyles.tableCell}>
                          <span className={shellStyles.badge} data-tone={getStatusTone(activity.status)}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
