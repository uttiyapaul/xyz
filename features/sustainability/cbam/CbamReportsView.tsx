"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface FilingRow {
  id: string;
  framework_id: string;
  fy_year: string;
  filing_type: string;
  due_date: string;
  portal_url: string | null;
  status: string;
  submitted_at: string | null;
  accepted_at: string | null;
  filing_reference: string | null;
  responsible_person: string | null;
  responsible_email: string | null;
  notes: string | null;
}

interface FrameworkRow {
  id: string;
  framework_name: string;
  full_name: string | null;
}

interface SubmissionRow {
  id: string;
  fy_year: string;
  status: string;
  submitted_at: string | null;
  verified_at: string | null;
}

const INITIAL_FORM = {
  frameworkId: "",
  fyYear: "2026-27",
  filingType: "cbam_declaration",
  dueDate: "",
  portalUrl: "",
  responsiblePerson: "",
  responsibleEmail: "",
  notes: "",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

/**
 * CBAM and regulatory filing workspace.
 *
 * Filing readiness stays tied to live submissions, due dates, and framework
 * references so compliance users can see whether the reporting pipeline is
 * actually ready for declaration work.
 */
export function CbamReportsView() {
  const { primaryOrgId, roles, isLoading: authLoading } = useAuth();
  const [filings, setFilings] = useState<FilingRow[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "warning" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const canEditFilings = roles.some((role) =>
    ["sustainability_head", "cbam_compliance_officer", "regulatory_filing_agent", "esg_manager"].includes(role),
  );

  async function loadCbamWorkspace() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [filingsResponse, frameworksResponse, submissionsResponse] = await Promise.all([
      supabase
        .from("regulatory_filings")
        .select(
          "id, framework_id, fy_year, filing_type, due_date, portal_url, status, submitted_at, accepted_at, filing_reference, responsible_person, responsible_email, notes",
        )
        .eq("organization_id", primaryOrgId)
        .order("due_date"),
      supabase.from("disclosure_frameworks").select("id, framework_name, full_name").order("framework_name"),
      supabase
        .from("ghg_submissions")
        .select("id, fy_year, status, submitted_at, verified_at")
        .eq("organization_id", primaryOrgId)
        .order("updated_at", { ascending: false }),
    ]);

    if (filingsResponse.error || frameworksResponse.error || submissionsResponse.error) {
      setFilings([]);
      setFrameworks([]);
      setSubmissions([]);
      setMessage({
        tone: "warning",
        text: "CBAM filing data is unavailable right now. Refresh the page or confirm framework records are present.",
      });
      setLoading(false);
      return;
    }

    setFilings((filingsResponse.data ?? []) as FilingRow[]);
    setFrameworks((frameworksResponse.data ?? []) as FrameworkRow[]);
    setSubmissions((submissionsResponse.data ?? []) as SubmissionRow[]);
    setLoading(false);
  }

  const scheduleCbamLoad = useEffectEvent(() => {
    void loadCbamWorkspace();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleCbamLoad);
    }
  }, [authLoading, primaryOrgId]);

  async function handleCreateFiling() {
    if (!primaryOrgId) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("regulatory_filings").insert({
      organization_id: primaryOrgId,
      framework_id: form.frameworkId,
      fy_year: form.fyYear,
      filing_type: form.filingType,
      due_date: form.dueDate,
      portal_url: form.portalUrl.trim() || null,
      responsible_person: form.responsiblePerson.trim() || null,
      responsible_email: form.responsibleEmail.trim() || null,
      notes: form.notes.trim() || null,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "warning",
        text: "The filing tracker row could not be saved. Check the framework and due-date details, then try again.",
      });
      return;
    }

    setSaving(false);
    setForm(INITIAL_FORM);
    setMessage({
      tone: "success",
      text: "Filing tracker updated. Keep verifier approval and formal submission as separate downstream controls.",
    });
    await loadCbamWorkspace();
  }

  const submittedFilings = filings.filter((filing) => filing.status === "submitted" || filing.status === "accepted").length;
  const verifiedSubmissions = submissions.filter((submission) => submission.status === "verified" || submission.verified_at).length;
  const cbamLikeFilings = filings.filter((filing) => {
    const framework = frameworks.find((item) => item.id === filing.framework_id);
    return (
      filing.filing_type.toLowerCase().includes("cbam") ||
      framework?.framework_name.toLowerCase().includes("cbam") ||
      framework?.full_name?.toLowerCase().includes("border adjustment")
    );
  }).length;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Sustainability Workspace</p>
        <h1 className={styles.title}>CBAM Operations & Reports</h1>
        <p className={styles.subtitle}>
          Manage filing readiness with due dates, framework mapping, and submission posture visible. The page keeps
          compliance preparation separate from verifier sign-off and final filing authority.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Tracked Filings</p><p className={styles.metricValue}>{filings.length}</p><p className={styles.metricHint}>Regulatory filing rows visible for the active organization.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>CBAM-Tagged</p><p className={styles.metricValue}>{cbamLikeFilings}</p><p className={styles.metricHint}>Rows whose filing type or framework explicitly points at CBAM-style work.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Submitted / Accepted</p><p className={styles.metricValue}>{submittedFilings}</p><p className={styles.metricHint}>Filing tracker rows already past draft or review stages.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Verified Submissions</p><p className={styles.metricValue}>{verifiedSubmissions}</p><p className={styles.metricHint}>Underlying emissions submissions currently marked verified.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>CBAM Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">Operational data approval, verifier assurance, and regulatory submission must remain separate control lanes.</div>
              <div className={styles.alert} data-tone="info">Portal URLs and due dates belong here; final declaration evidence and accepted references should remain traceable in downstream records.</div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Add filing tracker row</h2>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-framework">Framework</label><select id="filing-framework" className={styles.select} value={form.frameworkId} onChange={(event) => setForm((current) => ({ ...current, frameworkId: event.target.value }))}><option value="">Select framework</option>{frameworks.map((framework) => <option key={framework.id} value={framework.id}>{framework.framework_name}</option>)}</select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-fy">FY year</label><input id="filing-fy" className={styles.input} value={form.fyYear} onChange={(event) => setForm((current) => ({ ...current, fyYear: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-type">Filing type</label><input id="filing-type" className={styles.input} value={form.filingType} onChange={(event) => setForm((current) => ({ ...current, filingType: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-due">Due date</label><input id="filing-due" type="date" className={styles.input} value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-portal">Portal URL</label><input id="filing-portal" className={styles.input} value={form.portalUrl} onChange={(event) => setForm((current) => ({ ...current, portalUrl: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-person">Responsible person</label><input id="filing-person" className={styles.input} value={form.responsiblePerson} onChange={(event) => setForm((current) => ({ ...current, responsiblePerson: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-email">Responsible email</label><input id="filing-email" className={styles.input} value={form.responsibleEmail} onChange={(event) => setForm((current) => ({ ...current, responsibleEmail: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="filing-notes">Notes</label><textarea id="filing-notes" className={styles.textarea} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
              <div className={styles.actions}><button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={() => void handleCreateFiling()} disabled={!canEditFilings || saving}>{saving ? "Saving..." : "Track filing"}</button><button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setForm(INITIAL_FORM)}>Reset</button></div>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Regulatory Filing Board</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading CBAM operations workspace...</div>
          ) : filings.length === 0 ? (
            <div className={styles.emptyState}>No regulatory filing rows are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Framework</th>
                    <th className={styles.tableHeaderCell}>Window</th>
                    <th className={styles.tableHeaderCell}>Owner</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filings.map((filing) => {
                    const framework = frameworks.find((item) => item.id === filing.framework_id);

                    return (
                      <tr key={filing.id}>
                        <td className={styles.tableCell}>
                          <div className={styles.name}>{framework?.framework_name ?? filing.framework_id}</div>
                          <div className={styles.meta}>{filing.filing_type} | FY {filing.fy_year}</div>
                          <div className={styles.meta}>{framework?.full_name ?? "Framework full name not recorded"}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>Due {formatDate(filing.due_date)}</div>
                          <div className={styles.meta}>Submitted {formatDate(filing.submitted_at)}</div>
                          <div className={styles.meta}>Accepted {formatDate(filing.accepted_at)}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>{filing.responsible_person ?? "Owner not recorded"}</div>
                          <div className={styles.meta}>{filing.responsible_email ?? "Email not recorded"}</div>
                          <div className={styles.meta}>{filing.portal_url ?? "Portal URL not recorded"}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.badgeGroup}>
                            <span className={styles.badge} data-tone={filing.status === "submitted" || filing.status === "accepted" ? "success" : filing.status === "under_review" ? "info" : "warning"}>{filing.status}</span>
                            {filing.filing_reference ? <span className={styles.badge} data-tone="neutral">Reference ready</span> : null}
                          </div>
                          <div className={styles.meta}>{filing.filing_reference ?? "Reference not recorded"}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
