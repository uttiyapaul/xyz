"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
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

export function ActivityDataView() {
  const { primaryOrgId, siteScopeIds, user, isLoading: authLoading } = useAuth();
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
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
    } catch (error) {
      console.error("Error loading activity data:", error);
      setSources([]);
      setActivities([]);
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
      await loadData(orgId);
    } catch (error) {
      console.error("Error creating activity entry:", error);
    } finally {
      setSaving(false);
    }
  }

  const selectedSource = sources.find((source) => source.id === form.source_id);

  if (authLoading || (orgId && loading)) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
        Loading activity data...
      </div>
    );
  }

  if (!orgId) {
    return (
      <div style={{ padding: "32px", color: "#E8E6DE", minHeight: "100vh", background: "#050508" }}>
        <div
          style={{ padding: "24px", background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px" }}
        >
          <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: "0 0 8px" }}>Activity Data Entry</h1>
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
        <h1 style={{ fontSize: "24px", color: "#FAFAF8", margin: 0 }}>Activity Data Entry</h1>
      </div>

      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", color: "#FAFAF8", marginBottom: "16px" }}>New Activity</h2>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 0, marginBottom: "16px" }}>
              The selected source now drives facility, field key, and a compatible activity type automatically.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  SOURCE
                </label>
                <select
                  value={form.source_id}
                  onChange={(event) => setForm({ ...form, source_id: event.target.value })}
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
                >
                  <option value="">Select...</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.source_name} (Scope {source.scope})
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "#07070E",
                  border: "1px solid #1A1A24",
                  borderRadius: "4px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>AUTO-DERIVED TYPE</div>
                <div style={{ fontSize: "13px", color: "#FAFAF8" }}>
                  {selectedSource ? deriveActivityType(selectedSource).replace(/_/g, " ") : "Select a source"}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  QUANTITY
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
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
                  UNIT
                </label>
                <select
                  value={form.unit}
                  onChange={(event) => setForm({ ...form, unit: event.target.value })}
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
                  <option value="kWh">kWh</option>
                  <option value="L">Liters</option>
                  <option value="m3">m3</option>
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                  REPORTING DATE
                </label>
                <input
                  type="date"
                  value={form.reporting_period}
                  onChange={(event) => setForm({ ...form, reporting_period: event.target.value })}
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
                {saving ? "Saving..." : "Add Activity"}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A24" }}>
              <h2 style={{ fontSize: "16px", color: "#FAFAF8", margin: 0 }}>Recent Activities</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#07070E" }}>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    DATE
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    SOURCE
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    SITE
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    TYPE
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "right",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    QUANTITY
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "11px",
                      color: "#6B7280",
                      fontWeight: "500",
                    }}
                  >
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} style={{ borderBottom: "1px solid #111120" }}>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#9CA3AF" }}>
                      {activity.reporting_period}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#FAFAF8" }}>
                      {activity.source_name}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#9CA3AF" }}>
                      {activity.site_name}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#6B7280" }}>
                      {activity.activity_type.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: "13px", color: "#F59E0B", textAlign: "right" }}>
                      {activity.quantity.toLocaleString()} {activity.unit}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "12px",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                      }}
                    >
                      {activity.status}
                    </td>
                  </tr>
                ))}

                {activities.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#6B7280" }}>
                      No activity entries found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
