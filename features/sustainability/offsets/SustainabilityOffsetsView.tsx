"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface OffsetRegistryRow {
  id: string;
  name: string;
  credit_type: string;
  standard_body: string | null;
}

interface OffsetRow {
  id: string;
  registry_id: string;
  serial_number: string;
  project_name: string;
  project_type: string;
  project_country: string | null;
  vintage_year: number;
  quantity_tco2e: number;
  price_per_tco2e_usd: number | null;
  total_cost_inr: number | null;
  purchase_date: string;
  retirement_date: string | null;
  is_retired: boolean | null;
  retirement_purpose: string | null;
  fy_year_applied: string | null;
  scope_offset: number | null;
  verification_standard: string | null;
  verifier: string | null;
}

const INITIAL_FORM = {
  registryId: "",
  serialNumber: "",
  projectName: "",
  projectType: "renewable_energy",
  projectCountry: "IN",
  vintageYear: "2025",
  quantityTco2e: "0",
  pricePerTco2eUsd: "",
  totalCostInr: "",
  purchaseDate: "",
  fyYearApplied: "2026-27",
  scopeOffset: "1",
  verificationStandard: "",
  verifier: "",
  notes: "",
};

/**
 * Carbon offset workspace.
 *
 * The UI keeps retirement posture, verification context, and residual-emission
 * planning visible without claiming offsets replace primary reduction work.
 */
