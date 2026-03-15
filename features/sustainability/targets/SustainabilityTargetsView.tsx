"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface TargetRow {
  id: string;
  target_name: string;
  target_type: string;
  base_year: string;
  target_year: number;
  reduction_pct: number;
  scopes_covered: number[];
  methodology: string | null;
  is_sbti_aligned: boolean | null;
  sbti_submission_date: string | null;
  sbti_approval_date: string | null;
  is_net_zero: boolean | null;
}

interface TargetProgressRow {
  target_id: string;
  target_name: string;
  target_type: string;
  base_year: string;
  target_year: number;
  reduction_pct: number;
  scopes_covered: number[];
  is_sbti_aligned: boolean | null;
  is_net_zero: boolean | null;
  base_tco2e: number | null;
  current_tco2e: number | null;
  target_tco2e: number | null;
  achieved_reduction_pct: number | null;
  is_on_track: boolean | null;
}

const INITIAL_FORM = {
  targetName: "",
  targetType: "absolute_reduction",
  baseYear: "2024",
  targetYear: "2030",
  reductionPct: "30",
  methodology: "",
  scopesCovered: ["1", "2"],
  isSbtiAligned: true,
  isNetZero: false,
};

/**
 * Sustainability target workspace.
 *
 * The page keeps target posture and SBTi context visible while still allowing
 * scoped teams to capture new goals against the live org record.
 */
