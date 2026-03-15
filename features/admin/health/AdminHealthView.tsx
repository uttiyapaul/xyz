import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/shared/AdminWorkspace.module.css";
import { requirePlatformAdminActor } from "@/features/admin/shared/platformAdminAccess";

interface SessionRow {
  organization_id: string | null;
  is_active: boolean | null;
  mfa_verified: boolean | null;
  last_active_at: string;
  risk_score: number | null;
}

interface SubmissionRow {
  organization_id: string;
  status: string;
  updated_at: string | null;
}

interface ReadingRow {
  organization_id: string;
  status: string;
  updated_at: string | null;
  anomaly_flag: boolean | null;
  human_reviewed: boolean | null;
  is_ai_generated: boolean | null;
  trust_score: number | null;
}

interface AuditRow {
  result: string | null;
  event_timestamp: string | null;
}

interface DeliveryRow {
  succeeded: boolean | null;
  next_retry_at: string | null;
  delivered_at: string | null;
}

interface OrganizationRow {
  id: string;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Platform operations health snapshot.
 *
 * This page focuses on frontend-visible posture: session coverage, reporting
 * freshness, AI review backlog, and delivery failures that admin users should
 * react to through the existing operational workflows.
 */
export async function AdminHealthView() {
  let errorMessage: string | null = null;
  let sessions: SessionRow[] = [];
  let submissions: SubmissionRow[] = [];
  let readings: ReadingRow[] = [];
  let auditEvents: AuditRow[] = [];
  let deliveries: DeliveryRow[] = [];
  let organizations: OrganizationRow[] = [];

  try {
    await requirePlatformAdminActor();
    const admin = createServerSupabaseClient();
    const [orgResponse, sessionResponse, submissionResponse, readingResponse, auditResponse, deliveryResponse] = await Promise.all([
      admin.from("client_organizations").select("id").is("deleted_at", null),
      admin.from("user_sessions").select("organization_id, is_active, mfa_verified, last_active_at, risk_score").eq("is_active", true),
      admin.from("ghg_submissions").select("organization_id, status, updated_at").order("updated_at", { ascending: false }).limit(500),
      admin.from("ghg_monthly_readings").select("organization_id, status, updated_at, anomaly_flag, human_reviewed, is_ai_generated, trust_score").order("updated_at", { ascending: false }).limit(1000),
      admin.from("ghg_audit_log").select("result, event_timestamp").order("event_timestamp", { ascending: false }).limit(200),
      admin.from("webhook_delivery_log").select("succeeded, next_retry_at, delivered_at").order("delivered_at", { ascending: false }).limit(200),
    ]);

    if (
      orgResponse.error ||
      sessionResponse.error ||
      submissionResponse.error ||
      readingResponse.error ||
      auditResponse.error ||
      deliveryResponse.error
    ) {
      throw new Error("HEALTH_DATA_UNAVAILABLE");
    }

    organizations = (orgResponse.data ?? []) as OrganizationRow[];
    sessions = (sessionResponse.data ?? []) as SessionRow[];
    submissions = (submissionResponse.data ?? []) as SubmissionRow[];
    readings = (readingResponse.data ?? []) as ReadingRow[];
    auditEvents = (auditResponse.data ?? []) as AuditRow[];
    deliveries = (deliveryResponse.data ?? []) as DeliveryRow[];
  } catch (error) {
    console.error("Failed to load platform health data:", error);
    errorMessage = "System health data is unavailable right now. Verify platform connectivity and reload the page.";
  }

  const mfaCoverage = sessions.length === 0 ? 0 : Math.round((sessions.filter((row) => row.mfa_verified).length / sessions.length) * 100);
  const highRiskSessions = sessions.filter((row) => (row.risk_score ?? 0) >= 0.7).length;
  const aiPendingReview = readings.filter((row) => row.is_ai_generated && !row.human_reviewed).length;
  const anomalousReadings = readings.filter((row) => row.anomaly_flag).length;
  const lowTrustReadings = readings.filter((row) => (row.trust_score ?? 1) < 0.6).length;
  const unresolvedWebhookFailures = deliveries.filter((row) => row.succeeded === false && row.next_retry_at != null).length;
  const recentAuditFailures = auditEvents.filter((row) => row.result === "FAILURE" || row.result === "BLOCKED" || row.result === "ERROR").length;
  const latestSubmission = submissions[0];
  const latestReading = readings[0];
  const draftHeavyOrgs = new Set(submissions.filter((row) => row.status === "draft").map((row) => row.organization_id)).size;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Control</p>
        <h1 className={styles.title}>System Health & Metrics</h1>
        <p className={styles.subtitle}>
          Live admin snapshot for session posture, reporting freshness, AI review backlog, webhook reliability, and
          audit event pressure. This is a frontend-facing control board, not a replacement for backend observability.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert} data-tone="warning">{errorMessage}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Active Organizations</p><p className={styles.metricValue}>{organizations.length}</p><p className={styles.metricHint}>Current tenant footprint loaded for platform monitoring.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>MFA Coverage</p><p className={styles.metricValue}>{mfaCoverage}%</p><p className={styles.metricHint}>Share of active sessions currently marked MFA-verified.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>AI Pending Review</p><p className={styles.metricValue}>{aiPendingReview}</p><p className={styles.metricHint}>AI-generated readings awaiting human review before trust can increase.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Webhook Retries</p><p className={styles.metricValue}>{unresolvedWebhookFailures}</p><p className={styles.metricHint}>Delivery failures still queued for retry.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Freshness Snapshot</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Latest submission update</p><p className={styles.ruleMeta}>{latestSubmission ? `${latestSubmission.status} | ${formatDateTime(latestSubmission.updated_at)}` : "No submission activity recorded."}</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Latest reading update</p><p className={styles.ruleMeta}>{latestReading ? `${latestReading.status} | ${formatDateTime(latestReading.updated_at)}` : "No reading activity recorded."}</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Draft-heavy organizations</p><p className={styles.ruleMeta}>{draftHeavyOrgs} organization(s) currently carrying draft submissions.</p></div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Priority Signals</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>High-risk sessions</p><p className={styles.ruleMeta}>{highRiskSessions} active session(s) with elevated risk scores.</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Anomalous readings</p><p className={styles.ruleMeta}>{anomalousReadings} reading(s) currently flagged anomalous.</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Low-trust readings</p><p className={styles.ruleMeta}>{lowTrustReadings} reading(s) are below the 0.6 trust threshold.</p></div>
              <div className={styles.ruleItem}><p className={styles.ruleTitle}>Audit failures</p><p className={styles.ruleMeta}>{recentAuditFailures} recent audit event(s) recorded as failure, blocked, or error.</p></div>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Operational Health Board</h2>
          <div className={styles.ruleList}>
            <div className={styles.ruleItem}>
              <p className={styles.ruleTitle}>Session security posture</p>
              <p className={styles.ruleMeta}>
                {sessions.length} active session(s) are visible across the platform. MFA coverage is {mfaCoverage}% and{" "}
                {highRiskSessions} session(s) exceed the elevated-risk threshold.
              </p>
            </div>
            <div className={styles.ruleItem}>
              <p className={styles.ruleTitle}>Reporting pipeline posture</p>
              <p className={styles.ruleMeta}>
                {submissions.length} recent submission record(s) and {readings.length} recent monthly reading record(s)
                are in the current snapshot. Draft-heavy organizations: {draftHeavyOrgs}.
              </p>
            </div>
            <div className={styles.ruleItem}>
              <p className={styles.ruleTitle}>AI and review posture</p>
              <p className={styles.ruleMeta}>
                {aiPendingReview} AI-assisted reading(s) still need human review. {anomalousReadings} anomaly flag(s)
                and {lowTrustReadings} low-trust reading(s) should remain visible in downstream review UX.
              </p>
            </div>
            <div className={styles.ruleItem}>
              <p className={styles.ruleTitle}>Delivery and audit posture</p>
              <p className={styles.ruleMeta}>
                {unresolvedWebhookFailures} webhook delivery retry item(s) and {recentAuditFailures} negative audit
                outcomes are visible in the latest admin snapshot.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