export function SustainabilityOffsetsView() {
  const { primaryOrgId, user, roles, isLoading: authLoading } = useAuth();
  const [offsets, setOffsets] = useState<OffsetRow[]>([]);
  const [registries, setRegistries] = useState<OffsetRegistryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "warning" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const canEditOffsets = roles.some((role) =>
    ["sustainability_head", "esg_manager", "carbon_accountant", "cfo_viewer", "finance_analyst"].includes(role),
  );
  const isTraderAudience = roles.includes("carbon_credit_trader");

  async function loadOffsets() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [offsetResponse, registryResponse] = await Promise.all([
      supabase
        .from("carbon_offsets")
        .select(
          "id, registry_id, serial_number, project_name, project_type, project_country, vintage_year, quantity_tco2e, price_per_tco2e_usd, total_cost_inr, purchase_date, retirement_date, is_retired, retirement_purpose, fy_year_applied, scope_offset, verification_standard, verifier",
        )
        .eq("organization_id", primaryOrgId)
        .order("purchase_date", { ascending: false }),
      supabase.from("carbon_offset_registries").select("id, name, credit_type, standard_body").order("name"),
    ]);

    if (offsetResponse.error || registryResponse.error) {
      setOffsets([]);
      setRegistries([]);
      setMessage({
        tone: "warning",
        text: "Offset portfolio data is unavailable right now. Refresh the page or retry after registry data is available.",
      });
      setLoading(false);
      return;
    }

    setOffsets((offsetResponse.data ?? []) as OffsetRow[]);
    setRegistries((registryResponse.data ?? []) as OffsetRegistryRow[]);
    setLoading(false);
  }

  const scheduleOffsetsLoad = useEffectEvent(() => {
    void loadOffsets();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleOffsetsLoad);
    }
  }, [authLoading, primaryOrgId]);

  async function handleCreateOffset() {
    if (!primaryOrgId || !user) {
      return;
    }

    if (!canEditOffsets) {
      setMessage({
        tone: "warning",
        text: "This role can review offset inventory but cannot add or amend offset lots in the register.",
      });
      return;
    }

    if (!form.registryId || !form.serialNumber.trim() || !form.projectName.trim() || !form.purchaseDate) {
      setMessage({
        tone: "warning",
        text: "Registry, serial number, project name, and purchase date are required before an offset lot can be saved.",
      });
      return;
    }

    if (Number(form.quantityTco2e) <= 0 || Number(form.vintageYear) <= 0) {
      setMessage({
        tone: "warning",
        text: "Quantity and vintage year must be positive values before the offset record is saved.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("carbon_offsets").insert({
      organization_id: primaryOrgId,
      registry_id: form.registryId,
      serial_number: form.serialNumber.trim(),
      project_name: form.projectName.trim(),
      project_type: form.projectType,
      project_country: form.projectCountry.trim() || null,
      vintage_year: Number(form.vintageYear),
      quantity_tco2e: Number(form.quantityTco2e),
      price_per_tco2e_usd: form.pricePerTco2eUsd ? Number(form.pricePerTco2eUsd) : null,
      total_cost_inr: form.totalCostInr ? Number(form.totalCostInr) : null,
      purchase_date: form.purchaseDate,
      fy_year_applied: form.fyYearApplied.trim() || null,
      scope_offset: Number(form.scopeOffset),
      verification_standard: form.verificationStandard.trim() || null,
      verifier: form.verifier.trim() || null,
      notes: form.notes.trim() || null,
      created_by: user.id,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "warning",
        text: "The offset record could not be saved. Check the required registry, serial number, and purchase details, then try again.",
      });
      return;
    }

    setSaving(false);
    setForm(INITIAL_FORM);
    setMessage({
      tone: "success",
      text: "Offset record saved. Retirements should still be treated as residual-emission controls, not a substitute for reduction programs.",
    });
    await loadOffsets();
  }

  const retiredOffsets = offsets.filter((offset) => offset.is_retired).length;
  const totalVolume = offsets.reduce((sum, offset) => sum + Number(offset.quantity_tco2e || 0), 0);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Sustainability Workspace</p>
        <h1 className={styles.title}>Carbon Offsets Portfolio</h1>
        <p className={styles.subtitle}>
          Maintain the offset portfolio with registry, verification, and retirement context visible. The UI keeps
          residual-emission language explicit so offsets do not masquerade as primary reduction progress.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Portfolio Items</p><p className={styles.metricValue}>{offsets.length}</p><p className={styles.metricHint}>Offset records currently visible to the active organization.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Retired Credits</p><p className={styles.metricValue}>{retiredOffsets}</p><p className={styles.metricHint}>Portfolio rows already retired against a stated purpose.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Total Volume</p><p className={styles.metricValue}>{totalVolume.toFixed(0)}</p><p className={styles.metricHint}>Approximate tCO2e volume represented in the visible portfolio.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Registries</p><p className={styles.metricValue}>{registries.length}</p><p className={styles.metricHint}>Registry options currently available in the platform taxonomy.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Offset Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">Offsets are for residual emissions. They do not erase weak source data or delayed reduction action.</div>
              <div className={styles.alert} data-tone="info">Verification standard, serial traceability, and retirement purpose should remain visible to finance and sustainability reviewers.</div>
              <p className={styles.detailText}>Audience mode: {isTraderAudience ? "Market read-only" : canEditOffsets ? "Portfolio stewardship" : "Read-only oversight"}</p>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Add offset lot</h2>
            {!canEditOffsets ? (
              <div className={styles.alert} data-tone="info">
                This role can inspect the live offset register, but only stewardship roles can create or amend offset lots here.
              </div>
            ) : null}
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-registry">Registry</label><select id="offset-registry" className={styles.select} value={form.registryId} onChange={(event) => setForm((current) => ({ ...current, registryId: event.target.value }))}><option value="">Select registry</option>{registries.map((registry) => <option key={registry.id} value={registry.id}>{registry.name}</option>)}</select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-serial">Serial number</label><input id="offset-serial" className={styles.input} value={form.serialNumber} onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-project-name">Project name</label><input id="offset-project-name" className={styles.input} value={form.projectName} onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-project-type">Project type</label><select id="offset-project-type" className={styles.select} value={form.projectType} onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}><option value="renewable_energy">Renewable energy</option><option value="forestry">Forestry</option><option value="methane_capture">Methane capture</option><option value="energy_efficiency">Energy efficiency</option><option value="dac">DAC</option><option value="other">Other</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-country">Project country</label><input id="offset-country" className={styles.input} value={form.projectCountry} onChange={(event) => setForm((current) => ({ ...current, projectCountry: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-vintage">Vintage year</label><input id="offset-vintage" className={styles.input} value={form.vintageYear} onChange={(event) => setForm((current) => ({ ...current, vintageYear: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-quantity">Quantity tCO2e</label><input id="offset-quantity" className={styles.input} value={form.quantityTco2e} onChange={(event) => setForm((current) => ({ ...current, quantityTco2e: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-purchase-date">Purchase date</label><input id="offset-purchase-date" type="date" className={styles.input} value={form.purchaseDate} onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-fy">FY applied</label><input id="offset-fy" className={styles.input} value={form.fyYearApplied} onChange={(event) => setForm((current) => ({ ...current, fyYearApplied: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-scope">Scope offset</label><select id="offset-scope" className={styles.select} value={form.scopeOffset} onChange={(event) => setForm((current) => ({ ...current, scopeOffset: event.target.value }))}><option value="1">Scope 1</option><option value="2">Scope 2</option><option value="3">Scope 3</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-standard">Verification standard</label><input id="offset-standard" className={styles.input} value={form.verificationStandard} onChange={(event) => setForm((current) => ({ ...current, verificationStandard: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-verifier">Verifier</label><input id="offset-verifier" className={styles.input} value={form.verifier} onChange={(event) => setForm((current) => ({ ...current, verifier: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="offset-notes">Notes</label><textarea id="offset-notes" className={styles.textarea} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
              <div className={styles.actions}><button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={() => void handleCreateOffset()} disabled={!canEditOffsets || saving}>{saving ? "Saving..." : "Add offset"}</button><button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setForm(INITIAL_FORM)}>Reset</button></div>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Offset Portfolio</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading carbon offset portfolio...</div>
          ) : offsets.length === 0 ? (
            <div className={styles.emptyState}>No carbon offset records are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Project</th>
                    <th className={styles.tableHeaderCell}>Volume</th>
                    <th className={styles.tableHeaderCell}>Verification</th>
                    <th className={styles.tableHeaderCell}>Retirement</th>
                  </tr>
                </thead>
                <tbody>
                  {offsets.map((offset) => (
                    <tr key={offset.id}>
                      <td className={styles.tableCell}>
                        <div className={styles.name}>{offset.project_name}</div>
                        <div className={styles.meta}>{offset.project_type} | {offset.project_country ?? "Country n/a"} | Vintage {offset.vintage_year}</div>
                        <div className={styles.meta}>{offset.serial_number}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>{offset.quantity_tco2e} tCO2e</div>
                        <div className={styles.meta}>FY applied: {offset.fy_year_applied ?? "n/a"}</div>
                        <div className={styles.meta}>Scope: {offset.scope_offset ?? "n/a"}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>{offset.verification_standard ?? "Standard not recorded"}</div>
                        <div className={styles.meta}>Verifier: {offset.verifier ?? "Not recorded"}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.badgeGroup}>
                          <span className={styles.badge} data-tone={offset.is_retired ? "success" : "warning"}>{offset.is_retired ? "Retired" : "Available"}</span>
                          {offset.retirement_purpose ? <span className={styles.badge} data-tone="info">{offset.retirement_purpose}</span> : null}
                        </div>
                        <div className={styles.meta}>Purchase: {offset.purchase_date}</div>
                        <div className={styles.meta}>Retirement: {offset.retirement_date ?? "Not retired"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