export function SustainabilityTargetsView() {
  const { primaryOrgId, user, roles, isLoading: authLoading } = useAuth();
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [progressRows, setProgressRows] = useState<TargetProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "warning" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const canEditTargets = roles.some((role) =>
    [
      "sustainability_head",
      "esg_manager",
      "group_sustainability_head",
      "group_consolidator",
      "country_manager",
      "regional_analyst",
    ].includes(role),
  );

  async function loadTargets() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [targetsResponse, progressResponse] = await Promise.all([
      supabase
        .from("ghg_targets")
        .select(
          "id, target_name, target_type, base_year, target_year, reduction_pct, scopes_covered, methodology, is_sbti_aligned, sbti_submission_date, sbti_approval_date, is_net_zero",
        )
        .eq("organization_id", primaryOrgId)
        .order("target_year"),
      supabase
        .from("mv_targets_progress")
        .select(
          "target_id, target_name, target_type, base_year, target_year, reduction_pct, scopes_covered, is_sbti_aligned, is_net_zero, base_tco2e, current_tco2e, target_tco2e, achieved_reduction_pct, is_on_track",
        )
        .eq("organization_id", primaryOrgId)
        .order("target_year"),
    ]);

    if (targetsResponse.error || progressResponse.error) {
      setTargets([]);
      setProgressRows([]);
      setMessage({
        tone: "warning",
        text: "Target data is unavailable right now. Refresh the page or retry after the reporting views are refreshed.",
      });
      setLoading(false);
      return;
    }

    setTargets((targetsResponse.data ?? []) as TargetRow[]);
    setProgressRows((progressResponse.data ?? []) as TargetProgressRow[]);
    setLoading(false);
  }

  const scheduleTargetsLoad = useEffectEvent(() => {
    void loadTargets();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleTargetsLoad);
    }
  }, [authLoading, primaryOrgId]);

  async function handleCreateTarget() {
    if (!primaryOrgId || !user) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("ghg_targets").insert({
      organization_id: primaryOrgId,
      target_name: form.targetName.trim(),
      target_type: form.targetType,
      base_year: form.baseYear,
      target_year: Number(form.targetYear),
      reduction_pct: Number(form.reductionPct),
      scopes_covered: form.scopesCovered.map((scope) => Number(scope)),
      methodology: form.methodology.trim() || null,
      is_sbti_aligned: form.isSbtiAligned,
      is_net_zero: form.isNetZero,
      approved_by: user.id,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "warning",
        text: "The target could not be saved. Check required fields and current row-level access, then try again.",
      });
      return;
    }

    setSaving(false);
    setForm(INITIAL_FORM);
    setMessage({
      tone: "success",
      text: "Target saved. Refresh materialized views if progress metrics need immediate recalculation.",
    });
    await loadTargets();
  }

  if (!primaryOrgId) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Sustainability Workspace</p>
          <h1 className={styles.title}>Emissions Targets & SBTi</h1>
          <p className={styles.subtitle}>No organization is attached to the current session, so target planning cannot open yet.</p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Sustainability Workspace</p>
        <h1 className={styles.title}>Emissions Targets & SBTi</h1>
        <p className={styles.subtitle}>
          Track target posture, SBTi alignment, and on-track status without hiding the current emissions gap. Progress
          stays tied to the active organization and current reporting baseline.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Targets</p><p className={styles.metricValue}>{progressRows.length || targets.length}</p><p className={styles.metricHint}>Active reduction or net-zero targets visible to this session.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>SBTi Aligned</p><p className={styles.metricValue}>{progressRows.filter((row) => row.is_sbti_aligned).length}</p><p className={styles.metricHint}>Targets marked as aligned with SBTi methodology.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>On Track</p><p className={styles.metricValue}>{progressRows.filter((row) => row.is_on_track).length}</p><p className={styles.metricHint}>Targets currently meeting the expected reduction glidepath.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Net Zero</p><p className={styles.metricValue}>{progressRows.filter((row) => row.is_net_zero).length}</p><p className={styles.metricHint}>Targets explicitly flagged as net-zero commitments.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Target Guardrails</h2>
            <div className={styles.metaList}>
              <p className={styles.detailText}>Targets should map to real reporting boundaries and not be used to mask lagging data quality.</p>
              <div className={styles.alert} data-tone="info">SBTi and net-zero markers are planning context, not proof of achievement.</div>
              <div className={styles.alert} data-tone="warning">Progress metrics rely on reporting data freshness. Old baselines can make a target look healthier than it is.</div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Add target</h2>
            <p className={styles.cardText}>Use this for real approved targets only. Downstream reporting and executive views will inherit what is recorded here.</p>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}><label htmlFor="target-name" className={styles.label}>Target name</label><input id="target-name" className={styles.input} value={form.targetName} onChange={(event) => setForm((current) => ({ ...current, targetName: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label htmlFor="target-type" className={styles.label}>Target type</label><select id="target-type" className={styles.select} value={form.targetType} onChange={(event) => setForm((current) => ({ ...current, targetType: event.target.value }))}><option value="absolute_reduction">Absolute reduction</option><option value="intensity_reduction">Intensity reduction</option><option value="net_zero">Net zero</option></select></div>
              <div className={styles.fieldGroup}><label htmlFor="base-year" className={styles.label}>Base year</label><input id="base-year" className={styles.input} value={form.baseYear} onChange={(event) => setForm((current) => ({ ...current, baseYear: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label htmlFor="target-year" className={styles.label}>Target year</label><input id="target-year" className={styles.input} value={form.targetYear} onChange={(event) => setForm((current) => ({ ...current, targetYear: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label htmlFor="target-reduction" className={styles.label}>Reduction %</label><input id="target-reduction" className={styles.input} value={form.reductionPct} onChange={(event) => setForm((current) => ({ ...current, reductionPct: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label htmlFor="target-methodology" className={styles.label}>Methodology</label><textarea id="target-methodology" className={styles.textarea} value={form.methodology} onChange={(event) => setForm((current) => ({ ...current, methodology: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label htmlFor="target-scopes" className={styles.label}>Scopes covered</label><select id="target-scopes" className={styles.select} value={form.scopesCovered.join(",")} onChange={(event) => setForm((current) => ({ ...current, scopesCovered: event.target.value.split(",") }))}><option value="1,2">Scope 1 + 2</option><option value="1,2,3">Scope 1 + 2 + 3</option><option value="3">Scope 3 only</option></select></div>
              <label className={styles.checkboxRow}><input className={styles.checkbox} type="checkbox" checked={form.isSbtiAligned} onChange={(event) => setForm((current) => ({ ...current, isSbtiAligned: event.target.checked }))} />SBTi aligned</label>
              <label className={styles.checkboxRow}><input className={styles.checkbox} type="checkbox" checked={form.isNetZero} onChange={(event) => setForm((current) => ({ ...current, isNetZero: event.target.checked }))} />Net-zero target</label>
              <div className={styles.actions}>
                <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={() => void handleCreateTarget()} disabled={!canEditTargets || saving}>{saving ? "Saving..." : "Create target"}</button>
                <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setForm(INITIAL_FORM)}>Reset</button>
              </div>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Target Progress Board</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading sustainability targets...</div>
          ) : progressRows.length === 0 ? (
            <div className={styles.emptyState}>No target records are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Target</th>
                    <th className={styles.tableHeaderCell}>Reduction Path</th>
                    <th className={styles.tableHeaderCell}>Current Progress</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {progressRows.map((target) => (
                    <tr key={target.target_id}>
                      <td className={styles.tableCell}>
                        <div className={styles.name}>{target.target_name}</div>
                        <div className={styles.meta}>{target.target_type} | Base {target.base_year} | Target {target.target_year}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Reduction goal: {target.reduction_pct}%</div>
                        <div className={styles.meta}>Base tCO2e: {target.base_tco2e ?? "n/a"} | Target tCO2e: {target.target_tco2e ?? "n/a"}</div>
                        <div className={styles.meta}>Scopes: {target.scopes_covered.join(", ")}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.meta}>Current tCO2e: {target.current_tco2e ?? "n/a"}</div>
                        <div className={styles.meta}>Achieved reduction: {target.achieved_reduction_pct ?? 0}%</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.badgeGroup}>
                          <span className={styles.badge} data-tone={target.is_on_track ? "success" : "warning"}>{target.is_on_track ? "On track" : "Needs action"}</span>
                          {target.is_sbti_aligned ? <span className={styles.badge} data-tone="info">SBTi</span> : null}
                          {target.is_net_zero ? <span className={styles.badge} data-tone="neutral">Net zero</span> : null}
                        </div>
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
