"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface FrameworkRow {
  id: string;
  framework_name: string;
  full_name: string | null;
  framework_type: string;
  governing_body: string | null;
  applicable_region: string[] | null;
  reporting_url: string | null;
  notes: string | null;
}

interface IndicatorRow {
  id: string;
  framework_id: string;
  indicator_code: string;
  indicator_name: string;
  indicator_desc: string | null;
  data_type: string | null;
  unit: string | null;
  ghg_field_keys: string[] | null;
  ghg_scope: number[] | null;
  is_mandatory: boolean | null;
  reporting_level: string | null;
}

interface DisclosureRow {
  id: string;
  framework_id: string;
  indicator_id: string;
  fy_year: string;
  value_numeric: number | null;
  value_text: string | null;
  value_unit: string | null;
  notes: string | null;
  methodology: string | null;
  data_source: string | null;
  is_assured: boolean | null;
  assurance_level: string | null;
  submitted_at: string | null;
  status: string | null;
}

interface FilingRow {
  id: string;
  framework_id: string;
  fy_year: string;
  due_date: string;
  filing_window_opens: string | null;
  portal_url: string | null;
  status: string;
  submitted_at: string | null;
  accepted_at: string | null;
  filing_reference: string | null;
  responsible_person: string | null;
  responsible_email: string | null;
}

interface DisclosureDraft {
  value: string;
  methodology: string;
  dataSource: string;
  notes: string;
  isAssured: boolean;
  assuranceLevel: string;
}

const INITIAL_FY_YEAR = "2026-27";

function hasDisclosureValue(row: DisclosureRow | undefined): boolean {
  if (!row) {
    return false;
  }

  return row.value_numeric !== null || Boolean(row.value_text?.trim());
}

function buildDraft(row: DisclosureRow | undefined): DisclosureDraft {
  return {
    value:
      row?.value_numeric !== null && row?.value_numeric !== undefined
        ? String(row.value_numeric)
        : row?.value_text ?? "",
    methodology: row?.methodology ?? "",
    dataSource: row?.data_source ?? "",
    notes: row?.notes ?? "",
    isAssured: Boolean(row?.is_assured),
    assuranceLevel: row?.assurance_level ?? "",
  };
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function getFrameworkBadgeTone(status: string | null): "success" | "info" | "warning" | "neutral" {
  if (status === "accepted" || status === "submitted") {
    return "success";
  }

  if (status === "under_review" || status === "in_progress") {
    return "info";
  }

  if (!status || status === "not_started" || status === "draft") {
    return "warning";
  }

  return "neutral";
}

/**
 * Sustainability disclosure workspace.
 *
 * This page turns framework disclosures into a first-class sustainability lane
 * so ESG and filing roles can see framework completion, provenance, and filing
 * readiness without relying on orphaned helper components.
 */
export function SustainabilityDisclosuresView() {
  const { primaryOrgId, user, roles, isLoading: authLoading } = useAuth();
  const [frameworks, setFrameworks] = useState<FrameworkRow[]>([]);
  const [indicators, setIndicators] = useState<IndicatorRow[]>([]);
  const [disclosures, setDisclosures] = useState<DisclosureRow[]>([]);
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [fyYear, setFyYear] = useState(INITIAL_FY_YEAR);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, DisclosureDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingIndicatorId, setSavingIndicatorId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "info" | "warning" | "success"; text: string } | null>(null);

  const canEditDisclosures = roles.some((role) =>
    [
      "group_sustainability_head",
      "group_consolidator",
      "country_manager",
      "sustainability_head",
      "cbam_compliance_officer",
      "esg_manager",
      "regulatory_filing_agent",
    ].includes(role),
  );

  async function loadDisclosureWorkspace() {
    if (!primaryOrgId) {
      setFrameworks([]);
      setIndicators([]);
      setDisclosures([]);
      setFilings([]);
      setDrafts({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const [frameworksResponse, indicatorsResponse, disclosuresResponse, filingsResponse] = await Promise.all([
      supabase
        .from("disclosure_frameworks")
        .select("id, framework_name, full_name, framework_type, governing_body, applicable_region, reporting_url, notes")
        .order("framework_name"),
      supabase
        .from("framework_indicators")
        .select("id, framework_id, indicator_code, indicator_name, indicator_desc, data_type, unit, ghg_field_keys, ghg_scope, is_mandatory, reporting_level")
        .order("framework_id")
        .order("indicator_code"),
      supabase
        .from("framework_disclosures")
        .select("id, framework_id, indicator_id, fy_year, value_numeric, value_text, value_unit, notes, methodology, data_source, is_assured, assurance_level, submitted_at, status")
        .eq("organization_id", primaryOrgId)
        .eq("fy_year", fyYear),
      supabase
        .from("regulatory_filings")
        .select("id, framework_id, fy_year, due_date, filing_window_opens, portal_url, status, submitted_at, accepted_at, filing_reference, responsible_person, responsible_email")
        .eq("organization_id", primaryOrgId)
        .eq("fy_year", fyYear)
        .order("due_date"),
    ]);

    if (
      frameworksResponse.error ||
      indicatorsResponse.error ||
      disclosuresResponse.error ||
      filingsResponse.error
    ) {
      setFrameworks([]);
      setIndicators([]);
      setDisclosures([]);
      setFilings([]);
      setDrafts({});
      setMessage({
        tone: "warning",
        text: "Disclosure framework data is unavailable right now. Refresh the page or confirm framework configuration records are present.",
      });
      setLoading(false);
      return;
    }

    const nextFrameworks = (frameworksResponse.data ?? []) as FrameworkRow[];
    const nextIndicators = (indicatorsResponse.data ?? []) as IndicatorRow[];
    const nextDisclosures = (disclosuresResponse.data ?? []) as DisclosureRow[];
    const nextFilings = (filingsResponse.data ?? []) as FilingRow[];

    const nextDrafts: Record<string, DisclosureDraft> = {};
    nextIndicators.forEach((indicator) => {
      const row = nextDisclosures.find((disclosure) => disclosure.indicator_id === indicator.id);
      nextDrafts[indicator.id] = buildDraft(row);
    });

    const hasSelectedFramework = nextFrameworks.some((framework) => framework.id === selectedFrameworkId);

    setFrameworks(nextFrameworks);
    setIndicators(nextIndicators);
    setDisclosures(nextDisclosures);
    setFilings(nextFilings);
    setDrafts(nextDrafts);
    setSelectedFrameworkId(hasSelectedFramework ? selectedFrameworkId : nextFrameworks[0]?.id ?? "");
    setLoading(false);
  }

  const scheduleDisclosureLoad = useEffectEvent(() => {
    void loadDisclosureWorkspace();
  });

  useEffect(() => {
    if (!authLoading) {
      queueMicrotask(scheduleDisclosureLoad);
    }
  }, [authLoading, primaryOrgId, fyYear]);

  async function handleSaveIndicator(indicator: IndicatorRow) {
    if (!primaryOrgId || !user) {
      return;
    }

    const draft = drafts[indicator.id];

    if (!draft) {
      return;
    }

    const trimmedValue = draft.value.trim();
    const isQuantitative = indicator.data_type === "quantitative";

    if (trimmedValue === "") {
      setMessage({
        tone: "warning",
        text: `Enter a disclosure value for ${indicator.indicator_code} before saving supporting notes or methodology.`,
      });
      return;
    }

    const numericValue = isQuantitative ? Number(trimmedValue) : null;

    if (isQuantitative && Number.isNaN(numericValue)) {
      setMessage({
        tone: "warning",
        text: `The value for ${indicator.indicator_code} must be a valid number before it can be stored.`,
      });
      return;
    }

    setSavingIndicatorId(indicator.id);
    setMessage(null);

    const existingRow = disclosures.find((row) => row.indicator_id === indicator.id && row.fy_year === fyYear);
    const payload = {
      organization_id: primaryOrgId,
      framework_id: indicator.framework_id,
      indicator_id: indicator.id,
      fy_year: fyYear,
      value_numeric: isQuantitative ? numericValue : null,
      value_text: isQuantitative ? null : trimmedValue,
      value_unit: indicator.unit ?? existingRow?.value_unit ?? null,
      methodology: draft.methodology.trim() || null,
      data_source: draft.dataSource.trim() || null,
      notes: draft.notes.trim() || null,
      is_assured: draft.isAssured,
      assurance_level: draft.isAssured ? draft.assuranceLevel.trim() || null : null,
      submitted_by: user.id,
      status: existingRow?.status ?? "draft",
    };

    const { data, error } = await supabase
      .from("framework_disclosures")
      .upsert(payload, { onConflict: "organization_id,framework_id,indicator_id,fy_year" })
      .select("id, framework_id, indicator_id, fy_year, value_numeric, value_text, value_unit, notes, methodology, data_source, is_assured, assurance_level, submitted_at, status")
      .single();

    if (error || !data) {
      setSavingIndicatorId(null);
      setMessage({
        tone: "warning",
        text: `The disclosure for ${indicator.indicator_code} could not be saved. Check your row-level access and the current financial year.`,
      });
      return;
    }

    setDisclosures((current) => {
      const otherRows = current.filter((row) => row.indicator_id !== indicator.id || row.fy_year !== fyYear);
      return [...otherRows, data as DisclosureRow];
    });
    setSavingIndicatorId(null);
    setMessage({
      tone: "success",
      text: `Saved ${indicator.indicator_code}. Filing readiness still depends on full framework completion and downstream review controls.`,
    });
  }

  const selectedFramework = frameworks.find((framework) => framework.id === selectedFrameworkId) ?? null;
  const selectedIndicators = indicators.filter((indicator) => indicator.framework_id === selectedFrameworkId);
  const selectedFiling = filings.find((filing) => filing.framework_id === selectedFrameworkId) ?? null;
  const completedMandatoryIndicators = indicators.filter((indicator) => {
    if (!indicator.is_mandatory) {
      return false;
    }

    const disclosure = disclosures.find((row) => row.indicator_id === indicator.id && row.fy_year === fyYear);
    return hasDisclosureValue(disclosure);
  }).length;
  const totalMandatoryIndicators = indicators.filter((indicator) => indicator.is_mandatory).length;
  const filingReadyFrameworks = frameworks.filter((framework) => {
    const frameworkIndicators = indicators.filter((indicator) => indicator.framework_id === framework.id && indicator.is_mandatory);
    if (frameworkIndicators.length === 0) {
      return false;
    }

    return frameworkIndicators.every((indicator) => {
      const disclosure = disclosures.find((row) => row.indicator_id === indicator.id && row.fy_year === fyYear);
      return hasDisclosureValue(disclosure);
    });
  }).length;

  if (!primaryOrgId) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Sustainability Workspace</p>
          <h1 className={styles.title}>Disclosure Hub</h1>
          <p className={styles.subtitle}>
            No organization is attached to the current session, so disclosure frameworks and filing readiness cannot open yet.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Sustainability Workspace</p>
        <h1 className={styles.title}>Disclosure Hub</h1>
        <p className={styles.subtitle}>
          Manage framework disclosures, provenance, and filing readiness for the active organization and fiscal year.
          This workspace keeps disclosure preparation separate from final filing authority and verifier assurance.
        </p>
      </header>

      {message ? (
        <div className={styles.alert} data-tone={message.tone}>
          {message.text}
        </div>
      ) : null}

      {!canEditDisclosures ? (
        <div className={styles.alert} data-tone="info">
          This role can review disclosure posture and filing readiness, but disclosure values stay read-only here.
        </div>
      ) : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Frameworks</p>
          <p className={styles.metricValue}>{frameworks.length}</p>
          <p className={styles.metricHint}>Disclosure frameworks currently visible in the active workspace.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Mandatory Indicators</p>
          <p className={styles.metricValue}>{totalMandatoryIndicators}</p>
          <p className={styles.metricHint}>Mandatory indicators across all loaded frameworks for the selected fiscal year.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Mandatory Completed</p>
          <p className={styles.metricValue}>{completedMandatoryIndicators}</p>
          <p className={styles.metricHint}>Mandatory indicators already carrying a saved disclosure value.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Frameworks Ready</p>
          <p className={styles.metricValue}>{filingReadyFrameworks}</p>
          <p className={styles.metricHint}>Frameworks whose mandatory indicators are currently complete for filing preparation.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Disclosure Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">
                Disclosure completeness does not override review, approval, verifier, or filing-signoff requirements.
              </div>
              <div className={styles.alert} data-tone="info">
                Methodology, data source, and assurance posture should stay visible for every material indicator.
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Workspace Filters</h2>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="disclosure-fy-year">
                  Fiscal year
                </label>
                <input
                  id="disclosure-fy-year"
                  className={styles.input}
                  value={fyYear}
                  onChange={(event) => setFyYear(event.target.value)}
                />
              </div>
              <p className={styles.detailText}>
                Switch the fiscal year to compare framework completeness against different reporting cycles.
              </p>
              <Link href="/sustainability/cbam-reports" className={styles.inlineLink}>
                Open filing tracker for due dates and submission posture
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Frameworks</h2>
            {authLoading || loading ? (
              <div className={styles.alert} data-tone="info">
                Loading disclosure frameworks...
              </div>
            ) : frameworks.length === 0 ? (
              <div className={styles.emptyState}>
                No disclosure frameworks are visible yet. Add framework records before teams can prepare disclosures.
              </div>
            ) : (
              <div className={styles.frameworkList}>
                {frameworks.map((framework) => {
                  const frameworkIndicators = indicators.filter((indicator) => indicator.framework_id === framework.id);
                  const mandatoryCount = frameworkIndicators.filter((indicator) => indicator.is_mandatory).length;
                  const completedCount = frameworkIndicators.filter((indicator) => {
                    const row = disclosures.find((disclosure) => disclosure.indicator_id === indicator.id && disclosure.fy_year === fyYear);
                    return hasDisclosureValue(row);
                  }).length;
                  const completionPercent =
                    frameworkIndicators.length > 0
                      ? Math.round((completedCount / frameworkIndicators.length) * 100)
                      : 0;
                  const filing = filings.find((item) => item.framework_id === framework.id) ?? null;

                  return (
                    <button
                      key={framework.id}
                      type="button"
                      className={styles.frameworkButton}
                      data-active={framework.id === selectedFrameworkId ? "true" : "false"}
                      onClick={() => setSelectedFrameworkId(framework.id)}
                    >
                      <div className={styles.frameworkHeader}>
                        <div>
                          <div className={styles.name}>{framework.framework_name}</div>
                          <div className={styles.meta}>
                            {framework.framework_type} | {framework.governing_body ?? "Governing body not recorded"}
                          </div>
                        </div>
                        <div className={styles.badgeGroup}>
                          <span className={styles.badge} data-tone={mandatoryCount > 0 ? "info" : "neutral"}>
                            {mandatoryCount} mandatory
                          </span>
                          {filing ? (
                            <span className={styles.badge} data-tone={getFrameworkBadgeTone(filing.status)}>
                              {filing.status.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.progressRow}>
                        <label className={styles.progressLabel}>
                          Completion {completedCount}/{frameworkIndicators.length}
                        </label>
                        <progress className={styles.progress} value={completionPercent} max={100} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </aside>

        <section className={styles.mainStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Framework Context</h2>
            {!selectedFramework ? (
              <div className={styles.emptyState}>Select a framework to review its disclosure requirements.</div>
            ) : (
              <div className={styles.metaList}>
                <div className={styles.listItem}>
                  <div className={styles.name}>{selectedFramework.full_name ?? selectedFramework.framework_name}</div>
                  <p className={styles.detailText}>
                    {selectedFramework.governing_body ?? "Governing body not recorded"} | {selectedFramework.framework_type}
                  </p>
                  <p className={styles.detailText}>
                    Regions: {selectedFramework.applicable_region?.join(", ") ?? "No region taxonomy recorded"}
                  </p>
                  <p className={styles.detailText}>
                    {selectedFramework.notes ?? "No framework notes have been recorded yet."}
                  </p>
                  {selectedFramework.reporting_url ? (
                    <a
                      href={selectedFramework.reporting_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.inlineLink}
                    >
                      Open framework guidance
                    </a>
                  ) : null}
                </div>

                <div className={styles.listItem}>
                  <div className={styles.name}>Filing readiness</div>
                  {selectedFiling ? (
                    <>
                      <div className={styles.badgeGroup}>
                        <span className={styles.badge} data-tone={getFrameworkBadgeTone(selectedFiling.status)}>
                          {selectedFiling.status.replace(/_/g, " ")}
                        </span>
                        {selectedFiling.filing_reference ? (
                          <span className={styles.badge} data-tone="neutral">
                            Reference ready
                          </span>
                        ) : null}
                      </div>
                      <p className={styles.detailText}>Window opens: {formatDate(selectedFiling.filing_window_opens)}</p>
                      <p className={styles.detailText}>Due date: {formatDate(selectedFiling.due_date)}</p>
                      <p className={styles.detailText}>Submitted: {formatDate(selectedFiling.submitted_at)}</p>
                      <p className={styles.detailText}>Accepted: {formatDate(selectedFiling.accepted_at)}</p>
                      <p className={styles.detailText}>
                        Owner: {selectedFiling.responsible_person ?? "Owner not recorded"} | {selectedFiling.responsible_email ?? "Email not recorded"}
                      </p>
                      <p className={styles.detailText}>Portal: {selectedFiling.portal_url ?? "Portal URL not recorded"}</p>
                    </>
                  ) : (
                    <>
                      <div className={styles.alert} data-tone="warning">
                        No filing tracker row is recorded for this framework and fiscal year yet.
                      </div>
                      <Link href="/sustainability/cbam-reports" className={styles.inlineLink}>
                        Track the filing window and due date
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Indicator Disclosures</h2>
            {!selectedFramework ? (
              <div className={styles.emptyState}>Select a disclosure framework to review and update indicators.</div>
            ) : authLoading || loading ? (
              <div className={styles.alert} data-tone="info">
                Loading disclosure indicators...
              </div>
            ) : selectedIndicators.length === 0 ? (
              <div className={styles.emptyState}>
                No indicators are configured for {selectedFramework.framework_name} yet.
              </div>
            ) : (
              <div className={styles.list}>
                {selectedIndicators.map((indicator) => {
                  const draft = drafts[indicator.id] ?? buildDraft(undefined);
                  const disclosure = disclosures.find((row) => row.indicator_id === indicator.id && row.fy_year === fyYear);

                  return (
                    <article key={indicator.id} className={styles.listItem}>
                      <div className={styles.frameworkHeader}>
                        <div>
                          <div className={styles.badgeGroup}>
                            <span className={styles.badge} data-tone="info">
                              {indicator.indicator_code}
                            </span>
                            {indicator.is_mandatory ? (
                              <span className={styles.badge} data-tone="warning">
                                Mandatory
                              </span>
                            ) : null}
                            <span className={styles.badge} data-tone="neutral">
                              {indicator.data_type ?? "text"}
                            </span>
                            {indicator.reporting_level ? (
                              <span className={styles.badge} data-tone="neutral">
                                {indicator.reporting_level}
                              </span>
                            ) : null}
                          </div>
                          <div className={styles.name}>{indicator.indicator_name}</div>
                          <p className={styles.detailText}>
                            {indicator.indicator_desc ?? "No indicator description recorded."}
                          </p>
                          <p className={styles.meta}>
                            Scope: {indicator.ghg_scope?.join(", ") ?? "Not mapped"} | Unit: {indicator.unit ?? "Narrative"}
                          </p>
                        </div>
                        <div className={styles.badgeGroup}>
                          <span className={styles.badge} data-tone={hasDisclosureValue(disclosure) ? "success" : "warning"}>
                            {hasDisclosureValue(disclosure) ? "Saved" : "Pending"}
                          </span>
                          {disclosure?.status ? (
                            <span className={styles.badge} data-tone={getFrameworkBadgeTone(disclosure.status)}>
                              {disclosure.status.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.detailGrid}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor={`indicator-value-${indicator.id}`}>
                            Disclosure value
                          </label>
                          {indicator.data_type === "quantitative" ? (
                            <input
                              id={`indicator-value-${indicator.id}`}
                              className={styles.input}
                              inputMode="decimal"
                              value={draft.value}
                              disabled={!canEditDisclosures}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [indicator.id]: { ...draft, value: event.target.value },
                                }))
                              }
                            />
                          ) : (
                            <textarea
                              id={`indicator-value-${indicator.id}`}
                              className={styles.textarea}
                              value={draft.value}
                              disabled={!canEditDisclosures}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [indicator.id]: { ...draft, value: event.target.value },
                                }))
                              }
                            />
                          )}
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor={`indicator-source-${indicator.id}`}>
                            Data source
                          </label>
                          <input
                            id={`indicator-source-${indicator.id}`}
                            className={styles.input}
                            value={draft.dataSource}
                            disabled={!canEditDisclosures}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [indicator.id]: { ...draft, dataSource: event.target.value },
                              }))
                            }
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor={`indicator-methodology-${indicator.id}`}>
                            Methodology
                          </label>
                          <textarea
                            id={`indicator-methodology-${indicator.id}`}
                            className={styles.textarea}
                            value={draft.methodology}
                            disabled={!canEditDisclosures}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [indicator.id]: { ...draft, methodology: event.target.value },
                              }))
                            }
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor={`indicator-notes-${indicator.id}`}>
                            Notes
                          </label>
                          <textarea
                            id={`indicator-notes-${indicator.id}`}
                            className={styles.textarea}
                            value={draft.notes}
                            disabled={!canEditDisclosures}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [indicator.id]: { ...draft, notes: event.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <label className={styles.checkboxRow}>
                          <input
                            className={styles.checkbox}
                            type="checkbox"
                            checked={draft.isAssured}
                            disabled={!canEditDisclosures}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [indicator.id]: { ...draft, isAssured: event.target.checked },
                              }))
                            }
                          />
                          Assured indicator
                        </label>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label} htmlFor={`indicator-assurance-${indicator.id}`}>
                            Assurance level
                          </label>
                          <select
                            id={`indicator-assurance-${indicator.id}`}
                            className={styles.select}
                            value={draft.assuranceLevel}
                            disabled={!canEditDisclosures}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [indicator.id]: { ...draft, assuranceLevel: event.target.value },
                              }))
                            }
                          >
                            <option value="">Select assurance level</option>
                            <option value="limited">Limited assurance</option>
                            <option value="reasonable">Reasonable assurance</option>
                            <option value="internal_review">Internal review</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.primaryButton}`}
                          onClick={() => void handleSaveIndicator(indicator)}
                          disabled={!canEditDisclosures || savingIndicatorId === indicator.id}
                        >
                          {savingIndicatorId === indicator.id ? "Saving..." : "Save disclosure"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}
